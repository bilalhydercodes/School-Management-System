import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { prisma } from '@/lib/db';
import TeacherSalarySlipClient from '@/components/teacher/TeacherSalarySlipClient';

export const dynamic = 'force-dynamic';

export default async function TeacherSalarySlipPage() {
  const context = await getAuthenticatedContext();
  if (!context) {
    redirect('/login?redirect=/teacher/salary-slip');
  }

  // Load teacher profile and tenant information
  let teacherProfile = null;
  let tenant = null;

  if (context.userId) {
    try {
      teacherProfile = await prisma.teacherProfile.findFirst({
        where: {
          OR: [
            { userId: context.userId },
            { user: { email: context.user.email } },
          ],
        },
        include: {
          user: true,
          tenant: true,
        },
      });

      if (context.tenantId) {
        tenant = await prisma.tenant.findUnique({
          where: { id: context.tenantId },
        });
      }
    } catch {
      // Graceful fallback to session context
    }
  }

  const teacherData = {
    name: teacherProfile?.user?.firstName
      ? `${teacherProfile.user.firstName} ${teacherProfile.user.lastName}`
      : context.user.fullName || 'Faculty Member',
    employeeId: teacherProfile?.employeeId || 'EMP-DPS-101',
    department: teacherProfile?.department || 'Department of Mathematics',
    designation: teacherProfile?.designation || 'Senior PGT Faculty',
    email: teacherProfile?.user?.email || context.user.email || 'faculty@dps.edu.in',
    phone: teacherProfile?.user?.phone || '+91 98454 88621',
    avatarUrl: teacherProfile?.user?.avatarUrl || context.user.avatarUrl,
    bankName: 'State Bank of India (SBI)',
    accountMasked: '•••• 4821',
    ifsc: 'SBIN0004021',
    pan: 'ABCDE1234F',
    uan: '100982348712',
    joiningDate: teacherProfile?.joiningDate
      ? new Date(teacherProfile.joiningDate).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Jul 15, 2021',
  };

  const schoolData = {
    name: tenant?.name || 'Alpha Edu Hub — Delhi Public School',
    tagline: 'Learn · Grow · Excel',
    affiliationNo: 'CBSE / 1030482',
    address: tenant?.address || 'Sector 4, R.K. Puram',
    city: tenant?.city ? `${tenant.city}, ${tenant.state || 'Delhi'}` : 'New Delhi',
  };

  return (
    <TeacherSalarySlipClient
      teacher={teacherData}
      school={schoolData}
    />
  );
}
