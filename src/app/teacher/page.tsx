import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { prisma } from '@/lib/db';
import { TeacherDashboardView } from '@/components/teacher/TeacherDashboardView';

export default async function TeacherDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login?redirect=/teacher');
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let todayAttendance = null;
  let teacherName =
    session?.firstName && session?.lastName
      ? `${session.firstName} ${session.lastName}`
      : 'Sanjay Yadav';
  let teacherAvatarUrl: string | null = null;
  let teacherGender: string | null = (session as any)?.gender || null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (session?.tenantId && session?.sub && isUuid.test(session.sub) && isUuid.test(session.tenantId)) {
    try {
      const [attendance, dbUser] = await Promise.all([
        prisma.staffAttendance.findFirst({
          where: {
            tenantId: session.tenantId,
            userId: session.sub,
            date: todayStart,
          },
        }),
        prisma.user.findUnique({
          where: { id: session.sub },
          select: { firstName: true, lastName: true, avatarUrl: true },
        }),
      ]);
      todayAttendance = attendance;
      if (dbUser) {
        if (dbUser.firstName && dbUser.lastName) {
          teacherName = `${dbUser.firstName} ${dbUser.lastName}`;
        }
        teacherAvatarUrl = dbUser.avatarUrl;
      }
    } catch {
      // Graceful fallback
    }
  }

  return (
    <TeacherDashboardView
      teacherName={teacherName}
      roleTitle="Teacher"
      gender={teacherGender}
      avatarUrl={teacherAvatarUrl}
      initialCheckInTime={todayAttendance?.checkInTime?.toISOString() ?? null}
      initialCheckOutTime={todayAttendance?.checkOutTime?.toISOString() ?? null}
    />
  );
}
