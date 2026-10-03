import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesGrid from './FeaturesGrid';
import RoleSection from './RoleSection';
import BenefitsSection from './BenefitsSection';
import CommunitySection, { CommunityStatsProps } from './CommunitySection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import FaqSection from './FaqSection';
import FinalCtaSection from './FinalCtaSection';
import Footer from './Footer';

export interface LandingPageProps {
  stats?: CommunityStatsProps;
}

export default function LandingPage({ stats }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header / Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Features / Module Grid Section */}
        <FeaturesGrid />

        {/* 4. Designed for Everyone Section */}
        <RoleSection />

        {/* 5. Smarter Way to Manage Your School (Benefits + Dashboard Mockup) */}
        <BenefitsSection />

        {/* 6. Building Stronger School Communities (Statistics & Illustration) */}
        <CommunitySection stats={stats} />

        {/* 7. Transparent Pricing Section */}
        <PricingSection />

        {/* 8. Testimonials Section */}
        <TestimonialsSection />

        {/* 9. FAQ Section */}
        <FaqSection />

        {/* 10. Final Call to Action */}
        <FinalCtaSection />
      </main>

      {/* 11. Production-Ready Footer */}
      <Footer />
    </div>
  );
}
