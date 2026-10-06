import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getAuthenticatedContext } from '@/lib/auth-context';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

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

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Run all independent queries in parallel for high performance
  const [
    totalStudents,
    totalTeachers,
    todayAttendanceRecords,
    allAttendanceRecords,
    feeAggregates,
    overdueFeeAggregates,
    activeSubstitutions,
    notices,
    auditLogs,
    sections,
    pendingAdmissionsCount,
  ] = await Promise.all([
    prisma.studentProfile.count({ where: { tenantId } }),
    prisma.teacherProfile.count({ where: { tenantId } }),
    prisma.studentAttendance.findMany({
      where: {
        tenantId,
        date: { gte: todayStart, lte: todayEnd },
      },
      select: { status: true, sectionId: true },
    }),
    prisma.studentAttendance.findMany({
      where: { tenantId },
      select: { status: true },
      take: 100,
    }),
    prisma.feeInvoice.aggregate({
      where: { tenantId },
      _sum: {
        netAmount: true,
        paidAmount: true,
        balanceAmount: true,
      },
    }),
    prisma.feeInvoice.aggregate({
      where: {
        tenantId,
        balanceAmount: { gt: 0 },
        dueDate: { lt: todayStart },
      },
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
      select: {
        id: true,
        title: true,
        content: true,
        publishedAt: true,
        priority: true,
        targetAudience: true,
      },
    }),
    prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
    prisma.section.findMany({
      where: { tenantId },
      include: {
        classGrade: { select: { id: true, name: true } },
        classTeacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        students: { select: { id: true } },
      },
    }),
    prisma.admissionApplication.count({
      where: { tenantId, status: 'SUBMITTED' },
    }),
  ]);

  // Attendance metrics calculation (Today's actual attendance)
  const submittedSectionIds = new Set(todayAttendanceRecords.map((r) => r.sectionId));
  const unsubmittedSections = sections.filter((s) => !submittedSectionIds.has(s.id));
  const totalSectionsCount = sections.length;
  const submittedSectionsCount = totalSectionsCount - unsubmittedSections.length;

  const todayPresentCount = todayAttendanceRecords.filter((r) => r.status === 'PRESENT').length;
  const todayTotalAttendance = todayAttendanceRecords.length;
  const todayAttendanceRate =
    todayTotalAttendance > 0
      ? Math.round((todayPresentCount / todayTotalAttendance) * 100)
      : allAttendanceRecords.length > 0
      ? Math.round((allAttendanceRecords.filter((r) => r.status === 'PRESENT').length / allAttendanceRecords.length) * 100)
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
    date: n.publishedAt.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    priority: n.priority,
    targetAudience: n.targetAudience,
  }));

  // Filter out routine USER_LOGIN spam from primary audit view
  const sensitiveAudit = auditLogs.filter((l) => l.action !== 'USER_LOGIN');
  const logsToRender = sensitiveAudit.length > 0 ? sensitiveAudit : auditLogs.slice(0, 4);

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
      timestamp: log.createdAt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
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
      studentCount: sec.students.length,
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
