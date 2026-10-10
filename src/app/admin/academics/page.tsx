import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { getCachedAdminAcademics } from '@/lib/tenant-cache';
import AcademicsManagerClient, {
  TimetableSlotItem,
  TeacherLookupItem,
  SubstitutionItem,
} from '@/components/admin/AcademicsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminAcademicsPage() {
  const authContext = await getAuthenticatedContext();
  if (!authContext || (authContext.role !== 'ADMIN' && authContext.role !== 'SUPER_ADMIN')) {
    redirect('/unauthorized');
  }

  const tenantId = authContext.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  // Ultra-fast cached academics fetch (SWR cache with sub-ms retrieval)
  const [timetableRaw, teachersRaw, sectionsRaw, substitutionsRaw] =
    await getCachedAdminAcademics(tenantId);

  // Teacher name lookup map
  const teacherNameMap = new Map(
    teachersRaw.map((t) => [t.id, `${t.user.firstName} ${t.user.lastName}`])
  );

  // Map timetable slots
  const timetableSlots: TimetableSlotItem[] = timetableRaw.map((te) => {
    const sub = te.substitutions[0];
    return {
      id: te.id,
      sectionId: te.sectionId,
      sectionName: te.section.name,
      classGradeName: te.section.classGrade.name,
      periodName: te.periodTimeSlot.name,
      startTime: te.periodTimeSlot.startTime,
      endTime: te.periodTimeSlot.endTime,
      order: te.periodTimeSlot.order,
      isBreak: te.periodTimeSlot.isBreak,
      dayOfWeek: te.dayOfWeek,
      subjectName: te.subject?.name || null,
      subjectCode: te.subject?.code || null,
      teacherId: te.teacherId,
      teacherName: te.teacher ? `${te.teacher.user.firstName} ${te.teacher.user.lastName}` : null,
      activeSubstitution: sub
        ? {
            id: sub.id,
            substituteTeacherId: sub.substituteTeacherId,
            substituteTeacherName: `${sub.substituteTeacher.user.firstName} ${sub.substituteTeacher.user.lastName}`,
            reason: sub.reason,
            status: sub.status,
            date: new Date(sub.date).toISOString(),
          }
        : null,
    };
  });

  // Map teachers for lookup
  const teachers: TeacherLookupItem[] = teachersRaw.map((t) => ({
    id: t.id,
    name: `${t.user.firstName} ${t.user.lastName}`,
    department: t.department,
  }));

  // Map sections
  const sections = sectionsRaw.map((s) => ({
    id: s.id,
    name: s.name,
    classGradeName: s.classGrade.name,
  }));

  // Map recent substitutions
  const recentSubstitutions: SubstitutionItem[] = substitutionsRaw.map((sub) => ({
    id: sub.id,
    date: new Date(sub.date).toISOString(),
    timetableEntryId: sub.timetableEntryId,
    periodName: sub.timetableEntry.periodTimeSlot.name,
    timeRange: `${sub.timetableEntry.periodTimeSlot.startTime} - ${sub.timetableEntry.periodTimeSlot.endTime}`,
    classSection: `${sub.timetableEntry.section.classGrade.name}-${sub.timetableEntry.section.name}`,
    subjectName: sub.timetableEntry.subject?.name || 'Class Period',
    originalTeacherName: teacherNameMap.get(sub.originalTeacherId) || 'Assigned Staff',
    substituteTeacherName: `${sub.substituteTeacher.user.firstName} ${sub.substituteTeacher.user.lastName}`,
    reason: sub.reason,
    status: sub.status,
  }));

  return (
    <AcademicsManagerClient
      timetableSlots={timetableSlots}
      teachers={teachers}
      sections={sections}
      recentSubstitutions={recentSubstitutions}
    />
  );
}
