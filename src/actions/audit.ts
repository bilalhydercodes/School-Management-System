'use server';

import { db } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';

export interface AuditLogOptions {
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  tenantId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Institutional Audit Logger
 * Records administrative and operational actions for institutional compliance and security.
 * Strips any sensitive credentials (passwords, tokens, secrets) before persisting.
 */
export async function logAuditEvent(options: AuditLogOptions): Promise<void> {
  try {
    let tenantId = options.tenantId;
    let userId = options.userId;

    if (!tenantId || !userId) {
      const session = await getSessionFromCookies();
      if (session) {
        tenantId = tenantId || (session.tenantId as string) || undefined;
        userId = userId || session.sub;
      }
    }

    // Sanitize oldValues and newValues to prevent logging passwords/tokens
    const sanitize = (data: any) => {
      if (!data || typeof data !== 'object') return data;
      const sanitized = { ...data };
      const forbiddenKeys = ['password', 'passwordHash', 'token', 'tokenHash', 'secret', 'apiKey'];
      for (const key of Object.keys(sanitized)) {
        if (forbiddenKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
          sanitized[key] = '[REDACTED]';
        }
      }
      return sanitized;
    };

    if (tenantId) {
      await db.auditLog.create({
        data: {
          tenantId,
          userId: userId || null,
          action: options.action,
          entityType: options.entityType,
          entityId: options.entityId || null,
          oldValues: options.oldValues ? sanitize(options.oldValues) : undefined,
          newValues: options.newValues ? sanitize(options.newValues) : undefined,
          ipAddress: options.ipAddress || null,
          userAgent: options.userAgent || null,
        },
      });
    }
  } catch (error) {
    // Non-blocking log catch
    console.warn('Audit log write error:', error);
  }
}

/**
 * Fetch institutional audit logs for Super Admin / School Admin audit overview
 */
export async function getInstitutionalAuditLogs(limit: number = 50) {
  try {
    const session = await getSessionFromCookies();
    if (!session?.sub || !session?.tenantId) {
      return { success: false, error: 'Unauthorized' };
    }
    if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    const logs = await db.auditLog.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return { success: true, data: logs };
  } catch (error: any) {
    console.error('Fetch Audit Logs Error:', error);
    return { success: false, error: error.message || 'Failed to fetch audit logs' };
  }
}
