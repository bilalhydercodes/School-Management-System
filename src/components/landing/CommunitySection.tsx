'use client';

import React from 'react';
import {
  ShieldCheck,
  Server,
  Zap,
  Activity,
  CheckCircle2,
  TrendingUp,
  School,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface CommunityStatsProps {
  schools?: number;
  students?: number;
  attendance?: number;
  uptime?: string;
}

function formatStatNumber(num?: number): string {
  if (num === undefined || num === null) return '1+';
  if (num >= 1_000_000) {
    const val = (num / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${val}M+`;
  }
  if (num >= 1_000) {
    const val = (num / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${val}K+`;
  }
  return `${num > 0 ? num : 1}+`;
}

/**
 * Gamma-style Live Institutional Telemetry Card
 */
function InstitutionalTelemetryCard() {
  const liveEvents = [
    {
      school: 'Delhi Public School',
      event: 'Morning attendance synced for 1,420 students',
      badge: 'Real-time',
      time: 'Just now',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      school: 'Green Valley Academy',
      event: 'Term-1 Fee receipts reconciled (₹4.2L)',
      badge: 'Automated',
      time: '2m ago',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      school: 'National High School',
      event: 'CBSE Grade 10 marksheets published to parent portal',
      badge: 'Encrypted',
      time: '5m ago',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[480px]"
    >
      {/* Gamma-style ambient cyan & indigo glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-indigo-500/20 rounded-3xl blur-xl opacity-75" />

      {/* Main Glassmorphic Card Frame */}
      <div className="relative bg-white/95 backdrop-blur-xl border border-blue-100/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(11,114,231,0.08)]">
        {/* Top Status Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0B72E7] shadow-xs">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                <span>Cloud Infrastructure</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  HEALTHY
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Active Multi-Tenant Mesh • 99.9% SLA
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Pulse</span>
          </div>
        </div>

        {/* Live Stream Telemetry Events */}
        <div className="mt-4 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#0B72E7]" />
            <span>Recent School Activity</span>
          </div>

          {liveEvents.map((evt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.35, delay: 0.15 + idx * 0.08 }}
              className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all text-left group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0B72E7] transition-colors" />
                  {evt.school}
                </span>
                <span className="text-[10px] font-medium text-slate-400">{evt.time}</span>
              </div>
              <p className="text-[11.5px] text-slate-600 mt-1 leading-snug">{evt.event}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${evt.color}`}
                >
                  {evt.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Verified Hash ✓</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Institutional Trust Badges */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100/50">
            <Lock className="w-3.5 h-3.5 text-[#0B72E7] flex-shrink-0" />
            <span className="text-[11px] font-semibold text-slate-700">AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-slate-700">CBSE & ICSE Compliant</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunitySection({ stats }: { stats?: CommunityStatsProps }) {
  const statItems = [
    {
      value: formatStatNumber(stats?.schools ?? 1),
      label: 'Partner Schools',
      caption: 'Actively onboarded',
      icon: School,
    },
    {
      value: formatStatNumber(stats?.students ?? 5),
      label: 'Students Managed',
      caption: 'Across all grade levels',
      icon: TrendingUp,
    },
    {
      value: formatStatNumber(stats?.attendance ?? 15),
      label: 'Attendance Records',
      caption: 'Biometric & portal synced',
      icon: CheckCircle2,
    },
    {
      value: stats?.uptime || '99.9%',
      label: 'Uptime & Security',
      caption: 'Zero unscheduled downtime',
      icon: ShieldCheck,
    },
  ];

  return (
    <section suppressHydrationWarning className="relative py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-50/80 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-50/70 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-[#0B1536] via-[#0E204E] to-[#0A1A3D] text-white p-7 sm:p-12 lg:p-16 shadow-[0_25px_60px_rgba(11,21,54,0.18)] border border-blue-900/40"
        >
          {/* Ambient Mesh Lights inside Container */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0B72E7]/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Heading, Subtitle & 4 Metrics */}
            <div className="lg:col-span-7 text-left">
              {/* Pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[12px] font-bold text-cyan-300 tracking-wide mb-5"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>NATIONWIDE CAMPUS NETWORK</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]"
              >
                Building Resilient
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300 bg-clip-text text-transparent">
                  Institutional Ecosystems
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal"
              >
                Connecting educators, administrators, students, and parents into a unified,
                real-time collaborative academic cloud.
              </motion.p>

              {/* 4 Concrete Live Statistics Cards with Staggered Scroll Reveal */}
              <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-4 sm:gap-5">
                {statItems.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.45, delay: 0.2 + idx * 0.08 }}
                      className="p-4 sm:p-5 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.09] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-mono">
                          {stat.value}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-sm font-bold text-slate-100 leading-snug">
                        {stat.label}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400 font-medium">
                        {stat.caption}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Live Institutional Telemetry Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <InstitutionalTelemetryCard />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}