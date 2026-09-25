'use server';

import { db } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { logAuditEvent } from '@/actions/audit';
import { DayOfWeek } from '@prisma/client';
import { z } from 'zod';

const TimetableEntrySchema = z.object({
  sectionId: z.string().uuid('Invalid section'),
  periodTimeSlotId: z.string().uuid('Invalid time slot'),
  subjectId: z.string().uuid('Invalid subject').optional().nullable(),
  teacherId: z.string().uuid('Invalid teacher').optional().nullable(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  roomNumber: z.string().optional().nullable(),
});

export type TimetableEntryInput = z.infer<typeof TimetableEntrySchema>;

export async function createOrUpdateTimetableEntry(input: TimetableEntryInput) {
  try {
    const session = await getSessionFromCookies();
    let tenantId = session?.tenantId;
    let userId = session?.sub;

    if (!tenantId && process.env.NODE_ENV === 'development') {
      const defaultTenant = await db.tenant.findFirst();
      tenantId = defaultTenant?.id;
      userId = userId || 'dev-admin-id';
    }

    if (!tenantId || (session?.role && !['ADMIN', 'SUPER_ADMIN'].includes(session.role))) {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    const validation = TimetableEntrySchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const data = validation.data;

    // 1. Conflict Check: Teacher Clash
    if (data.teacherId) {
      const teacherClash = await db.timetableEntry.findFirst({
        where: {
          tenantId,
          teacherId: data.teacherId,
          periodTimeSlotId: data.periodTimeSlotId,
          dayOfWeek: data.dayOfWeek as DayOfWeek,
          sectionId: { not: data.sectionId },
        },
        include: {
          section: { include: { classGrade: true } },
          teacher: { include: { user: true } },
        },
      });

      if (teacherClash) {
        const teacherName = `${teacherClash.teacher?.user.firstName} ${teacherClash.teacher?.user.lastName}`;
        const conflictClass = `${teacherClash.section.classGrade.name}-${teacherClash.section.name}`;
        return {
          success: false,
          error: `Teacher Conflict: ${teacherName} is already assigned to ${conflictClass} on ${data.dayOfWeek} during this period.`,
        };
      }
    }

    // 2. Upsert Timetable Entry
    const entry = await db.timetableEntry.upsert({
      where: {
        sectionId_periodTimeSlotId_dayOfWeek: {
          sectionId: data.sectionId,
          periodTimeSlotId: data.periodTimeSlotId,
          dayOfWeek: data.dayOfWeek as DayOfWeek,
        },
      },
      update: {
        subjectId: data.subjectId || null,
        teacherId: data.teacherId || null,
      },
      create: {
        tenantId,
        sectionId: data.sectionId,
        periodTimeSlotId: data.periodTimeSlotId,
        subjectId: data.subjectId || null,
        teacherId: data.teacherId || null,
        dayOfWeek: data.dayOfWeek as DayOfWeek,
      },
    });

    await logAuditEvent({
      action: 'TIMETABLE_ENTRY_UPDATED',
      entityType: 'TimetableEntry',
      entityId: entry.id,
      newValues: {
        sectionId: data.sectionId,
        day: data.dayOfWeek,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
      },
      tenantId,
      userId,
    });

    return { success: true, data: { id: entry.id } };
  } catch (error: any) {
    console.error('Save Timetable Entry Error:', error);
    return { success: false, error: error.message || 'Failed to save timetable slot' };
  }
}

export async function getSectionTimetable(sectionId?: string) {
  try {
    const session = await getSessionFromCookies();
    let tenantId = session?.tenantId;

    if (!tenantId && process.env.NODE_ENV === 'development') {
      const defaultTenant = await db.tenant.findFirst();
      tenantId = defaultTenant?.id;
    }

    if (!tenantId) {
      return { success: false, error: 'Unauthorized' };
    }

    let targetSectionId = sectionId;
    if (!targetSectionId) {
      const firstSection = await db.section.findFirst({
        where: { tenantId },
      });
      targetSectionId = firstSection?.id;
    }

    if (!targetSectionId) {
      return { success: true, data: [] };
    }

    const entries = await db.timetableEntry.findMany({
      where: { tenantId, sectionId: targetSectionId },
      include: {
        periodTimeSlot: true,
        subject: true,
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { periodTimeSlot: { order: 'asc' } },
    });

    return { success: true, data: entries };
  } catch (error: any) {
    console.error('Get Section Timetable Error:', error);
    return { success: false, error: error.message || 'Failed to fetch timetable' };
  }
}
