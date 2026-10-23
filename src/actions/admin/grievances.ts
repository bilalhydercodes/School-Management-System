'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { NotificationService } from '@/services/notification.service';
import { NotificationType } from '@prisma/client';
import { Role } from '@/types';

export interface AdminStudentGrievanceItem {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  classInfo: string;
  category: string;
  subject: string;
  description: string;
  urgency: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  adminNote?: string;
  submittedAt: string;
  updatedAt?: string;
}

const UpdateGrievanceStatusSchema = z.object({
  ticketNumber: z.string().min(3),
  status: z.enum(['Pending', 'In Progress', 'Resolved', 'Closed']),
  adminRemarks: z.string().max(1000).optional(),
});

export type UpdateGrievanceStatusInput = z.infer<typeof UpdateGrievanceStatusSchema>;

/**
 * Fetches all real, persisted student grievances for the authenticated admin's tenant.
 * Filters out duplicate notifications by unique ticketNumber.
 */
export async function getAdminStudentGrievancesAction(filters?: {
  search?: string;
  status?: string;
  urgency?: string;
}): Promise<{
  success: boolean;
  grievances?: AdminStudentGrievanceItem[];
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
        type: NotificationType.COMPLAINT,
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

    // Deduplicate by ticketNumber
    const ticketMap = new Map<string, AdminStudentGrievanceItem>();

    for (const n of rawNotifications) {
      const meta = (n.metadata as Record<string, any>) || {};
      const ticketNumber = meta.ticketNumber || `TKT-${n.id.slice(0, 8)}`;

      if (ticketMap.has(ticketNumber)) {
        continue;
      }

      const dateFormatted = new Date(meta.submittedAt || n.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Extract student details
      let studentName = meta.studentName || 'Student';
      let studentEmail = '';
      if (n.recipient?.role === Role.STUDENT) {
        studentName = `${n.recipient.firstName || ''} ${n.recipient.lastName || ''}`.trim() || n.recipient.email;
        studentEmail = n.recipient.email;
      }

      const item: AdminStudentGrievanceItem = {
        id: n.id,
        ticketNumber,
        studentId: meta.studentId || n.recipientId,
        studentName,
        studentEmail,
        classInfo: meta.classInfo || 'Class 10-A',
        category: meta.category || 'General Administration',
        subject: meta.subject || n.title.replace(/^Ticket [^:]+:\s*/, '').replace(/^Student Grievance \([^)]+\):\s*/, ''),
        description: meta.description || n.body,
        urgency: (meta.urgency as 'NORMAL' | 'IMPORTANT' | 'URGENT') || 'NORMAL',
        status: (meta.status as 'Pending' | 'In Progress' | 'Resolved' | 'Closed') || 'In Progress',
        adminNote: meta.adminNote || '',
        submittedAt: dateFormatted,
        updatedAt: n.updatedAt.toISOString(),
      };

      ticketMap.set(ticketNumber, item);
    }

    let list = Array.from(ticketMap.values());

    // Apply optional search filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.ticketNumber.toLowerCase().includes(q) ||
          g.studentName.toLowerCase().includes(q) ||
          g.subject.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((g) => g.status === filters.status);
    }

    // Apply urgency filter
    if (filters?.urgency && filters.urgency !== 'ALL') {
      list = list.filter((g) => g.urgency === filters.urgency);
    }

    return { success: true, grievances: list };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve student grievances.';
    return { success: false, error: message };
  }
}

/**
 * Updates a student grievance status and remarks, records an audit log entry,
 * and sends an automated notification to the affected student.
 */
export async function updateStudentGrievanceStatusAction(
  rawInput: UpdateGrievanceStatusInput
): Promise<{
  success: boolean;
  error?: string;
  ticketNumber?: string;
  status?: string;
}> {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = UpdateGrievanceStatusSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { tenantId, userId, session } = guard.context;
  const { ticketNumber, status, adminRemarks } = validation.data;

  try {
    // 1. Locate all notifications associated with this ticket in the current tenant
    const matchingNotifications = await prisma.notification.findMany({
      where: {
        tenantId,
        type: NotificationType.COMPLAINT,
      },
    });

    const targetNotifications = matchingNotifications.filter((n) => {
      const meta = (n.metadata as Record<string, any>) || {};
      return meta.ticketNumber === ticketNumber;
    });

    if (targetNotifications.length === 0) {
      return { success: false, error: `Grievance ticket "${ticketNumber}" not found.` };
    }

    const previousMeta = (targetNotifications[0].metadata as Record<string, any>) || {};
    const previousStatus = previousMeta.status || 'Pending';

    // 2. Prevent redundant transitions
    if (previousStatus === status && previousMeta.adminNote === (adminRemarks || '')) {
      return { success: true, ticketNumber, status };
    }

    const updatedMetadata = {
      ...previousMeta,
      status,
      adminNote: adminRemarks || previousMeta.adminNote || 'Status reviewed by school administration.',
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    };

    // 3. Persist update on all matching notification records (student and admin copies)
    for (const n of targetNotifications) {
      await prisma.notification.update({
        where: { id: n.id },
        data: {
          metadata: updatedMetadata,
        },
      });
    }

    // 4. Notify the student directly if recipient was student or studentId is recorded
    const studentUserId = previousMeta.studentId || targetNotifications.find((n) => {
      const meta = (n.metadata as Record<string, any>) || {};
      return meta.studentId != null;
    })?.recipientId;

    if (studentUserId) {
      try {
        await NotificationService.send({
          tenantId,
          recipientId: studentUserId,
          title: `Grievance Ticket ${ticketNumber}: ${status}`,
          body: adminRemarks
            ? `Administrator Remarks: "${adminRemarks}"`
            : `Your grievance ticket has been transitioned to status: ${status}.`,
          type: NotificationType.COMPLAINT,
          actionUrl: '/portal?view=grievance-feedback',
          metadata: updatedMetadata,
        });
      } catch {
        // Non-blocking notification dispatch
      }
    }

    // 5. Write to System Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'STUDENT_GRIEVANCE_STATUS_UPDATED',
          entityType: 'GrievanceTicket',
          entityId: ticketNumber,
          oldValues: { status: previousStatus, adminNote: previousMeta.adminNote },
          newValues: { status, adminRemarks, updatedBy: session.email },
        },
      });
    } catch {
      // Non-blocking audit log
    }

    revalidatePath('/admin/feedback');
    revalidatePath('/portal');

    return { success: true, ticketNumber, status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update grievance ticket.';
    return { success: false, error: message };
  }
}
