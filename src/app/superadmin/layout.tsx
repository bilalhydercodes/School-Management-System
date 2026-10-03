import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { getAuthoritativeUserFromClerk } from '@/lib/clerk-auth';
import { prisma } from '@/lib/db';
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
  // 1. Session verification & Zero-Trust RBAC guard (Supports both Clerk & Session Cookie)
  const clerkSession = await getAuthoritativeUserFromClerk();
  const session = await getSessionFromCookies();

  const effectiveRole = clerkSession?.role || session?.role;
  const effectiveUserId = clerkSession?.appUser.userId || session?.sub;
  const effectiveEmail = clerkSession?.appUser.email || session?.email;

  if (!effectiveRole || !effectiveUserId) {
    redirect('/login?redirect=/superadmin');
  }

  if (effectiveRole !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }

  // 2. Fetch Super Admin profile details
  const user = await prisma.user.findUnique({
    where: { id: effectiveUserId },
    select: { firstName: true, lastName: true, email: true },
  });

  const adminName = user
    ? `${user.firstName} ${user.lastName}`
    : clerkSession
    ? `${clerkSession.appUser.firstName} ${clerkSession.appUser.lastName}`
    : 'Platform Super Admin';
  const adminEmail = user?.email || effectiveEmail || 'superadmin@schoolerp.in';

  return (
    <SuperAdminLayoutClient adminName={adminName} adminEmail={adminEmail}>
      {children}
    </SuperAdminLayoutClient>
  );
}
