import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  ShieldCheck,
  Zap,
  Users,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  ExternalLink,
  Linkedin,
  Building2,
  UserCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Alpha Edu Hub — School ERP Platform & Founder Mahammad Bilal Hyder',
  description:
    'Learn about Alpha Edu Hub, founded by Mahammad Bilal Hyder to empower schools across India with unified multi-tenant school ERP, student attendance, fee management, and academic automation.',
  alternates: {
    canonical: 'https://alphaeduhub.in/about',
  },
  openGraph: {
    title: 'About Alpha Edu Hub — School ERP Platform & Founder',
    description:
      'Learn about Alpha Edu Hub, founded by Mahammad Bilal Hyder to empower schools with unified multi-tenant school ERP, student attendance, fee management, and academic automation.',
    url: 'https://alphaeduhub.in/about',
    siteName: 'Alpha Edu Hub',
    images: ['/images/dashboard/open_graph_image.png'],
  },
};

export default function AboutPage() {
  const values = [
    {
      title: 'Simplicity & Intuitive Design',
      description: 'Educational technology should be accessible to every teacher, clerk, and parent without requiring complex technical training.',
      icon: Sparkles,
      iconColor: 'text-[#1d8cfd]',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Multi-Tenant Data Privacy',
      description: 'Strict logical database isolation and encryption ensure that every school’s student data and financial ledger remain secure.',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Modern Indian Curriculum Alignment',
      description: 'Engineered specifically for CBSE, ICSE, and State Board grading paradigms, period timetables, and academic term workflows.',
      icon: GraduationCap,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Reliable Real-Time Performance',
      description: '99.9% uptime architecture, automated backups, and instant notifications keep the entire school community in sync.',
      icon: Zap,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
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
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Our Vision &amp; Mission</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Empowering Schools for a{' '}
              <span className="text-[#1d8cfd]">Brighter Tomorrow</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Alpha Edu Hub is an enterprise-grade school management and ERP system built to streamline administration, reduce paperwork, and connect educators, students, and parents on one unified web platform.
            </p>
          </div>

          {/* Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto mb-20">
            <div className="lg:col-span-6 space-y-4 text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Why We Built Alpha Edu Hub
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Traditional school management software is often clunky, fragmented, and difficult to use on modern devices. School administrators spend countless hours consolidating spreadsheets, teachers struggle with duplicate attendance records, and parents lack real-time visibility into their children&apos;s academic progress.
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Alpha Edu Hub was architected from the ground up to solve these pain points. By combining admissions, daily attendance, fee invoice reconciliation, automated substitutions, and exam report cards into a single cohesive platform, we allow institutions to focus on what matters most: educating students.
              </p>
            </div>

            <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#1d8cfd] flex items-center justify-center font-black text-lg shrink-0">
                  01
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Unified Operating System</h3>
                  <p className="text-xs text-slate-500 mt-0.5">One platform for administrators, teachers, students, and parents.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg shrink-0">
                  02
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Paperless Automation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Online fee receipts, digital report cards, and automated attendance registers.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg shrink-0">
                  03
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enterprise Security</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Role-based access control, tenant isolation, and encrypted audit trails.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Founder & Company Section */}
          <div className="max-w-6xl mx-auto mb-20 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1d8cfd] text-xs font-bold uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Leadership &amp; Origins</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Founded by Mahammad Bilal Hyder
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Alpha Edu Hub was founded by <strong>Mahammad Bilal Hyder</strong> with the core objective of modernizing K-12 education infrastructure across India. Recognizing the inefficiencies of manual record-keeping and legacy ERP desktop utilities, he designed Alpha Edu Hub as a high-performance, web-first platform tailored for school administrators, educators, students, and parents.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Today, Alpha Edu Hub continues to evolve with continuous software updates, multi-tenant cloud architecture, automated fee management, and dedicated support for CBSE, ICSE, and State Board curriculums.
                </p>
                
                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  <a
                    href="https://www.linkedin.com/in/mahammad-bilal-hyder-493295356/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>Mahammad Bilal Hyder on LinkedIn</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/143961171/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-[#1d8cfd] border border-blue-100 hover:bg-blue-100 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Alpha Edu Hub LinkedIn Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/80 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  AEH
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alpha Edu Hub</h3>
                  <p className="text-xs text-slate-500">Official Educational SaaS Company</p>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Website:</span>
                    <span className="font-semibold text-slate-900">alphaeduhub.in</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Founder:</span>
                    <span className="font-semibold text-slate-900">Mahammad Bilal Hyder</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-semibold text-slate-900">+91 82773 00451 / +91 98454 88621</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Support:</span>
                    <a href="mailto:support@alphaeduhub.in" className="font-semibold text-blue-600 hover:underline">
                      support@alphaeduhub.in
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Our Core Principles</h2>
              <p className="text-sm text-slate-500 mt-2">The engineering and design standards behind every module.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs text-left">
                    <div className={`w-10 h-10 rounded-xl ${v.bgColor} ${v.iconColor} flex items-center justify-center mb-4`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{v.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">{v.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Strip */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#1d8cfd] to-[#0284c7] rounded-3xl p-8 sm:p-10 text-white text-center shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-black">Ready to modernize your institution?</h2>
            <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-lg mx-auto">
              Join leading schools across India with seamless cloud management and automated workflows.
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
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
