'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import {
  CreateCalendarEventSchema,
  UpdateCalendarEventSchema,
  type CreateCalendarEventInput,
  type UpdateCalendarEventInput,
} from '@/lib/validations/calendar';
import {
  CalendarEventType,
  EventAudience,
  CalendarEventStatus,
  EventRecurrence,
  DayOfWeek,
  Prisma,
} from '@prisma/client';
import { NotificationService } from '@/services/notification.service';

/**
 * Returns allowed audience values based on user role.
 */
function getAllowedAudiencesForRole(role: string): EventAudience[] {
  switch (role) {
    case Role.ADMIN:
    case Role.SUPER_ADMIN:
      return Object.values(EventAudience);
    case Role.TEACHER:
      return [
        EventAudience.EVERYONE,
        EventAudience.TEACHERS,
        EventAudience.STAFF,
        EventAudience.TEACHERS_AND_STAFF,
      ];
    case Role.STUDENT:
      return [
        EventAudience.EVERYONE,
        EventAudience.STUDENTS,
        EventAudience.STUDENTS_AND_PARENTS,
      ];
    case Role.PARENT:
      return [
        EventAudience.EVERYONE,
        EventAudience.PARENTS,
        EventAudience.STUDENTS_AND_PARENTS,
      ];
    default:
      return [EventAudience.EVERYONE];
  }
}

/**
 * Retrieves calendar events with tenant isolation, server-enforced role visibility,
 * and optional integrated exam schedules.
 */
