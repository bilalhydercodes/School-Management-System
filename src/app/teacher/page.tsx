import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { prisma } from '@/lib/db';
import { TeacherDashboardView } from '@/components/teacher/TeacherDashboardView';

export default async function TeacherDashboardPage() {
  const context = await getAuthenticatedContext();
  if (!context) {
    redirect('/login?redirect=/teacher');
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let todayAttendance = null;
  let feedbackSummary: { responseCount: number; overallRating: number; cycleTitle?: string } | null = null;
  const teacherName = context.user.fullName || 'Faculty Member';
  const teacherAvatarUrl = context.user.avatarUrl;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (context.tenantId && context.userId && isUuid.test(context.userId) && isUuid.test(context.tenantId)) {
    try {
      todayAttendance = await prisma.staffAttendance.findFirst({
        where: {
          tenantId: context.tenantId,
          userId: context.userId,
          date: todayStart,
        },
      });

      const teacherProfile = await prisma.teacherProfile.findFirst({
        where: { tenantId: context.tenantId, userId: context.userId },
        select: { id: true },
      });

      if (teacherProfile) {
        const activeCycle = await prisma.feedbackCycle.findFirst({
          where: { tenantId: context.tenantId, status: 'ACTIVE' },
          select: { id: true, title: true },
        });

        if (activeCycle) {
          const submissions = await prisma.feedbackSubmission.findMany({
            where: {
              tenantId: context.tenantId,
              teacherId: teacherProfile.id,
              feedbackCycleId: activeCycle.id,
            },
            select: { overallRating: true },
          });

          if (submissions.length > 0) {
            let sum = 0;
            let count = 0;
            for (const s of submissions) {
              if (s.overallRating) {
                sum += Number(s.overallRating);
                count++;
              }
            }
            feedbackSummary = {
              responseCount: submissions.length,
              overallRating: count > 0 ? Number((sum / count).toFixed(1)) : 0,
              cycleTitle: activeCycle.title,
            };
          }
        }
      }
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
      initialCheckInTime={todayAttendance?.checkInTime?.toISOString() ?? null}
      initialCheckOutTime={todayAttendance?.checkOutTime?.toISOString() ?? null}
      feedbackSummary={feedbackSummary}
    />
  );
}

