import { prisma } from '@/lib/db';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  staleUntil: number;
  isRevalidating?: boolean;
}

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds fresh TTL
const DEFAULT_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes stale TTL for background SWR

/**
 * High-performance Tenant-isolated Cache with Stale-While-Revalidate (SWR).
 * - Fresh Cache Hit: returns in < 0.1ms directly from in-memory store.
 * - Stale Hit (SWR): returns cached data instantly while silently revalidating in background.
 * - Cache Miss: queries database, stores entry, and returns fresh data.
 * - Guarantees zero cross-tenant contamination: keys are strictly prefixed with tenantId.
 */
export async function getOrSetTenantCache<T>(
  tenantId: string,
  category: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
  staleTtlMs: number = DEFAULT_STALE_TTL_MS
): Promise<T> {
  if (!tenantId) {
    throw new Error('Tenant isolation security check failed: tenantId required for cache access');
  }

  const cacheKey = `${tenantId}:${category}`;
  const now = Date.now();
  const cached = store.get(cacheKey) as CacheEntry<T> | undefined;

  // 1. Fresh Cache Hit (< 0.1ms)
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // 2. Stale-While-Revalidate Hit: return immediately, revalidate asynchronously
  if (cached && cached.staleUntil > now) {
    if (!cached.isRevalidating) {
      cached.isRevalidating = true;
      fetcher()
        .then((fresh) => {
          store.set(cacheKey, {
            data: fresh,
            expiresAt: Date.now() + ttlMs,
            staleUntil: Date.now() + staleTtlMs,
            isRevalidating: false,
          });
        })
        .catch((err) => {
          if (cached) cached.isRevalidating = false;
          console.warn(`[CACHE-REVALIDATE-WARN] Background revalidation failed for ${cacheKey}:`, err?.message || err);
        });
    }
    return cached.data;
  }

  // 3. Cache Miss: Fetch fresh data and cache it
  const freshData = await fetcher();
  store.set(cacheKey, {
    data: freshData,
    expiresAt: now + ttlMs,
    staleUntil: now + staleTtlMs,
    isRevalidating: false,
  });

  return freshData;
}

/**
 * Invalidate cache for a specific tenant and category, or globally across categories.
 */
export function invalidateTenantCache(
  tenantId?: string,
  category?: string
) {
  if (!tenantId) {
    if (!category || category === 'all') {
      store.clear();
    } else {
      store.forEach((_, key) => {
        if (key.includes(`:${category}`) || key.endsWith(`:${category}`)) {
          store.delete(key);
        }
      });
    }
    return;
  }

  if (!category || category === 'all') {
    const prefix = `${tenantId}:`;
    store.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        store.delete(key);
      }
    });
  } else {
    const prefix = `${tenantId}:${category}`;
    store.forEach((_, key) => {
      if (key === prefix || key.startsWith(`${prefix}:`)) {
        store.delete(key);
      }
    });
  }
}

// ============================================================================
// ADMIN DASHBOARD & DIRECTORY CACHES (Instant Reads)
// ============================================================================

/**
 * Cached Admin Dashboard Metrics & Aggregates.
 * Bundles 10 heavy queries into a single cached payload (60s fresh, 5m stale).
 */