export async function getCalendarEventsAction(options?: {
  academicYearId?: string;
  startDate?: string;
  endDate?: string;
  eventType?: string;
  audience?: string;
  search?: string;
  status?: string;
}) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error, events: [] };
  }

  const { tenantId, role } = guard.context;
  const isAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;
  const allowedAudiences = getAllowedAudiencesForRole(role);

  try {
    const where: Prisma.CalendarEventWhereInput = {
      tenantId,
    };

    // Server-enforced role audience visibility
    if (!isAdmin) {
      where.audience = { in: allowedAudiences };
      where.status = CalendarEventStatus.ACTIVE;
    } else {
      if (options?.audience && options.audience !== 'ALL') {
        where.audience = options.audience as EventAudience;
      }
      if (options?.status && options.status !== 'ALL') {
        where.status = options.status as CalendarEventStatus;
      } else {
        where.status = { not: CalendarEventStatus.ARCHIVED };
      }
    }

    if (options?.academicYearId && options.academicYearId !== 'ALL') {
      where.academicYearId = options.academicYearId;
    }

    if (options?.eventType && options.eventType !== 'ALL') {
      where.eventType = options.eventType as CalendarEventType;
    }

    if (options?.startDate && options?.endDate) {
      const start = new Date(`${options.startDate}T00:00:00.000Z`);
      const end = new Date(`${options.endDate}T23:59:59.999Z`);
      where.OR = [
        { startDate: { gte: start, lte: end } },
        { endDate: { gte: start, lte: end } },
        { AND: [{ startDate: { lte: start } }, { endDate: { gte: end } }] },
      ];
    }

    if (options?.search && options.search.trim() !== '') {
      const q = options.search.trim();
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
            { organizer: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Query Calendar Events and Exam Schedules in parallel
    const [eventsRaw, examSchedulesRaw, academicYears] = await Promise.all([
      prisma.calendarEvent.findMany({
        where,
        orderBy: [{ startDate: 'asc' }, { isImportant: 'desc' }],
        include: {
          academicYear: { select: { id: true, name: true, isCurrent: true } },
          creator: { select: { firstName: true, lastName: true } },
        },
      }),
      // Exam schedule integration
      prisma.examSchedule.findMany({
        where: {
          tenantId,
          ...(options?.academicYearId && options.academicYearId !== 'ALL'
            ? { examTerm: { academicYearId: options.academicYearId } }
            : {}),
          ...(options?.startDate && options?.endDate
            ? {
                examDate: {
                  gte: new Date(`${options.startDate}T00:00:00.000Z`),
                  lte: new Date(`${options.endDate}T23:59:59.999Z`),
                },
              }
            : {}),
        },
        include: {
          classGrade: { select: { name: true } },
          subject: { select: { name: true, code: true } },
          examTerm: { select: { name: true, academicYearId: true } },
        },
      }),
      prisma.academicYear.findMany({
        where: { tenantId },
        orderBy: { startDate: 'desc' },
        select: { id: true, name: true, isCurrent: true, startDate: true, endDate: true },
      }),
    ]);

    // Format Calendar Events
    const formattedEvents = eventsRaw.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      eventType: e.eventType,
      startDate: e.startDate.toISOString().split('T')[0],
      endDate: e.endDate.toISOString().split('T')[0],
      startTime: e.startTime || null,
      endTime: e.endTime || null,
      isAllDay: e.isAllDay,
      location: e.location || '',
      organizer: e.organizer || '',
      contactInfo: e.contactInfo || '',
      isImportant: e.isImportant,
      audience: e.audience,
      recurrence: e.recurrence,
      status: e.status,
      isSpecialWorkingDay: e.isSpecialWorkingDay,
      isHoliday: e.isHoliday,
      academicYearId: e.academicYearId,
      academicYearName: e.academicYear?.name || null,
      creatorName: e.creator ? `${e.creator.firstName} ${e.creator.lastName}` : null,
      sourceType: e.sourceType || 'CALENDAR',
      sourceId: e.sourceId || null,
    }));

    // Integrate Exam Schedules (unless filtered out by non-EXAM type)
    if (!options?.eventType || options.eventType === 'ALL' || options.eventType === 'EXAM') {
      for (const es of examSchedulesRaw) {
        // Prevent duplicate if explicitly linked
        const isAlreadyAdded = formattedEvents.some(
          (fe) => fe.sourceType === 'EXAM' && fe.sourceId === es.id
        );
        if (!isAlreadyAdded) {
          const examDateStr = es.examDate.toISOString().split('T')[0];
          formattedEvents.push({
            id: `exam-${es.id}`,
            title: `[Exam] ${es.classGrade.name} - ${es.subject.name} (${es.examTerm.name})`,
            description: `Scheduled exam for Class ${es.classGrade.name}. Max Marks: ${es.maxMarks}, Passing Marks: ${es.passingMarks}.`,
            eventType: CalendarEventType.EXAM,
            startDate: examDateStr,
            endDate: examDateStr,
            startTime: es.startTime,
            endTime: es.endTime,
            isAllDay: false,
            location: `Main Academic Hall / Grade ${es.classGrade.name}`,
            organizer: 'Exam Cell',
            contactInfo: 'examination@school.edu.in',
            isImportant: true,
            audience: EventAudience.STUDENTS_AND_PARENTS,
            recurrence: EventRecurrence.NONE,
            status: CalendarEventStatus.ACTIVE,
            isSpecialWorkingDay: false,
            isHoliday: false,
            academicYearId: es.examTerm.academicYearId,
            academicYearName: null,
            creatorName: 'Examination System',
            sourceType: 'EXAM',
            sourceId: es.id,
          });
        }
      }
    }

    // Sort combined events by startDate
    formattedEvents.sort((a, b) => a.startDate.localeCompare(b.startDate));

    return {
      success: true,
      events: formattedEvents,
      academicYears,
    };
  } catch (err: any) {
    console.error('Error fetching calendar events:', err);
    return { success: false, error: err?.message || 'Failed to fetch calendar events', events: [], academicYears: [] };
  }
}

/**
 * Creates a new central Academic Calendar event.
 */
