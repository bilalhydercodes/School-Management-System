import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
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
  // 1. Session verification & Zero-redundancy authenticated context
  const context = await getAuthenticatedContext();

  if (!context) {
    redirect('/login?redirect=/admin');
  }

  if (
    context.role !== 'ADMIN' &&
    context.role !== 'SUPER_ADMIN' &&
    context.role !== 'ACCOUNTANT'
  ) {
    redirect('/unauthorized');
  }

  const schoolName = context.tenant?.name || 'Alpha Edu Hub';
  const board = context.tenant?.board || 'CBSE';
  const academicYearName = context.academicYear?.name || '2026-27';
  const adminName = context.user.fullName || 'Administrator';
  const adminEmail = context.user.email || 'admin@school.edu.in';

  return (
    <AdminLayoutClient
      schoolName={schoolName}
      board={board}
      academicYear={academicYearName}
      adminName={adminName}
      adminEmail={adminEmail}
      role={context.role}
    >
      {children}
    </AdminLayoutClient>
  );
}
