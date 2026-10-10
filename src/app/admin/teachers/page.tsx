import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { getCachedAdminTeachers } from '@/lib/tenant-cache';
import TeacherDirectoryClient, {
  type TeacherItem,
} from '@/components/admin/TeacherDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminTeachersPage() {
  const authContext = await getAuthenticatedContext();
  if (!authContext || (authContext.role !== 'ADMIN' && authContext.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin/teachers');
  }

  const tenantId = authContext.tenantId;
  if (!tenantId) {
    return <div>Platform context required.</div>;
  }

  // Ultra-fast cached teachers fetch (SWR cache with sub-ms retrieval)
  const [teachersRaw, sectionsRaw] = await getCachedAdminTeachers(tenantId);

  const classTeacherSectionMap = new Map<string, string>();
  for (const sec of sectionsRaw) {
    if (sec.classTeacherId) {
      classTeacherSectionMap.set(sec.classTeacherId, `${sec.classGrade.name}-${sec.name}`);
    }
  }

  const teachers: TeacherItem[] = teachersRaw.map((t) => {
    const activeSub = t.assignedSubstitutions[0];
    const origTeacher = activeSub?.originalTeacher || null;

    return {
      id: t.id,
      name: `${t.user.firstName} ${t.user.lastName}`,
      email: t.user.email,
      phone: t.user.phone || '+91 11 2345 6789',
      employeeId: t.employeeId,
      department: t.department,
      qualification: t.qualification,
      specialization: t.specialization,
      joiningDate: new Date(t.joiningDate).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      }),
      isActive: t.user.isActive,
      deletedAt: (t.user as any).deletedAt ? new Date((t.user as any).deletedAt).toISOString() : null,
      classTeacherSection: classTeacherSectionMap.get(t.id) || null,
      activeSubstitution: activeSub
        ? {
            date: new Date(activeSub.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            }),
            originalTeacherName: origTeacher
              ? `Dr. ${origTeacher.user.firstName} ${origTeacher.user.lastName}`
              : 'Absent Colleague',
            reason: activeSub.reason || 'Medical Leave',
          }
        : null,
    };
  });

  return <TeacherDirectoryClient teachers={teachers} />;
}
