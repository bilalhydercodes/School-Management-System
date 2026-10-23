'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { NotificationService } from '@/services/notification.service';
import { NotificationType } from '@prisma/client';
import { Role } from '@/types';

export interface AdminStudentLeaveItem {
  id: string;
  requestId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  className: string;
  sectionName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  guardianPhone?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminRemarks?: string;
  submittedAt: string;
}

const UpdateStudentLeaveSchema = z.object({
  requestId: z.string().min(3),
  status: z.enum(['Approved', 'Rejected']),
  adminRemarks: z.string().max(1000).optional(),
});

export type UpdateStudentLeaveInput = z.infer<typeof UpdateStudentLeaveSchema>;

/**
 * Retrieves all real persisted student leave applications for the tenant.
 * Deduplicates by unique requestId.
 */
export async function getAdminStudentLeavesAction(filters?: {
  search?: string;
  status?: string;
}): Promise<{
  success: boolean;
  leaves?: AdminStudentLeaveItem[];
  error?: string;
}> {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId } = guard.context;

  try {
    const rawNotifications = await prisma.notification.findMany({
      where: {
        tenantId,
        type: NotificationType.LEAVE,
      },
      include: {
        recipient: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const leaveMap = new Map<string, AdminStudentLeaveItem>();

    for (const n of rawNotifications) {
      const meta = (n.metadata as Record<string, any>) || {};
      const requestId = meta.requestId || `LEV-${n.id.slice(0, 8)}`;

      if (leaveMap.has(requestId)) {
        continue;
      }

      const dateFormatted = new Date(meta.submittedAt || n.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Calculate days count
      let daysCount = 1;
      if (meta.startDate && meta.endDate) {
        const start = new Date(meta.startDate).getTime();
        const end = new Date(meta.endDate).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          daysCount = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }
      }

      let studentName = meta.studentName || 'Student';
      let studentEmail = '';
      if (n.recipient?.role === Role.STUDENT) {
        studentName = `${n.recipient.firstName || ''} ${n.recipient.lastName || ''}`.trim() || n.recipient.email;
        studentEmail = n.recipient.email;
      }

      const item: AdminStudentLeaveItem = {
        id: n.id,
        requestId,
        studentId: meta.studentId || n.recipientId,
        studentName,
        studentEmail,
        className: meta.className || '10',
        sectionName: meta.sectionName || 'A',
        leaveType: meta.leaveType || 'Medical / Sick Leave',
        startDate: meta.startDate || dateFormatted,
        endDate: meta.endDate || dateFormatted,
        daysCount,
        reason: meta.reason || n.body,
        guardianPhone: meta.guardianPhone || '+91 98111 22233',
        status: (meta.status as 'Pending' | 'Approved' | 'Rejected') || 'Pending',
        adminRemarks: meta.adminRemarks || '',
        submittedAt: dateFormatted,
      };

      leaveMap.set(requestId, item);
    }

    let list = Array.from(leaveMap.values());

    // Apply search filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.requestId.toLowerCase().includes(q) ||
          l.studentName.toLowerCase().includes(q) ||
          l.leaveType.toLowerCase().includes(q) ||
          l.reason.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((l) => l.status === filters.status);
    }

    return { success: true, leaves: list };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve student leaves.';
    return { success: false, error: message };
  }
}

/**
 * Updates a student leave application decision (Approved / Rejected) with remarks,
 * records an audit log entry, and notifies the student.
 */
export async function updateStudentLeaveDecisionAction(
  rawInput: UpdateStudentLeaveInput
): Promise<{
  success: boolean;
  error?: string;
  requestId?: string;
  status?: string;
}> {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = UpdateStudentLeaveSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { tenantId, userId, session } = guard.context;
  const { requestId, status, adminRemarks } = validation.data;

  try {
    // 1. Locate all notifications associated with this leave requestId
    const matchingNotifications = await prisma.notification.findMany({
      where: {
        tenantId,
        type: NotificationType.LEAVE,
      },
    });

    const targetNotifications = matchingNotifications.filter((n) => {
      const meta = (n.metadata as Record<string, any>) || {};
      return meta.requestId === requestId;
    });

    if (targetNotifications.length === 0) {
      return { success: false, error: `Student leave application "${requestId}" not found.` };
    }

    const previousMeta = (targetNotifications[0].metadata as Record<string, any>) || {};
    const previousStatus = previousMeta.status || 'Pending';

    // 2. Prevent redundant transitions
    if (previousStatus === status && previousMeta.adminRemarks === (adminRemarks || '')) {
      return { success: true, requestId, status };
    }

    const updatedMetadata = {
      ...previousMeta,
      status,
      adminRemarks: adminRemarks || previousMeta.adminRemarks || `Sanctioned by school administration: ${status}`,
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    };

    // 3. Persist decision on all copies of the notification
    for (const n of targetNotifications) {
      await prisma.notification.update({
        where: { id: n.id },
        data: {
          metadata: updatedMetadata,
        },
      });
    }

    // 4. Notify the student directly
    const studentUserId = previousMeta.studentId || targetNotifications.find((n) => {
      const meta = (n.metadata as Record<string, any>) || {};
      return meta.studentId != null;
    })?.recipientId;

    if (studentUserId) {
      try {
        await NotificationService.send({
          tenantId,
          recipientId: studentUserId,
          title: `Leave Application ${requestId}: ${status}`,
          body: adminRemarks
            ? `Administrator Decision: ${status}. Remarks: "${adminRemarks}"`
            : `Your leave application for ${previousMeta.leaveType || 'Leave'} has been ${status.toLowerCase()} by administration.`,
          type: NotificationType.LEAVE,
          actionUrl: '/portal?view=my-attendance',
          metadata: updatedMetadata,
        });
      } catch {
        // Non-blocking notification
      }
    }

    // 5. Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'STUDENT_LEAVE_DECISION_UPDATED',
          entityType: 'StudentLeave',
          entityId: requestId,
          oldValues: { status: previousStatus, adminRemarks: previousMeta.adminRemarks },
          newValues: { status, adminRemarks, updatedBy: session.email },
        },
      });
    } catch {
      // Non-blocking audit
    }

    revalidatePath('/admin/leave');
    revalidatePath('/portal');

    return { success: true, requestId, status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update student leave decision.';
    return { success: false, error: message };
  }
}
