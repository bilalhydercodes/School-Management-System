import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import SuperAdminLayoutClient from '@/components/superadmin/SuperAdminLayoutClient';

export const metadata = {
  title: 'Super Admin — Alpha Edu Hub',
  description:
    'Super Admin control panel for managing school tenants, subscriptions, domains, and platform-wide settings on Alpha Edu Hub.',
  openGraph: {
    type: 'website',
    title: 'Super Admin — Alpha Edu Hub',
    description:
      'Multi-tenant platform management: provision schools, configure subscriptions, manage domains, and monitor system health.',
    siteName: 'Alpha Edu Hub',
    images: [
      {
        url: '/images/dashboard/open_graph_image.png',
        width: 1730,
        height: 909,
        alt: 'Alpha Edu Hub — Super Admin Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Admin — Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getAuthenticatedContext();

  if (!context) {
    redirect('/login?redirect=/superadmin');
  }

  if (context.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }

  const adminName = context.user.fullName || 'Platform Super Admin';
  const adminEmail = context.user.email || 'superadmin@schoolerp.in';

  return (
    <SuperAdminLayoutClient adminName={adminName} adminEmail={adminEmail}>
      {children}
    </SuperAdminLayoutClient>
  );
}
