import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CommunitySection from '@/components/landing/CommunitySection';
import FinalCtaSection from '@/components/landing/FinalCtaSection';
import Footer from '@/components/landing/Footer';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'School Testimonials — What Educational Leaders Say About Alpha Edu Hub',
  description:
    'Read real reviews and feedback from school principals, teachers, and administrators who trust Alpha Edu Hub for daily school management.',
  alternates: {
    canonical: 'https://alphaeduhub.in/testimonials',
  },
  openGraph: {
    title: 'Alpha Edu Hub School Testimonials & Reviews',
    description:
      'Read real reviews and feedback from school principals, teachers, and administrators using Alpha Edu Hub.',
    url: 'https://alphaeduhub.in/testimonials',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default async function TestimonialsPage() {
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
    console.error('Failed to load stats for testimonials page:', err);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1">
        {/* Testimonials */}
        <TestimonialsSection />

        {/* Community & Stats */}
        <CommunitySection stats={stats} />

        {/* Final CTA */}
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
