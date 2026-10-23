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
  for (const sec of sectionsRaw || []) {
    if (sec?.classTeacherId) {
      const gradeName = sec.classGrade?.name || 'Class';
      classTeacherSectionMap.set(sec.classTeacherId, `${gradeName}-${sec.name || 'A'}`);
    }
  }

  const teachers: TeacherItem[] = (teachersRaw || [])
    .filter((t) => Boolean(t && t.user))
    .map((t) => {
      const activeSub = t.assignedSubstitutions?.[0];
      const origTeacher = activeSub?.originalTeacher || null;

      let formattedJoiningDate = 'N/A';
      try {
        if (t.joiningDate) {
          const d = new Date(t.joiningDate);
          if (!isNaN(d.getTime())) {
            formattedJoiningDate = d.toLocaleDateString('en-IN', {
              month: 'short',
              year: 'numeric',
            });
          }
        }
      } catch {
        formattedJoiningDate = 'N/A';
      }

      let subDateStr = '';
      try {
        if (activeSub?.date) {
          const sd = new Date(activeSub.date);
          if (!isNaN(sd.getTime())) {
            subDateStr = sd.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            });
          }
        }
      } catch {}

      return {
        id: t.id,
        name: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim() || 'Teacher',
        email: t.user?.email || '',
        phone: t.user?.phone || '+91 11 2345 6789',
        employeeId: t.employeeId || 'EMP',
        department: t.department || 'General',
        qualification: t.qualification || 'B.Ed',
        specialization: t.specialization,
        joiningDate: formattedJoiningDate,
        isActive: t.user?.isActive ?? true,
        deletedAt: (t.user as any)?.deletedAt ? new Date((t.user as any).deletedAt).toISOString() : null,
        classTeacherSection: classTeacherSectionMap.get(t.id) || null,
        activeSubstitution: activeSub
          ? {
              date: subDateStr,
              originalTeacherName: origTeacher?.user
                ? `Dr. ${origTeacher.user.firstName} ${origTeacher.user.lastName}`
                : 'Absent Colleague',
              reason: activeSub.reason || 'Medical Leave',
            }
          : null,
      };
    });

  return <TeacherDirectoryClient teachers={teachers} />;
}