export async function createCalendarEventAction(rawInput: CreateCalendarEventInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  const validation = CreateCalendarEventSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;

  try {
    // If no academicYearId supplied, find current active academic year
    let targetAcademicYearId = input.academicYearId || null;
    if (!targetAcademicYearId) {
      const currentYear = await prisma.academicYear.findFirst({
        where: { tenantId, isCurrent: true },
      });
      targetAcademicYearId = currentYear?.id || null;
    }

    const isHoliday = input.isHoliday || input.eventType === 'HOLIDAY' || input.eventType === 'VACATION';

    const event = await prisma.calendarEvent.create({
      data: {
        tenantId,
        academicYearId: targetAcademicYearId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        eventType: input.eventType,
        startDate: new Date(`${input.startDate}T00:00:00.000Z`),
        endDate: new Date(`${input.endDate}T00:00:00.000Z`),
        startTime: input.startTime?.trim() || null,
        endTime: input.endTime?.trim() || null,
        isAllDay: input.isAllDay,
        location: input.location?.trim() || null,
        organizer: input.organizer?.trim() || null,
        contactInfo: input.contactInfo?.trim() || null,
        isImportant: input.isImportant,
        audience: input.audience,
        recurrence: input.recurrence,
        sendNotification: input.sendNotification,
        isSpecialWorkingDay: input.isSpecialWorkingDay,
        isHoliday,
        createdById: userId,
        status: CalendarEventStatus.ACTIVE,
      },
    });

    // Send notifications if enabled
    if (input.sendNotification) {
      let targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS' = 'ALL';
      if (input.audience === EventAudience.TEACHERS || input.audience === EventAudience.TEACHERS_AND_STAFF) {
        targetAudience = 'TEACHERS';
      } else if (input.audience === EventAudience.STUDENTS) {
        targetAudience = 'STUDENTS';
      } else if (input.audience === EventAudience.PARENTS) {
        targetAudience = 'PARENTS';
      }

      await NotificationService.sendToAudience({
        tenantId,
        audience: targetAudience,
        title: `Academic Calendar: ${event.title}`,
        body: `New event scheduled for ${input.startDate}${input.location ? ` at ${input.location}` : ''}. Details available on the Academic Calendar.`,
        actionUrl: '/admin/calendar',
      }).catch((e) => console.error('Notification dispatch non-blocking error:', e));
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CALENDAR_EVENT_CREATED',
        entityType: 'CalendarEvent',
        entityId: event.id,
        newValues: {
          title: event.title,
          eventType: event.eventType,
          startDate: input.startDate,
          endDate: input.endDate,
          audience: event.audience,
          isImportant: event.isImportant,
          isSpecialWorkingDay: event.isSpecialWorkingDay,
        },
      },
    });

    revalidatePath('/admin/calendar');
    revalidatePath('/admin');
    revalidatePath('/teacher/calendar');

    return { success: true, event };
  } catch (err: any) {
    console.error('Error creating calendar event:', err);
    return { success: false, error: err?.message || 'Failed to create calendar event' };
  }
}

/**
 * Updates an existing calendar event.
 */
