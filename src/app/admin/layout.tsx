import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { getAuthoritativeUserFromClerk } from '@/lib/clerk-auth';
import { prisma } from '@/lib/db';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

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

  const schoolName = tenant?.name || 'Sunrise Public School';
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
