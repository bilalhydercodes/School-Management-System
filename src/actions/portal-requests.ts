'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { NotificationService } from '@/services/notification.service';
import {
  SubmitGrievanceSchema,
  type SubmitGrievanceInput,
  SubmitLeaveRequestSchema,
  type SubmitLeaveRequestInput,
} from '@/lib/validations/portal-requests';
import { NotificationType } from '@prisma/client';

export interface GrievanceTicketItem {
  id: string;
  ticketNumber: string;
  date: string;
  category: string;
  subject: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  urgency: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  adminNote?: string;
}

export interface StudentLeaveRequestItem {
  id: string;
  requestId: string;
  date: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  guardianPhone?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminRemarks?: string;
}

/**
 * Submits a new student grievance or campus feedback inquiry with genuine DB persistence.
 */
export async function submitGrievanceAction(rawInput: SubmitGrievanceInput) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = SubmitGrievanceSchema.safeParse(rawInput);
  if (!validation.success) {
    const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
    return { success: false, error: errorMsg };
  }

  const { tenantId, userId, session } = guard.context;
  const input = validation.data;

  try {
    // 1. Fetch student bio context
    const studentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            section: {
              include: { classGrade: true },
            },
          },
        },
      },
    });

    const studentName = studentUser
      ? `${studentUser.firstName} ${studentUser.lastName}`
      : session.email;
    const classInfo = studentUser?.studentProfile?.section
      ? `Class ${studentUser.studentProfile.section.classGrade.name}-${studentUser.studentProfile.section.name}`
      : 'Class 10';

    // 2. Generate server-side unique ticket reference
    const now = new Date();
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const ticketNumber = `TKT-${now.getFullYear()}-${randSuffix}`;

    const metadata = {
      ticketNumber,
      category: input.category,
      subject: input.subject,
      description: input.description,
      urgency: input.urgency,
      status: 'In Progress',
      adminNote: 'Ticket registered. Queued for Academic Disciplinary & Welfare Board review.',
      studentId: studentUser?.studentProfile?.id || userId,
      studentName,
      classInfo,
      submittedAt: now.toISOString(),
    };

    // 3. Persist student inquiry record in database (under student's user account)
    await prisma.notification.create({
      data: {
        tenantId,
        recipientId: userId,
        title: `Ticket ${ticketNumber}: ${input.subject}`,
        body: input.description,
        type: NotificationType.COMPLAINT,
        actionUrl: `/portal?view=grievance-feedback`,
        metadata,
      },
    });

    // 4. Notify School Administrators / Welfare Officers
    const adminUsers = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    });

    if (adminUsers.length > 0) {
      await NotificationService.sendBulk({
        tenantId,
        recipientIds: adminUsers.map((a) => a.id),
        title: `Student Grievance (${input.urgency}): ${ticketNumber}`,
        body: `From ${studentName} (${classInfo}) - [${input.category}]: ${input.subject}`,
        type: NotificationType.COMPLAINT,
        actionUrl: '/admin',
        metadata,
      });
    }

    // 5. Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'GRIEVANCE_TICKET_SUBMITTED',
          entityType: 'GrievanceTicket',
          entityId: ticketNumber,
          newValues: metadata,
        },
      });
    } catch {
      // Non-blocking audit failure
    }

    revalidatePath('/portal');
    return { success: true, ticketNumber };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to register grievance ticket.';
    return { success: false, error: message };
  }
}

/**
 * Retrieves all stored grievance tickets for the logged-in student.
 */
