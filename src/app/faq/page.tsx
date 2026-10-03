import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import FaqSection from '@/components/landing/FaqSection';
import FinalCtaSection from '@/components/landing/FinalCtaSection';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) — Alpha Edu Hub School ERP',
  description:
    'Find answers to common questions about Alpha Edu Hub: data migration, setup time, security, CBSE/ICSE grading scales, parent portals, and customer support.',
  alternates: {
    canonical: 'https://alphaeduhub.in/faq',
  },
  openGraph: {
    title: 'Alpha Edu Hub FAQ — School ERP Questions & Answers',
    description:
      'Answers to common questions about Alpha Edu Hub: data migration, pricing, setup, security, and features.',
    url: 'https://alphaeduhub.in/faq',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1">
        {/* Full FAQ Section */}
        <FaqSection />

        {/* Final CTA */}
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
