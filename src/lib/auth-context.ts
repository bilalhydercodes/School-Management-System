import * as React from 'react';
import { getSessionFromCookies } from '@/lib/session';
import { getAuthoritativeUserFromClerk } from '@/lib/clerk-auth';
import { prisma } from '@/lib/db';
import type { JWTPayload, RoleType } from '@/types';

const serverCache =
  typeof (React as any).cache === 'function'
    ? (React as any).cache
    : (<T extends (...args: any[]) => any>(fn: T): T => fn);

// ============================================================================
// IN-MEMORY TTL CACHE FOR TENANT & USER METADATA (Cross-Request, Tenant-Isolated)
// ============================================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const TENANT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const USER_CACHE_TTL_MS = 60 * 1000;       // 60 seconds

// Keyed strictly by tenantId to guarantee zero cross-tenant contamination
const tenantMetadataCache = new Map<string, CacheEntry<{
  id: string;
  name: string;
  board: string | null;
  slug: string;
  isActive: boolean;
} | null>>();

const academicYearCache = new Map<string, CacheEntry<{
  id: string;
  name: string;
  isCurrent: boolean;
} | null>>();

// Keyed strictly by userId
const userProfileCache = new Map<string, CacheEntry<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleType;
  avatarUrl: string | null;
  tenantId: string | null;
} | null>>();

/**
 * Invalidates cached tenant metadata when updated.
 */
export function invalidateTenantCache(tenantId: string) {
  tenantMetadataCache.delete(tenantId);
  academicYearCache.delete(tenantId);
}

/**
 * Invalidates cached user profile.
 */
export function invalidateUserCache(userId: string) {
  userProfileCache.delete(userId);
}

// ============================================================================
// TENANT & ACADEMIC YEAR METADATA FETCHERS (Cached)
// ============================================================================

export async function getCachedTenantMeta(tenantId: string) {
  if (!tenantId) return null;
  const now = Date.now();
  const cached = tenantMetadataCache.get(tenantId);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      board: true,
      slug: true,
      isActive: true,
    },
  });

  tenantMetadataCache.set(tenantId, {
    data: tenant,
    expiresAt: now + TENANT_CACHE_TTL_MS,
  });

  return tenant;
}

export async function getCachedAcademicYear(tenantId: string) {
  if (!tenantId) return null;
  const now = Date.now();
  const cached = academicYearCache.get(tenantId);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const academicYear = await prisma.academicYear.findFirst({
    where: { tenantId, isCurrent: true },
    select: { id: true, name: true, isCurrent: true },
  });

  academicYearCache.set(tenantId, {
    data: academicYear,
    expiresAt: now + TENANT_CACHE_TTL_MS,
  });

  return academicYear;
}

export async function getCachedUserProfile(userId: string) {
  if (!userId) return null;
  const now = Date.now();
  const cached = userProfileCache.get(userId);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      avatarUrl: true,
      tenantId: true,
    },
  });

  userProfileCache.set(userId, {
    data: user as any,
    expiresAt: now + USER_CACHE_TTL_MS,
  });

  return user;
}

// ============================================================================
// REQUEST-LEVEL MEMOIZED SESSION & AUTH CONTEXT (React.cache)
// ============================================================================

/**
 * Request-memoized session resolution.
 * Calling this multiple times in the same request (e.g. layout + page + guards)
 * executes the cookie/JWT validation EXACTLY ONCE.
 */
export const getEffectiveSession = serverCache(async () => {
  const clerkSession = await getAuthoritativeUserFromClerk();
  const session = await getSessionFromCookies();

  const effectiveRole = (clerkSession?.role || session?.role) as RoleType | undefined;
  const effectiveUserId = clerkSession?.appUser.userId || session?.sub;
  const effectiveEmail = clerkSession?.appUser.email || session?.email;
  const effectiveTenantId = clerkSession?.tenantId || session?.tenantId;

  return {
    clerkSession,
    session,
    role: effectiveRole,
    userId: effectiveUserId,
    email: effectiveEmail,
    tenantId: effectiveTenantId,
    isAuthenticated: Boolean(effectiveRole && effectiveUserId),
  };
});

export interface AuthenticatedContext {
  userId: string;
  role: RoleType;
  email: string;
  tenantId: string | null;
  user: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  tenant: {
    name: string;
    board: string;
    slug: string;
  } | null;
  academicYear: {
    name: string;
  } | null;
}

/**
 * Consolidated high-performance authenticated context.
 * Performs zero redundant database roundtrips during navigation.
 */
export const getAuthenticatedContext = serverCache(async (): Promise<AuthenticatedContext | null> => {
  const auth = await getEffectiveSession();
  if (!auth.isAuthenticated || !auth.userId || !auth.role) {
    return null;
  }

  const [dbUser, tenantMeta, academicYear] = await Promise.all([
    getCachedUserProfile(auth.userId),
    auth.tenantId ? getCachedTenantMeta(auth.tenantId) : null,
    auth.tenantId ? getCachedAcademicYear(auth.tenantId) : null,
  ]);

  const firstName = dbUser?.firstName || auth.session?.firstName || 'User';
  const lastName = dbUser?.lastName || auth.session?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = dbUser?.email || auth.email || '';
  const avatarUrl = dbUser?.avatarUrl || null;

  return {
    userId: auth.userId,
    role: auth.role,
    email,
    tenantId: auth.tenantId || null,
    user: {
      firstName,
      lastName,
      fullName,
      email,
      avatarUrl,
    },
    tenant: tenantMeta
      ? {
          name: tenantMeta.name,
          board: tenantMeta.board || 'CBSE',
          slug: tenantMeta.slug,
        }
      : null,
    academicYear: academicYear
      ? {
          name: academicYear.name,
        }
      : null,
  };
});
