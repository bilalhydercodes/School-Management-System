import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { getCalendarEventsAction } from '@/actions/admin/calendar';
import CalendarViewClient from '@/components/calendar/CalendarViewClient';

export const dynamic = 'force-dynamic';

export default async function AdminCalendarPage() {
  const authContext = await getAuthenticatedContext();
  if (!authContext || (authContext.role !== 'ADMIN' && authContext.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin/calendar');
  }

  const calendarData = await getCalendarEventsAction();

  return (
    <CalendarViewClient
      initialEvents={calendarData.events || []}
      academicYears={calendarData.academicYears || []}
      userRole="ADMIN"
    />
  );
}
