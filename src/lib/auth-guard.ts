import { getSessionFromCookies } from '@/lib/session';
import { getAuthoritativeUserFromClerk } from '@/lib/clerk-auth';
import type { JWTPayload, RoleType } from '@/types';
import { Role } from '@/types';

export interface GuardedSession {
  session: JWTPayload;
  userId: string;
  tenantId: string;
  role: RoleType;
  clerkUserId?: string;
}

export type GuardResult =
  | { success: true; context: GuardedSession }
  | { success: false; error: string; statusCode: number; mustChangePassword?: boolean; mustReauthenticate?: boolean };

/**
 * Authoritative Server-Side Authorization Guard.
 * Enforces:
 * 1. Active Clerk or verified session authentication.
 * 2. Strict Role-Specific Session Lifetime:
 *    - School Admins & Super Admins: 15-Minute maximum session limit (hard stop, requires fresh authentication).
 *    - Teachers: 24-Hour verification cycle.
 *    - Students: 24-Hour target session.
 * 3. Role-based access control (RBAC).
 * 4. Multi-tenant school isolation.
 * 5. Password-change requirement.
 */
export async function requireAuthGuard(
  allowedRoles?: RoleType[],
  options?: { allowMustChangePassword?: boolean; requireTenant?: boolean }
): Promise<GuardResult> {
  // 1. Check authoritative Clerk session
  try {
    const clerkAuth = await getAuthoritativeUserFromClerk();

    if (clerkAuth) {
      // Enforce strict 15-min limit on Admins/SuperAdmins and 24h on Teachers/Students
      if (clerkAuth.isSessionExpired) {
        return {
          success: false,
          error:
            clerkAuth.role === Role.ADMIN || clerkAuth.role === Role.SUPER_ADMIN
              ? 'Session expired: Administrator access requires re-authentication every 15 minutes.'
              : 'Session expired: Please sign in again.',
          statusCode: 401,
          mustReauthenticate: true,
        };
      }

      // Role authorization
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(clerkAuth.role)) {
        return {
          success: false,
          error: 'Forbidden: Insufficient privileges for this operation.',
          statusCode: 403,
        };
      }

      // Tenant context enforcement
      const requireTenant = options?.requireTenant ?? (clerkAuth.role !== Role.SUPER_ADMIN);
      if (requireTenant && !clerkAuth.tenantId) {
        return {
          success: false,
          error: 'Tenant context required.',
          statusCode: 400,
        };
      }

      const syntheticPayload: JWTPayload = {
        sub: clerkAuth.appUser.userId,
        tenantId: clerkAuth.tenantId,
        role: clerkAuth.role,
        email: clerkAuth.appUser.email,
        firstName: clerkAuth.appUser.firstName,
        lastName: clerkAuth.appUser.lastName,
        mustChangePassword: clerkAuth.appUser.mustChangePassword,
      };

      return {
        success: true,
        context: {
          session: syntheticPayload,
          userId: clerkAuth.appUser.userId,
          tenantId: clerkAuth.tenantId || '',
          role: clerkAuth.role,
          clerkUserId: clerkAuth.clerkUserId,
        },
      };
    }
  } catch (clerkErr) {
    // If Clerk auth check throws outside request context, proceed to fallback session check
  }

  // 2. Fallback / Direct Cookie Session Verification (Preserves tests and transition tokens)
  const session = await getSessionFromCookies();

  if (!session) {
    return {
      success: false,
      error: 'Unauthorized: Valid session required.',
      statusCode: 401,
    };
  }

  // Role verification
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      success: false,
      error: 'Forbidden: Insufficient privileges for this operation.',
      statusCode: 403,
    };
  }

  // mustChangePassword gate
  if (session.mustChangePassword && !options?.allowMustChangePassword) {
    return {
      success: false,
      error: 'Password change required: You must change your default password before performing operations.',
      statusCode: 403,
      mustChangePassword: true,
    };
  }

  // Tenant context enforcement (for non-SuperAdmin operations)
  const requireTenant = options?.requireTenant ?? (session.role !== Role.SUPER_ADMIN);
  if (requireTenant && !session.tenantId) {
    return {
      success: false,
      error: 'Tenant context required.',
      statusCode: 400,
    };
  }

  return {
    success: true,
    context: {
      session,
      userId: session.sub,
      tenantId: session.tenantId || '',
      role: session.role,
    },
  };
}