export async function getCachedAdminDashboardData(tenantId: string) {
  return getOrSetTenantCache(
    tenantId,
    'dashboard',
    async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      return Promise.all([
        prisma.studentProfile.count({ where: { tenantId } }),
        prisma.teacherProfile.count({ where: { tenantId } }),
        // Today's attendance records (for attendance rate)
        prisma.studentAttendance.findMany({
          where: { tenantId, date: { gte: todayStart, lte: todayEnd } },
          select: { status: true, sectionId: true },
        }),
        // Fee aggregates
        prisma.feeInvoice.aggregate({
          where: { tenantId },
          _sum: { netAmount: true, paidAmount: true, balanceAmount: true },
        }),
        prisma.feeInvoice.aggregate({
          where: { tenantId, balanceAmount: { gt: 0 }, dueDate: { lt: todayStart } },
          _sum: { balanceAmount: true },
          _count: { _all: true },
        }),
        prisma.teacherSubstitution.count({
          where: { tenantId, status: 'ASSIGNED', date: { gte: todayStart, lte: todayEnd } },
        }),
        prisma.notice.findMany({
          where: { tenantId },
          orderBy: { publishedAt: 'desc' },
          take: 6,
          select: { id: true, title: true, content: true, publishedAt: true, priority: true, targetAudience: true },
        }),
        // Filter out USER_LOGIN spam at DB level
        prisma.auditLog.findMany({
          where: { tenantId, action: { not: 'USER_LOGIN' } },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: { user: { select: { firstName: true, lastName: true } } },
        }),
        // Use _count for fast section student aggregates
        prisma.section.findMany({
          where: { tenantId },
          include: {
            classGrade: { select: { id: true, name: true } },
            classTeacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            _count: { select: { students: true } },
          },
        }),
        prisma.admissionApplication.count({
          where: { tenantId, status: 'SUBMITTED' },
        }),
      ]);
    },
    60 * 1000,
    5 * 60 * 1000
  );
}

/**
 * Cached Admin Students Directory.
 */
export async function getCachedAdminStudents(tenantId: string, page: number = 1, pageSize: number = 50) {
  const skip = (page - 1) * pageSize;
  return getOrSetTenantCache(
    tenantId,
    `students:${page}:${pageSize}`,
    async () => {
      return Promise.all([
        prisma.studentProfile.count({ where: { tenantId } }),
        prisma.studentProfile.findMany({
          where: { tenantId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                isActive: true,
                deletedAt: true,
              },
            },
            section: {
              include: {
                classGrade: { select: { id: true, name: true } },
              },
            },
            parents: {
              include: {
                parent: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
              orderBy: { isPrimary: 'desc' },
              take: 1,
            },
            attendances: {
              select: { status: true },
              take: 30,
              orderBy: { date: 'desc' },
            },
            feeInvoices: {
              select: {
                netAmount: true,
                paidAmount: true,
                balanceAmount: true,
                status: true,
              },
              take: 10,
            },
          },
          orderBy: { rollNumber: 'asc' },
          take: pageSize,
          skip,
        }),
        prisma.section.findMany({
          where: { tenantId },
          include: { classGrade: { select: { id: true, name: true } } },
        }),
      ]);
    },
    60 * 1000,
    5 * 60 * 1000
  );
}

/**
 * Cached Admin Teachers Directory.
 */
