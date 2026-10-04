import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  CalendarCheck,
  CreditCard,
  Building2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'School Management & ERP Knowledge Hub — Alpha Edu Hub Guides',
  description:
    'Comprehensive educational guides and resources for school principals, trustees, and administrators on modern school ERP software, digital attendance, fee collection, and institutional automation.',
  alternates: {
    canonical: 'https://alphaeduhub.in/guides',
  },
  openGraph: {
    title: 'School Management & ERP Knowledge Hub — Alpha Edu Hub',
    description:
      'Educational guides and resources for school administrators on school ERP software, digital attendance, fee collection, and automation.',
    url: 'https://alphaeduhub.in/guides',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default function GuidesIndexPage() {
  const guides = [
    {
      slug: 'what-is-a-school-management-system',
      title: 'What Is a School Management System? Complete Guide',
      description:
        'A foundational guide explaining what school management systems (SMS) are, how they differ from legacy software, core architecture, and why modern K-12 institutions require centralized platforms.',
      icon: BookOpen,
      category: 'Foundations',
      readTime: '6 min read',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      slug: 'benefits-of-school-erp-software',
      title: 'Top 10 Benefits of School ERP Software for Modern Institutions',
      description:
        'Explore how enterprise resource planning (ERP) software transforms campus operations, reduces administrative overhead by 70%, accelerates fee recovery, and keeps parents actively engaged.',
      icon: Sparkles,
      category: 'Strategy & ROI',
      readTime: '8 min read',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      slug: 'digital-attendance-management',
      title: 'Digital Attendance Management for Schools: Automated Tracking & Reports',
      description:
        'Understand best practices for tracking student and faculty attendance, preventing manual register errors, generating monthly compliance summaries, and sending instant absence alerts to parents.',
      icon: CalendarCheck,
      category: 'Operations',
      readTime: '5 min read',
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      slug: 'school-fee-management-software',
      title: 'School Fee Management Software: Online Invoicing, Reconciliation & Receipts',
      description:
        'Learn how cloud fee management streamlines installment scheduling, multi-head fee structures, automated SMS reminders, instant digital receipts, and real-time ledger accounting.',
      icon: CreditCard,
      category: 'Financial Management',
      readTime: '7 min read',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      slug: 'how-schools-can-simplify-administration',
      title: 'How Schools Can Simplify Administration Through Cloud Automation',
      description:
        'Actionable strategies for school trustees and principals to eliminate redundant paperwork, automate teacher substitutions, unify student records, and boost institutional efficiency.',
      icon: Building2,
      category: 'Leadership',
      readTime: '6 min read',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20 bg-[#f8fbff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Educational Resources &amp; Guides</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              School Management &amp; <span className="text-[#1d8cfd]">ERP Insights</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              In-depth, practical guides curated by Alpha Edu Hub to assist school principals, educators, and administrators in implementing modern digital campus workflows.
            </p>
          </div>

          {/* Guides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <article
                  key={guide.slug}
                  className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-left group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {guide.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {guide.readTime}
                      </span>
                    </div>

                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${guide.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {guide.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1d8cfd] group-hover:text-blue-700 transition-colors"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Quick CTA Banner */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#1d8cfd] to-[#0284c7] rounded-3xl p-8 sm:p-10 text-white text-center shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-black">Experience Alpha Edu Hub in Action</h2>
            <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-lg mx-auto">
              Ready to see how our multi-tenant school operating system simplifies daily operations for your institution?
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-white text-[#1d8cfd] hover:bg-blue-50 font-bold text-sm transition-colors shadow-xs"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white border border-white/20 font-semibold text-sm transition-colors"
              >
                Schedule a Demo
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
