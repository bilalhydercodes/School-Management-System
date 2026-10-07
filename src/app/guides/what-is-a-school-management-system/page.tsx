import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  Building2,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'What Is a School Management System? Complete Guide 2026 | Alpha Edu Hub',
  description:
    'Discover what a school management system (SMS) is, how it works, core features like attendance and fee tracking, and why Indian schools are adopting cloud ERP platforms.',
  alternates: {
    canonical: 'https://alphaeduhub.in/guides/what-is-a-school-management-system',
  },
  openGraph: {
    title: 'What Is a School Management System? Complete Guide | Alpha Edu Hub',
    description:
      'Learn how school management software simplifies administration, unifies student records, tracks attendance, and automates fee reconciliation.',
    url: 'https://alphaeduhub.in/guides/what-is-a-school-management-system',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'What Is a School Management System? Complete Guide for School Administrators',
  description:
    'A comprehensive guide explaining what school management systems are, core modules, benefits, and how modern K-12 schools use cloud ERP platforms.',
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
      url: 'https://alphaeduhub.in/images/dashboard/logo_crest.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://alphaeduhub.in/guides/what-is-a-school-management-system',
  },
  datePublished: '2026-01-15T00:00:00.000Z',
  dateModified: '2026-10-01T00:00:00.000Z',
};

export default function WhatIsSchoolManagementSystemPage() {
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
            <span className="text-slate-900 font-medium">Foundations</span>
          </div>

          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Comprehensive ERP Guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              What Is a School Management System?
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              Everything you need to know about cloud-based School ERP software, how it replaces fragmented paperwork, and how modern institutions streamline daily operations.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span>Published by <strong>Alpha Edu Hub Team</strong></span>
              <span>•</span>
              <span>6 min read</span>
              <span>•</span>
              <span>Updated October 2026</span>
            </div>
          </div>

          {/* Article Body */}
          <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                1. Definition &amp; Core Purpose
              </h2>
              <p>
                A <strong>School Management System (SMS)</strong>—often referred to as a School ERP (Enterprise Resource Planning)—is a centralized software suite designed to automate, manage, and coordinate the entire administrative, academic, and communication workflow of an educational institution.
              </p>
              <p>
                Rather than relying on disjointed spreadsheets, physical registers, and separate billing tools, a unified platform like <Link href="/" className="text-blue-600 font-medium hover:underline">Alpha Edu Hub</Link> brings school principals, administrators, teachers, accountants, students, and parents into a singular, synchronized web environment.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                2. Core Modules in a Modern School ERP
              </h2>
              <p>
                Modern school management platforms offer specialized modules configured for the daily needs of different institutional roles:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-blue-600" />
                    Student Attendance
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Real-time period-by-period and daily roll-call attendance with automated parent notifications.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Fee Collection &amp; Invoicing
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Online payments, automated installment generation, receipt issuance, and overdue balance tracking.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Examinations &amp; Report Cards
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Custom grading scales configured for CBSE, ICSE, and State Board performance evaluation.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    Timetable &amp; Substitutions
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Automated conflict resolution for master period scheduling and one-click teacher leave substitutions.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                3. Key Advantages Over Legacy Desktop Software
              </h2>
              <p>
                Legacy offline software requires on-premise server maintenance, manual USB backups, and cannot be accessed outside the physical school office. In contrast, modern cloud architectures deliver:
              </p>
              <ul className="space-y-2.5 pl-2 text-sm sm:text-base">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Installation Overhead:</strong> Accessible via any modern web browser on desktop, tablet, or smartphone.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Multi-Tenant Data Isolation:</strong> Strict database boundaries ensure complete institutional privacy and zero data mixing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Instant Cloud Backups:</strong> Automated daily backups protect academic records against hardware failure or accidental loss.</span>
                </li>
              </ul>
            </section>

            {/* Related Navigation */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/guides/benefits-of-school-erp-software"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1d8cfd] hover:text-blue-700"
              >
                <span>Next: Top 10 Benefits of School ERP Software</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="px-5 py-2.5 rounded-xl bg-blue-50 text-[#1d8cfd] hover:bg-blue-100 font-semibold text-xs sm:text-sm transition-colors"
              >
                Explore Alpha Edu Hub Features
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
