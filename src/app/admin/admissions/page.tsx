import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { sanitizeAadhaarForDisplay } from '@/lib/aadhaar';
import { getSessionFromCookies } from '@/lib/session';
import AdmissionsIntakeClient, {
  AdmissionApplicationItem,
  SectionItem,
  FeeStructureItem,
  FeeTermItem,
} from '@/components/admin/AdmissionsIntakeClient';

export const dynamic = 'force-dynamic';

export default async function AdminAdmissionsPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  // Parallel database fetch for high performance
  const [applicationsRaw, sectionsRaw, feeStructuresRaw, feeTermsRaw, studentCount] =
    await Promise.all([
      prisma.admissionApplication.findMany({
        where: { tenantId },
        include: {
          classGrade: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.section.findMany({
        where: { tenantId },
        include: {
          classGrade: true,
        },
        orderBy: { name: 'asc' },
      }),

      prisma.feeStructure.findMany({
        where: { tenantId },
        include: {
          feeCategory: true,
        },
      }),

      prisma.feeTerm.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          termNumber: true,
        },
        orderBy: { termNumber: 'asc' },
      }),

      prisma.studentProfile.count({
        where: { tenantId },
      }),
    ]);

  const currentYear = new Date().getFullYear();
  const suggestedNextAdmNumber = `DPS-${currentYear}-${String(studentCount + 1).padStart(4, '0')}`;

  // Map applications
  const applications: AdmissionApplicationItem[] = (applicationsRaw || []).map((app) => ({
    id: app.id,
    applicationNumber: app.applicationNumber || 'APP',
    studentFirstName: app.studentFirstName || '',
    studentLastName: app.studentLastName || '',
    studentName: `${app.studentFirstName || ''} ${app.studentLastName || ''}`.trim() || 'Applicant',
    dateOfBirth: app.dateOfBirth ? new Date(app.dateOfBirth).toISOString() : new Date().toISOString(),
    gender: app.gender || 'OTHER',
    bloodGroup: app.bloodGroup || null,
    aadhaarNumber: sanitizeAadhaarForDisplay(app.aadhaarNumber),
    parentName: app.parentName || 'Parent',
    parentPhone: app.parentPhone || '',
    parentEmail: app.parentEmail || null,
    relationship: app.relationship || 'Guardian',
    address: app.address || '',
    previousSchool: app.previousSchool || null,
    previousMarks: app.previousMarks ? Number(app.previousMarks) : null,
    applicationFee: Number(app.applicationFee || 0),
    isFeePaid: Boolean(app.isFeePaid),
    status: app.status as any,
    interviewDate: app.interviewDate ? new Date(app.interviewDate).toISOString() : null,
    adminRemarks: app.adminRemarks || null,
    createdAt: app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString(),
    classGradeName: app.classGrade?.name || 'Class',
    classGradeId: app.classGradeId,
    enrolledStudentId: app.enrolledStudentId,
  }));

  // Map sections
  const sections: SectionItem[] = (sectionsRaw || []).map((s) => ({
    id: s.id,
    name: s.name || 'A',
    classGradeId: s.classGradeId,
    classGradeName: s.classGrade?.name || 'Class',
  }));

  // Map fee structures
  const feeStructures: FeeStructureItem[] = (feeStructuresRaw || []).map((fs) => ({
    id: fs.id,
    amount: Number(fs.amount || 0),
    categoryName: fs.feeCategory?.name || 'Tuition',
    classGradeId: fs.classGradeId,
  }));

  // Map fee terms
  const feeTerms: FeeTermItem[] = feeTermsRaw.map((ft) => ({
    id: ft.id,
    name: ft.name,
    termNumber: ft.termNumber,
  }));

  return (
    <AdmissionsIntakeClient
      applications={applications}
      sections={sections}
      feeStructures={feeStructures}
      feeTerms={feeTerms}
      suggestedNextAdmNumber={suggestedNextAdmNumber}
    />
  );
}
