'use client';

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  FileText,
  FileEdit,
  CalendarDays,
  CreditCard,
  Palmtree,
  Bus,
  Mail,
  BarChart3,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface FeatureItem {
  id: string;
  name: string;
  category: 'Administration' | 'Academics' | 'Finance & Ops';
  tag: string;
  description: string;
  capabilities: string[];
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

const features: FeatureItem[] = [
  {
    id: 'student-mgmt',
    name: 'Student Information System',
    category: 'Administration',
    tag: 'Core SIS',
    description: 'Centralized directory for admissions lifecycle, KYC document vaults, and parent guardian linkages.',
    capabilities: ['Admission Pipeline', 'Document Vault', 'Parent Linkage'],
    icon: Users,
    iconColor: 'text-[#0B72E7]',
    bgColor: 'bg-blue-50 text-[#0B72E7]',
    borderColor: 'hover:border-blue-300',
  },
  {
    id: 'teacher-mgmt',
    name: 'Faculty & Staff Roster',
    category: 'Administration',
    tag: 'HR & Payroll',
    description: 'Teacher profiles, subject specializations, biometric staff attendance, and salary slips.',
    capabilities: ['Biometric Sync', 'Workload Matrix', 'Digital Pay Slips'],
    icon: GraduationCap,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50 text-purple-600',
    borderColor: 'hover:border-purple-300',
  },
  {
    id: 'attendance-tracking',
    name: 'Real-Time Attendance Engine',
    category: 'Academics',
    tag: 'Instant Alerts',
    description: 'Daily roll call & period-wise logging with automated instant WhatsApp and SMS alerts to parents.',
    capabilities: ['1-Tap WhatsApp Alerts', 'Absentee Tracking', 'Monthly Register'],
    icon: CalendarCheck2,
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-50 text-rose-600',
    borderColor: 'hover:border-rose-300',
  },
  {
    id: 'fees-payments',
    name: 'Fee Collection & Invoicing',
    category: 'Finance & Ops',
    tag: 'UPI & Gateway',
    description: 'Custom installment structures, automated fee receipt generation, overdue tracking, and UPI QR payments.',
    capabilities: ['Instant Receipts', 'Overdue Dues Ledger', 'Razorpay & UPI'],
    icon: CreditCard,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50 text-emerald-600',
    borderColor: 'hover:border-emerald-300',
  },
  {
    id: 'classes-sections',
    name: 'Classes, Streams & Sections',
    category: 'Academics',
    tag: 'K-12 Structure',
    description: 'Standardized section capacity limits, elective streams, and bulk student promotions across sessions.',
    capabilities: ['Batch Promotions', 'Stream Allocations', 'Capacity Caps'],
    icon: BookOpen,
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50 text-teal-600',
    borderColor: 'hover:border-teal-300',
  },
  {
    id: 'timetable-mgmt',
    name: 'Timetable & Substitutions',
    category: 'Academics',
    tag: 'Conflict-Free',
    description: 'Smart period scheduler preventing faculty clashes with instant 1-click teacher substitution dispatch.',
    capabilities: ['Zero Clashes', 'Auto Substitution', 'Faculty Timetables'],
    icon: CalendarDays,
    iconColor: 'text-sky-600',
    bgColor: 'bg-sky-50 text-sky-600',
    borderColor: 'hover:border-sky-300',
  },
  {
    id: 'exams-results',
    name: 'Exams & Automated Report Cards',
    category: 'Academics',
    tag: 'CBSE & ICSE',
    description: 'Standardized marks entry, scholastic/co-scholastic grading scales, and print-ready marksheet generation.',
    capabilities: ['CCE Compliance', 'Rank Generation', 'Printable PDF Cards'],
    icon: FileText,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50 text-amber-600',
    borderColor: 'hover:border-amber-300',
  },
  {
    id: 'assignments',
    name: 'Digital Homework & Notes',
    category: 'Academics',
    tag: 'Submissions',
    description: 'Syllabus tracker, digital PDF homework delivery, deadline notices, and teacher review remarks.',
    capabilities: ['Study Material Vault', 'Submission Tracker', 'Teacher Remarks'],
    icon: FileEdit,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50 text-indigo-600',
    borderColor: 'hover:border-indigo-300',
  },
  {
    id: 'communication',
    name: 'Circulars & Parent Alerts',
    category: 'Administration',
    tag: 'Multi-Channel',
    description: 'Targeted broadcast circulars, emergency holiday notices, and direct parent-teacher communications.',
    capabilities: ['Section Broadcasts', 'Read Receipts', 'Push Notifications'],
    icon: Mail,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50 text-blue-600',
    borderColor: 'hover:border-blue-300',
  },
  {
    id: 'transport-mgmt',
    name: 'Transport & Route Tracking',
    category: 'Finance & Ops',
    tag: 'Fleet Safety',
    description: 'School bus route mapping, stop-wise student pick/drop rosters, and verified driver documentation.',
    capabilities: ['Route Stop Rosters', 'Driver Directory', 'Parent Bus Alerts'],
    icon: Bus,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50 text-amber-600',
    borderColor: 'hover:border-amber-300',
  },
  {
    id: 'leave-mgmt',
    name: 'Staff & Student Leave Desk',
    category: 'Administration',
    tag: 'Approvals',
    description: 'Paperless leave applications with administrative approval workflows, casual quotas, and medical logs.',
    capabilities: ['1-Click Approvals', 'Quota Accounting', 'Absence History'],
    icon: Palmtree,
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-50 text-rose-600',
    borderColor: 'hover:border-rose-300',
  },
  {
    id: 'reports-analytics',
    name: 'Executive Analytics & Audits',
    category: 'Finance & Ops',
    tag: 'Excel & PDF',
    description: 'Daily collection summaries, student strength heatmaps, board compliance reports, and audit logs.',
    capabilities: ['Revenue Heatmaps', 'Compliance Exports', 'Immutable Audit Log'],
    icon: BarChart3,
    iconColor: 'text-[#0B72E7]',
    bgColor: 'bg-cyan-50 text-cyan-600',
    borderColor: 'hover:border-cyan-300',
  },
];

type CategoryFilter = 'All' | 'Administration' | 'Academics' | 'Finance & Ops';

export default function FeaturesGrid() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  const filteredFeatures =
    activeCategory === 'All'
      ? features
      : features.filter((f) => f.category === activeCategory);

  const categories: { label: CategoryFilter; count: number }[] = [
    { label: 'All', count: features.length },
    { label: 'Administration', count: features.filter((f) => f.category === 'Administration').length },
    { label: 'Academics', count: features.filter((f) => f.category === 'Academics').length },
    { label: 'Finance & Ops', count: features.filter((f) => f.category === 'Finance & Ops').length },
  ];

  return (
    <section id="features" suppressHydrationWarning className="relative pt-16 sm:pt-20 lg:pt-24 pb-40 sm:pb-48 lg:pb-56 bg-[#70aaff] overflow-hidden">
      {/* ─── SKY BLUE AMBIENT ACCENTS ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-white/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-cyan-300/25 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ─── ASYMMETRICAL WALL CLOUDS (CRYO-BYTE & GAMMA STYLE) ─── */}
      {/* Left Wall Cloud 1 (High, partially off-screen) */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-28 sm:-left-36 top-[10%] w-80 sm:w-[440px] pointer-events-none z-0 opacity-75 -rotate-2 select-none"
      >
        <Image
          src="/images/cloud.png"
          alt=""
          width={500}
          height={250}
          className="w-full h-auto object-contain"
          priority
        />
      </motion.div>

      {/* Left Wall Cloud 2 (Low, bridging into bottom fade) */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-20 sm:-left-28 bottom-[3%] w-88 sm:w-[520px] pointer-events-none z-20 opacity-95 select-none"
      >
        <Image
          src="/images/cloud.png"
          alt=""
          width={500}
          height={250}
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Right Wall Cloud (Mid-level, between card rows) */}
      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-32 sm:-right-44 top-[36%] w-76 sm:w-[420px] pointer-events-none z-0 opacity-65 scale-x-[-1] -rotate-3 select-none"
      >
        <Image
          src="/images/cloud.png"
          alt=""
          width={500}
          height={250}
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Right Wall Cloud (Lower-right billow) */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-20 sm:-right-32 bottom-[12%] w-96 sm:w-[560px] pointer-events-none z-20 opacity-95 scale-x-[-1] rotate-1 select-none"
      >
        <Image
          src="/images/cloud.png"
          alt=""
          width={600}
          height={300}
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* ─── CLOUDS IN BLUE BACKGROUND BEHIND CARD GRIDS ─── */}
      {/* Cloud Behind Header & Pills */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[6%] left-1/2 -translate-x-1/2 w-[550px] sm:w-[720px] pointer-events-none z-0 opacity-30 blur-[0.5px] select-none"
      >
        <Image
          src="/images/cloud.png"
          alt=""
          width={600}
          height={300}
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Cloud Behind Row 1 (Center-Left) */}
      <motion.div
        animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[24%] left-[4%] sm:left-[10%] w-80 sm:w-[460px] pointer-events-none z-0 opacity-40 -rotate-3 select-none"
      >
        <Image
          src="/images/cloud.png"
          alt=""
          width={500}
          height={250}
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Cloud Behind Rows 1 & 2 (Center-Right) */}
      <motion.div
        animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[36%] right-[6%] sm:right-[12%] w-96 sm:w-[540px] pointer-events-none z-0 opacity-45 scale-x-[-1] rotate-2 select-none"
      >
        <Image
          src="/images/cloud.png"
          alt=""
          width={550}
          height={275}
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Cloud Behind Rows 2 & 3 (Center-Left) */}
      <motion.div
        animate={{ y: [0, -9, 0], x: [0, 4, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[56%] left-[8%] sm:left-[15%] w-72 sm:w-[420px] pointer-events-none z-0 opacity-35 rotate-1 select-none"
      >
        <Image
          src="/images/cloud.png"
          alt=""
          width={450}
          height={225}
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Cloud Behind Row 3 & Bottom Banner (Center-Right) */}
      <motion.div
        animate={{ y: [0, 9, 0], x: [0, -5, 0] }}
        transition={{ duration: 12.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[74%] right-[10%] sm:right-[18%] w-96 sm:w-[520px] pointer-events-none z-0 opacity-40 scale-x-[-1] -rotate-2 select-none"
      >
        <Image
          src="/images/cloud.png"
          alt=""
          width={550}
          height={275}
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* ─── BOTTOM FADED EFFECT (FOCUSED DISSOLVE AT BOTTOM BOUNDARY) ─── */}
      <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-white via-white/80 via-35% to-transparent pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Index & Pill like sample reference */}
          <div className="flex flex-col items-center gap-1.5 mb-3">
            <span className="text-white/80 font-mono text-xs sm:text-sm tracking-widest font-bold">
              02 .
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold uppercase tracking-wider shadow-2xs">
              <Zap className="w-3 h-3 text-white" />
              <span>Comprehensive School ERP Suite</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-[-0.03em] leading-tight drop-shadow-xs">
            Everything You Need
            <span className="block text-white/95 mt-1">in One Unified Platform</span>
          </h2>

          {/* Interactive Category Filter Pills with counts */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-xs max-w-fit mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.label
                    ? 'bg-white text-[#0B72E7] shadow-sm'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    activeCategory === cat.label
                      ? 'bg-blue-50 text-[#0B72E7]'
                      : 'bg-white/25 text-white'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── SLEEK FEATURE CARDS GRID WITH SCROLL REVEAL ─── */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5">
          {filteredFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: (idx % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative bg-white rounded-2xl p-5 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.14)] transition-all duration-200 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Icon + Category Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl ${feature.bgColor} flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0 shadow-2xs`}
                    >
                      <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
                    </div>

                    <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100/90 text-slate-600 border border-slate-200/60">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] font-bold text-[#0A1344] leading-snug group-hover:text-[#0B72E7] transition-colors">
                    {feature.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal min-h-[34px]">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Section: Micro-Capabilities Pills */}
                <div className="mt-4 pt-3 border-t border-slate-100/90">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {feature.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/60 rounded-md px-1.5 py-0.5"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        <span>{cap}</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-[#0B72E7] opacity-80 group-hover:opacity-100 transition-opacity pt-1">
                    <span>Explore Module</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-10 sm:mt-12 p-5 sm:p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-white/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B72E7] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#0A1344]">
                Need a custom module or state board integration?
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Full compliance with CBSE, ICSE, and state boards with bespoke white-label deployments.
              </div>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B72E7] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <span>Request Custom Board Setup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}