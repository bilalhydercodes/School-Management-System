'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Users, Zap, BarChart3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardMockup from './DashboardMockup';

export default function BenefitsSection() {
  const [activeBenefit, setActiveBenefit] = useState<string>('save-time');

  const benefits = [
    {
      id: 'save-time',
      title: 'Automated Operations',
      description: 'Cut daily administrative workload by 70% with 1-click attendance and auto-invoicing.',
      icon: Clock,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200/80',
    },
    {
      id: 'improve-communication',
      title: 'Omnichannel Parent Engagement',
      description: 'Keep parents informed with real-time academic feeds, homework diaries, and instant SMS.',
      icon: Users,
      iconColor: 'text-[#0B72E7]',
      bgColor: 'bg-blue-50 border-blue-200/80',
    },
    {
      id: 'increase-efficiency',
      title: 'Unified Institutional Intelligence',
      description: 'Consolidate multiple campus branches, grade sections, and fee cycles into one cloud.',
      icon: Zap,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 border-amber-200/80',
    },
    {
      id: 'data-driven',
      title: 'CBSE & ICSE Compliant Reporting',
      description: 'Generate term scorecards, student conduct records, and statutory audits in one click.',
      icon: BarChart3,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200/80',
    },
  ];

  return (
    <section id="why-us" suppressHydrationWarning className="relative py-14 sm:py-18 lg:py-24 bg-white overflow-hidden">
      {/* Background Gamma-style subtle ambient glow */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-100/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Heading, 4 Sleek Benefit Rows & CTA */}
          <div className="lg:col-span-5 text-left flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-[#0B72E7] mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0B72E7]" />
                <span>MEASURABLE CAMPUS IMPACT</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0A1344] tracking-tight leading-tight">
                A Smarter Way to
                <br />
                <span className="text-[#0B72E7]">Manage Your School</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-md">
                Engineered for modern institutions seeking operational velocity, data security, and transparent parent trust.
              </p>

              {/* 4 Sleek Benefit Items with Staggered Scroll Reveal */}
              <div className="mt-5 space-y-2.5">
                {benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  const isActive = activeBenefit === benefit.id;
                  return (
                    <motion.div
                      key={benefit.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => setActiveBenefit(benefit.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group ${
                        isActive
                          ? 'border-[#0B72E7] bg-blue-50/50 shadow-xs'
                          : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50/60'
                      }`}
                    >
                      <div
                        className={`w-8.5 h-8.5 rounded-xl ${benefit.bgColor} border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon className={`w-4 h-4 ${benefit.iconColor} stroke-[2.2]`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-[13.5px] font-bold leading-snug transition-colors ${
                          isActive ? 'text-[#0B72E7]' : 'text-[#0A1344] group-hover:text-[#0B72E7]'
                        }`}>
                          {benefit.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5 font-normal">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Action CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 pt-1"
            >
              <Link
                href="/register/institution"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0B72E7] hover:bg-blue-600 active:bg-blue-700 rounded-xl shadow-[0_4px_14px_rgba(11,114,231,0.25)] hover:shadow-[0_6px_20px_rgba(11,114,231,0.35)] transition-all duration-150 transform hover:-translate-y-0.5"
              >
                <span>Onboard Your School Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: PINNED / STICKY Product UI Mockup */}
          <div className="lg:col-span-7 flex justify-center w-full lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 25 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <DashboardMockup activeBenefit={activeBenefit} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}