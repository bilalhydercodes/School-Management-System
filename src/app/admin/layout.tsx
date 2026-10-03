import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { getAuthoritativeUserFromClerk } from '@/lib/clerk-auth';
import { prisma } from '@/lib/db';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'Admin Portal — Alpha Edu Hub',
  description:
    'School administration portal for managing students, teachers, attendance, fees, exams, and more — powered by Alpha Edu Hub.',
  openGraph: {
    type: 'website',
    title: 'Admin Portal — Alpha Edu Hub',
    description:
      'Comprehensive school administration dashboard with real-time data, student management, attendance tracking, and fee collection.',
    siteName: 'Alpha Edu Hub',
    images: [
      {
        url: '/images/dashboard/open_graph_image.png',
        width: 1730,
        height: 909,
        alt: 'Alpha Edu Hub — Admin Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admin Portal — Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Session verification & RBAC guard (Supports both Clerk & Session Cookie)
  const clerkSession = await getAuthoritativeUserFromClerk();
  const session = await getSessionFromCookies();

  const effectiveRole = clerkSession?.role || session?.role;
  const effectiveUserId = clerkSession?.appUser.userId || session?.sub;
  const effectiveEmail = clerkSession?.appUser.email || session?.email;
  const effectiveTenantId = clerkSession?.tenantId || session?.tenantId;

  if (!effectiveRole || !effectiveUserId) {
    redirect('/login?redirect=/admin');
  }

  if (effectiveRole !== 'ADMIN' && effectiveRole !== 'SUPER_ADMIN' && effectiveRole !== 'ACCOUNTANT') {
    redirect('/unauthorized');
  }

  // 2. Fetch tenant & user details
  const [user, tenant, academicYear] = await Promise.all([
    prisma.user.findUnique({
      where: { id: effectiveUserId },
      select: { firstName: true, lastName: true, email: true, role: true },
    }),
    effectiveTenantId
      ? prisma.tenant.findUnique({
          where: { id: effectiveTenantId },
          select: { name: true, board: true },
        })
      : null,
    effectiveTenantId
      ? prisma.academicYear.findFirst({
          where: { tenantId: effectiveTenantId, isCurrent: true },
          select: { name: true },
        })
      : null,
  ]);

  const schoolName = tenant?.name || 'Alpha Edu Hub';
  const board = tenant?.board || 'CBSE';
  const academicYearName = academicYear?.name || '2026-27';
  const adminName = user
    ? `${user.firstName} ${user.lastName}`
    : clerkSession
    ? `${clerkSession.appUser.firstName} ${clerkSession.appUser.lastName}`
    : 'Administrator';
  const adminEmail = user?.email || effectiveEmail || 'admin@dps.edu.in';

  return (
    <AdminLayoutClient
      schoolName={schoolName}
      board={board}
      academicYear={academicYearName}
      adminName={adminName}
      adminEmail={adminEmail}
      role={effectiveRole}
    >
      {children}
    </AdminLayoutClient>
  );
}
