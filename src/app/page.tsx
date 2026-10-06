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

import type { PricingPlan } from '@/components/landing/PricingSection';

export default async function HomePage() {
  let stats = {
    schools: 1,
    students: 5,
    attendance: 15,
    uptime: '99.9%',
  };
  let customPlans: PricingPlan[] | undefined = undefined;

  try {
    const [schoolsCount, studentsCount, attendanceCount, dbPlans] = await Promise.all([
      prisma.tenant.count({ where: { isActive: true } }),
      prisma.studentProfile.count(),
      prisma.studentAttendance.count(),
      prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { priceMonthly: 'asc' },
      }),
    ]);

    stats = {
      schools: schoolsCount,
      students: studentsCount,
      attendance: attendanceCount,
      uptime: '99.9%',
    };

    if (dbPlans.length > 0) {
      customPlans = dbPlans.map((p) => {
        const isWhiteLabel = p.name.toLowerCase().includes('white');
        const isPrime = p.name.toLowerCase().includes('prime');
        return {
          id: p.id,
          name: p.name.toUpperCase(),
          serverTag: isWhiteLabel ? 'Your Dedicated Server' : 'Alpha Edu Hub Cloud Server',
          price: isWhiteLabel && Number(p.priceMonthly) >= 20 ? 'Custom' : `₹${Number(p.priceMonthly)}`,
          billingPeriod: isWhiteLabel ? 'Ask for Quotation' : 'Per Student / Month',
          description: isPrime
            ? 'Complete School ERP with web portals, notifications, and advanced automation features.'
            : isWhiteLabel
            ? 'ERP deployed under your school’s brand name with complete ownership and customization.'
            : 'Perfect for schools looking for a reliable and affordable ERP solution.',
          isPopular: isPrime,
          features: Object.entries((p.features as Record<string, boolean>) || {})
            .filter(([_, isEnabled]) => isEnabled)
            .map(([k]) => {
              const map: Record<string, string> = {
                admission: 'Online Admission',
                attendance: 'Attendance Management',
                fees: 'Fee Management',
                exams: 'Examination Management',
                reports: 'Reports & Analytics',
                portals: 'Student & Parent Web Portals',
                notifications: 'Notifications & Alerts',
                timetable: 'Timetable Scheduling Engine',
                analytics: 'Advanced Dashboard & Analytics',
                pwa: 'PWA Mobile Support',
                customDomain: 'Custom Domain',
                whiteLabel: 'Your School Branding',
                prioritySupport: 'Priority Support',
              };
              return map[k] || k.replace(/([A-Z])/g, ' $1');
            }),
          ctaLabel: isWhiteLabel ? 'Request a Quote' : isPrime ? 'Choose Prime' : 'Get Started',
          ctaHref: isWhiteLabel ? undefined : '/login',
          isCustomQuote: isWhiteLabel,
        };
      });
    }
  } catch (error) {
    console.error('Failed to query live landing stats & plans:', error);
  }

  return <LandingPage stats={stats} plans={customPlans} />;
}
