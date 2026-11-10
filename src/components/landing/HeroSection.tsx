'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Play,
  Star,
  ChevronDown,
  X,
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  Layers,
  Zap,
  Expand,
} from 'lucide-react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import HeroDashboardCard from './HeroDashboardCard';
import GetStartedButton from './GetStartedButton';

export default function HeroSection() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Parallax & Scroll Fade Hooks
  const { scrollY } = useScroll();
  const orb1Y = useTransform(scrollY, [0, 600], [0, -60]);
  const orb2Y = useTransform(scrollY, [0, 600], [0, -90]);
  const tabletParallaxY = useTransform(scrollY, [0, 600], [0, 35]);
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 60], [1, 0]);
  const scrollIndicatorY = useTransform(scrollY, [0, 60], [0, 15]);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Staggered Text Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section
      suppressHydrationWarning
      className="relative overflow-hidden bg-gradient-to-b from-[#e8f4fe] via-[#f3f9ff] to-white min-h-screen pt-14 flex flex-col justify-between"
    >
      {/* ─── PARALLAX BACKGROUND COLOR SHAPES ─── */}
      <motion.div
        style={{ y: orb1Y }}
        className="absolute -top-24 -left-20 w-[520px] h-[520px] bg-gradient-to-br from-cyan-300/35 via-blue-200/25 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
      />
      <motion.div
        style={{ y: orb2Y }}
        className="absolute top-1/6 right-0 w-[580px] h-[480px] bg-gradient-to-bl from-blue-400/25 via-sky-300/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
      />
      <div className="absolute -bottom-16 right-1/4 w-[420px] h-[320px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex flex-col justify-between py-3 sm:py-5 lg:py-6">
        {/* Main 2-column Grid Centered Vertically */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto w-full pt-1 pb-3">
          {/* ─── LEFT COLUMN: STAGGERED TEXT REVEAL & CALLS TO ACTION ─── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center text-left"
          >
            {/* Top Pill Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-[#0B72E7] text-xs sm:text-[13px] font-bold shadow-2xs w-fit mb-3 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0B72E7] shrink-0" />
                <span>All-in-One School ERP</span>
              </div>
            </motion.div>

            {/* Main Headline with Wavy Underline Accent */}
            <motion.h1
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[42px] font-black text-[#0A1344] tracking-[-0.03em] leading-[1.16]"
            >
              <span>All-in-One School Management</span>
              <br />
              <span className="relative inline-block text-[#0B72E7] mt-1">
                for a Brighter Tomorrow
                {/* Wavy Underline Flourish */}
                <svg
                  className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-2.5 sm:h-3.5 text-[#0B72E7]/80 overflow-visible"
                  viewBox="0 0 280 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 10C45 4 95 12 140 7C185 2 235 11 277 5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-3 sm:mt-3.5 text-xs sm:text-sm lg:text-[15px] text-slate-600 leading-relaxed max-w-lg font-normal"
            >
              Simplify administration, enhance communication, and create a better learning
              experience for students, teachers and parents.
            </motion.p>

            {/* Action Buttons: Get Started + Watch Demo */}
            <motion.div variants={itemVariants} className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3">
              <GetStartedButton className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0B72E7] to-[#1D8CFD] hover:from-[#0961C4] hover:to-[#0B72E7] active:from-[#0852A5] active:to-[#0961C4] rounded-xl shadow-[0_4px_16px_rgba(11,114,231,0.3)] hover:shadow-[0_6px_20px_rgba(11,114,231,0.4)] transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer group">
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </GetStartedButton>

              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-800 bg-white/90 hover:bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer group"
              >
                <span className="w-4 h-4 rounded-full bg-blue-50 text-[#0B72E7] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-2 h-2 fill-current ml-0.5" />
                </span>
                <span>Watch Demo</span>
                <span className="text-[11px] text-slate-400 font-medium">(2 min)</span>
              </button>
            </motion.div>

            {/* Social Proof Stars */}
            <motion.div variants={itemVariants} className="mt-4 sm:mt-4.5 flex items-center gap-2.5 text-left">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-[11.5px] sm:text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-900">4.9/5</span> from{' '}
                <span className="text-slate-800 font-semibold">10,000+ schools</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ─── RIGHT COLUMN: 3D GLASSMORPHIC TABLET WITH SUBTLE PARALLAX ─── */}
          <motion.div
            style={{ y: tabletParallaxY }}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="lg:col-span-6 xl:col-span-6 flex justify-center items-center relative mt-4 lg:mt-0"
          >
            <HeroDashboardCard />
          </motion.div>
        </div>

        {/* ─── BOTTOM BLOCK: GOAL TABS + SCROLL INDICATOR ─── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full shrink-0 pt-2 pb-1"
        >
          {/* VALUE PILLARS BAR */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100/90 gap-y-2 sm:gap-y-0">
                {/* Tab 1: Easy to Use */}
                <div className="flex items-center gap-2.5 px-3 py-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                    <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[12.5px] font-bold text-slate-900 leading-tight">
                      Easy to Use
                    </div>
                    <div className="text-[10.5px] text-slate-500 leading-tight mt-0.5 truncate">
                      Simple & intuitive for everyone
                    </div>
                  </div>
                </div>

                {/* Tab 2: Secure & Reliable */}
                <div className="flex items-center gap-2.5 px-3 py-1">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 shrink-0 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[12.5px] font-bold text-slate-900 leading-tight">
                      Secure & Reliable
                    </div>
                    <div className="text-[10.5px] text-slate-500 leading-tight mt-0.5 truncate">
                      Your data is always safe
                    </div>
                  </div>
                </div>

                {/* Tab 3: Trusted by Schools */}
                <div className="flex items-center gap-2.5 px-3 py-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-500 shrink-0 shadow-2xs">
                    <Zap className="w-3.5 h-3.5 stroke-[2.2] fill-amber-400/20" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[12.5px] font-bold text-slate-900 leading-tight">
                      Trusted by Schools
                    </div>
                    <div className="text-[10.5px] text-slate-500 leading-tight mt-0.5 truncate">
                      10,000+ schools and growing
                    </div>
                  </div>
                </div>

                {/* Tab 4: Modern & Scalable */}
                <div className="flex items-center gap-2.5 px-3 py-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100/80 flex items-center justify-center text-[#0B72E7] shrink-0 shadow-2xs">
                    <Expand className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[12.5px] font-bold text-slate-900 leading-tight">
                      Modern & Scalable
                    </div>
                    <div className="text-[10.5px] text-slate-500 leading-tight mt-0.5 truncate">
                      Built for schools of every size
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── BOTTOM SCROLL INDICATOR SVG (FADES AWAY ON SCROLL) ─── */}
          <motion.div
            style={{
              opacity: scrollIndicatorOpacity,
              y: scrollIndicatorY,
            }}
            className={`mt-3 sm:mt-3.5 flex justify-center pb-1 transition-all ${
              hasScrolled ? 'pointer-events-none' : ''
            }`}
          >
            <button
              type="button"
              onClick={handleScrollToFeatures}
              className="group flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#0B72E7] transition-colors cursor-pointer"
              aria-label="Scroll to explore features"
            >
              {/* Mouse outline with animated sliding dot */}
              <div className="w-5 h-8 rounded-full border-2 border-slate-300/90 group-hover:border-[#0B72E7] p-0.5 flex justify-center transition-colors shadow-2xs">
                <div className="w-1 h-2 rounded-full bg-slate-400 group-hover:bg-[#0B72E7] animate-scroll-wheel transition-colors" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 text-slate-400 group-hover:text-[#0B72E7] transition-colors">
                <span>Scroll to explore</span>
                <ChevronDown className="w-3 h-3 animate-bounce" />
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── INTERACTIVE DEMO MODAL ─── */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close demo modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B72E7] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Interactive Demo</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Experience Alpha Edu Hub
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Choose a portal role below to explore live workflows without registration:
              </p>
            </div>

            {/* Role Demo Selectors */}
            <div className="mt-6 space-y-3">
              <Link
                href="/login?demo=admin"
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B72E7] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-900 group-hover:text-[#0B72E7]">
                      Principal / School Administrator
                    </div>
                    <div className="text-xs text-slate-500">
                      Full control: Fee collections, staff rosters, attendance logs, and reports.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B72E7] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/login?demo=teacher"
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                      Faculty / Class Teacher
                    </div>
                    <div className="text-xs text-slate-500">
                      Take roll call attendance, assign homework, schedule periods & mark grades.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/login?demo=student"
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-900 group-hover:text-purple-700">
                      Parent / Student Portal
                    </div>
                    <div className="text-xs text-slate-500">
                      View attendance reports, fee dues receipt slips, and exam timetables.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            {/* Modal Footer Note */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                No credit card or setup required
              </span>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="font-bold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}