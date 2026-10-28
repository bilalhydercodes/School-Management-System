import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import SuperAdminHelpClient from '@/components/superadmin/SuperAdminHelpClient';

export const metadata = {
  title: 'Super Admin Operations & Support — Alpha Edu Hub',
  description: 'Multi-tenant cloud infrastructure, disaster recovery, and platform operations guide.',
};

export const dynamic = 'force-dynamic';

export default async function SuperAdminHelpPage() {
  const context = await getAuthenticatedContext();
  if (!context) {
    redirect('/login?redirect=/superadmin/help');
  }

  if (context.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }

  return <SuperAdminHelpClient />;
}
