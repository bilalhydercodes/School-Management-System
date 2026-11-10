'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ChevronDown, 
  ShieldCheck, 
  GraduationCap, 
  Zap, 
  X,
  School,
  FileCheck2,
  BellRing,
  Building,
  Check
} from 'lucide-react';
import InstitutionRegistrationWizard from './InstitutionRegistrationWizard';

export default function InstitutionLandingHero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Smooth mouse parallax tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize mouse coordinates from -1 to 1
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToPerks = () => {
    const perksElement = document.getElementById('institution-perks');
    if (perksElement) {
      perksElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fafafc] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans overflow-x-hidden">
      {/* ── TECHNICAL GRAPH PAPER GRID BACKGROUND ── */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* ── SUBTLE AMBIENT PASTEL GRADIENTS ── */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-100/35 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-0 w-[550px] h-[550px] bg-emerald-100/25 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* ── FLOATING SHAPES WITH MOUSE PARALLAX ── */}
      {/* Shape 1: Top-left pastel yellow rounded square with solid offset shadow */}
      <motion.div
        className="absolute top-[14%] left-[6%] z-10 hidden sm:block pointer-events-none"
        animate={{
          x: mousePos.x * 18,
          y: mousePos.y * 18,
          rotate: -12,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring', bounce: 0.4 }}
          className="w-12 h-12 rounded-2xl bg-[#ffeed0] border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]"
        />
      </motion.div>

      {/* Shape 2: Top-center 4-point sparkle star */}
      <motion.div
        className="absolute top-[12%] left-[42%] z-10 pointer-events-none"
        animate={{
          x: mousePos.x * -14,
          y: mousePos.y * -16,
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 100 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35, type: 'spring' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-400 drop-shadow-xs">
            <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Shape 3: Right mint green circle with solid offset shadow */}
      <motion.div
        className="absolute top-[32%] right-[5%] z-10 hidden sm:block pointer-events-none"
        animate={{
          x: mousePos.x * 24,
          y: mousePos.y * 22,
        }}
        transition={{ type: 'spring', damping: 24, stiffness: 110 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: 'spring', bounce: 0.4 }}
          className="w-10 h-10 rounded-full bg-[#c8f5de] border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]"
        />
      </motion.div>

      {/* Shape 4: Bottom-right periwinkle rectangle with solid offset shadow */}
      <motion.div
        className="absolute bottom-[22%] right-[6%] z-10 hidden md:block pointer-events-none"
        animate={{
          x: mousePos.x * -18,
          y: mousePos.y * 18,
          rotate: 12,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 115 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45, type: 'spring', bounce: 0.4 }}
          className="w-14 h-10 rounded-xl bg-[#d5dcfa] border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]"
        />
      </motion.div>

      {/* Shape 5: Bottom-center dashed black diamond */}
      <motion.div
        className="absolute bottom-[10%] left-[48%] z-10 pointer-events-none hidden sm:block"
        animate={{
          x: mousePos.x * 16,
          y: mousePos.y * -18,
          rotate: 45,
        }}
        transition={{ type: 'spring', damping: 26, stiffness: 105 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5, type: 'spring' }}
          className="w-10 h-10 border-2 border-dashed border-slate-800"
        />
      </motion.div>

      {/* ── TOP HEADER / NAV ── */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <span className="font-black text-lg">α</span>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">Alpha Edu Hub</span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
              Institution Onboarding
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            Already an institutional user? <span className="text-indigo-600 hover:underline">Sign in →</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN HERO SECTION ── */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 pt-6 sm:pt-12 pb-24 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── LEFT COLUMN: HEADLINE, COPY & CTA ── */}
          <div className="lg:col-span-7 flex flex-col items-start pt-4 lg:pt-0">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200/90 shadow-xs mb-6 sm:mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                Verified Institution Registration
              </span>
            </motion.div>

            {/* Giant Bold Headline tailored directly for Alpha Edu Hub */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-1 sm:space-y-2"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black text-slate-900 tracking-[-0.03em] leading-[1.06]">
                Modernize Your{' '}
                <span className="relative inline-block px-1">
                  School.
                  {/* Highlighter effect behind 'School.' */}
                  <span className="absolute left-0 bottom-1.5 -z-10 w-full h-3.5 sm:h-5 bg-indigo-100/90 rounded-sm" />
                </span>
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black text-slate-900 tracking-[-0.03em] leading-[1.06]">
                Automate Every{' '}
                <span className="relative inline-block text-indigo-600">
                  Workflow.
                  {/* Hand-drawn playful wavy doodle underline under 'Workflow.' */}
                  <svg
                    viewBox="0 0 200 14"
                    fill="none"
                    className="absolute -bottom-2.5 left-0 w-full h-3 sm:h-4 text-slate-900 stroke-current overflow-visible"
                  >
                    <path
                      d="M 2,7 C 45,2 105,12 198,5"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </h1>
            </motion.div>

            {/* Subtitle explicitly communicating Alpha Edu Hub value proposition */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed"
            >
              Provision a dedicated multi-tenant ERP workspace for your school or college. Streamline student admissions, daily attendance, automated fee collection, and parent communications in one unified platform.
            </motion.p>

            {/* Feature highlights bullets */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-slate-600"
            >
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>CBSE, ICSE & State Boards</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero Migration Downtime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Instant WhatsApp Alerts</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-6"
            >
              <button
                onClick={() => setShowApplicationModal(true)}
                className="group relative inline-flex items-center gap-3.5 bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-white pl-6 pr-3.5 py-3 rounded-full text-base font-semibold shadow-xl shadow-slate-950/15 transition-all hover:shadow-2xl hover:shadow-slate-950/20"
              >
                <span>Register Institution</span>
                <span className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center font-bold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </button>

              <button
                onClick={scrollToPerks}
                className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-slate-700 hover:text-slate-950 transition-colors group"
              >
                <span>See institution benefits</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </button>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: HANGING ID BADGE WITH PENDULUM SWING ── */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end items-start pt-6 lg:pt-0">
            {/* Lanyard & ID Card Pendulum Swing Assembly */}
            <motion.div
              initial={{ y: -160, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center"
            >
              <motion.div
                style={{ transformOrigin: 'top center' }}
                animate={{
                  rotate: [-3.8, 3.8, -3.8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5.2,
                  ease: 'easeInOut',
                }}
                className="flex flex-col items-center cursor-grab active:cursor-grabbing select-none"
              >
                {/* ── 1. Black Woven Lanyard Strap ── */}
                <div className="relative w-8 sm:w-9 h-28 sm:h-36 bg-[#18181b] shadow-md rounded-b-[2px] flex items-center justify-center overflow-hidden">
                  {/* Woven fabric texture lines */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, #3f3f46 0, #3f3f46 2px, transparent 2px, transparent 6px)`,
                    }}
                  />
                  {/* Center crease line */}
                  <div className="w-[1px] h-full bg-black/40 shadow-[1px_0_0_rgba(255,255,255,0.08)]" />
                </div>

                {/* ── 2. Metallic Clasp & Swivel Hook ── */}
                <div className="relative -mt-1 flex flex-col items-center z-10">
                  {/* Metallic ring */}
                  <div className="w-5 h-5 rounded-full border-[3px] border-slate-300 bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400 shadow-sm" />
                  
                  {/* Swivel clip hook */}
                  <div className="-mt-1.5 w-3.5 h-6 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 rounded-sm shadow-sm flex items-end justify-center pb-0.5">
                    <div className="w-2.5 h-3 border-2 border-slate-600 rounded-b-md bg-slate-200" />
                  </div>
                </div>

                {/* ── 3. Hanging Institutional ID Card ── */}
                <div className="-mt-1 relative w-64 sm:w-[285px] h-[385px] sm:h-[405px] bg-white rounded-[28px] border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18),0_10px_20px_-5px_rgba(15,23,42,0.08)] p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
                  
                  {/* Top Punch Slot Hole for Hook */}
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-100 border border-slate-300 rounded-full" />

                  {/* Card Header */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
                        α
                      </div>
                      <div className="leading-tight">
                        <div className="text-[12px] font-extrabold text-slate-900 tracking-tight">alphaeduhub</div>
                        <div className="text-[9.5px] font-semibold text-slate-500 tracking-tight uppercase">Institution Console</div>
                      </div>
                    </div>

                    {/* Verified Institution Badge Pill */}
                    <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                      <span className="text-[9.5px] font-bold text-indigo-700">Verified</span>
                    </div>
                  </div>

                  {/* Card Main Hero Body */}
                  <div className="my-auto text-left pl-1">
                    <h2 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none">
                      Your Campus.
                    </h2>
                    <p className="mt-2.5 text-xs sm:text-sm font-semibold text-slate-500 tracking-tight">
                      unified school operations • 2026
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Multi-Tenant Architecture Active
                    </div>
                  </div>

                  {/* Card Footer: Domain pill on left, institution crest on right */}
                  <div className="flex items-end justify-between pt-2">
                    {/* Domain Pill */}
                    <div className="border border-slate-300 rounded-full px-3 py-1 bg-white text-[11px] font-bold text-slate-700 shadow-xs mb-1">
                      alphaeduhub.in
                    </div>

                    {/* Modern Institutional Crest Graphic */}
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 p-0.5 shadow-md flex items-center justify-center">
                      <div className="w-full h-full bg-indigo-950/20 backdrop-blur-xs rounded-[14px] flex flex-col items-center justify-center">
                        <GraduationCap className="w-7 h-7 text-amber-300 drop-shadow-xs" />
                        <span className="text-[8px] font-extrabold text-white tracking-widest uppercase mt-0.5">ERP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* ── SECTION: INSTITUTION BENEFITS & PRIVILEGES ── */}
      <section id="institution-perks" className="relative z-20 border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-20 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-full">
              Enterprise Institutional Privileges
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for School Principals, Trustees & Administrators
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Replace fragmented registers, Excel sheets, and legacy desktop software with one high-speed platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Zero-Downtime Data Migration</h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Our onboarding team migrates your existing student records, faculty rosters, and fee registers free of charge within 24 hours. Zero disruption to classes.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">CBSE, ICSE & State Compliance</h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Pre-configured CCE report cards, attendance registers, UDISE+/APAAR code tracking, and digital transfer certificates compliant with national education policies.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Automated Parent Alerts & UPI</h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Instant period-absence notifications to parents via automated WhatsApp and SMS. Digital fee invoices with instant UPI QR payments and automated reconciliation.
              </p>
            </div>
          </div>

          {/* Bottom Action Card */}
          <div className="mt-16 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to empower your school with Alpha Edu Hub?
              </h3>
              <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl">
                Submit your institution details. Our onboarding team validates and provisions your multi-tenant school console with priority deployment.
              </p>
            </div>
            <button
              onClick={() => setShowApplicationModal(true)}
              className="whitespace-nowrap px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-base shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              Start Registration →
            </button>
          </div>
        </div>
      </section>

      {/* ── APPLICATION MODAL (Preserving Form Logic & Step Wizard) ── */}
      <AnimatePresence>
        {showApplicationModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    α
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Institution Registration</h3>
                    <p className="text-xs text-slate-500">Alpha Edu Hub Multi-Tenant School ERP</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body with preserved wizard */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <InstitutionRegistrationWizard />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
