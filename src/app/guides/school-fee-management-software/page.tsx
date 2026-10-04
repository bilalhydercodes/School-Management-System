import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Receipt,
  ShieldCheck,
  FileSpreadsheet,
  Banknote,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'School Fee Management Software: Online Invoicing & Receipts | Alpha Edu Hub',
  description:
    'Comprehensive guide on modern school fee management software: automated installment invoicing, online payments, digital receipts, and real-time ledger accounting.',
  alternates: {
    canonical: 'https://alphaeduhub.in/guides/school-fee-management-software',
  },
  openGraph: {
    title: 'School Fee Management Software | Alpha Edu Hub',
    description:
      'How schools automate fee invoicing, online collections, overdue reminders, and GST/account reconciliation with Alpha Edu Hub.',
    url: 'https://alphaeduhub.in/guides/school-fee-management-software',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'School Fee Management Software: Online Payments, Invoicing & Receipts',
  description:
    'Complete guide to modern cloud fee collection and accounting automation for K-12 educational institutions.',
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
    '@id': 'https://alphaeduhub.in/guides/school-fee-management-software',
  },
  datePublished: '2026-02-15T00:00:00.000Z',
  dateModified: '2026-10-01T00:00:00.000Z',
};

export default function SchoolFeeManagementSoftwarePage() {
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
            <span className="text-slate-900 font-medium">Financial Management</span>
          </div>

          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-3">
              <CreditCard className="w-3.5 h-3.5" />
              <span>School Finance Automation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              School Fee Management Software: Online Invoicing &amp; Receipts
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              How schools automate fee structure allocation, online gateway collections, instant digital receipts, and real-time ledger accounting.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span>Published by <strong>Alpha Edu Hub Team</strong></span>
              <span>•</span>
              <span>7 min read</span>
              <span>•</span>
              <span>Updated October 2026</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                1. Streamlining Complex School Fee Structures
              </h2>
              <p>
                Schools operate on intricate fee models: quarterly tuition, lab charges, transport zones, annual sports funds, and sibling discounts. Managing these combinations with physical receipt books leads to billing discrepancies and long queues at school fee counters.
              </p>
              <p>
                A modern system like <Link href="/features" className="text-blue-600 font-medium hover:underline">Alpha Edu Hub</Link> enables administrators to define custom fee categories and assign them per class, section, or student cohort in a single step.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                2. Core Advantages of Cloud Fee Automation
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span>Instant Digital Receipts</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Automated generation of PDF fee receipts with GST breakdown, school header, and tamper-proof invoice IDs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Online &amp; Counter Payments</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Support for UPI, Net Banking, cards, and counter cash payments with immediate status reconciliation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Automated Overdue Reminders</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Automated SMS and dashboard reminders before installment due dates to reduce payment delays.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                    <span>One-Click Audit Reports</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Export comprehensive collection summaries, class-wise balances, and defaulter lists to Excel or CSV.
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom Links */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/guides/how-schools-can-simplify-administration"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1d8cfd] hover:text-blue-700"
              >
                <span>Next: How Schools Can Simplify Administration</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="px-5 py-2.5 rounded-xl bg-blue-50 text-[#1d8cfd] hover:bg-blue-100 font-semibold text-xs sm:text-sm transition-colors"
              >
                Explore Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
