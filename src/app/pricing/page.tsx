import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import PricingSection from '@/components/landing/PricingSection';
import FaqSection from '@/components/landing/FaqSection';
import FinalCtaSection from '@/components/landing/FinalCtaSection';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Alpha Edu Hub Pricing — Transparent Plans for Every Institution',
  description:
    'Simple, transparent pricing for schools starting at ₹8/student/month. Lite, Prime, and White Label custom deployment tiers with zero hidden setup fees.',
  alternates: {
    canonical: 'https://alphaeduhub.in/pricing',
  },
  openGraph: {
    title: 'Alpha Edu Hub Pricing Plans',
    description:
      'Predictable, student-based pricing plans for schools of all sizes. Lite (₹8), Prime (₹11), and White Label options.',
    url: 'https://alphaeduhub.in/pricing',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1">
        {/* Transparent Pricing 3-Tier Matrix */}
        <PricingSection />

        {/* Pricing FAQs */}
        <FaqSection />

        {/* Final CTA */}
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
