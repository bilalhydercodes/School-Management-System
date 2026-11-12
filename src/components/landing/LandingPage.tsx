import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import type { CommunityStatsProps } from './CommunitySection';
import type { PricingPlan } from './PricingSection';

const SectionLoader = () => (
  <div className="w-full py-16 flex items-center justify-center bg-white/40">
    <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
  </div>
);

const FeaturesGrid = dynamic(() => import('./FeaturesGrid'), { loading: SectionLoader });
const RoleSection = dynamic(() => import('./RoleSection'), { loading: SectionLoader });
const CommunitySection = dynamic(() => import('./CommunitySection'), { loading: SectionLoader });
const PricingSection = dynamic(() => import('./PricingSection'), { loading: SectionLoader });
const TestimonialsSection = dynamic(() => import('./TestimonialsSection'), { loading: SectionLoader });
const FaqSection = dynamic(() => import('./FaqSection'), { loading: SectionLoader });
const FinalCtaSection = dynamic(() => import('./FinalCtaSection'), { loading: SectionLoader });
const Footer = dynamic(() => import('./Footer'), { loading: SectionLoader });

export interface LandingPageProps {
  stats?: CommunityStatsProps;
  plans?: PricingPlan[];
}

export default function LandingPage({ stats, plans }: LandingPageProps) {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header / Navigation */}
      <Navbar />

      <main suppressHydrationWarning className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Features / Module Grid Section */}
        <FeaturesGrid />

        {/* 4. Designed for Everyone Section (Gamma Alternating Role Portals) */}
        <RoleSection />

        {/* 5. Building Stronger School Communities (Institutional Telemetry & Live Pulse) */}
        <CommunitySection stats={stats} />

        {/* 6. Transparent Pricing Section */}
        <PricingSection plans={plans} />

        {/* 7. Testimonials Horizontal Carousel */}
        <TestimonialsSection />

        {/* 8. FAQ Section */}
        <FaqSection />

        {/* 9. Final Call to Action */}
        <FinalCtaSection />
      </main>

      {/* 10. Production-Ready Footer */}
      <Footer />
    </div>
  );
}
