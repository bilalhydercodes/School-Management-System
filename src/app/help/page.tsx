import React from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  GraduationCap,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Sparkles,
  Building2,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'Help & Support Center — Alpha Edu Hub',
  description:
    'Central knowledge base, role-specific helpdesks, and customer support for students, parents, teachers, and school administrators.',
  alternates: {
    canonical: 'https://alphaeduhub.in/help',
  },
};

const GENERAL_FAQS = [
  {
    q: 'How do students and parents access their dashboard?',
    a: 'Visit the Login page (or demo login) and sign in using your registered mobile number or student email. If you forgot your password, click "Forgot Password" to receive a 6-digit OTP code directly to your verified email or mobile phone.',
  },
  {
    q: 'How does a school sign up for Alpha Edu Hub?',
    a: 'School directors and principals can request an institution pilot by visiting our Contact page or emailing support@alphaeduhub.in. Our team provisions a dedicated tenant, migrates existing student/teacher data, and trains staff within 48 hours.',
  },
  {
    q: 'What educational boards does Alpha Edu Hub support?',
    a: 'Alpha Edu Hub has native assessment templates and report card generators compliant with CBSE (Continuous and Comprehensive Evaluation), ICSE/ISC, and various State Education Boards.',
  },
  {
    q: 'How can parents pay school fees online securely?',
    a: 'Parents can log in to the Student & Parent Portal, go to "Fee Summary & Invoices", and click "Pay Now". We integrate with Razorpay, allowing payments via UPI (Google Pay, PhonePe, Paytm), Net Banking, and Debit/Credit cards with instant digital receipt generation.',
  },
  {
    q: 'Is our school data private and secure?',
    a: 'Yes. Alpha Edu Hub uses row-level tenant isolation, OWASP ASVS compliant password hashing, TLS 1.3 encryption in transit, AES-256 encryption at rest, and automated nightly cloud backups.',
  },
];

export default function UniversalHelpPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Top Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Alpha Edu Hub Helpdesk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Welcome to the Alpha Edu Hub Central Knowledge Base. Choose your role below to access tailored tutorials, user guides, or directly reach our support engineers.
          </p>
        </div>

        {/* Role-Specific Portal Desks (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Students & Parents */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_25px_rgba(30,100,200,0.06)] p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg hover:border-blue-200 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Students & Parents
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Fee invoices & UPI receipts, term report cards, daily attendance tracker, holiday lists, and class mentor appointments.
                </p>
              </div>
            </div>

            <Link
              href="/portal?view=help-support"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-all"
            >
              <span>Open Student Helpdesk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Teaching Faculty */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_25px_rgba(30,100,200,0.06)] p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg hover:border-blue-200 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Teaching Faculty
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Daily roll-call attendance, periodic exam marks entry, monthly salary slip downloads, casual leave requests, and student remarks.
                </p>
              </div>
            </div>

            <Link
              href="/teacher/help"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-all"
            >
              <span>Open Faculty Helpdesk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: School Administrators */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_25px_rgba(30,100,200,0.06)] p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg hover:border-blue-200 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  School Administrators
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Student directory roster imports, fee structure & Razorpay gateway configuration, CBSE board compliance, and accountant roles.
                </p>
              </div>
            </div>

            <Link
              href="/admin/help"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-all"
            >
              <span>Open Admin Helpdesk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* General FAQs */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-9 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">General Questions & Answers</h2>
          </div>

          <div className="space-y-4">
            {GENERAL_FAQS.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/10">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-lg font-bold">Need direct technical assistance?</h3>
            <p className="text-xs text-blue-100">Our customer happiness and engineering team is available 6 days a week.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:support@alphaeduhub.in"
              className="px-5 py-2.5 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Mail className="w-4 h-4" />
              <span>support@alphaeduhub.in</span>
            </a>
            <a
              href="tel:+911123456780"
              className="px-5 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white text-xs font-bold transition-colors flex items-center gap-2 border border-blue-400/30"
            >
              <Phone className="w-4 h-4" />
              <span>+91 11 2345 6780</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
