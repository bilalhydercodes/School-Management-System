import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import TeacherHelpClient from '@/components/teacher/TeacherHelpClient';

export const metadata = {
  title: 'Teacher Help & Support — Alpha Edu Hub',
  description: 'Official academic assistance, operational ERP manuals, and prompt IT resolution for teaching faculty.',
};

export const dynamic = 'force-dynamic';

export default async function TeacherHelpPage() {
  const context = await getAuthenticatedContext();
  if (!context) {
    redirect('/login?redirect=/teacher/help');
  }

  return <TeacherHelpClient />;
}
