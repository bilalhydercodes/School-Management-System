import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Users,
  Smartphone,
  CreditCard,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Top 10 Benefits of School ERP Software for Modern Institutions | Alpha Edu Hub',
  description:
    'Discover the top 10 advantages of implementing School ERP software, from automated fee collection and paperless attendance to parent engagement and administrative cost savings.',
  alternates: {
    canonical: 'https://alphaeduhub.in/guides/benefits-of-school-erp-software',
  },
  openGraph: {
    title: 'Top 10 Benefits of School ERP Software | Alpha Edu Hub',
    description:
      'Learn how School ERP software cuts administrative workload, boosts fee collection, and improves school-parent communication.',
    url: 'https://alphaeduhub.in/guides/benefits-of-school-erp-software',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Top 10 Benefits of School ERP Software for Modern Institutions',
  description:
    'Detailed breakdown of why educational institutions across India are adopting centralized School ERP systems.',
  author: {
    '@type': 'Organization',
    name: 'Alpha Edu Hub',
    url: 'https://alphaeduhub.in',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Alpha Edu Hub',
    logo: {
      '@type': 'ImageObject',
      url: 'https://alphaeduhub.in/images/dashboard/logo_transparent_bg.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://alphaeduhub.in/guides/benefits-of-school-erp-software',
  },
  datePublished: '2026-01-20T00:00:00.000Z',
  dateModified: '2026-10-01T00:00:00.000Z',
};

export default function BenefitsOfSchoolErpSoftwarePage() {
  const benefits = [
    {
      number: '01',
      title: '70% Reduction in Administrative Paperwork',
      description:
        'Digitizing student admission records, daily attendance registers, and circular notices eliminates tedious manual filing and paperwork storage.',
      icon: FileCheck,
    },
    {
      number: '02',
      title: 'Accelerated Fee Collection & Cash Flow',
      description:
        'Automated invoice generation, payment reminders, and multi-tier fee structures ensure school fees are collected on time with minimal default rates.',
      icon: CreditCard,
    },
    {
      number: '03',
      title: 'Real-Time Parent-School Communication',
      description:
        'Dedicated student/parent web portals provide immediate visibility into daily attendance, exam scorecards, timetables, and emergency notices.',
      icon: Smartphone,
    },
    {
      number: '04',
      title: 'Error-Free Examination & Grading Workflows',
      description:
        'Configurable mark entry sheets aligned with CBSE, ICSE, and State Board guidelines automatically compute CGPA, grade points, and printable report cards.',
      icon: TrendingUp,
    },
    {
      number: '05',
      title: 'Automated Teacher Timetables & Substitutions',
      description:
        'Generate conflict-free weekly timetables in seconds and reassign classes automatically when faculty take planned or emergency leaves.',
      icon: Zap,
    },
    {
      number: '06',
      title: 'Enterprise Data Security & Tenant Privacy',
      description:
        'Role-based access control and 256-bit encryption safeguard sensitive student demographic records and financial ledgers.',
      icon: ShieldCheck,
    },
    {
      number: '07',
      title: 'Consolidated Multi-Branch & Trust Management',
      description:
        'Education trusts operating multiple school campuses can monitor overarching enrollments, attendance averages, and fee recoveries from a single dashboard.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 bg-[#f8fbff]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <Link href="/guides" className="hover:text-blue-600 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Guides</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Strategy &amp; ROI</span>
          </div>

          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Strategy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Top Benefits of School ERP Software for Modern Institutions
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              Why forward-thinking school trustees and administrators in India are replacing legacy systems with modern cloud ERP solutions like Alpha Edu Hub.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span>Published by <strong>Alpha Edu Hub Team</strong></span>
              <span>•</span>
              <span>8 min read</span>
              <span>•</span>
              <span>Updated October 2026</span>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
            <div className="space-y-6">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <section
                    key={b.number}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {b.number}
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {b.title}
                      </h2>
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed pl-13">
                      {b.description}
                    </p>
                  </section>
                );
              })}
            </div>

            {/* Bottom Links */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/guides/digital-attendance-management"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1d8cfd] hover:text-blue-700"
              >
                <span>Next: Digital Attendance Management for Schools</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="px-5 py-2.5 rounded-xl bg-blue-50 text-[#1d8cfd] hover:bg-blue-100 font-semibold text-xs sm:text-sm transition-colors"
              >
                View Transparent Pricing
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
