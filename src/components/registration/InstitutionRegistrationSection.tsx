'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CalendarDays } from 'lucide-react';
import ModernInstitutionRegistrationFlow from './ModernInstitutionRegistrationFlow';

const MeetingScheduler = dynamic(() => import('./MeetingScheduler'), {
  loading: () => (
    <div className="w-full max-w-6xl mx-auto h-[520px] bg-white rounded-3xl shadow-xl border border-slate-200/90 animate-pulse flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mx-auto mb-3">
          α
        </div>
        <p className="text-sm font-semibold text-slate-500">Loading consultation calendar...</p>
      </div>
    </div>
  ),
});

export default function InstitutionRegistrationSection() {
  // The user explicitly requested: the default MUST be the registration form,
  // and scheduling meeting should be secondary.
  const [activeTab, setActiveTab] = useState<'form' | 'schedule'>('form');

  return (
    <section id="register-section" className="relative z-20 bg-[#FAF9F6] py-24 sm:py-32 px-4 sm:px-8 border-t border-slate-200/80">
      {/* ── TECHNICAL GRAPH PAPER SUBTLE GRID ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs mb-5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              CONNECT WITH ALPHA EDU HUB
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-[-0.03em] leading-[1.08]">
            {activeTab === 'form' ? (
              <span>
                Register Your Institution{' '}
                <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">
                  Workspace
                </span>
              </span>
            ) : (
              <span>
                Schedule a 30 minutes{' '}
                <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">
                  meeting
                </span>
              </span>
            )}
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {activeTab === 'form'
              ? 'Complete our quick 2-minute registration below to provision your multi-tenant school console, or schedule a 1-on-1 walkthrough with our team.'
              : 'Pick a convenient time slot below to connect directly with our educational consultation team.'}
          </p>

          {/* ── SEGMENTED PILL SWITCHER ── */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
            {/* Tab 1: Fill Form Directly (Default Active) */}
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>FILL FORM DIRECTLY</span>
            </button>

            {/* Tab 2: Schedule Meeting */}
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>SCHEDULE MEETING</span>
            </button>
          </div>
        </div>

        {/* ── ACTIVE TAB CONTAINER ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'form' ? (
            <motion.div
              key="form-tab"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <ModernInstitutionRegistrationFlow embedded={true} />
            </motion.div>
          ) : (
            <motion.div
              key="schedule-tab"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <MeetingScheduler onFormSwitch={() => setActiveTab('form')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
