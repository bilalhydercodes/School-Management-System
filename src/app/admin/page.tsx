import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import { getAuthenticatedContext } from '@/lib/auth-context';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';
// Allow Next.js to revalidate cached dashboard data every 60 seconds
export const revalidate = 60;

export default async function AdminDashboardPage() {
  const authContext = await getAuthenticatedContext();
  if (!authContext || (authContext.role !== 'ADMIN' && authContext.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin');
  }

  const tenantId = authContext.tenantId;
  if (!tenantId) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Platform Super Admin Context</h2>
        <p className="text-xs text-slate-500 mt-1">
          Please select a specific school tenant from the Super Admin Command Center.
        </p>
      </div>
    );
  }

  // Cache the heavy parallel DB queries for 60s per tenant to avoid re-fetching on every nav
  const fetchDashboardData = unstable_cache(
    async (tId: string) => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      return Promise.all([
        prisma.studentProfile.count({ where: { tenantId: tId } }),
        prisma.teacherProfile.count({ where: { tenantId: tId } }),
        // Today's attendance records (for attendance rate)
        prisma.studentAttendance.findMany({
          where: { tenantId: tId, date: { gte: todayStart, lte: todayEnd } },
          select: { status: true, sectionId: true },
        }),
        // Fee aggregates
        prisma.feeInvoice.aggregate({
          where: { tenantId: tId },
          _sum: { netAmount: true, paidAmount: true, balanceAmount: true },
        }),
        prisma.feeInvoice.aggregate({
          where: { tenantId: tId, balanceAmount: { gt: 0 }, dueDate: { lt: todayStart } },
          _sum: { balanceAmount: true },
          _count: { _all: true },
        }),
        prisma.teacherSubstitution.count({
          where: { tenantId: tId, status: 'ASSIGNED', date: { gte: todayStart, lte: todayEnd } },
        }),
        prisma.notice.findMany({
          where: { tenantId: tId },
          orderBy: { publishedAt: 'desc' },
          take: 6,
          select: { id: true, title: true, content: true, publishedAt: true, priority: true, targetAudience: true },
        }),
        // Filter out USER_LOGIN spam at DB level rather than in memory
        prisma.auditLog.findMany({
          where: { tenantId: tId, action: { not: 'USER_LOGIN' } },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: { user: { select: { firstName: true, lastName: true } } },
        }),
        // Use _count instead of loading all student IDs per section (much cheaper)
        prisma.section.findMany({
          where: { tenantId: tId },
          include: {
            classGrade: { select: { id: true, name: true } },
            classTeacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            _count: { select: { students: true } },
          },
        }),
        prisma.admissionApplication.count({
          where: { tenantId: tId, status: 'SUBMITTED' },
        }),
      ]);
    },
    [`admin-dashboard-${tenantId}`],
    { revalidate: 60, tags: [`tenant-${tenantId}-dashboard`] }
  );

  const [
    totalStudents,
    totalTeachers,
    todayAttendanceRecords,
    feeAggregates,
    overdueFeeAggregates,
    activeSubstitutions,
    notices,
    auditLogs,
    sections,
    pendingAdmissionsCount,
  ] = await fetchDashboardData(tenantId);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Attendance metrics calculation (Today's actual attendance)
  const submittedSectionIds = new Set(todayAttendanceRecords.map((r) => r.sectionId));
  const unsubmittedSections = sections.filter((s) => !submittedSectionIds.has(s.id));
  const totalSectionsCount = sections.length;
  const submittedSectionsCount = totalSectionsCount - unsubmittedSections.length;

  const todayPresentCount = todayAttendanceRecords.filter((r) => r.status === 'PRESENT').length;
  const todayTotalAttendance = todayAttendanceRecords.length;
  // When today has no attendance records yet, default to 100% (no data = full day ahead)
  const todayAttendanceRate =
    todayTotalAttendance > 0
      ? Math.round((todayPresentCount / todayTotalAttendance) * 100)
      : 100;

  // Fee metrics calculation via DB aggregates
  const totalFeeInvoiced = Number(feeAggregates._sum.netAmount || 0);
  const totalFeePaid = Number(feeAggregates._sum.paidAmount || 0);
  const totalFeePending = Number(feeAggregates._sum.balanceAmount || 0);
  const collectionPercentage =
    totalFeeInvoiced > 0 ? Math.round((totalFeePaid / totalFeeInvoiced) * 100) : 0;

  const totalOverdueAmount = Number(overdueFeeAggregates._sum.balanceAmount || 0);

  const formattedNotices = notices.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    date: n.publishedAt
      ? new Date(n.publishedAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Recent',
    priority: n.priority,
    targetAudience: n.targetAudience,
  }));

  // Filter out routine USER_LOGIN spam from primary audit view (already filtered at DB level)
  const logsToRender = auditLogs.length > 0 ? auditLogs : [];

  const formattedAuditLogs = logsToRender.map((log) => {
    let cleanAction = log.action;
    if (log.action === 'USER_LOGIN') cleanAction = 'User signed in';
    else if (log.action === 'CREATE_NOTICE') cleanAction = 'Circular published';
    else if (log.action === 'MARK_ATTENDANCE') cleanAction = 'Attendance marked';
    else if (log.action === 'RECORD_FEE_PAYMENT') cleanAction = 'Fee receipt recorded';

    // Never show ::1
    const safeIp = log.ipAddress && !log.ipAddress.includes('::1') && !log.ipAddress.includes('127.0.0.1')
      ? log.ipAddress
      : null;

    return {
      id: log.id,
      action: cleanAction,
      entityType: log.entityType,
      timestamp: log.createdAt
        ? new Date(log.createdAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Just now',
      ipAddress: safeIp,
      userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Administrator',
    };
  });

  const formattedSections = sections.map((sec) => {
    const isSubmittedToday = submittedSectionIds.has(sec.id);

    return {
      id: sec.id,
      className: sec.classGrade.name,
      sectionName: sec.name,
      // Use _count.students (aggregate) instead of sec.students.length
      studentCount: (sec as any)._count?.students ?? 0,
      classTeacherName: sec.classTeacher?.user
        ? `${sec.classTeacher.user.firstName} ${sec.classTeacher.user.lastName}`
        : 'Unassigned',
      isSubmittedToday,
    };
  });

  return (
    <AdminDashboardClient
      schoolName={authContext.tenant?.name || 'Alpha Edu Hub'}
      board={authContext.tenant?.board || 'CBSE'}
      metrics={{
        totalStudents,
        totalTeachers,
        attendanceRate: todayAttendanceRate,
        submittedSectionsCount,
        totalSectionsCount,
        presentCount: todayPresentCount,
        totalFeeCollected: totalFeePaid,
        totalFeePending,
        totalFeeInvoiced,
        totalOverdueAmount,
        overdueCount: overdueFeeAggregates._count._all || 0,
        collectionPercentage,
        totalNotices: notices.length,
        activeSubstitutions,
        pendingAdmissionsCount,
      }}
      unsubmittedSections={unsubmittedSections.map((s) => ({
        id: s.id,
        name: `${s.classGrade.name}-${s.name}`,
      }))}
      recentNotices={formattedNotices}
      recentAuditLogs={formattedAuditLogs}
      classSections={formattedSections}
    />
  );
}
