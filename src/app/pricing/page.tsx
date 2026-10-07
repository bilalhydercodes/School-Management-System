import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import PricingSection from '@/components/landing/PricingSection';
import FaqSection from '@/components/landing/FaqSection';
import FinalCtaSection from '@/components/landing/FinalCtaSection';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Alpha Edu Hub Pricing — Plans Coming Soon',
  description:
    'Transparent per-student pricing plans for schools coming soon. Request early access and special introductory rates for your institution.',
  alternates: {
    canonical: 'https://alphaeduhub.in/pricing',
  },
  openGraph: {
    title: 'Alpha Edu Hub Pricing — Coming Soon',
    description:
      'Transparent per-student pricing plans for schools coming soon. Request early access and special introductory rates.',
    url: 'https://alphaeduhub.in/pricing',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

import { prisma } from '@/lib/db';
import type { PricingPlan } from '@/components/landing/PricingSection';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  let customPlans: PricingPlan[] | undefined = undefined;

  try {
    const dbPlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });

    if (dbPlans.length > 0) {
      customPlans = dbPlans.map((p) => {
        const isWhiteLabel = p.name.toLowerCase().includes('white');
        const isPrime = p.name.toLowerCase().includes('prime');
        return {
          id: p.id,
          name: p.name.toUpperCase(),
          serverTag: isWhiteLabel ? 'Your Dedicated Server' : 'Alpha Edu Hub Cloud Server',
          price: 'Coming Soon',
          billingPeriod: isWhiteLabel ? 'Ask for Quotation' : 'Announcing Soon',
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
          ctaLabel: isWhiteLabel ? 'Request a Quote' : 'Request Early Access',
          isCustomQuote: true,
        };
      });
    }
  } catch (err) {
    console.error('Failed to load dynamic pricing plans:', err);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1">
        {/* Transparent Pricing 3-Tier Matrix */}
        <PricingSection plans={customPlans} />

        {/* Pricing FAQs */}
        <FaqSection />

        {/* Final CTA */}
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