export async function updateCalendarEventAction(rawInput: UpdateCalendarEventInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  const validation = UpdateCalendarEventSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;

  try {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id: input.id, tenantId },
    });
    if (!existing) {
      return { success: false, error: 'Calendar event not found or unauthorized.' };
    }

    const dataToUpdate: Prisma.CalendarEventUpdateInput = {};
    if (input.title) dataToUpdate.title = input.title.trim();
    if (input.description !== undefined) dataToUpdate.description = input.description?.trim() || null;
    if (input.eventType) dataToUpdate.eventType = input.eventType;
    if (input.startDate) dataToUpdate.startDate = new Date(`${input.startDate}T00:00:00.000Z`);
    if (input.endDate) dataToUpdate.endDate = new Date(`${input.endDate}T00:00:00.000Z`);
    if (input.startTime !== undefined) dataToUpdate.startTime = input.startTime?.trim() || null;
    if (input.endTime !== undefined) dataToUpdate.endTime = input.endTime?.trim() || null;
    if (input.isAllDay !== undefined) dataToUpdate.isAllDay = input.isAllDay;
    if (input.location !== undefined) dataToUpdate.location = input.location?.trim() || null;
    if (input.organizer !== undefined) dataToUpdate.organizer = input.organizer?.trim() || null;
    if (input.contactInfo !== undefined) dataToUpdate.contactInfo = input.contactInfo?.trim() || null;
    if (input.isImportant !== undefined) dataToUpdate.isImportant = input.isImportant;
    if (input.audience) dataToUpdate.audience = input.audience;
    if (input.recurrence) dataToUpdate.recurrence = input.recurrence;
    if (input.status) dataToUpdate.status = input.status;
    if (input.isSpecialWorkingDay !== undefined) dataToUpdate.isSpecialWorkingDay = input.isSpecialWorkingDay;
    if (input.isHoliday !== undefined) dataToUpdate.isHoliday = input.isHoliday;

    const updated = await prisma.calendarEvent.update({
      where: { id: input.id },
      data: dataToUpdate,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CALENDAR_EVENT_UPDATED',
        entityType: 'CalendarEvent',
        entityId: updated.id,
        oldValues: {
          title: existing.title,
          startDate: existing.startDate.toISOString().split('T')[0],
          endDate: existing.endDate.toISOString().split('T')[0],
          status: existing.status,
        },
        newValues: {
          title: updated.title,
          status: updated.status,
        },
      },
    });

    revalidatePath('/admin/calendar');
    revalidatePath('/teacher/calendar');

    return { success: true, event: updated };
  } catch (err: any) {
    console.error('Error updating calendar event:', err);
    return { success: false, error: err?.message || 'Failed to update calendar event' };
  }
}

/**
 * Soft archives/deletes a calendar event.
 */
export async function archiveCalendarEventAction(id: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return { success: false, error: 'Calendar event not found.' };
    }

    await prisma.calendarEvent.update({
      where: { id },
      data: { status: CalendarEventStatus.ARCHIVED },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CALENDAR_EVENT_ARCHIVED',
        entityType: 'CalendarEvent',
        entityId: id,
        oldValues: { title: existing.title, status: existing.status },
      },
    });

    revalidatePath('/admin/calendar');
    return { success: true };
  } catch (err: any) {
    console.error('Error archiving calendar event:', err);
    return { success: false, error: err?.message || 'Failed to archive calendar event' };
  }
}

/**
 * Returns Working Days configuration and special exceptions (e.g. Special Working Saturdays, Holidays).
 */
export async function getWorkingDaysConfigAction() {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return {
      success: false,
      error: guard.error,
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as DayOfWeek[],
      exceptions: [],
    };
  }

  const tenantId = guard.context.tenantId;

  try {
    const [tenant, exceptionsRaw] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { workingDays: true },
      }),
      prisma.calendarEvent.findMany({
        where: {
          tenantId,
          status: CalendarEventStatus.ACTIVE,
          OR: [{ isSpecialWorkingDay: true }, { isHoliday: true }],
        },
        orderBy: { startDate: 'asc' },
      }),
    ]);

    const defaultDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const workingDays = (tenant?.workingDays?.length ? tenant.workingDays : defaultDays) as DayOfWeek[];

    const exceptions = exceptionsRaw.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startDate.toISOString().split('T')[0],
      isSpecialWorkingDay: e.isSpecialWorkingDay,
      isHoliday: e.isHoliday,
    }));

    return {
      success: true,
      workingDays,
      exceptions,
    };
  } catch (err: any) {
    console.error('Error fetching working days config:', err);
    return {
      success: false,
      error: err?.message || 'Failed to fetch configuration',
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as DayOfWeek[],
      exceptions: [],
    };
  }
}

/**
 * Updates the institutional Working Days configuration.
 */
