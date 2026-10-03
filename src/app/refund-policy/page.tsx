import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { CreditCard, RotateCcw, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Alpha Edu Hub',
  description:
    'Refund and Cancellation Policy for Alpha Edu Hub subscription plans and billing cycles.',
  alternates: {
    canonical: 'https://alphaeduhub.in/refund-policy',
  },
  openGraph: {
    title: 'Refund Policy — Alpha Edu Hub',
    description:
      'Refund and Cancellation Policy for Alpha Edu Hub subscription plans and billing cycles.',
    url: 'https://alphaeduhub.in/refund-policy',
    siteName: 'Alpha Edu Hub',
  },
};

export default function RefundPolicyPage() {
  const lastUpdated = 'October 2026';

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20 bg-[#f8fbff]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-3">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Billing &amp; Cancellations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Last Updated: {lastUpdated} • Alpha Edu Hub SaaS Billing
            </p>
          </div>

          {/* Policy Content */}
          <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#1d8cfd]" />
                <span>1. Subscription Cancellation</span>
              </h2>
              <p>
                Schools may cancel their Alpha Edu Hub SaaS plan (Lite or Prime) at any time through the SuperAdmin / Institution Billing settings or by submitting a written notice to <strong>support@alphaeduhub.in</strong>.
              </p>
              <p>
                Upon cancellation, your school will maintain full access to your ERP tenant until the end of the current paid billing cycle, after which the account will not be charged again.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                <span>2. 14-Day Onboarding Guarantee &amp; Refunds</span>
              </h2>
              <p>
                We stand behind our platform. New school onboardings are eligible for a <strong>14-day money-back guarantee</strong> if the software does not meet your operational requirements or if technical onboarding cannot be achieved.
              </p>
              <p>
                To request a refund under the 14-day onboarding guarantee, the authorized school administrator must submit a formal refund request to <strong>support@alphaeduhub.in</strong> within 14 calendar days of plan activation. Approved refunds are processed to the original payment method within 5–7 business days.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <span>3. Data Export Prior to Termination</span>
              </h2>
              <p>
                We ensure that your school is never locked into our platform. Prior to subscription termination, administrators can generate full automated exports of all student rosters, attendance logs, and fee ledger records.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Billing Support Inquiries</h2>
              <p>
                For invoice inquiries, GST tax receipts, or subscription updates, please contact our billing team:
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
