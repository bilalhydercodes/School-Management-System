import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ShieldCheck, Lock, FileText, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Alpha Edu Hub School ERP',
  description:
    'Alpha Edu Hub Privacy Policy: Learn how student records, institutional data, attendance logs, and school databases are protected and isolated.',
  alternates: {
    canonical: 'https://alphaeduhub.in/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy — Alpha Edu Hub',
    description:
      'Learn how student records, institutional data, attendance logs, and school databases are protected and isolated under Alpha Edu Hub.',
    url: 'https://alphaeduhub.in/privacy-policy',
    siteName: 'Alpha Edu Hub',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 2026';

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20 bg-[#f8fbff]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security &amp; Data Governance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Last Updated: {lastUpdated} • Alpha Edu Hub Operating System
            </p>
          </div>

          {/* Policy Content */}
          <div className="prose prose-slate max-w-none space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#1d8cfd]" />
                <span>1. Multi-Tenant Architecture &amp; Data Ownership</span>
              </h2>
              <p>
                Alpha Edu Hub operates as a multi-tenant cloud software platform. Each subscribing school or educational institution (&ldquo;Tenant&rdquo;) retains 100% legal ownership of its student records, faculty information, examination results, fee ledgers, and attendance archives.
              </p>
              <p>
                We do not sell, rent, monetize, or disclose student or institutional data to third-party advertisers or data brokers under any circumstances.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span>2. Information We Collect</span>
              </h2>
              <p>To provide school management services, we process information on behalf of the institution:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li><strong>Student &amp; Parent Data:</strong> Names, roll numbers, admission numbers, contact information, class sections, and emergency contacts.</li>
                <li><strong>Academic &amp; Attendance Records:</strong> Daily attendance timestamps, subject marks, exam terms, and report card summaries.</li>
                <li><strong>Administrative Data:</strong> Teacher profiles, staff schedules, fee categories, and invoice payment receipts.</li>
                <li><strong>System Logs:</strong> IP addresses, browser user-agents, and audit logs for fraud prevention and security verification.</li>
              </ul>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>3. Data Protection &amp; Encryption Standards</span>
              </h2>
              <p>
                All data transmission between client browsers and Alpha Edu Hub servers is secured using <strong>TLS 1.3 / 256-bit SSL encryption</strong>. Passwords are cryptographically hashed using industry-standard bcrypt hashing algorithms. Multi-tenant database queries enforce strict tenant identification constraints to prevent cross-tenant data exposure.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>4. Data Retention &amp; Deletion</span>
              </h2>
              <p>
                Institutions may request full exports of student records, grades, and fee reports at any time in standard CSV or Excel formats. Upon subscription termination or upon verified request by the school administration, tenant databases and student archives are permanently purged in accordance with data protection regulations.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Contact Our Privacy Officer</h2>
              <p>
                If you have questions regarding this Privacy Policy or your institution&apos;s data compliance, please reach out to:
              </p>
              <p className="text-slate-900 font-semibold">
                Email: <a href="mailto:support@alphaeduhub.in" className="text-[#1d8cfd] hover:underline">support@alphaeduhub.in</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