export async function updateWorkingDaysConfigAction(days: DayOfWeek[]) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { workingDays: days },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'WORKING_DAYS_UPDATED',
        entityType: 'Tenant',
        entityId: tenantId,
        newValues: { workingDays: days },
      },
    });

    revalidatePath('/admin/calendar');
    revalidatePath('/admin/timetable');
    revalidatePath('/admin/settings');

    return { success: true };
  } catch (err: any) {
    console.error('Error updating working days:', err);
    return { success: false, error: err?.message || 'Failed to update working days' };
  }
}

/**
 * Returns upcoming events scoped to the authenticated caller's role.
 */
export async function getUpcomingEventsAction(limit: number = 5) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error, events: [] };
  }

  const { tenantId, role } = guard.context;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allowedAudiences = getAllowedAudiencesForRole(role);

  try {
    const eventsRaw = await prisma.calendarEvent.findMany({
      where: {
        tenantId,
        status: CalendarEventStatus.ACTIVE,
        endDate: { gte: today },
        audience: { in: allowedAudiences },
      },
      orderBy: [{ startDate: 'asc' }, { isImportant: 'desc' }],
      take: limit,
      include: { academicYear: { select: { name: true } } },
    });

    const events = eventsRaw.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      eventType: e.eventType,
      startDate: e.startDate.toISOString().split('T')[0],
      endDate: e.endDate.toISOString().split('T')[0],
      isAllDay: e.isAllDay,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location || '',
      isImportant: e.isImportant,
      audience: e.audience,
    }));

    return { success: true, events };
  } catch (err: any) {
    console.error('Error fetching upcoming events:', err);
    return { success: false, error: err?.message || 'Failed to fetch upcoming events', events: [] };
  }
}

/**
 * One-click migration of legacy Event and Holiday models into CalendarEvent.
 */
export async function syncLegacyEventsAction() {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const [legacyEvents, legacyHolidays, currentYear] = await Promise.all([
      prisma.event.findMany({ where: { tenantId } }),
      prisma.holiday.findMany({ where: { tenantId } }),
      prisma.academicYear.findFirst({ where: { tenantId, isCurrent: true } }),
    ]);

    let migratedCount = 0;

    // Migrate Legacy Events
    for (const le of legacyEvents) {
      const existing = await prisma.calendarEvent.findFirst({
        where: { tenantId, sourceType: 'LEGACY_EVENT', sourceId: le.id },
      });
      if (!existing) {
        await prisma.calendarEvent.create({
          data: {
            tenantId,
            academicYearId: currentYear?.id || null,
            title: le.title,
            description: le.description || null,
            eventType: CalendarEventType.SCHOOL_EVENT,
            startDate: le.eventDate,
            endDate: le.eventDate,
            startTime: le.eventTime || null,
            isAllDay: !le.eventTime,
            location: le.location || null,
            audience: EventAudience.EVERYONE,
            sourceType: 'LEGACY_EVENT',
            sourceId: le.id,
            status: CalendarEventStatus.ACTIVE,
            createdById: le.createdById || userId,
          },
        });
        migratedCount++;
      }
    }

    // Migrate Legacy Holidays
    for (const lh of legacyHolidays) {
      const existing = await prisma.calendarEvent.findFirst({
        where: { tenantId, sourceType: 'LEGACY_HOLIDAY', sourceId: lh.id },
      });
      if (!existing) {
        await prisma.calendarEvent.create({
          data: {
            tenantId,
            academicYearId: currentYear?.id || null,
            title: lh.name,
            description: null,
            eventType: CalendarEventType.HOLIDAY,
            startDate: lh.date,
            endDate: lh.date,
            isAllDay: true,
            isHoliday: true,
            audience: EventAudience.EVERYONE,
            sourceType: 'LEGACY_HOLIDAY',
            sourceId: lh.id,
            status: CalendarEventStatus.ACTIVE,
            createdById: userId,
          },
        });
        migratedCount++;
      }
    }

    revalidatePath('/admin/calendar');
    return { success: true, count: migratedCount };
  } catch (err: any) {
    console.error('Error syncing legacy events:', err);
    return { success: false, error: err?.message || 'Failed to sync legacy events' };
  }
}
