'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Mail,
  BarChart3,
  Settings,
  Plus,
  Send,
  Calendar,
  Bell,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function HeroDashboardCard() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Students', icon: GraduationCap },
    { label: 'Teachers', icon: Users },
    { label: 'Classes', icon: BookOpen },
    { label: 'Academics', icon: FileText },
    { label: 'Communication', icon: Mail },
    { label: 'Reports', icon: BarChart3 },
    { label: 'Settings', icon: Settings },
  ];

  const quickActions = [
    { label: 'Add Student', icon: Plus, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'Create Class', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Send Notice', icon: Send, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'View Reports', icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ];

  return (
    <div suppressHydrationWarning className="relative w-full max-w-[600px] mx-auto select-none group [perspective:1400px]">
      {/* 1. Ambient Background Neon Glows (Gamma inspiration) */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-14 bg-gradient-to-r from-blue-500/20 via-cyan-400/35 to-blue-600/25 blur-2xl rounded-full -z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3/5 h-2 bg-cyan-400/80 blur-[3px] rounded-full -z-10 pointer-events-none" />

      {/* 2. Glassmorphic 3D Tablet Frame */}
      <div
        className="relative rounded-[22px] sm:rounded-[28px] p-2 sm:p-2 bg-gradient-to-br from-white/95 via-sky-50/70 to-white/95 border-2 border-white/90 shadow-[0_24px_50px_-12px_rgba(11,114,231,0.22),0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-700 ease-out transform lg:[transform:rotateY(-3.5deg)_rotateX(2deg)] group-hover:[transform:rotateY(-1deg)_rotateX(0.5deg)_translateY(-3px)]"
      >
        {/* Inner screen container */}
        <div className="rounded-[16px] sm:rounded-[22px] overflow-hidden bg-white border border-slate-100/90 shadow-sm flex flex-col sm:flex-row min-h-[340px]">
          {/* ── LEFT DARK SIDEBAR (Navy #0D1629) ── */}
          <div className="w-full sm:w-36 lg:w-40 bg-[#0D1629] text-slate-300 p-3 flex flex-col justify-between shrink-0">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-2 px-1 py-1 mb-3 border-b border-slate-800/80 pb-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                  <Image
                    src="/images/dashboard/logo_crest.png"
                    alt="Alpha Edu Hub"
                    width={20}
                    height={20}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[11px] font-bold text-white leading-tight truncate">
                    Alpha Edu Hub
                  </div>
                  <div className="text-[8px] font-medium text-slate-400 leading-tight truncate">
                    School ERP
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveTab(item.label)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-150 text-left ${
                        isActive
                          ? 'bg-[#0B72E7] text-white shadow-[0_2px_8px_rgba(11,114,231,0.4)] font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Principal Profile Footer */}
            <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center gap-2 px-0.5">
              <div className="relative w-5 h-5 rounded-full overflow-hidden bg-slate-700 shrink-0 border border-slate-600">
                <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-[8px] font-bold">
                  P
                </div>
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-[#0D1629]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[9.5px] font-semibold text-white truncate leading-tight">
                  Principal
                </div>
                <div className="text-[8px] text-emerald-400 font-medium truncate leading-tight">
                  Online
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT MAIN DASHBOARD CONTENT (Light #F8FAFC) ── */}
          <div className="flex-1 bg-[#F8FAFC] p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Top Greeting & Date/Notification Bar */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                <div>
                  <h3 className="text-[12px] sm:text-[13px] font-bold text-slate-900 leading-tight flex items-center gap-1">
                    <span>Good Morning, Principal</span>
                    <span className="text-sm select-none">👋</span>
                  </h3>
                  <p className="text-[9px] sm:text-[9.5px] text-slate-500 font-medium mt-0.5">
                    Here&apos;s what&apos;s happening at your school today.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-medium text-slate-600 shadow-xs">
                    <Calendar className="w-2.5 h-2.5 text-slate-400" />
                    <span>Tue, 10 Nov 2026</span>
                  </div>
                  <div className="relative w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
                    <Bell className="w-2.5 h-2.5" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-white" />
                  </div>
                  <div className="w-5 h-5 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center text-[#0B72E7] text-[9px] font-bold shadow-xs">
                    VK
                  </div>
                </div>
              </div>

              {/* 4 Metric Stat Cards (Scaled down to fit properly without truncation) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mt-2.5">
                {/* 1. Total Students */}
                <div className="bg-white rounded-xl p-1.5 sm:p-2 border border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.03)] flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0B72E7] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] sm:text-[12px] font-black text-slate-900 leading-tight whitespace-nowrap">
                      2,420
                    </div>
                    <div className="text-[8px] text-slate-500 font-medium leading-tight whitespace-nowrap">
                      Students
                    </div>
                  </div>
                </div>

                {/* 2. Teachers */}
                <div className="bg-white rounded-xl p-1.5 sm:p-2 border border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.03)] flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] sm:text-[12px] font-black text-slate-900 leading-tight whitespace-nowrap">
                      180
                    </div>
                    <div className="text-[8px] text-slate-500 font-medium leading-tight whitespace-nowrap">
                      Teachers
                    </div>
                  </div>
                </div>

                {/* 3. Classes */}
                <div className="bg-white rounded-xl p-1.5 sm:p-2 border border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.03)] flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] sm:text-[12px] font-black text-slate-900 leading-tight whitespace-nowrap">
                      64
                    </div>
                    <div className="text-[8px] text-slate-500 font-medium leading-tight whitespace-nowrap">
                      Classes
                    </div>
                  </div>
                </div>

                {/* 4. Attendance */}
                <div className="bg-white rounded-xl p-1.5 sm:p-2 border border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.03)] flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] sm:text-[12px] font-black text-slate-900 leading-tight whitespace-nowrap">
                      98%
                    </div>
                    <div className="text-[8px] text-slate-500 font-medium leading-tight whitespace-nowrap">
                      Attendance
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Section: School Overview Graph + Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mt-2.5 items-stretch">
                {/* School Overview Chart (Span 7) */}
                <div className="sm:col-span-7 bg-white rounded-xl p-2 sm:p-2.5 border border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.03)] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <span>School Overview</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[8px] font-semibold text-slate-500 bg-slate-50 px-1 py-0.5 rounded border border-slate-200">
                      This Month ▾
                    </div>
                  </div>

                  {/* SVG Area Line Chart */}
                  <div className="relative w-full h-[88px] mt-0.5">
                    {/* Tooltip on peak */}
                    <div className="absolute top-1 right-[16%] -translate-x-1/2 bg-[#0B72E7] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 z-10 whitespace-nowrap">
                      <span>2,420 Students</span>
                    </div>

                    <svg viewBox="0 0 280 85" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0B72E7" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#0B72E7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="20" y1="15" x2="270" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20" y1="40" x2="270" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20" y1="65" x2="270" y2="65" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Area Fill */}
                      <path
                        d="M25 65 Q 60 62, 95 48 T 165 44 T 235 20 L 235 75 L 25 75 Z"
                        fill="url(#chartGrad)"
                      />

                      {/* Curved Trend Line */}
                      <path
                        d="M25 65 Q 60 62, 95 48 T 165 44 T 235 20"
                        fill="none"
                        stroke="#0B72E7"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />

                      {/* Peak Data Pin */}
                      <circle cx="235" cy="20" r="3.5" fill="#0B72E7" stroke="#ffffff" strokeWidth="2" />
                      <line x1="235" y1="20" x2="235" y2="75" stroke="#0B72E7" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.5" />
                    </svg>

                    {/* X-Axis labels */}
                    <div className="flex justify-between text-[7.5px] text-slate-400 font-medium px-2 mt-0.5">
                      <span>Oct 1</span>
                      <span>Oct 8</span>
                      <span>Oct 15</span>
                      <span>Oct 22</span>
                      <span>Oct 29</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions (Span 5) */}
                <div className="sm:col-span-5 bg-white rounded-xl p-2 sm:p-2.5 border border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.03)] flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Quick Actions</span>
                    <Sparkles className="w-2.5 h-2.5 text-[#0B72E7]" />
                  </div>

                  <div className="space-y-1">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <div
                          key={action.label}
                          className="flex items-center justify-between p-1 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${action.color}`}>
                              <Icon className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[9px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                              {action.label}
                            </span>
                          </div>
                          <ChevronRight className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
