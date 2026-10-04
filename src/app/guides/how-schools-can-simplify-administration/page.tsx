import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Users,
  ShieldCheck,
  Zap,
  GraduationCap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How Schools Can Simplify Administration: Centralized Cloud Workflows | Alpha Edu Hub',
  description:
    'Practical strategies for school leaders, principals, and administrative staff to eliminate redundant paperwork, automate teacher substitutions, and unify institutional data.',
  alternates: {
    canonical: 'https://alphaeduhub.in/guides/how-schools-can-simplify-administration',
  },
  openGraph: {
    title: 'How Schools Can Simplify Administration | Alpha Edu Hub',
    description:
      'Learn how school principals and administrators streamline operations with modern multi-tenant cloud software.',
    url: 'https://alphaeduhub.in/guides/how-schools-can-simplify-administration',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How Schools Can Simplify Administration: Centralized Cloud Workflows',
  description:
    'Strategies and software solutions for modern educational institutions looking to streamline daily administration.',
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
    '@id': 'https://alphaeduhub.in/guides/how-schools-can-simplify-administration',
  },
  datePublished: '2026-03-01T00:00:00.000Z',
  dateModified: '2026-10-01T00:00:00.000Z',
};

export default function HowSchoolsCanSimplifyAdministrationPage() {
  const steps = [
    {
      step: '01',
      title: 'Centralize All Records into a Single Source of Truth',
      desc: 'Replace fragmented spreadsheets and physical registers with a unified cloud database where student admissions, attendance records, fee status, and exam marks are synchronized in real time.',
    },
    {
      step: '02',
      title: 'Automate Routine Teacher Substitutions',
      desc: 'When faculty members apply for leave, the system instantly identifies available teachers with matching subject expertise and free time slots, sending automated timetable updates to faculty.',
    },
    {
      step: '03',
      title: 'Empower Parents with Self-Service Web Portals',
      desc: 'Reduce phone calls to school reception by providing parents with direct access to attendance updates, digital fee payment receipts, term report cards, and official school circulars.',
    },
    {
      step: '04',
      title: 'Standardize Board-Compliant Report Cards',
      desc: 'Automate grade calculations, scholastic & co-scholastic remark generation, and printable PDF report cards configured for CBSE, ICSE, and State Board standards.',
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
            <span className="text-slate-900 font-medium">Leadership</span>
          </div>

          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Administrative Excellence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              How Schools Can Simplify Administration
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              Actionable operational strategies for school principals, headmasters, and administrative officers to minimize overhead and maximize instructional time.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span>Published by <strong>Alpha Edu Hub Team</strong></span>
              <span>•</span>
              <span>6 min read</span>
              <span>•</span>
              <span>Updated October 2026</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
            <div className="space-y-6">
              {steps.map((s) => (
                <section
                  key={s.step}
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {s.step}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{s.title}</h2>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed pl-13">
                    {s.desc}
                  </p>
                </section>
              ))}
            </div>

            <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white space-y-4 text-left">
              <h2 className="text-2xl font-bold">Ready to modernize your school administration?</h2>
              <p className="text-blue-100 text-sm sm:text-base">
                Join schools adopting Alpha Edu Hub to reduce administrative chaos, secure student data, and create a modern digital campus.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="px-6 py-3 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white border border-white/20 font-semibold text-sm transition-colors"
                >
                  Talk to Our Education Team
                </Link>
              </div>
            </section>

            {/* Bottom Links */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1d8cfd] hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Guides</span>
              </Link>
              <Link
                href="/modules"
                className="px-5 py-2.5 rounded-xl bg-blue-50 text-[#1d8cfd] hover:bg-blue-100 font-semibold text-xs sm:text-sm transition-colors"
              >
                View Role-Based Workspaces
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
