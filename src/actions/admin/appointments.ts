'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { z } from 'zod';
import {
  CalendarEventType,
  CalendarEventStatus,
  EventAudience,
  EventRecurrence,
  NotificationType,
} from '@prisma/client';
import { NotificationService } from '@/services/notification.service';

export interface FormattedAppointment {
  id: string;
  title: string;
  requesterName: string;
  requesterRole: string;
  requesterContact: string | null;
  authorityName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  mode: 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE';
  purpose: string;
  notes: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  rawEventId: string;
}

export interface PendingAppointmentRequest {
  id: string;
  title: string;
  requestedBy: string;
  authorityName: string;
  requestedDate: string;
  purpose: string;
  createdAt: string;
  isRead: boolean;
  contactId?: string;
}

export interface AuthorityOption {
  id: string;
  name: string;
  designation: string;
  category: string;
  userId?: string | null;
}

const CreateAppointmentSchema = z.object({
  requesterName: z.string().min(2, 'Requester name is required').max(100),
  requesterPhone: z.string().max(20).optional().or(z.literal('')),
  requesterEmail: z.string().email().optional().or(z.literal('')),
  requesterRole: z.enum(['PARENT', 'STUDENT', 'STAFF', 'VISITOR']).default('PARENT'),
  authorityName: z.string().min(2, 'Authority name is required').max(100),
  authorityUserId: z.string().uuid().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().max(150).optional().or(z.literal('')),
  mode: z.enum(['IN_PERSON', 'VIDEO_CALL', 'PHONE']).default('IN_PERSON'),
  purpose: z.string().min(3, 'Purpose must be at least 3 characters').max(300),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

/**
 * Fetches all appointments, pending consultation requests, and available authorities.
 */
export async function getAppointmentsAction() {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return {
      success: false,
      error: guard.error,
      appointments: [],
      pendingRequests: [],
      authorities: [],
    };
  }

  const { tenantId } = guard.context;

  try {
    // 1. Fetch confirmed / scheduled appointments from CalendarEvent
    const calendarAppointments = await prisma.calendarEvent.findMany({
      where: {
        tenantId,
        OR: [
          { sourceType: 'APPOINTMENT' },
          { eventType: { in: [CalendarEventType.PARENT_TEACHER_MEETING, CalendarEventType.MEETING] } },
        ],
      },
      orderBy: { startDate: 'desc' },
      take: 200,
    });

    const appointments: FormattedAppointment[] = calendarAppointments.map((e) => {
      // Parse description for mode, purpose, and notes if structured
      const desc = e.description || '';
      let mode: 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE' = 'IN_PERSON';
      if (desc.includes('Mode: VIDEO_CALL') || e.location?.toLowerCase().includes('zoom') || e.location?.toLowerCase().includes('meet')) {
        mode = 'VIDEO_CALL';
      } else if (desc.includes('Mode: PHONE') || e.location?.toLowerCase().includes('phone')) {
        mode = 'PHONE';
      }

      let status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'SCHEDULED';
      if (e.status === CalendarEventStatus.CANCELLED) {
        status = 'CANCELLED';
      } else if (new Date(e.startDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
        status = 'COMPLETED';
      }

      // Extract Requester Name & Authority
      let requesterName = e.contactInfo || 'Parent / Student';
      let requesterRole = 'PARENT';
      let requesterContact: string | null = null;

      if (e.contactInfo?.includes('(')) {
        const parts = e.contactInfo.split('(');
        requesterName = parts[0].trim();
        requesterContact = parts[1].replace(')', '').trim();
      }

      const authorityName = e.organizer || 'School Administration';

      return {
        id: e.id,
        title: e.title,
        requesterName,
        requesterRole,
        requesterContact,
        authorityName,
        date: e.startDate.toISOString().split('T')[0],
        startTime: e.startTime || '10:00 AM',
        endTime: e.endTime || '10:30 AM',
        location: e.location || "Principal's Office",
        mode,
        purpose: desc.replace(/Mode: [A-Z_]+\.?\s*/i, '').replace(/Purpose:\s*/i, '').trim() || e.title,
        notes: null,
        status,
        rawEventId: e.id,
      };
    });

    // 2. Fetch pending appointment requests from Notifications
    const requestNotifications = await prisma.notification.findMany({
      where: {
        tenantId,
        title: { startsWith: 'Appointment Request:' },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Cross reference already confirmed notifications
    const confirmedSourceIds = new Set(
      calendarAppointments.map((c) => c.sourceId).filter(Boolean)
    );

    const pendingRequests: PendingAppointmentRequest[] = requestNotifications
      .filter((n) => !confirmedSourceIds.has(n.id))
      .map((n) => {
        const meta = (n.metadata as Record<string, any>) || {};
        return {
          id: n.id,
          title: n.title,
          requestedBy: meta.requestedBy || 'Parent / Student',
          authorityName: meta.appointmentWith || n.title.replace('Appointment Request:', '').trim(),
          requestedDate: meta.requestedDate || n.createdAt.toISOString().split('T')[0],
          purpose: meta.purpose || n.body,
          createdAt: n.createdAt.toISOString(),
          isRead: n.isRead,
          contactId: meta.contactId,
        };
      });

    // 3. Fetch authorities for scheduling dropdown
    const emergencyContacts = await prisma.emergencyContact.findMany({
      where: { tenantId },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    const staffUsers = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['ADMIN', 'SUPER_ADMIN', 'TEACHER'] },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: { firstName: 'asc' },
    });

    const authorities: AuthorityOption[] = [
      ...emergencyContacts.map((c) => ({
        id: c.id,
        name: c.name,
        designation: c.designation,
        category: c.category,
        userId: null,
      })),
      ...staffUsers.map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        designation: s.role === 'TEACHER' ? 'Faculty Member' : 'School Administrator',
        category: 'INTERNAL_STAFF',
        userId: s.id,
      })),
    ];

    return {
      success: true,
      appointments,
      pendingRequests,
      authorities,
    };
  } catch (err: any) {
    console.error('Error fetching appointments:', err);
    return {
      success: false,
      error: err?.message || 'Failed to fetch appointments data',
      appointments: [],
      pendingRequests: [],
      authorities: [],
    };
  }
}

/**
 * Creates a new scheduled appointment.
 */
export async function createAppointmentAction(rawInput: CreateAppointmentInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;
  const validation = CreateAppointmentSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;

  try {
    const startDateTime = new Date(`${input.date}T00:00:00Z`);
    const endDateTime = new Date(`${input.date}T23:59:59Z`);

    const defaultLocation =
      input.mode === 'VIDEO_CALL'
        ? 'Google Meet (Link will be emailed)'
        : input.mode === 'PHONE'
        ? 'Telephonic Consultation'
        : "Principal's Office / Executive Conference Room";

    const location = input.location || defaultLocation;

    const contactStr = input.requesterPhone || input.requesterEmail || input.requesterRole;

    await prisma.calendarEvent.create({
      data: {
        tenantId,
        title: `[Appointment] ${input.authorityName} with ${input.requesterName}`,
        description: `Mode: ${input.mode}. Purpose: ${input.purpose}. ${input.notes ? `Notes: ${input.notes}` : ''}`,
        eventType: CalendarEventType.PARENT_TEACHER_MEETING,
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: input.startTime,
        endTime: input.endTime,
        isAllDay: false,
        location,
        organizer: input.authorityName,
        contactInfo: `${input.requesterName} (${contactStr})`,
        audience: EventAudience.ADMIN_ONLY,
        recurrence: EventRecurrence.NONE,
        status: CalendarEventStatus.ACTIVE,
        sourceType: 'APPOINTMENT',
        createdById: userId,
      },
    });

    // Notify authority if it's an internal user
    if (input.authorityUserId) {
      await NotificationService.send({
        tenantId,
        recipientId: input.authorityUserId,
        title: `New Appointment Scheduled: ${input.requesterName}`,
        body: `You have an appointment on ${input.date} at ${input.startTime} with ${input.requesterName}. Purpose: ${input.purpose}`,
        type: NotificationType.GENERAL,
        actionUrl: '/admin/appointments',
      });
    }

    revalidatePath('/admin/appointments');
    revalidatePath('/admin/calendar');
    return { success: true };
  } catch (err: any) {
    console.error('Error creating appointment:', err);
    return { success: false, error: err?.message || 'Failed to create appointment' };
  }
}

/**
 * Confirms a pending consultation request received from parents/students via in-app notification.
 */
export async function confirmPendingRequestAction(input: {
  notificationId: string;
  confirmedDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
}) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: input.notificationId },
    });

    if (!notification || notification.tenantId !== tenantId) {
      return { success: false, error: 'Appointment request not found.' };
    }

    const meta = (notification.metadata as Record<string, any>) || {};
    const requesterName = meta.requestedBy || 'Parent / Student';
    const authorityName = meta.appointmentWith || notification.title.replace('Appointment Request:', '').trim();
    const purpose = meta.purpose || notification.body;

    const startDateTime = new Date(`${input.confirmedDate}T00:00:00Z`);
    const endDateTime = new Date(`${input.confirmedDate}T23:59:59Z`);

    const location = input.location || "Executive Conference Room / Principal's Office";

    // 1. Create confirmed CalendarEvent
    await prisma.calendarEvent.create({
      data: {
        tenantId,
        title: `[Appointment] ${authorityName} with ${requesterName}`,
        description: `Confirmed from request. Purpose: ${purpose}. ${input.notes ? `Notes: ${input.notes}` : ''}`,
        eventType: CalendarEventType.PARENT_TEACHER_MEETING,
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: input.startTime,
        endTime: input.endTime,
        isAllDay: false,
        location,
        organizer: authorityName,
        contactInfo: requesterName,
        audience: EventAudience.ADMIN_ONLY,
        recurrence: EventRecurrence.NONE,
        status: CalendarEventStatus.ACTIVE,
        sourceType: 'APPOINTMENT',
        sourceId: notification.id,
        createdById: userId,
      },
    });

    // 2. Mark notification as read
    await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });

    revalidatePath('/admin/appointments');
    revalidatePath('/admin/calendar');
    return { success: true };
  } catch (err: any) {
    console.error('Error confirming appointment request:', err);
    return { success: false, error: err?.message || 'Failed to confirm appointment request.' };
  }
}

/**
 * Updates status of an existing appointment (e.g. Cancel or Archive).
 */
export async function updateAppointmentStatusAction(input: {
  appointmentId: string;
  status: 'CANCELLED' | 'ARCHIVED' | 'ACTIVE';
}) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId } = guard.context;

  try {
    await prisma.calendarEvent.updateMany({
      where: {
        id: input.appointmentId,
        tenantId,
      },
      data: {
        status:
          input.status === 'CANCELLED'
            ? CalendarEventStatus.CANCELLED
            : input.status === 'ARCHIVED'
            ? CalendarEventStatus.ARCHIVED
            : CalendarEventStatus.ACTIVE,
      },
    });

    revalidatePath('/admin/appointments');
    revalidatePath('/admin/calendar');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating appointment status:', err);
    return { success: false, error: err?.message || 'Failed to update appointment status.' };
  }
}