export async function getStudentGrievancesAction(): Promise<{
  success: boolean;
  tickets?: GrievanceTicketItem[];
  error?: string;
}> {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const rawNotifications = await prisma.notification.findMany({
      where: {
        tenantId,
        recipientId: userId,
        type: NotificationType.COMPLAINT,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const tickets: GrievanceTicketItem[] = rawNotifications.map((n) => {
      const meta = (n.metadata as any) || {};
      const dateFormatted = new Date(n.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      return {
        id: n.id,
        ticketNumber: meta.ticketNumber || `TKT-${n.id.slice(0, 8)}`,
        date: dateFormatted,
        category: meta.category || 'General',
        subject: meta.subject || n.title.replace(/^Ticket [^:]+:\s*/, ''),
        description: meta.description || n.body,
        status: meta.status || 'In Progress',
        urgency: meta.urgency || 'NORMAL',
        adminNote: meta.adminNote || 'Under review by institutional authorities.',
      };
    });

    return { success: true, tickets };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load tickets.';
    return { success: false, error: message };
  }
}

/**
 * Submits a student leave application with date validation and persistence.
 */
export async function submitStudentLeaveAction(rawInput: SubmitLeaveRequestInput) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = SubmitLeaveRequestSchema.safeParse(rawInput);
  if (!validation.success) {
    const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
    return { success: false, error: errorMsg };
  }

  const { tenantId, userId, session } = guard.context;
  const input = validation.data;

  try {
    // 1. Fetch student info
    const studentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            section: {
              include: { classGrade: true },
            },
          },
        },
      },
    });

    const studentName = studentUser
      ? `${studentUser.firstName} ${studentUser.lastName}`
      : session.email;
    const className = studentUser?.studentProfile?.section?.classGrade?.name || '10';
    const sectionName = studentUser?.studentProfile?.section?.name || 'A';

    // 2. Generate unique Request Identifier
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const requestId = `LEV-${new Date().getFullYear()}-${randSuffix}`;

    const metadata = {
      requestId,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason,
      guardianPhone: input.guardianPhone,
      status: 'Pending',
      adminRemarks: 'Application received. Pending class teacher sanction.',
      studentId: studentUser?.studentProfile?.id || userId,
      studentName,
      className,
      sectionName,
      submittedAt: new Date().toISOString(),
    };

    // 3. Persist record under student user
    await prisma.notification.create({
      data: {
        tenantId,
        recipientId: userId,
        title: `Leave Application: ${requestId} (${input.leaveType})`,
        body: input.reason,
        type: NotificationType.LEAVE,
        actionUrl: `/portal?view=my-attendance`,
        metadata,
      },
    });

    // 4. Notify Class Teachers & Admins
    const staffRecipients = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['ADMIN', 'TEACHER', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { id: true },
      take: 10,
    });

    if (staffRecipients.length > 0) {
      await NotificationService.sendBulk({
        tenantId,
        recipientIds: staffRecipients.map((s) => s.id),
        title: `Leave Request: ${studentName} (Class ${className}-${sectionName})`,
        body: `Applied for ${input.leaveType} from ${input.startDate} to ${input.endDate}. Reason: ${input.reason}`,
        type: NotificationType.LEAVE,
        actionUrl: '/teacher',
        metadata,
      });
    }

    // 5. Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'STUDENT_LEAVE_APPLIED',
          entityType: 'StudentLeave',
          entityId: requestId,
          newValues: metadata,
        },
      });
    } catch {
      // Non-blocking audit error
    }

    revalidatePath('/portal');
    return { success: true, requestId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit leave application.';
    return { success: false, error: message };
  }
}

/**
 * Retrieves all stored leave requests for the logged-in student.
 */
export async function getStudentLeaveRequestsAction(): Promise<{
  success: boolean;
  requests?: StudentLeaveRequestItem[];
  error?: string;
}> {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const rawNotifications = await prisma.notification.findMany({
      where: {
        tenantId,
        recipientId: userId,
        type: NotificationType.LEAVE,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const requests: StudentLeaveRequestItem[] = rawNotifications.map((n) => {
      const meta = (n.metadata as any) || {};
      const dateFormatted = new Date(n.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      return {
        id: n.id,
        requestId: meta.requestId || `LEV-${n.id.slice(0, 8)}`,
        date: dateFormatted,
        leaveType: meta.leaveType || 'Medical / Sick Leave',
        startDate: meta.startDate || dateFormatted,
        endDate: meta.endDate || dateFormatted,
        reason: meta.reason || n.body,
        guardianPhone: meta.guardianPhone,
        status: meta.status || 'Pending',
        adminRemarks: meta.adminRemarks || 'Under review by institutional authorities.',
      };
    });

    return { success: true, requests };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load leave requests.';
    return { success: false, error: message };
  }
}
