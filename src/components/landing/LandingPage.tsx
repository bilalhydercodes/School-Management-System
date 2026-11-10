import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesGrid from './FeaturesGrid';
import RoleSection from './RoleSection';
import CommunitySection, { CommunityStatsProps } from './CommunitySection';
import PricingSection, { PricingPlan } from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import FaqSection from './FaqSection';
import FinalCtaSection from './FinalCtaSection';
import Footer from './Footer';

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
