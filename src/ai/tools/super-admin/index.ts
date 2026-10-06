import { prisma } from '@/lib/db';
import type { AITool, ToolExecutionResult } from '../types';
import type { AIUserContext } from '../../core/types';

function verifySuperAdminSession(context: AIUserContext) {
  if (context.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Super Admin tools are restricted to platform administrators.');
  }
}

export const superAdminTools: AITool[] = [
  // 1. getPlatformOverview
  {
    name: 'getPlatformOverview',
    description: 'Retrieves multi-tenant platform statistics, total registered schools, and pending onboarding applications.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifySuperAdminSession(context);

        const totalTenants = await prisma.tenant.count();
        const activeTenants = await prisma.tenant.count({ where: { isActive: true } });
        const pendingApplications = await prisma.institutionApplication.count({ where: { status: 'PENDING' } });
        const totalUsers = await prisma.user.count();

        return {
          success: true,
          data: {
            totalRegisteredInstitutions: totalTenants,
            activeInstitutions: activeTenants,
            pendingOnboardingRequests: pendingApplications,
            totalPlatformUsers: totalUsers,
          },
          uiCard: {
            type: 'generic',
            title: 'Alpha Platform Overview',
            badge: `${activeTenants}/${totalTenants} Active`,
            metrics: [
              { label: 'Total Schools', value: totalTenants },
              { label: 'Active Schools', value: activeTenants },
              { label: 'Pending Onboarding', value: pendingApplications, highlight: pendingApplications > 0 },
              { label: 'Total Users', value: totalUsers },
            ],
          },
          uiActions: [
            { label: 'Institution Requests', path: '/superadmin/institution-requests' },
            { label: 'Super Admin Control Panel', path: '/superadmin' },
          ],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 2. getTenantStatistics
  {
    name: 'getTenantStatistics',
    description: 'Lists all school tenants with their status, board, student counts, and creation dates.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifySuperAdminSession(context);

        const tenants = await prisma.tenant.findMany({
          include: {
            _count: {
              select: {
                users: true,
                studentProfiles: true,
                teacherProfiles: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        const list = tenants.map((t) => ({
          name: t.name,
          slug: t.slug,
          board: t.board || 'CBSE',
          isActive: t.isActive,
          studentsCount: t._count.studentProfiles,
          teachersCount: t._count.teacherProfiles,
        }));

        return {
          success: true,
          data: list,
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 3. getTenantActivity
  {
    name: 'getTenantActivity',
    description: 'Retrieves recent platform audit logs and institution onboarding events.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifySuperAdminSession(context);

        const logs = await prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            action: true,
            entityType: true,
            createdAt: true,
          },
        });

        return {
          success: true,
          data: logs.map((l) => ({
            action: l.action,
            entity: l.entityType,
            date: l.createdAt.toISOString(),
          })),
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 4. getPlatformUserStatistics
  {
    name: 'getPlatformUserStatistics',
    description: 'Aggregates all active users across the multi-tenant platform categorized by role.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifySuperAdminSession(context);

        const usersByRole = await prisma.user.groupBy({
          by: ['role'],
          _count: { id: true },
        });

        const summary: Record<string, number> = {};
        for (const item of usersByRole) {
          summary[item.role] = item._count.id;
        }

        return {
          success: true,
          data: summary,
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 5. getPlatformRevenueStatistics
  {
    name: 'getPlatformRevenueStatistics',
    description: 'Retrieves platform SaaS subscription tiers, active subscriptions, and school licenses.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifySuperAdminSession(context);

        const plansCount = await prisma.subscriptionPlan.count();
        const activeTenants = await prisma.tenant.count({ where: { isActive: true } });

        return {
          success: true,
          data: {
            activeSubscribedInstitutions: activeTenants,
            availablePlanTiers: plansCount,
            billingStatus: 'Operational',
          },
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },
];
