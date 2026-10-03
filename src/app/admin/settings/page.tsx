import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';
import { Role } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  const [tenant, academicYears] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        branding: true,
      },
    }),
    prisma.academicYear.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
    }),
  ]);

  const currentYear =
    academicYears.find((ay) => ay.isCurrent)?.name ||
    academicYears[0]?.name ||
    'AY 2026-27';

  return (
    <AdminSettingsClient
      schoolName={tenant?.name || 'Alpha Edu Hub'}
      tagline={tenant?.branding?.tagline || 'Next-Gen School ERP Platform'}
      board={tenant?.board || 'CBSE'}
      email={tenant?.email || 'admin@alphaeduhub.in'}
      phone={tenant?.phone || '+91 98765 43210'}
      address={tenant?.address || 'Sector 14, Institutional Area'}
      city={tenant?.city || 'New Delhi'}
      state={tenant?.state || 'Delhi NCR'}
      pincode={tenant?.pincode || '110001'}
      workingDays={tenant?.workingDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']}
      currentAcademicYear={currentYear}
    />
  );
}
