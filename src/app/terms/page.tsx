import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — Alpha Edu Hub School ERP',
  description:
    'Terms of Service and SaaS Licensing Agreement for institutions and schools using Alpha Edu Hub.',
  alternates: {
    canonical: 'https://alphaeduhub.in/terms',
  },
  openGraph: {
    title: 'Terms of Service — Alpha Edu Hub',
    description:
      'Terms of Service and SaaS Licensing Agreement for institutions and schools using Alpha Edu Hub.',
    url: 'https://alphaeduhub.in/terms',
    siteName: 'Alpha Edu Hub',
  },
};

export default function TermsPage() {
  const lastUpdated = 'October 2026';

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20 bg-[#f8fbff]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>Service Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Last Updated: {lastUpdated} • Alpha Edu Hub SaaS
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By creating an institution tenant account, accessing, or using the Alpha Edu Hub web platform (&ldquo;Service&rdquo;), your educational institution agrees to be bound by these Terms of Service. If you are registering on behalf of a school, trust, or organization, you represent that you have the legal authority to bind that entity.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Service Description &amp; Availability</h2>
              <p>
                Alpha Edu Hub provides web-based school enterprise resource planning (ERP) modules, including attendance management, academic grading, student information systems, fee invoice processing, and communication tools.
              </p>
              <p>
                We strive to maintain a <strong>99.9% uptime Service Level Agreement (SLA)</strong>. Scheduled maintenance windows are communicated in advance and performed outside school operating hours whenever possible.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. User Accounts &amp; Access Controls</h2>
              <p>
                Schools are responsible for assigning appropriate role-based access permissions (Administrators, Teachers, Students, Parents) and maintaining the confidentiality of administrative credentials. Multi-factor authentication (2FA) and password change policies should be maintained according to best security practices.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Subscription Billing &amp; Fees</h2>
              <p>
                SaaS plans (Lite, Prime, White Label) are billed on a monthly or annual student-tier basis according to the selected plan. Subscriptions renew automatically unless cancelled prior to the billing cycle. Pricing updates are notified to institution administrators with at least 30 days prior written notice.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Limitation of Liability</h2>
              <p>
                Alpha Edu Hub provides cloud software tools to facilitate school management. To the maximum extent permitted by applicable law, Alpha Edu Hub shall not be liable for indirect, incidental, or consequential damages resulting from unauthorized account compromise caused by user negligence.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Governing Law &amp; Inquiries</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. For questions regarding licensing, agreements, or terms, contact:
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
