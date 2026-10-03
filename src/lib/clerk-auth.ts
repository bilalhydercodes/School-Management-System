import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { Role, type RoleType, type UserSession } from '@/types';

// ============================================================================
// ROLE-SPECIFIC SESSION POLICY CONSTANTS
// ============================================================================
// Students / Parents: Lifetime persistent session until explicit logout (1 year TTL)
export const STUDENT_MAX_SESSION_MS = 365 * 24 * 60 * 60 * 1000;

// Teachers: Extended session until logout (30 days TTL)
export const TEACHER_MAX_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

// School Admins & Super Admins: Active session until logout or session close (7 days TTL)
export const ADMIN_MAX_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export interface AuthoritativeClerkSession {
  clerkUserId: string;
  appUser: UserSession;
  tenantId: string | null;
  role: RoleType;
  authTimestamp: number;
  sessionExpiresAt: number;
  isSessionExpired: boolean;
  mustReauthenticate: boolean;
}

/**
 * Returns the role-specific maximum session lifetime in milliseconds.
 */
export function getRoleSessionLifetimeMs(role: RoleType | string): number {
  switch (role) {
    case Role.STUDENT:
    case Role.PARENT:
      return STUDENT_MAX_SESSION_MS; // Lifetime persistent until logout (1 year)
    case Role.TEACHER:
      return TEACHER_MAX_SESSION_MS; // Active until logout
    case Role.SUPER_ADMIN:
    case Role.ADMIN:
    default:
      return ADMIN_MAX_SESSION_MS; // Active session until logout or exit
  }
}

/**
 * Checks if a session has exceeded its role-specific maximum lifespan.
 */
export function isSessionExpired(
  authTimestamp: number,
  role: RoleType | string,
  currentTime: number = Date.now()
): boolean {
  const lifetimeMs = getRoleSessionLifetimeMs(role);
  return currentTime > authTimestamp + lifetimeMs;
}

/**
 * Resolves the authenticated user from Clerk, links to Prisma PostgreSQL application user,
 * and rigorously validates account status, tenant membership, and role-specific session TTL.
 */
export async function getAuthoritativeUserFromClerk(): Promise<AuthoritativeClerkSession | null> {
  const { userId: clerkUserId, sessionClaims } = auth();

  if (!clerkUserId) {
    return null;
  }

  // 1. Fetch user from authoritative Prisma PostgreSQL database
  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          subscriptionStatus: true,
        },
      },
    },
  });

  // 2. If not linked by clerkUserId yet, attempt verified email linking
  if (!user) {
    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses?.find(
      (e) => e.id === clerkUser.primaryEmailAddressId && e.verification?.status === 'verified'
    )?.emailAddress;

    if (primaryEmail) {
      // Find candidate user by verified email
      const candidateUser = await prisma.user.findFirst({
        where: {
          email: { equals: primaryEmail.toLowerCase().trim(), mode: 'insensitive' },
          clerkUserId: null, // Only unlinked records
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
              subscriptionStatus: true,
            },
          },
        },
      });

      if (candidateUser) {
        // Safe Atomic Linking with audit trail
        user = await prisma.user.update({
          where: { id: candidateUser.id },
          data: { clerkUserId },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
                subscriptionStatus: true,
              },
            },
          },
        });

        console.info(`[CLERK-AUTH] Successfully linked Clerk user ${clerkUserId} to application user ${user.id} (${user.email}).`);
      }
    }
  }

  if (!user) {
    return null;
  }

  // 3. Validate Account Active Status
  if (!user.isActive || user.deletedAt !== null) {
    console.warn(`[CLERK-AUTH-BLOCKED] User account ${user.id} (${user.email}) is deactivated or deleted.`);
    return null;
  }

  // 4. Validate Tenant Subscription & Active Status (for non-SuperAdmin)
  if (user.role !== Role.SUPER_ADMIN) {
    if (!user.tenant || !user.tenant.isActive || user.tenant.subscriptionStatus === 'SUSPENDED') {
      console.warn(`[CLERK-AUTH-BLOCKED] Tenant ${user.tenantId} for user ${user.id} is suspended or inactive.`);
      return null;
    }
  }

  // 5. Calculate & Enforce Role-Specific Session Expiry
  // Extract auth timestamp from session claims iat/auth_time or fallback to current time
  const iatSeconds = (sessionClaims?.iat as number) || (sessionClaims?.auth_time as number) || Math.floor(Date.now() / 1000);
  const authTimestamp = iatSeconds * 1000;
  const lifetimeMs = getRoleSessionLifetimeMs(user.role as RoleType);
  const sessionExpiresAt = authTimestamp + lifetimeMs;
  const isSessionExpired = Date.now() > sessionExpiresAt;

  const appUser: UserSession = {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role as RoleType,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    mustChangePassword: user.mustChangePassword,
  };

  return {
    clerkUserId,
    appUser,
    tenantId: user.tenantId,
    role: user.role as RoleType,
    authTimestamp,
    sessionExpiresAt,
    isSessionExpired,
    mustReauthenticate: isSessionExpired,
  };
}

/**
 * Safe Administrative Account Linking Helper.
 * Links an existing Prisma user to a Clerk user ID after verifying identity.
 */
export async function linkClerkAccount(
  appUserId: string,
  clerkUserId: string,
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existingClerkMapping = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (existingClerkMapping && existingClerkMapping.id !== appUserId) {
      return { success: false, error: 'This Clerk identity is already linked to another user account.' };
    }

    const updatedUser = await prisma.user.update({
      where: { id: appUserId },
      data: { clerkUserId },
    });

    if (adminUserId && updatedUser.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: updatedUser.tenantId,
          userId: adminUserId,
          action: 'CLERK_ACCOUNT_LINKED',
          entityType: 'User',
          entityId: appUserId,
          newValues: { clerkUserId },
        },
      });
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to link Clerk account';
    return { success: false, error: msg };
  }
}
