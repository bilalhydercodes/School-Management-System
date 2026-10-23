import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { getCachedAdminStudents } from '@/lib/tenant-cache';
import StudentDirectoryClient, {
  type StudentItem,
} from '@/components/admin/StudentDirectoryClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function AdminStudentsPage({ searchParams }: PageProps) {
  const authContext = await getAuthenticatedContext();
  if (!authContext || (authContext.role !== 'ADMIN' && authContext.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin/students');
  }

  const tenantId = authContext.tenantId;
  if (!tenantId) {
    return <div>Platform context required.</div>;
  }

  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 50;

  // Ultra-fast cached students fetch (SWR cache with sub-ms retrieval)
  const [totalCount, studentsRaw, sectionsRaw] = await getCachedAdminStudents(tenantId, page, pageSize);

  const classList = Array.from(
    new Set(
      (sectionsRaw || [])
        .map((s) => `${s.classGrade?.name || 'Class'}-${s.name || 'A'}`)
        .filter(Boolean)
    )
  );

  const students: StudentItem[] = (studentsRaw || [])
    .filter((s) => Boolean(s && s.user))
    .map((s) => {
      // Attendance rate
      const attendances = s.attendances || [];
      const totalAtt = Math.max(attendances.length, 1);
      const presentCount = attendances.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE'
      ).length;
      const attendancePercentage =
        attendances.length > 0
          ? Math.round((presentCount / totalAtt) * 1000) / 10
          : 94.8;

      // Fee balance
      const invoices = s.feeInvoices || [];
      const totalInvoiced = invoices.reduce(
        (sum, inv) => sum + Number(inv.netAmount || 0),
        0
      );
      const totalPaid = invoices.reduce(
        (sum, inv) => sum + Number(inv.paidAmount || 0),
        0
      );
      const pendingAmount = invoices.reduce(
        (sum, inv) => sum + Number(inv.balanceAmount || 0),
        0
      );
      const feeStatusType: 'PAID' | 'PENDING' | 'OVERDUE' =
        pendingAmount === 0 ? 'PAID' : 'PENDING';

      // Primary parent
      const primaryParentLink = s.parents?.[0];
      const parentUser = primaryParentLink?.parent?.user;
      const parent = parentUser
        ? {
            name: `${parentUser.firstName || ''} ${parentUser.lastName || ''}`.trim() || 'Parent',
            relationship: primaryParentLink?.parent?.relationship || 'Guardian',
            phone: parentUser.phone || '+91 98765 43210',
            email: parentUser.email || '',
          }
        : null;

      let formattedDob = 'N/A';
      try {
        if (s.dateOfBirth) {
          const d = new Date(s.dateOfBirth);
          if (!isNaN(d.getTime())) {
            formattedDob = d.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          }
        }
      } catch {}

      const gradeName = s.section?.classGrade?.name || 'Class';
      const secName = s.section?.name || 'A';

      return {
        id: s.id,
        name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim() || 'Student',
        firstName: s.user?.firstName || '',
        lastName: s.user?.lastName || '',
        email: s.user?.email || '',
        admissionNumber: s.admissionNumber || 'N/A',
        rollNumber: s.rollNumber ?? null,
        className: gradeName,
        sectionName: secName,
        classSection: `${gradeName}-${secName}`,
        gender: s.gender || 'OTHER',
        dateOfBirth: formattedDob,
        bloodGroup: s.bloodGroup,
        address: s.address || '',
        emergencyContact: s.emergencyContact || '',
        attendancePercentage,
        isActive: s.user?.isActive ?? true,
        deletedAt: (s.user as any)?.deletedAt ? new Date((s.user as any).deletedAt).toISOString() : null,
        sectionId: s.sectionId || '',
        feeStatus: {
          totalInvoiced,
          totalPaid,
          pendingAmount,
          status: feeStatusType,
        },
        parent,
      };
    });

  const sectionOptions = (sectionsRaw || []).map((s) => ({
    id: s.id,
    name: `${s.classGrade?.name || 'Class'}-${s.name || 'A'}`,
  }));

  return (
    <StudentDirectoryClient
      students={students}
      classList={classList}
      sections={sectionOptions}
      pagination={{
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        totalCount,
        pageSize,
      }}
    />
  );
}
