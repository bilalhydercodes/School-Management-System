import { prisma } from '@/lib/db';
import { Role, type RoleType } from '@/types';

export interface MigrationUserResult {
  appUserId: string;
  email: string;
  role: RoleType;
  tenantId: string | null;
  status: 'ALREADY_LINKED' | 'LINKED' | 'FAILED' | 'SKIPPED';
  clerkUserId?: string;
  error?: string;
}

export class ClerkMigrationService {
  /**
   * Safely links an existing database user with their Clerk User ID.
   * Enforces verified identity and checks for duplicate conflicts.
   */
  static async linkUserAccount(
    appUserId: string,
    clerkUserId: string,
    verifiedEmail: string,
    options?: { initiatedByAdminId?: string; overwrite?: boolean }
  ): Promise<MigrationUserResult> {
    const user = await prisma.user.findUnique({
      where: { id: appUserId },
      include: { tenant: true },
    });

    if (!user) {
      return {
        appUserId,
        email: verifiedEmail,
        role: Role.STUDENT,
        tenantId: null,
        status: 'FAILED',
        error: 'Application user not found in PostgreSQL database.',
      };
    }

    // Guard: Prevent account takeover by verifying email match
    if (user.email.toLowerCase().trim() !== verifiedEmail.toLowerCase().trim()) {
      return {
        appUserId,
        email: user.email,
        role: user.role as RoleType,
        tenantId: user.tenantId,
        status: 'FAILED',
        error: `Security mismatch: Clerk verified email "${verifiedEmail}" does not match database email "${user.email}".`,
      };
    }

    // Check if clerkUserId is already assigned to a different user
    const conflictingUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (conflictingUser && conflictingUser.id !== user.id) {
      return {
        appUserId,
        email: user.email,
        role: user.role as RoleType,
        tenantId: user.tenantId,
        status: 'FAILED',
        error: `Clerk ID ${clerkUserId} is already mapped to user ${conflictingUser.id} (${conflictingUser.email}).`,
      };
    }

    if (user.clerkUserId === clerkUserId) {
      return {
        appUserId,
        email: user.email,
        role: user.role as RoleType,
        tenantId: user.tenantId,
        status: 'ALREADY_LINKED',
        clerkUserId,
      };
    }

    // Perform atomic linking
    await prisma.user.update({
      where: { id: user.id },
      data: { clerkUserId },
    });

    // Record audit trail
    if (user.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: options?.initiatedByAdminId || user.id,
          action: 'CLERK_ACCOUNT_LINKED',
          entityType: 'User',
          entityId: user.id,
          newValues: {
            clerkUserId,
            email: user.email,
            role: user.role,
          },
        },
      });
    }

    return {
      appUserId: user.id,
      email: user.email,
      role: user.role as RoleType,
      tenantId: user.tenantId,
      status: 'LINKED',
      clerkUserId,
    };
  }

  /**
   * Generates a pre-migration audit summary of all unlinked accounts across schools.
   */
  static async getUnlinkedAccountsAudit(tenantId?: string) {
    const whereClause: Record<string, unknown> = {
      clerkUserId: null,
      isActive: true,
      deletedAt: null,
    };

    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const unlinkedUsers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        createdAt: true,
        tenant: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const byRole = unlinkedUsers.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUnlinked: unlinkedUsers.length,
      byRole,
      users: unlinkedUsers,
    };
  }

  /**
   * Rollback utility: unlinks a specific Clerk user ID in case of recovery.
   */
  static async rollbackAccountLink(appUserId: string, adminUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: appUserId },
    });

    if (!user || !user.clerkUserId) {
      return { success: false, error: 'User not found or not linked to Clerk.' };
    }

    const previousClerkId = user.clerkUserId;
    await prisma.user.update({
      where: { id: appUserId },
      data: { clerkUserId: null },
    });

    if (user.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: adminUserId || user.id,
          action: 'CLERK_ACCOUNT_UNLINKED',
          entityType: 'User',
          entityId: appUserId,
          newValues: { previousClerkId },
        },
      });
    }

    return { success: true, unlinkedClerkId: previousClerkId };
  }
}
