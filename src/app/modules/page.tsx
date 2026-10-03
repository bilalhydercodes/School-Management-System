import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import RoleSection from '@/components/landing/RoleSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import FinalCtaSection from '@/components/landing/FinalCtaSection';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Alpha Edu Hub Modules — Role-Based Portals for Everyone',
  description:
    'Dedicated role-based workspaces for school administrators, teachers, students, and parents. Seamless collaboration and unified education management.',
  alternates: {
    canonical: 'https://alphaeduhub.in/modules',
  },
  openGraph: {
    title: 'Alpha Edu Hub Modules — Role-Based School Portals',
    description:
      'Dedicated workspaces for school administrators, teachers, students, and parents.',
    url: 'https://alphaeduhub.in/modules',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1">
        {/* Role-based Workspaces */}
        <RoleSection />

        {/* Feature Grid */}
        <FeaturesGrid />

        {/* Final CTA */}
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
