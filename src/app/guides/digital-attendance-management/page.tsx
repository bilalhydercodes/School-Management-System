import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Bell,
  BarChart3,
  Users,
  Smartphone,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Digital Attendance Management for Schools: Automated Tracking & Reports | Alpha Edu Hub',
  description:
    'Learn how digital attendance management software helps schools automate daily roll-calls, generate board compliance reports, and send instant parent absence alerts.',
  alternates: {
    canonical: 'https://alphaeduhub.in/guides/digital-attendance-management',
  },
  openGraph: {
    title: 'Digital Attendance Management for Schools | Alpha Edu Hub',
    description:
      'Discover how automated school attendance tracking eliminates manual register errors and keeps parents informed in real time.',
    url: 'https://alphaeduhub.in/guides/digital-attendance-management',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Digital Attendance Management for Schools: Automated Tracking & Reports',
  description:
    'Guide to modern web and digital attendance tracking for K-12 schools, CBSE/ICSE institutions, and colleges.',
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
    '@id': 'https://alphaeduhub.in/guides/digital-attendance-management',
  },
  datePublished: '2026-02-01T00:00:00.000Z',
  dateModified: '2026-10-01T00:00:00.000Z',
};

export default function DigitalAttendanceManagementPage() {
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
            <span className="text-slate-900 font-medium">Operations</span>
          </div>

          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-3">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Attendance Best Practices</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Digital Attendance Management for Schools: Automated Tracking &amp; Reports
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              How modern schools eliminate physical roll-call registers, reduce proxy attendance, and maintain 100% accurate compliance records.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span>Published by <strong>Alpha Edu Hub Team</strong></span>
              <span>•</span>
              <span>5 min read</span>
              <span>•</span>
              <span>Updated October 2026</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                1. The Pitfalls of Manual Paper Registers
              </h2>
              <p>
                For decades, teachers in Indian schools spent 10–15 minutes every morning marking paper registers. These paper logs are susceptible to physical damage, transcription mistakes during monthly roll-up calculations, and delay notifying parents of unexcused absences.
              </p>
              <p>
                With <Link href="/features" className="text-blue-600 font-medium hover:underline">Alpha Edu Hub attendance module</Link>, teachers record section attendance in less than 30 seconds using any tablet or smartphone, updating central school databases instantaneously.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                2. Key Capabilities of Digital Attendance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>Instant Absence Alerts</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Parents receive immediate web notifications if their child is marked absent without prior leave.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    <span>Automated Monthly Percentages</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Instant calculation of monthly and annual student attendance percentages for CBSE/ICSE board eligibility.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Faculty &amp; Staff Attendance</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Comprehensive teacher check-in tracking with automated leave application and substitution routing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Smartphone className="w-4 h-4 text-purple-500" />
                    <span>Mobile-Optimized Interface</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Zero latency, touch-friendly UI enabling quick toggling between Present, Absent, and Late.
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom Links */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/guides/school-fee-management-software"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1d8cfd] hover:text-blue-700"
              >
                <span>Next: School Fee Management Software</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/why-us"
                className="px-5 py-2.5 rounded-xl bg-blue-50 text-[#1d8cfd] hover:bg-blue-100 font-semibold text-xs sm:text-sm transition-colors"
              >
                Why Schools Choose Us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
