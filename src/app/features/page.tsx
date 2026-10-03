import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import BenefitsSection from '@/components/landing/BenefitsSection';
import FinalCtaSection from '@/components/landing/FinalCtaSection';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Alpha Edu Hub Features — Complete School Management in One Platform',
  description:
    'Explore all 12+ powerful school ERP features: student information system, biometric/web attendance, automated fee collection, examination grading, timetables, and transport.',
  alternates: {
    canonical: 'https://alphaeduhub.in/features',
  },
  openGraph: {
    title: 'Alpha Edu Hub Features — School ERP Platform',
    description:
      'Explore all powerful school ERP features: student information system, attendance, fee collection, examinations, and timetables.',
    url: 'https://alphaeduhub.in/features',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1">
        {/* Core Features Grid */}
        <FeaturesGrid />

        {/* Benefits Overview */}
        <BenefitsSection />

        {/* Final CTA */}
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
