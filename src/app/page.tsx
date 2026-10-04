import LandingPage from '@/components/landing/LandingPage';
import { prisma } from '@/lib/db';

export const revalidate = 60; // Revalidate live community statistics every 60s

export const metadata = {
  title: 'Alpha Edu Hub | School Management System & School ERP',
  description:
    'Alpha Edu Hub is an all-in-one school management platform that helps schools manage attendance, fee records, administration, and communication through a centralized web application.',
  keywords: [
    'Alpha Edu Hub',
    'AlphaEduHub',
    'Alpha Edu Hub school management system',
    'Alpha Edu Hub founder',
    'Mahammad Bilal Hyder Alpha Edu Hub',
    'School ERP',
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
    title: 'Alpha Edu Hub | School Management System & School ERP',
    description:
      'Alpha Edu Hub is an all-in-one school management platform that helps schools manage attendance, fee records, administration, and communication through a centralized web application.',
    siteName: 'Alpha Edu Hub',
    images: [
      {
        url: '/images/dashboard/open_graph_image.png',
        width: 1730,
        height: 909,
        alt: 'Alpha Edu Hub — School Management System & School ERP',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alpha Edu Hub | School Management System & School ERP',
    description:
      'Alpha Edu Hub is an all-in-one school management platform that helps schools manage attendance, fee records, administration, and communication through a centralized web application.',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default async function HomePage() {
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

  return <LandingPage stats={stats} />;
}
