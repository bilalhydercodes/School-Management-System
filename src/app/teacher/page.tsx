import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { getCachedTeacherDashboard } from '@/lib/tenant-cache';
import { TeacherDashboardView } from '@/components/teacher/TeacherDashboardView';

export default async function TeacherDashboardPage() {
  const context = await getAuthenticatedContext();
  if (!context) {
    redirect('/login?redirect=/teacher');
  }

  const teacherName = context.user.fullName || 'Faculty Member';
  const teacherAvatarUrl = context.user.avatarUrl;

  let todayAttendance = null;
  let feedbackSummary: { responseCount: number; overallRating: number; cycleTitle?: string } | null = null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (context.tenantId && context.userId && isUuid.test(context.userId) && isUuid.test(context.tenantId)) {
    try {
      const cached = await getCachedTeacherDashboard(context.tenantId, context.userId);
      todayAttendance = cached.todayAttendance;
      feedbackSummary = cached.feedbackSummary;
    } catch {
      // Graceful fallback
    }
  }

  return (
    <TeacherDashboardView
      teacherName={teacherName}
      roleTitle="Teacher"
      gender={null}
      avatarUrl={teacherAvatarUrl}
      initialCheckInTime={todayAttendance?.checkInTime ? new Date(todayAttendance.checkInTime).toISOString() : null}
      initialCheckOutTime={todayAttendance?.checkOutTime ? new Date(todayAttendance.checkOutTime).toISOString() : null}
      feedbackSummary={feedbackSummary}
    />
  );
}

