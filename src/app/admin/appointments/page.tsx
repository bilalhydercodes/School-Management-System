import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { getAppointmentsAction } from '@/actions/admin/appointments';
import AppointmentsClient from '@/components/admin/AppointmentsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAppointmentsPage() {
  const authContext = await getAuthenticatedContext();
  if (!authContext || (authContext.role !== 'ADMIN' && authContext.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin/appointments');
  }

  const data = await getAppointmentsAction();

  return (
    <AppointmentsClient
      initialAppointments={data.appointments || []}
      initialPendingRequests={data.pendingRequests || []}
      authorities={data.authorities || []}
    />
  );
}
