'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Cloud,
  Mail,
  HelpCircle,
  BookOpen,
  Loader2,
  AlertCircle,
  GraduationCap,
  Users,
  Briefcase,
  Building2,
  Receipt,
  Globe,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

// ============================================================================
// 1. CENTRALIZED CUSTOM CONTENT CONFIGURATION
// ============================================================================
const LOGIN_PAGE_CONFIG = {
  institution: {
    name: 'DELHI PUBLIC SCHOOL',
    affiliation: 'CBSE AFFILIATED • ESTD. 1949',
    portalTitle: 'SCHOOL MANAGEMENT SYSTEM',
    portalAcronym: 'SMS',
    logoAccentChar: 'D',
    logoRemainingChars: 'PS',
  },

  heroShowcase: {
    campusImage: '/campus-hero.jpg',
    bannerHeadline: 'DPS Sets New Global Benchmarks',
    bannerSubheadline: 'In Holistic K-12 Education & CBSE Excellence 2026',
    accreditationBadge: {
      provider: 'Education World & CBSE Honours',
      ratingText: 'Excellence & Sustainability',
      yearText: 'Ratings 2026',
    },
    ranking: {
      preTitle: 'RANKS DPS',
      primaryRank: '1',
      primarySuffix: 'st',
      primaryScope: 'IN NORTH INDIA',
      scopeAudience: 'Amongst Both Government, Private & International Schools',
      globalRankText: '23rd GLOBALLY',
    },
    footnoteText:
      'Ahead of leading national institutions in STEM innovation, state-of-the-art sports facilities, and holistic student leadership development | CBSE Affiliation No. 2730017 | Delhi Public School Society',
  },

  offices: [
    { id: 'admin', label: 'Admin Command Desk', role: 'ADMIN', path: '/admin' },
    { id: 'teacher', label: 'Faculty & Teacher Desk', role: 'TEACHER', path: '/teacher' },
    { id: 'student', label: 'Student & Parent Desk', role: 'STUDENT', path: '/' },
    { id: 'head-office', label: 'HeadOffice / Central', role: 'ADMIN', path: '/admin' },
  ],

  footerLinks: [
    { label: 'Student Mail', href: '#', icon: Mail },
    { label: 'Help Desk', href: '#', icon: HelpCircle },
    { label: 'LMS Portal', href: '#', icon: BookOpen },
  ],

  primaryLaunchPortals: [
    {
      role: 'ADMIN',
      title: 'Administrator Portal',
      subtitle: 'Institutional Command & Master Control',
      email: 'admin@dps.edu.in',
      path: '/admin',
      icon: Building2,
      accentColor: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      role: 'TEACHER',
      title: 'Faculty / Teacher Portal',
      subtitle: 'Attendance, Schedules & Gradebook',
      email: 'teacher@dps.edu.in',
      path: '/teacher',
      icon: Briefcase,
      accentColor: 'from-blue-600 to-indigo-700',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      role: 'STUDENT',
      title: 'Student & Parent Portal',
      subtitle: 'Academic Ledger, Fees & Report Cards',
      email: 'student@dps.edu.in',
      path: '/',
      icon: GraduationCap,
      accentColor: 'from-emerald-600 to-teal-700',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ],

  demoAccounts: [
    {
      role: 'Admin',
      roleKey: 'ADMIN',
      email: 'admin@dps.edu.in',
      password: 'Admin@123',
      icon: Building2,
      path: '/admin',
    },
    {
      role: 'Teacher',
      roleKey: 'TEACHER',
      email: 'teacher@dps.edu.in',
      password: 'Teacher@123',
      icon: Briefcase,
      path: '/teacher',
    },
    {
      role: 'Student',
      roleKey: 'STUDENT',
      email: 'student@dps.edu.in',
      password: 'Student@123',
      icon: GraduationCap,
      path: '/',
    },
    {
      role: 'Parent',
      roleKey: 'PARENT',
      email: 'parent@dps.edu.in',
      password: 'Parent@123',
      icon: Users,
      path: '/',
    },
    {
      role: 'Accountant',
      roleKey: 'ACCOUNTANT',
      email: 'accountant@dps.edu.in',
      password: 'Accountant@123',
      icon: Receipt,
      path: '/admin',
    },
    {
      role: 'Super Admin',
      roleKey: 'SUPER_ADMIN',
      email: 'superadmin@schoolerp.in',
      password: 'SuperAdmin@123',
      icon: Globe,
      path: '/superadmin',
    },
  ],
};

// ============================================================================
// 2. INNER LOGIN FORM COMPONENT
// ============================================================================
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [selectedOffice, setSelectedOffice] = useState(LOGIN_PAGE_CONFIG.offices[0].label);
  const [userId, setUserId] = useState('admin@dps.edu.in');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeRoleLoggingIn, setActiveRoleLoggingIn] = useState<string | null>(null);

  const executeDirectLogin = async (roleKey: string, customEmail?: string, targetPath?: string) => {
    setIsLoggingIn(true);
    setActiveRoleLoggingIn(roleKey);

    const email = customEmail || userId || `${roleKey.toLowerCase()}@dps.edu.in`;
    const destination = redirectParam || targetPath || (roleKey === 'TEACHER' ? '/teacher' : roleKey === 'STUDENT' || roleKey === 'PARENT' ? '/' : roleKey === 'SUPER_ADMIN' ? '/superadmin' : '/admin');

    try {
      // Call demo login API to sign session cookie
      await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleKey, email }),
      });
    } catch {
      // Ignore network failures for demo login and navigate directly
    }

    // Direct client redirect
    window.location.href = destination;
  };

  const handleDemoSelect = (roleKey: string, email: string, pass: string, path: string) => {
    setUserId(email);
    setPassword(pass);
    executeDirectLogin(roleKey, email, path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inputLower = (userId || '').toLowerCase();
    let detectedRole = 'ADMIN';
    let target = '/admin';

    if (inputLower.includes('teacher') || inputLower.includes('faculty')) {
      detectedRole = 'TEACHER';
      target = '/teacher';
    } else if (inputLower.includes('student') || inputLower.includes('parent')) {
      detectedRole = 'STUDENT';
      target = '/';
    } else if (inputLower.includes('super')) {
      detectedRole = 'SUPER_ADMIN';
      target = '/superadmin';
    }

    executeDirectLogin(detectedRole, userId, target);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F9FA] text-[#111C2D] font-sans antialiased overflow-x-hidden">
      {/* ==================================================================== */}
      {/* LEFT COLUMN: VISUAL HERO & SHOWCASE BANNER                           */}
      {/* ==================================================================== */}
      <section className="relative w-full lg:w-1/2 min-h-[480px] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#111C2D]">
        <img
          src={LOGIN_PAGE_CONFIG.heroShowcase.campusImage}
          alt="Campus Clock Tower Architecture"
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25 z-10 pointer-events-none" />

        <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F37021] shadow-xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
        </div>

        <div className="relative z-20 pt-8 sm:pt-12 px-6 sm:px-10 lg:px-12 max-w-xl">
          <div
            className="bg-gradient-to-br from-[#F37021] to-[#E05D0E] text-white p-6 sm:p-8 shadow-2xl relative rounded-tr-3xl"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 84% 100%, 0 100%)',
            }}
          >
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black leading-tight tracking-tight drop-shadow-xs">
              {LOGIN_PAGE_CONFIG.heroShowcase.bannerHeadline}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-white/95 mt-1 leading-snug">
              {LOGIN_PAGE_CONFIG.heroShowcase.bannerSubheadline}
            </p>

            <div className="bg-white rounded-lg p-2.5 mt-5 inline-flex items-center gap-3 shadow-md max-w-xs text-slate-900">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {LOGIN_PAGE_CONFIG.heroShowcase.accreditationBadge.provider}
                </div>
                <div className="text-xs font-black text-slate-900 tracking-tight">
                  {LOGIN_PAGE_CONFIG.heroShowcase.accreditationBadge.ratingText}
                </div>
                <div className="text-[11px] font-extrabold text-[#F37021]">
                  {LOGIN_PAGE_CONFIG.heroShowcase.accreditationBadge.yearText}
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-0.5">
              <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-white/90 block">
                {LOGIN_PAGE_CONFIG.heroShowcase.ranking.preTitle}
              </span>

              <div className="flex items-start text-white leading-none">
                <span className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter">
                  {LOGIN_PAGE_CONFIG.heroShowcase.ranking.primaryRank}
                </span>
                <span className="text-2xl sm:text-3xl font-black ml-1.5 mt-3 sm:mt-4">
                  {LOGIN_PAGE_CONFIG.heroShowcase.ranking.primarySuffix}
                </span>
              </div>

              <div className="text-xl sm:text-2xl lg:text-[26px] font-black uppercase text-white tracking-wide">
                {LOGIN_PAGE_CONFIG.heroShowcase.ranking.primaryScope}
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-white/90 max-w-[320px] leading-tight pt-1">
                {LOGIN_PAGE_CONFIG.heroShowcase.ranking.scopeAudience}
              </p>

              <div className="pt-4">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {LOGIN_PAGE_CONFIG.heroShowcase.ranking.globalRankText}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 bg-black/75 backdrop-blur-md p-4 sm:p-5 text-[10px] sm:text-[11px] text-white/80 leading-relaxed border-t border-white/10 mt-8">
          <p className="max-w-2xl">{LOGIN_PAGE_CONFIG.heroShowcase.footnoteText}</p>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* RIGHT COLUMN: DEMO ACCESS & INSTANT LOGIN LAUNCHER                    */}
      {/* ==================================================================== */}
      <section className="w-full lg:w-1/2 min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        {/* Top Header */}
        <div className="w-full max-w-[480px] flex items-center justify-center gap-3.5 pt-2 pb-4">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-300 p-1 flex items-center justify-center shadow-sm shrink-0">
            <div className="w-full h-full rounded-full border border-dashed border-[#F37021] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-[#111C2D]">
              <Award className="w-6 h-6 text-[#F37021]" />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1 leading-none">
              <div className="w-6 h-6 bg-[#111C2D] rounded-md flex items-center justify-center text-white mr-0.5">
                <GraduationCap className="w-4 h-4 text-[#F37021]" />
              </div>
              <span className="text-[#F37021] font-black text-2xl sm:text-3xl tracking-tight">
                {LOGIN_PAGE_CONFIG.institution.logoAccentChar}
              </span>
              <span className="text-[#111C2D] font-black text-2xl sm:text-3xl tracking-tight">
                {LOGIN_PAGE_CONFIG.institution.logoRemainingChars}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.24em] font-extrabold text-[#64748B] uppercase mt-1">
              {LOGIN_PAGE_CONFIG.institution.portalTitle}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-[#EBECEF] p-6 sm:p-8 my-auto space-y-5">
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-[#111C2D] tracking-tight">Portal Gateway</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select your role to start instant 1-click demo access
              </p>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo Active</span>
            </div>
          </div>

          {/* 1-CLICK INSTANT PORTAL LAUNCHERS (PRIMARY ROLES) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Instant 1-Click Launchers</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {LOGIN_PAGE_CONFIG.primaryLaunchPortals.map((portal) => {
                const Icon = portal.icon;
                const isSelected = activeRoleLoggingIn === portal.role && isLoggingIn;

                return (
                  <button
                    key={portal.role}
                    type="button"
                    disabled={isLoggingIn}
                    onClick={() => executeDirectLogin(portal.role, portal.email, portal.path)}
                    className={`w-full group text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#F37021] bg-[#FFF5EE] shadow-sm'
                        : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${portal.accentColor} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        {isSelected ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-[#F37021] transition-colors">
                            {portal.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{portal.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-[#F37021] group-hover:translate-x-0.5 transition-all">
                      <span>Enter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Switcher Matrix */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                All Demo Roles & Accounts
              </span>
              <span className="text-[10px] font-semibold text-[#F37021]">1-Click Switch</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {LOGIN_PAGE_CONFIG.demoAccounts.map((account) => {
                const Icon = account.icon;
                const isSelected = activeRoleLoggingIn === account.roleKey && isLoggingIn;

                return (
                  <button
                    key={account.role}
                    type="button"
                    disabled={isLoggingIn}
                    onClick={() =>
                      handleDemoSelect(account.roleKey, account.email, account.password, account.path)
                    }
                    className="p-2 rounded-lg text-left border border-slate-200 hover:border-[#F37021] hover:bg-[#FFF5EE] text-slate-700 transition-all flex flex-col gap-0.5 group"
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-slate-500 group-hover:text-[#F37021]" />
                      <span className="text-[11px] font-bold truncate group-hover:text-[#F37021]">
                        {account.role}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 truncate">{account.email}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Credential Form */}
          <form className="space-y-3 pt-2 border-t border-slate-100" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or Login with Custom ID
              </span>
            </div>

            <div className="relative rounded-xl">
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Registration No. / User ID / Email"
                className="w-full bg-[#EBF2F9] focus:bg-white text-xs font-medium text-[#111C2D] placeholder:text-slate-400 py-2.5 pl-3.5 pr-10 rounded-xl border border-transparent focus:border-[#F37021] outline-none transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="relative rounded-xl">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#EBF2F9] focus:bg-white text-xs font-medium text-[#111C2D] placeholder:text-slate-400 py-2.5 pl-3.5 pr-10 rounded-xl border border-transparent focus:border-[#F37021] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#F37021] hover:bg-[#E05D0E] active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Entering Portal...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer Quick Links */}
        <div className="w-full max-w-[480px] flex items-center justify-center gap-6 py-3 text-xs font-semibold text-slate-700">
          {LOGIN_PAGE_CONFIG.footerLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1.5 hover:text-[#F37021] transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-slate-600" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 3. EXPORT ROOT WITH SUSPENSE BOUNDARY
// ============================================================================
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#F37021]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
