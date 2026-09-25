'use server';

import { db } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { logAuditEvent } from '@/actions/audit';
import { NoticeAudience, NoticePriority } from '@prisma/client';
import { z } from 'zod';

const CreateNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'PARENTS', 'STUDENTS', 'SPECIFIC_CLASSES']).default('ALL'),
  priority: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']).default('NORMAL'),
  targetClasses: z.array(z.string()).optional(),
  channels: z.string().default('Portal Only'),
  expiresAt: z.string().optional().nullable(),
});

export type CreateNoticeInput = z.infer<typeof CreateNoticeSchema>;

export async function createBroadcastNotice(input: CreateNoticeInput) {
  try {
    const session = await getSessionFromCookies();
    let tenantId = session?.tenantId;
    let userId = session?.sub;

    if (!tenantId && process.env.NODE_ENV === 'development') {
      const defaultTenant = await db.tenant.findFirst();
      tenantId = defaultTenant?.id;
      userId = userId || 'dev-admin-id';
    }

    if (!tenantId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session?.role && !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return { success: false, error: 'Forbidden: Only administrators can broadcast notices' };
    }

    const validation = CreateNoticeSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const data = validation.data;

    // Fetch or fallback author
    let authorUser = await db.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!authorUser) {
      authorUser = await db.user.findFirst({
        where: { tenantId, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      });
    }

    if (!authorUser) {
      return { success: false, error: 'Author account not found' };
    }

    const notice = await db.notice.create({
      data: {
        tenantId,
        authorId: authorUser.id,
        title: data.title,
        content: data.content,
        priority: data.priority as NoticePriority,
        targetAudience: data.targetAudience as NoticeAudience,
        targetClasses: data.targetClasses ? JSON.parse(JSON.stringify(data.targetClasses)) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    await logAuditEvent({
      action: 'NOTICE_BROADCASTED',
      entityType: 'Notice',
      entityId: notice.id,
      newValues: {
        title: notice.title,
        targetAudience: notice.targetAudience,
        priority: notice.priority,
        channels: data.channels,
      },
      tenantId,
      userId: authorUser.id,
    });

    return { success: true, data: { id: notice.id } };
  } catch (error: any) {
    console.error('Create Notice Error:', error);
    return { success: false, error: error.message || 'Failed to broadcast circular' };
  }
}

export async function getBroadcastNotices() {
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

    const role = session?.role || 'STUDENT';
    const now = new Date();

    // Role-scoped notice filtering
    const audienceConditions: NoticeAudience[] = ['ALL'];
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      audienceConditions.push('TEACHERS', 'PARENTS', 'STUDENTS', 'SPECIFIC_CLASSES');
    } else if (role === 'TEACHER') {
      audienceConditions.push('TEACHERS');
    } else if (role === 'PARENT') {
      audienceConditions.push('PARENTS');
    } else if (role === 'STUDENT') {
      audienceConditions.push('STUDENTS');
    }

    const notices = await db.notice.findMany({
      where: {
        tenantId,
        targetAudience: { in: audienceConditions },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 25,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    const formatted = notices.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      audience: n.targetAudience,
      priority: n.priority,
      date: n.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      expiresAt: n.expiresAt ? n.expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Permanent',
      author: `${n.author.firstName} ${n.author.lastName} (${n.author.role})`,
      channel: 'Portal + SMS + WhatsApp',
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Get Broadcast Notices Error:', error);
    return { success: false, error: error.message || 'Failed to fetch notices' };
  }
}
