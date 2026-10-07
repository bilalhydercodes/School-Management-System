import { prisma } from '@/lib/db';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Tenant-isolated cache getter and fetcher.
 * Guarantees zero cross-tenant contamination: key is strictly prefixed with tenantId.
 */
async function getOrSetTenantCache<T>(
  tenantId: string,
  category: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  if (!tenantId) {
    throw new Error('Tenant isolation security check failed: tenantId required for cache access');
  }

  const cacheKey = `${tenantId}:${category}`;
  const now = Date.now();
  const cached = store.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const freshData = await fetcher();
  store.set(cacheKey, {
    data: freshData,
    expiresAt: now + ttlMs,
  });

  return freshData;
}

/**
 * Invalidate cache for a specific tenant and category.
 */
export function invalidateTenantCache(
  tenantId: string,
  category?: 'notices' | 'holidays' | 'events' | 'contacts' | 'subjects' | 'all'
) {
  if (!tenantId) return;

  if (!category || category === 'all') {
    const prefix = `${tenantId}:`;
    store.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        store.delete(key);
      }
    });
  } else {
    store.delete(`${tenantId}:${category}`);
  }
}

/**
 * Cached Subjects for a tenant.
 */
export async function getCachedTenantSubjects(tenantId: string) {
  return getOrSetTenantCache(tenantId, 'subjects', async () => {
    return prisma.subject.findMany({
      where: { tenantId },
      orderBy: { code: 'asc' },
    });
  });
}

/**
 * Cached Notices for a tenant.
 */
export async function getCachedTenantNotices(tenantId: string, take: number = 12) {
  return getOrSetTenantCache(tenantId, `notices:${take}`, async () => {
    return prisma.notice.findMany({
      where: { tenantId },
      orderBy: { publishedAt: 'desc' },
      take,
    });
  });
}

/**
 * Cached Holidays for a tenant.
 */
export async function getCachedTenantHolidays(tenantId: string, take: number = 6) {
  return getOrSetTenantCache(tenantId, `holidays:${take}`, async () => {
    return prisma.holiday.findMany({
      where: { tenantId },
      orderBy: { date: 'asc' },
      take,
    });
  });
}

/**
 * Cached Published Events for a tenant.
 */
export async function getCachedTenantEvents(tenantId: string, take: number = 6) {
  return getOrSetTenantCache(tenantId, `events:${take}`, async () => {
    return prisma.event.findMany({
      where: { tenantId, isPublished: true },
      orderBy: { eventDate: 'asc' },
      take,
    });
  });
}

/**
 * Cached Emergency Contacts for a tenant.
 */
export async function getCachedTenantEmergencyContacts(tenantId: string, take: number = 8) {
  return getOrSetTenantCache(tenantId, `contacts:${take}`, async () => {
    try {
      return prisma.emergencyContact
        ? await prisma.emergencyContact.findMany({
            where: { tenantId },
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
            take,
          })
        : [];
    } catch {
      return [];
    }
  });
}
