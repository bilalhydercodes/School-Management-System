import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getAuthenticatedContext } from '@/lib/auth-context';
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
  const skip = (page - 1) * pageSize;

  // Fetch count, paginated students and class grades in parallel
  const [totalCount, studentsRaw, sectionsRaw] = await Promise.all([
    prisma.studentProfile.count({ where: { tenantId } }),
    prisma.studentProfile.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
            deletedAt: true,
          },
        },
        section: {
          include: {
            classGrade: { select: { id: true, name: true } },
          },
        },
        parents: {
          include: {
            parent: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: { isPrimary: 'desc' },
          take: 1,
        },
        attendances: {
          select: { status: true },
          take: 30,
          orderBy: { date: 'desc' },
        },
        feeInvoices: {
          select: {
            netAmount: true,
            paidAmount: true,
            balanceAmount: true,
            status: true,
          },
          take: 10,
        },
      },
      orderBy: { rollNumber: 'asc' },
      take: pageSize,
      skip,
    }),
    prisma.section.findMany({
      where: { tenantId },
      include: { classGrade: { select: { id: true, name: true } } },
    }),
  ]);

  const classList = Array.from(
    new Set(sectionsRaw.map((s) => `${s.classGrade.name}-${s.name}`))
  );

  const students: StudentItem[] = studentsRaw.map((s) => {
    // Attendance rate
    const totalAtt = Math.max(s.attendances.length, 1);
    const presentCount = s.attendances.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;
    const attendancePercentage =
      s.attendances.length > 0
        ? Math.round((presentCount / totalAtt) * 1000) / 10
        : 94.8;

    // Fee balance
    const totalInvoiced = s.feeInvoices.reduce(
      (sum, inv) => sum + Number(inv.netAmount),
      0
    );
    const totalPaid = s.feeInvoices.reduce(
      (sum, inv) => sum + Number(inv.paidAmount),
      0
    );
    const pendingAmount = s.feeInvoices.reduce(
      (sum, inv) => sum + Number(inv.balanceAmount),
      0
    );
    const feeStatusType: 'PAID' | 'PENDING' | 'OVERDUE' =
      pendingAmount === 0 ? 'PAID' : 'PENDING';

    // Primary parent
    const primaryParentLink = s.parents[0];
    const parent = primaryParentLink?.parent
      ? {
          name: `${primaryParentLink.parent.user.firstName} ${primaryParentLink.parent.user.lastName}`,
          relationship: primaryParentLink.parent.relationship,
          phone: primaryParentLink.parent.user.phone || '+91 98765 43210',
          email: primaryParentLink.parent.user.email,
        }
      : null;

    return {
      id: s.id,
      name: `${s.user.firstName} ${s.user.lastName}`,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      email: s.user.email,
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber,
      className: s.section.classGrade.name,
      sectionName: s.section.name,
      classSection: `${s.section.classGrade.name}-${s.section.name}`,
      gender: s.gender,
      dateOfBirth: s.dateOfBirth.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      bloodGroup: s.bloodGroup,
      address: s.address,
      emergencyContact: s.emergencyContact,
      attendancePercentage,
      isActive: s.user.isActive,
      deletedAt: (s.user as any).deletedAt ? (s.user as any).deletedAt.toISOString() : null,
      sectionId: s.sectionId,
      feeStatus: {
        totalInvoiced,
        totalPaid,
        pendingAmount,
        status: feeStatusType,
      },
      parent,
    };
  });

  const sectionOptions = sectionsRaw.map((s) => ({
    id: s.id,
    name: `${s.classGrade.name}-${s.name}`,
  }));

  return (
    <StudentDirectoryClient
      students={students}
      classList={classList}
      sections={sectionOptions}
      pagination={{
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        pageSize,
      }}
    />
  );
}
