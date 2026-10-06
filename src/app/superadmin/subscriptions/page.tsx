import { prisma } from '@/lib/db';
import SubscriptionsManagerClient, {
  PlanItem,
} from '@/components/superadmin/SubscriptionsManagerClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminSubscriptionsPage() {
  const [plans, studentGroups] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      include: {
        tenants: {
          select: {
            id: true,
            subscriptionStatus: true,
            isActive: true,
          },
        },
      },
      orderBy: { priceMonthly: 'asc' },
    }),
    prisma.studentProfile.groupBy({
      by: ['tenantId'],
      _count: { id: true },
    }),
  ]);

  const studentCountMap = new Map<string, number>();
  studentGroups.forEach((g) => {
    studentCountMap.set(g.tenantId, g._count.id);
  });

  let totalMrr = 0;

  const planItems: PlanItem[] = plans.map((p) => {
    const activeTenants = p.tenants.filter(
      (t) => t.subscriptionStatus === 'ACTIVE' && t.isActive
    );
    const activeTenantsCount = activeTenants.length;
    const enrolledStudents = activeTenants.reduce(
      (acc, t) => acc + (studentCountMap.get(t.id) || 0),
      0
    );
    const perStudentRate = Number(p.priceMonthly);
    const monthlyRev =
      enrolledStudents > 0
        ? enrolledStudents * perStudentRate
        : activeTenantsCount * perStudentRate;

    totalMrr += monthlyRev;

    return {
      id: p.id,
      name: p.name,
      maxStudents: p.maxStudents,
      maxStaff: p.maxStaff,
      features: (p.features as Record<string, boolean>) || {},
      priceMonthly: perStudentRate,
      priceAnnual: Number(p.priceAnnual),
      isActive: p.isActive,
      tenantCount: activeTenantsCount,
      enrolledStudents,
      totalMonthlyRevenue: monthlyRev,
    };
  });

  const totalArr = totalMrr * 12;

  return (
    <SubscriptionsManagerClient
      plans={planItems}
      totalMrr={totalMrr}
      totalArr={totalArr}
    />
  );
}
