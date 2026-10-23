import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import AdminLeaveClient, { TeacherLookup } from '@/components/admin/AdminLeaveClient';
import { getAdminStudentLeavesAction } from '@/actions/admin/leaves';
import { Role } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminLeavePage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  // 1. Fetch teachers for substitution selector
  const [teachersRaw, studentLeavesResult] = await Promise.all([
    prisma.teacherProfile.findMany({
      where: {
        tenantId,
        user: { isActive: true },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    }),
    getAdminStudentLeavesAction(),
  ]);

  const teachers: TeacherLookup[] = teachersRaw.map((t) => ({
    id: t.id,
    name: `${t.user.firstName} ${t.user.lastName}`,
    department: t.department,
    employeeId: t.employeeId,
  }));

  return (
    <AdminLeaveClient
      teachers={teachers}
      initialStudentLeaves={studentLeavesResult.success ? studentLeavesResult.leaves || [] : []}
    />
  );
}
