import { getSessionFromCookies, getRoleDefaultPath } from '@/lib/session';
import LandingPage from '@/components/landing/LandingPage';
import { prisma } from '@/lib/db';

export const revalidate = 60; // Revalidate live community statistics every 60s

export const metadata = {
  title: 'Alpha Edu Hub — Next-Gen Multi-Tenant School ERP & Operating System',
  description:
    'Alpha Edu Hub provides complete school automation for Indian K-12 institutions. Student attendance, CBSE/ICSE curriculum grading, online fee collection, teacher workspaces, and mobile portals.',
  keywords: [
    'Alpha Edu Hub',
    'AlphaEduHub',
    'School ERP India',
    'School Management System',
    'Multi-Tenant School Software',
    'CBSE School Management',
    'ICSE School ERP',
    'Online Fee Collection School',
    'Student Attendance System',
    'Teacher Dashboard',
    'K-12 School Software',
    'School Portal India',
  ],
  alternates: {
    canonical: 'https://alphaeduhub.in',
  },
  openGraph: {
    type: 'website',
    url: 'https://alphaeduhub.in',
    title: 'Alpha Edu Hub — Next-Gen School ERP & Management System',
    description:
      'Alpha Edu Hub provides complete school automation for Indian K-12 institutions. Student attendance, grading, online fee collection, teacher workspaces, and parent portals.',
    siteName: 'Alpha Edu Hub',
    images: [
      {
        url: '/images/dashboard/open_graph_image.png',
        width: 1730,
        height: 909,
        alt: 'Alpha Edu Hub — School ERP & Management System',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alpha Edu Hub — Next-Gen School ERP & Management System',
    description:
      'Complete school automation: attendance, grading, online fees, teacher dashboards, and parent portals.',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default async function HomePage() {
  const session = await getSessionFromCookies();
  const dashboardHref = session ? getRoleDefaultPath(session.role) : undefined;

  let stats = {
    schools: 1,
    students: 5,
    attendance: 15,
    uptime: '99.9%',
  };

  try {
    const [schoolsCount, studentsCount, attendanceCount] = await Promise.all([
      prisma.tenant.count({ where: { isActive: true } }),
      prisma.studentProfile.count(),
      prisma.studentAttendance.count(),
    ]);

    stats = {
      schools: schoolsCount,
      students: studentsCount,
      attendance: attendanceCount,
      uptime: '99.9%',
    };
  } catch (error) {
    console.error('Failed to query live landing stats:', error);
  }

  return <LandingPage dashboardHref={dashboardHref} stats={stats} />;
}
