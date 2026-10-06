import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import AdminAttendanceDashboard from '@/components/admin/AdminAttendanceDashboard';
import { getAdminAttendanceOverviewAction } from '@/actions/attendance';
import { Role } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminAttendancePage() {
  const authContext = await getAuthenticatedContext();
  if (!authContext || (authContext.role !== Role.ADMIN && authContext.role !== Role.SUPER_ADMIN)) {
    redirect('/unauthorized');
  }

  const tenantId = authContext.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  const res = await getAdminAttendanceOverviewAction();
  const overview = res.success && res.overview ? res.overview : null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <AdminAttendanceDashboard
        schoolName={authContext.tenant?.name || 'School Campus'}
        board={authContext.tenant?.board || 'CBSE'}
        initialOverview={overview}
      />
    </div>
  );
}
