import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import BenefitsSection from '@/components/landing/BenefitsSection';
import CommunitySection from '@/components/landing/CommunitySection';
import FinalCtaSection from '@/components/landing/FinalCtaSection';
import Footer from '@/components/landing/Footer';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Why Choose Alpha Edu Hub — A Smarter Way to Manage Your School',
  description:
    'Discover why top K-12 schools, CBSE/ICSE institutions, and educational trusts choose Alpha Edu Hub for complete academic, fee, and administrative automation.',
  alternates: {
    canonical: 'https://alphaeduhub.in/why-us',
  },
  openGraph: {
    title: 'Why Choose Alpha Edu Hub — School ERP',
    description:
      'Discover why top K-12 schools choose Alpha Edu Hub for automated school operations, real-time parent portals, and intelligent grading.',
    url: 'https://alphaeduhub.in/why-us',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default async function WhyUsPage() {
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
  } catch (err) {
    console.error('Failed to load live stats for why-us page:', err);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1">
        {/* Why Us Hero & Benefits */}
        <BenefitsSection />

        {/* Community & Live Platform Metrics */}
        <CommunitySection stats={stats} />

        {/* Call to Action */}
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
