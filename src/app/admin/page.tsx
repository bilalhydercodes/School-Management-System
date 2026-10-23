import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { getCachedAdminDashboardData } from '@/lib/tenant-cache';
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

  // Instant SWR-cached dashboard data (sub-millisecond L1 memory hit + background revalidation)
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
  ] = await getCachedAdminDashboardData(tenantId);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Attendance metrics calculation (Today's actual attendance)
  const attendanceRecords = todayAttendanceRecords || [];
  const sectionsList = sections || [];

  const submittedSectionIds = new Set(attendanceRecords.map((r) => r.sectionId));
  const unsubmittedSections = sectionsList.filter((s) => !submittedSectionIds.has(s.id));
  const totalSectionsCount = sectionsList.length;
  const submittedSectionsCount = totalSectionsCount - unsubmittedSections.length;

  const todayPresentCount = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
  const todayTotalAttendance = attendanceRecords.length;
  // When today has no attendance records yet, default to 100% (no data = full day ahead)
  const todayAttendanceRate =
    todayTotalAttendance > 0
      ? Math.round((todayPresentCount / todayTotalAttendance) * 100)
      : 100;

  // Fee metrics calculation via DB aggregates
  const totalFeeInvoiced = Number(feeAggregates?._sum?.netAmount || 0);
  const totalFeePaid = Number(feeAggregates?._sum?.paidAmount || 0);
  const totalFeePending = Number(feeAggregates?._sum?.balanceAmount || 0);
  const collectionPercentage =
    totalFeeInvoiced > 0 ? Math.round((totalFeePaid / totalFeeInvoiced) * 100) : 0;

  const totalOverdueAmount = Number(overdueFeeAggregates?._sum?.balanceAmount || 0);
  const overdueCount = Number(overdueFeeAggregates?._count?._all || 0);

  const formattedNotices = (notices || []).map((n) => ({
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
  const logsToRender = auditLogs?.length > 0 ? auditLogs : [];

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
      userName: log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() : 'Administrator',
    };
  });

  const formattedSections = sectionsList.map((sec) => {
    const isSubmittedToday = submittedSectionIds.has(sec.id);

    return {
      id: sec.id,
      className: sec.classGrade?.name || 'Class',
      sectionName: sec.name || 'A',
      // Use _count.students (aggregate) instead of sec.students.length
      studentCount: (sec as any)._count?.students ?? 0,
      classTeacherName: sec.classTeacher?.user
        ? `${sec.classTeacher.user.firstName || ''} ${sec.classTeacher.user.lastName || ''}`.trim()
        : 'Unassigned',
      isSubmittedToday,
    };
  });

  return (
    <AdminDashboardClient
      schoolName={authContext.tenant?.name || 'Alpha Edu Hub'}
      board={authContext.tenant?.board || 'CBSE'}
      metrics={{
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        attendanceRate: todayAttendanceRate,
        submittedSectionsCount,
        totalSectionsCount,
        presentCount: todayPresentCount,
        totalFeeCollected: totalFeePaid,
        totalFeePending,
        totalFeeInvoiced,
        totalOverdueAmount,
        overdueCount,
        collectionPercentage,
        totalNotices: (notices || []).length,
        activeSubstitutions: activeSubstitutions || 0,
        pendingAdmissionsCount: pendingAdmissionsCount || 0,
      }}
      unsubmittedSections={unsubmittedSections.map((s) => ({
        id: s.id,
        name: `${s.classGrade?.name || 'Class'}-${s.name || 'A'}`,
      }))}
      recentNotices={formattedNotices}
      recentAuditLogs={formattedAuditLogs}
      classSections={formattedSections}
    />
  );
}
