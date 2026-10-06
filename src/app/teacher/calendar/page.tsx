import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { getCalendarEventsAction } from '@/actions/admin/calendar';
import CalendarViewClient from '@/components/calendar/CalendarViewClient';

export const dynamic = 'force-dynamic';

export default async function TeacherCalendarPage() {
  const context = await getAuthenticatedContext();
  if (!context || (context.role !== 'TEACHER' && context.role !== 'ADMIN' && context.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/teacher/calendar');
  }

  const calendarData = await getCalendarEventsAction();

  return (
    <CalendarViewClient
      initialEvents={calendarData.events || []}
      academicYears={calendarData.academicYears || []}
      userRole="TEACHER"
      readOnly={true}
    />
  );
}