export async function getCachedAdminTeachers(tenantId: string) {
  return getOrSetTenantCache(
    tenantId,
    'teachers',
    async () => {
      const today = new Date();
      const todayDateOnly = new Date(`${today.toISOString().split('T')[0]}T00:00:00.000Z`);

      return Promise.all([
        prisma.teacherProfile.findMany({
          where: { tenantId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                isActive: true,
                deletedAt: true,
              },
            },
            assignedSubstitutions: {
              where: {
                status: 'ASSIGNED',
                date: todayDateOnly,
              },
              include: {
                originalTeacher: {
                  include: {
                    user: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
          },
          orderBy: { employeeId: 'asc' },
        }),
        prisma.section.findMany({
          where: { tenantId },
          include: { classGrade: { select: { id: true, name: true } } },
        }),
      ]);
    },
    60 * 1000,
    5 * 60 * 1000
  );
}

/**
 * Cached Admin Fees Counter & Invoices.
 */
export async function getCachedAdminFees(tenantId: string) {
  return getOrSetTenantCache(
    tenantId,
    'fees',
    async () => {
      return Promise.all([
        prisma.feeInvoice.findMany({
          where: { tenantId },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
                section: {
                  include: { classGrade: { select: { id: true, name: true } } },
                },
              },
            },
            feeTerm: {
              select: { id: true, name: true },
            },
            items: {
              include: { feeCategory: { select: { id: true, name: true } } },
            },
          },
          orderBy: { generatedAt: 'desc' },
          take: 50,
        }),
        prisma.feePayment.findMany({
          where: { tenantId },
          include: {
            collector: {
              select: { firstName: true, lastName: true },
            },
            feeInvoice: {
              include: {
                student: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                    section: {
                      include: { classGrade: { select: { id: true, name: true } } },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.studentProfile.findMany({
          where: { tenantId, user: { isActive: true } },
          select: {
            id: true,
            admissionNumber: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            section: {
              select: {
                name: true,
                classGrade: { select: { name: true } },
              },
            },
            parents: {
              take: 1,
              orderBy: { isPrimary: 'desc' },
              select: {
                parent: {
                  select: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { admissionNumber: 'asc' },
          take: 100,
        }),
        prisma.academicYear.findMany({
          where: { tenantId },
          select: { id: true, name: true },
          orderBy: { startDate: 'desc' },
        }),
        prisma.classGrade.findMany({
          where: { tenantId },
          select: { id: true, name: true },
          orderBy: { numericOrder: 'asc' },
        }),
        prisma.feeTerm.findMany({
          where: { tenantId },
          select: { id: true, name: true, termNumber: true, academicYearId: true },
          orderBy: { termNumber: 'asc' },
        }),
      ]);
    },
    45 * 1000,
    5 * 60 * 1000
  );
}

/**
 * Cached Admin Academics & Timetable Schedule.
 */
export async function getCachedAdminAcademics(tenantId: string) {
  return getOrSetTenantCache(
    tenantId,
    'academics',
    async () => {
      const today = new Date();
      const todayDateOnly = new Date(`${today.toISOString().split('T')[0]}T00:00:00.000Z`);

      return Promise.all([
        prisma.timetableEntry.findMany({
          where: { tenantId },
          include: {
            section: {
              include: {
                classGrade: true,
              },
            },
            periodTimeSlot: true,
            subject: true,
            teacher: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
            substitutions: {
              where: {
                status: 'ASSIGNED',
                date: {
                  gte: todayDateOnly,
                },
              },
              include: {
                substituteTeacher: {
                  include: {
                    user: { select: { firstName: true, lastName: true } },
                  },
                },
              },
              take: 1,
            },
          },
          orderBy: [
            { sectionId: 'asc' },
            { periodTimeSlot: { order: 'asc' } },
          ],
        }),
        prisma.teacherProfile.findMany({
          where: { tenantId },
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: {
            user: {
              firstName: 'asc',
            },
          },
        }),
        prisma.section.findMany({
          where: { tenantId },
          include: { classGrade: true },
          orderBy: [
            { classGrade: { numericOrder: 'asc' } },
            { name: 'asc' },
          ],
        }),
        prisma.teacherSubstitution.findMany({
          where: { tenantId },
          include: {
            timetableEntry: {
              include: {
                section: {
                  include: {
                    classGrade: true,
                  },
                },
                periodTimeSlot: true,
                subject: true,
              },
            },
            substituteTeacher: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 50,
        }),
      ]);
    },
    60 * 1000,
    5 * 60 * 1000
  );
}

// ============================================================================
// FACULTY & STUDENT PORTAL CACHES
// ============================================================================

/**
 * Cached Teacher Dashboard (Attendance status + feedback rating).
 */
export async function getCachedTeacherDashboard(tenantId: string, userId: string) {
  return getOrSetTenantCache(
    tenantId,
    `teacherDashboard:${userId}`,
    async () => {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      let todayAttendance = null;
      let feedbackSummary: { responseCount: number; overallRating: number; cycleTitle?: string } | null = null;

      todayAttendance = await prisma.staffAttendance.findFirst({
        where: {
          tenantId,
          userId,
          date: todayStart,
        },
      });

      const teacherProfile = await prisma.teacherProfile.findFirst({
        where: { tenantId, userId },
        select: { id: true },
      });

      if (teacherProfile) {
        const activeCycle = await prisma.feedbackCycle.findFirst({
          where: { tenantId, status: 'ACTIVE' },
          select: { id: true, title: true },
        });

        if (activeCycle) {
          const agg = await prisma.feedbackSubmission.aggregate({
            where: {
              tenantId,
              teacherId: teacherProfile.id,
              feedbackCycleId: activeCycle.id,
              overallRating: { not: null },
            },
            _count: { overallRating: true },
            _avg: { overallRating: true },
          });

          if (agg._count.overallRating > 0) {
            feedbackSummary = {
              responseCount: agg._count.overallRating,
              overallRating: Number((agg._avg.overallRating || 0).toFixed(1)),
              cycleTitle: activeCycle.title,
            };
          }
        }
      }

      return {
        todayAttendance,
        feedbackSummary,
      };
    },
    30 * 1000,
    3 * 60 * 1000
  );
}

/**
 * Cached User Profile with Student and Parent relations.
 */
export async function getCachedUserProfileWithProfiles(userId: string) {
  return getOrSetTenantCache(
    'user',
    `profiles:${userId}`,
    async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: {
            include: {
              user: true,
              section: {
                include: {
                  classGrade: true,
                },
              },
            },
          },
          parentProfile: {
            include: {
              students: {
                include: {
                  student: {
                    include: {
                      user: true,
                      section: {
                        include: {
                          classGrade: true,
                        },
                      },
                    },
                  },
                },
                orderBy: { isPrimary: 'desc' },
              },
            },
          },
        },
      });
    },
    60 * 1000,
    10 * 60 * 1000
  );
}

// ============================================================================
// TENANT METADATA CACHES
// ============================================================================

/**
 * Cached Subjects for a tenant.
 */
export async function getCachedTenantSubjects(tenantId: string) {
  return getOrSetTenantCache(
    tenantId,
    'subjects',
    async () => {
      return prisma.subject.findMany({
        where: { tenantId },
        orderBy: { code: 'asc' },
      });
    },
    10 * 60 * 1000
  );
}

/**
 * Cached Notices for a tenant.
 */
export async function getCachedTenantNotices(tenantId: string, take?: number) {
  return getOrSetTenantCache(
    tenantId,
    `notices:${take ?? 'all'}`,
    async () => {
      return prisma.notice.findMany({
        where: { tenantId },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        ...(take ? { take } : {}),
      });
    },
    3 * 60 * 1000,
    15 * 60 * 1000
  );
}

/**
 * Cached Holidays for a tenant.
 */
export async function getCachedTenantHolidays(tenantId: string, take: number = 6) {
  return getOrSetTenantCache(
    tenantId,
    `holidays:${take}`,
    async () => {
      return prisma.holiday.findMany({
        where: { tenantId },
        orderBy: { date: 'asc' },
        take,
      });
    },
    10 * 60 * 1000,
    60 * 60 * 1000
  );
}

/**
 * Cached Published Events for a tenant.
 */
export async function getCachedTenantEvents(tenantId: string, take: number = 6) {
  return getOrSetTenantCache(
    tenantId,
    `events:${take}`,
    async () => {
      return prisma.event.findMany({
        where: { tenantId, isPublished: true },
        orderBy: { eventDate: 'asc' },
        take,
      });
    },
    10 * 60 * 1000,
    60 * 60 * 1000
  );
}

/**
 * Cached Emergency Contacts for a tenant.
 */
export async function getCachedTenantEmergencyContacts(tenantId: string, take: number = 8) {
  return getOrSetTenantCache(
    tenantId,
    `contacts:${take}`,
    async () => {
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
    },
    10 * 60 * 1000,
    60 * 60 * 1000
  );
}
