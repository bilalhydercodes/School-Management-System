import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import AdminHelpClient from '@/components/admin/AdminHelpClient';

export const metadata = {
  title: 'Administrator Help & Support — Alpha Edu Hub',
  description: 'Executive documentation, operational SOPs, and dedicated enterprise support for school administrators.',
};

export const dynamic = 'force-dynamic';

export default async function AdminHelpPage() {
  const context = await getAuthenticatedContext();
  if (!context) {
    redirect('/login?redirect=/admin/help');
  }

  return <AdminHelpClient />;
}
