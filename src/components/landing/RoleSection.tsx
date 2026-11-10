'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  CalendarCheck2,
  FileCheck,
  Lock,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import { TORN_PAPER_VARIANTS } from './torn-paper-paths';

interface TornPaperStripProps {
  variantIndex: 1 | 2 | 3;
  bgGradient: string;
  glowColor: string;
  glowPosition: 'left' | 'right';
  children: React.ReactNode;
}

function TornPaperStrip({
  variantIndex,
  bgGradient,
  glowColor,
  glowPosition,
  children,
}: TornPaperStripProps) {
  const variant = TORN_PAPER_VARIANTS[variantIndex];

  return (
    <div className={`relative w-full ${bgGradient} overflow-hidden my-5 sm:my-8`}>
      {/* Top Torn Paper Edge (White paper tearing into the colored strip with realistic drop-shadow) */}
      <div className="absolute top-0 inset-x-0 w-full overflow-hidden pointer-events-none z-20 -translate-y-[1px]">
        <svg
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          className="w-full h-8 sm:h-12 lg:h-14 block"
          style={{
            filter:
              'drop-shadow(0 10px 14px rgba(0, 0, 0, 0.08)) drop-shadow(0 3px 5px rgba(0, 0, 0, 0.04))',
          }}
        >
          <path d={variant.topPath} fill="#ffffff" />
          <path d={variant.linePath} fill="none" stroke="rgba(255, 255, 255, 0.95)" strokeWidth="1.5" />
          <path d={variant.linePath} fill="none" stroke="rgba(0, 0, 0, 0.06)" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Subtle theme ambient glow */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-[480px] h-[480px] ${glowColor} rounded-full blur-3xl pointer-events-none -z-0 ${
          glowPosition === 'left' ? '-left-20' : '-right-20'
        }`}
      />

      {/* Inner Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10">
        {children}
      </div>

      {/* Bottom Torn Paper Edge (White paper tearing into the colored strip with upward drop-shadow) */}
      <div className="absolute bottom-0 inset-x-0 w-full overflow-hidden pointer-events-none z-20 translate-y-[1px]">
        <svg
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          className="w-full h-8 sm:h-12 lg:h-14 block"
          style={{
            filter:
              'drop-shadow(0 -10px 14px rgba(0, 0, 0, 0.08)) drop-shadow(0 -3px 5px rgba(0, 0, 0, 0.04))',
          }}
        >
          <path d={variant.botPath} fill="#ffffff" />
          <path d={variant.linePath} fill="none" stroke="rgba(255, 255, 255, 0.95)" strokeWidth="1.5" />
          <path d={variant.linePath} fill="none" stroke="rgba(0, 0, 0, 0.06)" strokeWidth="0.8" />
        </svg>
      </div>
    </div>
  );
}

export default function RoleSection() {
  return (
    <section
      id="modules"
      suppressHydrationWarning
      className="relative pt-4 sm:pt-6 lg:pt-8 pb-16 sm:pb-24 bg-white overflow-hidden"
    >
      {/* ─── SECTION HEADER (Clean on White Canvas) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0B72E7] text-xs font-bold uppercase tracking-wider mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#0B72E7]" />
            <span>ROLE-BASED PLATFORM ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#0A1344] tracking-[-0.03em] leading-tight">
            Designed for
            <span className="block text-[#0B72E7] mt-1">Everyone in Your School</span>
          </h2>
        </motion.div>
      </div>

      {/* ─── 3 PAPER STRIP BLOCKS IN THEME COLOURS (GAMMA / TORN PAPER STYLE) ─── */}
      <div className="space-y-4 sm:space-y-6">
        {/* =========================================================================
            BLOCK 1: FACULTY & TEACHERS (EMERALD / MINT PAPER STRIP)
           ========================================================================= */}
        <TornPaperStrip
          variantIndex={1}
          bgGradient="bg-gradient-to-b from-[#eaf8f1] via-[#edfcf5] to-[#e6f7ef]"
          glowColor="bg-emerald-200/40"
          glowPosition="left"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* LEFT: Compact Sleek UI Card Mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 flex justify-center w-full"
            >
              <div className="w-full max-w-[460px] bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200/70 shadow-[0_16px_40px_rgba(16,185,129,0.10)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.16)] transition-all duration-300 relative overflow-hidden group">
                {/* Subtle top ambient mint wash */}
                <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none" />

                {/* Card Header */}
                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        Faculty Command Desk
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-medium">
                        Period 3 · Room 204
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Live Session
                  </span>
                </div>

                {/* Class & Attendance Widget */}
                <div className="relative z-10 mt-4 bg-[#f0fbf4] rounded-2xl p-3.5 border border-emerald-200/60 space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-extrabold text-slate-900 leading-tight">
                        Class 10-A · Mathematics
                      </div>
                      <div className="text-[10.5px] text-slate-500 mt-0.5">
                        Topic: Quadratic Equations & Roots
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-800 font-mono bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                      42/44 Present
                    </span>
                  </div>

                  {/* Attendance Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10.5px] font-semibold text-slate-500">
                      <span>Roll Call Complete</span>
                      <span className="text-emerald-700 font-bold">95.4%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-emerald-200/60 overflow-hidden">
                      <div className="w-[95.4%] h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Micro Action Stats */}
                <div className="relative z-10 mt-3 grid grid-cols-2 gap-2 text-left text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-medium">Homework Due</span>
                    <span className="font-extrabold text-slate-900 text-xs">3 Assignments</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-medium">Teacher Substitution</span>
                    <span className="font-extrabold text-emerald-600 text-xs">0 Clashes</span>
                  </div>
                </div>

                {/* Instant Action Prompt */}
                <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                    Auto WhatsApp alerts ready
                  </span>
                  <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    Auto-Sync ✓
                  </span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Description & Copy */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 flex flex-col justify-center text-left"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-2xs w-fit">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>FACULTY COMMAND DESK</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#0A1344] tracking-tight leading-tight">
                Empowering educators with effortless 10-second workflows.
              </h3>

              {/* Feature Checklist with Icons */}
              <div className="mt-5 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">1-Tap Roll Call & Daily Attendance:</span>
                    <span className="text-xs sm:text-sm text-slate-600 ml-1 font-normal">
                      Instant WhatsApp and SMS absentee alerts sent to parents automatically.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">Scholastic Gradebook & Marks Entry:</span>
                    <span className="text-xs sm:text-sm text-slate-600 ml-1 font-normal">
                      Pre-formatted CBSE, ICSE, and state rubrics with 1-click report generation.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">Conflict-Free Timetable & Substitutions:</span>
                    <span className="text-xs sm:text-sm text-slate-600 ml-1 font-normal">
                      AI reassignment prevents clashes when teachers apply for emergency leave.
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6 pt-1">
                <Link
                  href="/login?role=teacher"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.4)] transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span>Launch Teacher Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </TornPaperStrip>

        {/* =========================================================================
            BLOCK 2: ADMINISTRATORS (COBALT / SKY BLUE PAPER STRIP)
           ========================================================================= */}
        <TornPaperStrip
          variantIndex={2}
          bgGradient="bg-gradient-to-b from-[#eaf2ff] via-[#eff6ff] to-[#e6f0fe]"
          glowColor="bg-blue-200/40"
          glowPosition="right"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* LEFT: Description & Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 flex flex-col justify-center text-left order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/90 text-[#0B72E7] border border-blue-300/80 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-2xs w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B72E7]" />
                <span>EXECUTIVE GOVERNANCE</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#0A1344] tracking-tight leading-tight">
                Complete institutional control across every branch &amp; rupee.
              </h3>

              {/* Feature Checklist with Icons */}
              <div className="mt-5 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-[#0B72E7] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">Automated Fee Invoicing &amp; UPI Gateways:</span>
                    <span className="text-xs sm:text-sm text-slate-600 ml-1 font-normal">
                      Automate fee collection schedules, overdue alerts, and instant receipt generation.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-[#0B72E7] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">Multi-Branch &amp; Section Structuring:</span>
                    <span className="text-xs sm:text-sm text-slate-600 ml-1 font-normal">
                      Manage branch allocations, section capacities, student promotions, and archiving.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-[#0B72E7] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">Staff Roster &amp; Biometric Attendance:</span>
                    <span className="text-xs sm:text-sm text-slate-600 ml-1 font-normal">
                      Real-time sync with fingerprint/RFID devices with automated leave balancing.
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6 pt-1">
                <Link
                  href="/login?role=admin"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#0B72E7] hover:bg-blue-600 active:bg-blue-700 rounded-xl shadow-[0_4px_16px_rgba(11,114,231,0.3)] hover:shadow-[0_6px_22px_rgba(11,114,231,0.4)] transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span>Launch Administrator Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* RIGHT: Compact Sleek UI Card Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 flex justify-center w-full order-1 lg:order-2"
            >
              <div className="w-full max-w-[460px] bg-white rounded-3xl p-5 sm:p-6 border border-blue-200/70 shadow-[0_16px_40px_rgba(11,114,231,0.10)] hover:shadow-[0_20px_50px_rgba(11,114,231,0.16)] transition-all duration-300 relative overflow-hidden group">
                {/* Subtle top ambient blue wash */}
                <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none" />

                {/* Card Header */}
                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0B72E7] text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        Executive Suite
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-medium">
                        Central Institutional Overview
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#0B72E7] bg-blue-100/90 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Live Audit ✓
                  </span>
                </div>

                {/* Fee Collection Progress Widget */}
                <div className="relative z-10 mt-4 bg-[#f0f6ff] rounded-2xl p-3.5 border border-blue-200/60 space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-extrabold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#0B72E7]" />
                      Term Fee Collections
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-full">
                      94.2% Reconciled
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-2.5 border border-blue-100 shadow-2xs space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">Invoiced: ₹26.5L</span>
                      <span className="font-extrabold text-slate-900">₹24.8L Received</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="w-[94%] h-full bg-gradient-to-r from-[#0B72E7] to-indigo-600 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Sub Metrics Grid */}
                <div className="relative z-10 mt-3 grid grid-cols-2 gap-2 text-left text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-medium">Campus Attendance</span>
                    <span className="font-extrabold text-emerald-600 text-xs">98.4% (42/42 Sec)</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-medium">Active Staff Roster</span>
                    <span className="font-extrabold text-slate-900 text-xs">118 Verified Faculty</span>
                  </div>
                </div>

                {/* Instant Action Prompt */}
                <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#0B72E7]" />
                    Bank-grade 256-bit isolation
                  </span>
                  <span className="text-[#0B72E7] font-bold text-[10px] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                    Full Governance
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </TornPaperStrip>

        {/* =========================================================================
            BLOCK 3: STUDENTS & PARENTS (VIOLET / PURPLE PAPER STRIP)
           ========================================================================= */}
        <TornPaperStrip
          variantIndex={3}
          bgGradient="bg-gradient-to-b from-[#f4effe] via-[#f8f3ff] to-[#f1eafd]"
          glowColor="bg-purple-200/40"
          glowPosition="left"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* LEFT: Compact Sleek UI Card Mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 flex justify-center w-full"
            >
              <div className="w-full max-w-[460px] bg-white rounded-3xl p-5 sm:p-6 border border-purple-200/70 shadow-[0_16px_40px_rgba(147,51,234,0.10)] hover:shadow-[0_20px_50px_rgba(147,51,234,0.16)] transition-all duration-300 relative overflow-hidden group">
                {/* Subtle top ambient purple wash */}
                <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-purple-500/10 via-violet-500/5 to-transparent pointer-events-none" />

                {/* Card Header */}
                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-purple-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                      <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        Student &amp; Parent Portal
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-medium">
                        Student: Aarav Sharma (Class 10-A)
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100/90 border border-purple-200 px-2.5 py-0.5 rounded-full">
                    Term 1 Active
                  </span>
                </div>

                {/* Scorecard Performance Widget */}
                <div className="relative z-10 mt-4 bg-[#f8f5fe] rounded-2xl p-3.5 border border-purple-200/60 space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      Academic Performance
                    </span>
                    <span className="text-[10px] font-extrabold text-purple-700 bg-white border border-purple-200 px-2 py-0.5 rounded-full shadow-2xs">
                      Grade A1 · Rank #3
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-2.5 border border-purple-100 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Term Aggregate</span>
                      <span className="text-lg font-black text-slate-900 leading-tight font-mono">94.8%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Term Fee Status</span>
                      <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Receipt Issued</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub Metrics Grid */}
                <div className="relative z-10 mt-3 grid grid-cols-2 gap-2 text-left text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-medium">Next Board Exam</span>
                    <span className="font-extrabold text-slate-900 text-xs">Science (16 Nov)</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-medium">Attendance Rate</span>
                    <span className="font-extrabold text-emerald-600 text-xs">96.5% Overall</span>
                  </div>
                </div>

                {/* Instant Action Prompt */}
                <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                    Digital marksheet verified
                  </span>
                  <span className="text-purple-700 font-bold text-[10px] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                    CBSE Format
                  </span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Description & Copy */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 flex flex-col justify-center text-left"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/90 text-purple-800 border border-purple-300/80 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-2xs w-fit">
                <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                <span>STUDENT &amp; PARENT HUB</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#0A1344] tracking-tight leading-tight">
                Transparent academic clarity and peace of mind for families.
              </h3>

              {/* Feature Checklist with Icons */}
              <div className="mt-5 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">Live Attendance Records &amp; Leave Desk:</span>
                    <span className="text-xs sm:text-sm text-slate-600 ml-1 font-normal">
                      Submit student medical leave notes digitally and monitor attendance trends.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">Digital Report Cards &amp; Grade Insights:</span>
                    <span className="text-xs sm:text-sm text-slate-600 ml-1 font-normal">
                      Download printable PDF report cards with class rankings and teacher feedback.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">Instant Online Fee Payments &amp; Slips:</span>
                    <span className="text-xs sm:text-sm text-slate-600 ml-1 font-normal">
                      Pay via UPI, credit/debit card, or net banking and save receipts instantly.
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6 pt-1">
                <Link
                  href="/login?role=student"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-[0_4px_16px_rgba(147,51,234,0.3)] hover:shadow-[0_6px_22px_rgba(147,51,234,0.4)] transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span>Launch Student &amp; Parent Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </TornPaperStrip>
      </div>
    </section>
  );
}