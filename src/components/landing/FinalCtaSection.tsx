'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import GetStartedButton from './GetStartedButton';

export default function FinalCtaSection() {
  return (
    <section suppressHydrationWarning className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Skyblue Container with Soft Cloudy Effect & Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden bg-gradient-to-r from-[#1d8cfd] via-[#1a84f3] to-[#0284c7] rounded-3xl sm:rounded-[36px] p-8 sm:p-12 lg:p-14 shadow-[0_15px_40px_rgba(29,140,253,0.3)]"
        >
          {/* Decorative Cloud Silhouettes along Bottom and Corners */}
          <div className="absolute -bottom-8 -left-10 w-48 h-28 bg-white/20 rounded-full blur-sm pointer-events-none" />
          <div className="absolute -bottom-10 left-24 w-60 h-36 bg-white/25 rounded-full blur-md pointer-events-none" />
          <div className="absolute -bottom-12 right-1/4 w-72 h-40 bg-white/20 rounded-full blur-md pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-52 h-32 bg-white/25 rounded-full blur-sm pointer-events-none" />
          <div className="absolute top-2 right-1/3 w-36 h-20 bg-white/15 rounded-full blur-lg pointer-events-none" />
          <div className="absolute top-4 left-1/4 w-28 h-16 bg-white/10 rounded-full blur-md pointer-events-none" />

          {/* Banner Content Container */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="text-left max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[12px] font-bold text-white tracking-wide mb-3 border border-white/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>EXPERIENCE THE NEXT-GEN SCHOOL ERP</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight"
              >
                Ready to Upgrade Your
                <br />
                Campus Operations?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-3 text-sm sm:text-base text-blue-50 font-medium leading-relaxed max-w-xl"
              >
                Join forward-thinking school principals, administrators, and teachers using Alpha Edu Hub
                to automate workflows, secure student data, and elevate the learning experience.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-blue-100 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  Bank-Grade 256-bit Encryption
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-white" />
                  Instant 5-Minute Setup
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  No Credit Card Required
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <GetStartedButton className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:text-base font-bold text-[#1d8cfd] bg-white hover:bg-blue-50 active:bg-blue-100 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.15)] transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer">
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </GetStartedButton>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl transition-all"
              >
                <span>Live Demo Portal</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}