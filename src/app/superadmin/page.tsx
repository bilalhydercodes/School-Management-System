import { prisma } from '@/lib/db';
import SuperAdminDashboardClient, {
  SuperAdminDashboardStats,
} from '@/components/superadmin/SuperAdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  let tenants: any[] = [];
  let studentCount = 0;
  let teacherCount = 0;
  let studentGroups: any[] = [];
  let auditLogs: any[] = [];

  try {
    tenants = await prisma.tenant.findMany({
      include: {
        subscriptionPlan: true,
        domains: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err: any) {
    console.warn('First attempt to query tenants failed, retrying in 500ms...', err?.message);
    await new Promise((r) => setTimeout(r, 500));
    try {
      tenants = await prisma.tenant.findMany({
        include: {
          subscriptionPlan: true,
          domains: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (retryErr) {
      console.error('Failed to query tenants after retry:', retryErr);
      tenants = [];
    }
  }

  try {
    const results = await Promise.all([
      prisma.studentProfile.count().catch(() => 0),
      prisma.teacherProfile.count().catch(() => 0),
      prisma.studentProfile.groupBy({
        by: ['tenantId'],
        _count: { id: true },
      }).catch(() => []),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { name: true } },
          user: { select: { email: true } },
        },
      }).catch(() => []),
    ]);

    studentCount = results[0];
    teacherCount = results[1];
    studentGroups = results[2];
    auditLogs = results[3];
  } catch {
    // Graceful fallback
  }

  const studentCountMap = new Map<string, number>();
  studentGroups.forEach((g) => {
    studentCountMap.set(g.tenantId, g._count?.id || 0);
  });

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(
    (t) => t.subscriptionStatus === 'ACTIVE' && t.isActive
  ).length;

  let platformMrr = 0;
  tenants.forEach((t) => {
    if (t.subscriptionStatus === 'ACTIVE' && t.isActive && t.subscriptionPlan) {
      const sCount = studentCountMap.get(t.id) || 0;
      const rate = Number(t.subscriptionPlan.priceMonthly);
      platformMrr += sCount > 0 ? sCount * rate : rate;
    }
  });

  const platformArr = platformMrr * 12;

  // Board distribution
  const boardCounts: Record<string, number> = {};
  tenants.forEach((t) => {
    const b = t.board || 'CBSE';
    boardCounts[b] = (boardCounts[b] || 0) + 1;
  });

  const boardDistribution = Object.entries(boardCounts).map(([board, count]) => ({
    board,
    count,
  }));

  // Real Exceptions for Needs Attention
  const nearCapacityTenants = tenants
    .filter((t) => {
      const count = studentCountMap.get(t.id) || 0;
      const max = t.subscriptionPlan?.maxStudents || 1500;
      return count / max >= 0.85;
    })
    .map((t) => ({
      id: t.id,
      name: t.name,
      ratio: `${studentCountMap.get(t.id) || 0} / ${t.subscriptionPlan?.maxStudents || 1500}`,
      percent: Math.round(
        ((studentCountMap.get(t.id) || 0) / (t.subscriptionPlan?.maxStudents || 1500)) * 100
      ),
    }));

  const pendingDnsDomains = tenants.flatMap((t) =>
    (t.domains || [])
      .filter((d: any) => !d.isVerified)
      .map((d: any) => ({
        tenantName: t.name,
        domain: d.domain,
      }))
  );

  const suspendedTenants = tenants
    .filter((t) => t.subscriptionStatus === 'SUSPENDED')
    .map((t) => ({
      id: t.id,
      name: t.name,
    }));

  const recentTenants = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    city: t.city,
    board: t.board === 'STATE_BOARD' ? 'State Board' : t.board,
    status: t.subscriptionStatus,
    planName: t.subscriptionPlan?.name || 'Standard Plan',
    studentCount: studentCountMap.get(t.id) || 0,
    maxStudents: t.subscriptionPlan?.maxStudents || 1500,
    priceMonthly: Number(t.subscriptionPlan?.priceMonthly || 0),
    createdAt: t.createdAt.toISOString(),
  }));

  // Filter routine USER_LOGIN spam
  const sensitiveAudit = auditLogs.filter((l) => l.action !== 'USER_LOGIN');
  const auditLogsToRender = sensitiveAudit.length > 0 ? sensitiveAudit : auditLogs.slice(0, 4);

  const recentAuditLogs = auditLogsToRender.map((log) => {
    let cleanAction = log.action;
    if (log.action === 'USER_LOGIN') cleanAction = 'User signed in';
    else if (log.action === 'PROVISION_TENANT') cleanAction = 'School provisioned';
    else if (log.action === 'TOGGLE_STATUS') cleanAction = 'Tenant status updated';
    else if (log.action === 'UPDATE_PLAN') cleanAction = 'Subscription plan updated';

    return {
      id: log.id,
      action: cleanAction,
      entityType: log.entityType,
      entityId: log.entityId,
      tenantName: log.tenant?.name || null,
      userEmail: log.user?.email || null,
      createdAt: log.createdAt.toISOString(),
    };
  });

  const stats: SuperAdminDashboardStats = {
    totalTenants,
    activeTenants,
    totalStudents: studentCount,
    totalTeachers: teacherCount,
    platformMrr,
    platformArr,
    boardDistribution,
    nearCapacityTenants,
    pendingDnsDomains,
    suspendedTenants,
    recentTenants,
    recentAuditLogs,
  };

  return <SuperAdminDashboardClient stats={stats} />;
}
