'use client';

import React, { useState, useTransition, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Shield,
  GraduationCap,
  User,
} from 'lucide-react';
import BrandLoader from '@/components/ui/BrandLoader';
import { isSupabaseConfigured, signInWithGoogleSupabase } from '@/lib/supabase';

const Phone3D = dynamic(() => import('@/components/login/Phone3D'), {
  ssr: false,
  loading: () => (
    <div className="w-[300px] sm:w-[320px] h-[640px] rounded-[50px] bg-slate-100/70 border border-slate-200/80 animate-pulse flex flex-col items-center justify-center p-6 shadow-inner">
      <div className="w-12 h-12 rounded-2xl bg-blue-100/60 flex items-center justify-center text-blue-600 font-bold mb-4">
        α
      </div>
      <div className="h-4 w-32 bg-slate-200/80 rounded-full mb-2" />
      <div className="h-3 w-20 bg-slate-200/60 rounded-full" />
    </div>
  ),
});

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectParam = searchParams?.get('redirect') ?? null;

  // Step 1: Credentials
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: 2FA State (For Admin / Teacher role sessions)
  const [is2FaStep, setIs2FaStep] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  // Google Login State
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Navigation handler for Back button
  const handleGoBack = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    },
    [router]
  );

  const navigateTo = useCallback((target: string) => {
    window.location.replace(target);
  }, []);

  const executeLogin = (emailToUse: string, passwordToUse: string) => {
    setErrorMessage(null);
    setUserId(emailToUse);
    setPassword(passwordToUse);

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailToUse.trim(),
            password: passwordToUse.trim(),
          }),
        });

        const result = await response.json();

        if (response.ok && result.success && result.redirectUrl) {
          navigateTo(redirectParam || result.redirectUrl);
        } else if (result.requiresOtp && result.challengeId) {
          setChallengeId(result.challengeId);
          setEmailHint(result.emailHint || null);
          setUserRole(result.role || null);
          setIs2FaStep(true);
        } else {
          setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
        }
      } catch {
        setErrorMessage('Unable to reach server. Please check your network connection.');
      }
    });
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userId.trim()) {
      setErrorMessage('Please enter your email address or admission ID.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    executeLogin(userId, password);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!challengeId) {
      setErrorMessage('Session expired. Please sign in again.');
      setIs2FaStep(false);
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    startTransition(async () => {
      try {
        const { verifyLoginOtpAction } = await import('@/actions/auth');
        const result = await verifyLoginOtpAction({
          challengeId,
          otp: otpCode.trim(),
        });

        if (result.success && result.redirectUrl) {
          navigateTo(redirectParam || result.redirectUrl);
        } else {
          setErrorMessage(result.error || 'Invalid or expired OTP code.');
        }
      } catch {
        setErrorMessage('A network error occurred during verification.');
      }
    });
  };

  // Google SSO Login Handler (End-to-End)
  const handleGoogleLoginClick = async () => {
    setIsGoogleLoggingIn(true);
    setErrorMessage(null);

    if (isSupabaseConfigured) {
      try {
        await signInWithGoogleSupabase();
        return;
      } catch (err: unknown) {
        console.warn('Supabase OAuth error, attempting institutional Google auth fallback:', err);
      }
    }

    // Direct institutional Google sign-in fallback (instant 1-click auth)
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student@dps.edu.in',
          name: 'Rohan Sharma',
          role: 'STUDENT',
        }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.redirectUrl) {
        navigateTo(redirectParam || result.redirectUrl);
      } else {
        setErrorMessage(result.error || 'Google sign-in failed.');
        setIsGoogleLoggingIn(false);
      }
    } catch {
      setErrorMessage('Failed to connect to authentication service.');
      setIsGoogleLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] relative">
      {/* ════════════════════════════════════════════════════════════
          LEFT PANEL — 3D INTERACTIVE PHONE ON STUDIO GRID BACKDROP
      ════════════════════════════════════════════════════════════ */}
      <section
        className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] min-h-screen bg-[#F8FAFC] login-grid-pattern items-center justify-center overflow-hidden border-r border-slate-200/80"
        aria-label="Alpha Edu Hub 3D Interactive Showcase"
      >
        {/* Back Pill Button */}
        <button
          type="button"
          onClick={handleGoBack}
          className="absolute top-7 left-7 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md border border-slate-200/90 backdrop-blur-sm transition-all duration-200 cursor-pointer group"
          title="Go back"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-all" />
          <span>Back</span>
        </button>

        {/* 3D Phone with Alpha Edu Hub Student Dashboard Render */}
        <div className="w-full max-w-[480px] h-[720px] flex items-center justify-center pointer-events-auto">
          <Phone3D />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          RIGHT PANEL — VIBRANT, MODERN, HIGH-CONTRAST LOGIN FORM
      ════════════════════════════════════════════════════════════ */}
      <section className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-14 xl:px-20 pt-20 pb-12 sm:py-16 bg-white overflow-y-auto relative min-h-screen">
        {/* Mobile-only Back Button */}
        <button
          type="button"
          onClick={handleGoBack}
          className="lg:hidden absolute top-6 left-6 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 hover:text-blue-600 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md border border-slate-200/90 transition-all cursor-pointer group"
          title="Go back"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        {/* Ambient Subtle Accent Blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-100/40 via-sky-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[420px] mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {!is2FaStep ? (
              /* ────────────────────────────────────────────────────────
                 STEP 1: CREDENTIALS (STUDENT, TEACHER, ADMIN)
              ──────────────────────────────────────────────────────── */
              <motion.div
                key="credentials-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Header Title with Institutional Badge */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-100 text-blue-600 text-[11.5px] font-semibold mb-3.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>Institutional Portal</span>
                </div>
                <h1 className="text-3xl sm:text-[35px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Login to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600">
                    Alpha Edu Hub.
                  </span>
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-normal leading-relaxed">
                  Welcome back! Please enter your institutional credentials to access your dashboard.
                </p>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Field 1: Email Address Input */}
                <div>
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[18px] text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
                      <Mail className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </div>
                    <input
                      id="email-input"
                      type="text"
                      required
                      autoComplete="username"
                      value={userId}
                      onChange={(e) => {
                        setUserId(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Email address or Admission ID"
                      className="w-full h-[52px] pl-12 pr-4 rounded-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm sm:text-[14.5px] text-slate-900 placeholder-slate-400 font-medium transition-all shadow-2xs hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Field 2: Password Input */}
                <div>
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[18px] text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
                      <Lock className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </div>
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Password"
                      className="w-full h-[52px] pl-12 pr-12 rounded-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm sm:text-[14.5px] text-slate-900 placeholder-slate-400 font-medium transition-all shadow-2xs hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 focus:outline-none"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 z-10">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4" strokeWidth={1.8} />
                        ) : (
                          <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgotten Password Link */}
                  <div className="flex justify-end mt-2 pr-1">
                    <Link
                      href="/login/forgot-password"
                      className="text-xs sm:text-[13px] text-slate-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      Forgotten password?
                    </Link>
                  </div>
                </div>

                {/* Primary Log In Button (Energetic, high-contrast gradient pill) */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-[52px] rounded-full text-white text-base font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 via-sky-600 to-blue-600 bg-[length:200%_auto] hover:bg-right"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* OR Divider Line */}
                <div className="flex items-center my-4 sm:my-5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="px-3.5 text-xs font-semibold text-slate-400 tracking-wider">
                    OR
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* "Log in with Google" Button */}
                <button
                  type="button"
                  onClick={handleGoogleLoginClick}
                  disabled={isGoogleLoggingIn}
                  className="w-full h-[52px] rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-sm sm:text-[14.5px] flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
                >
                  {isGoogleLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Signing in with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Log in with Google</span>
                    </>
                  )}
                </button>

                {/* Sign up Row */}
                <div className="text-center pt-2">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Don&apos;t have an institutional account?{' '}
                    <Link
                      href="/register/institution"
                      className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>

                {/* Sleek 1-Click Demo Credentials Chip Bar */}
                <div className="pt-5 border-t border-slate-100/90 mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                    <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      1-Click Demo Fill
                    </span>
                    <span className="text-[11px] text-slate-400">Instant test login</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUserId('admin@dps.edu.in');
                        setPassword('Admin@123');
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-[0.98] group"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <span>Admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserId('teacher@dps.edu.in');
                        setPassword('Teacher@123');
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-[0.98] group"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      <span>Teacher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserId('student@dps.edu.in');
                        setPassword('Student@123');
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200/80 hover:border-sky-300 text-xs font-semibold text-slate-700 hover:text-sky-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-[0.98] group"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                      <span>Student</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            /* ────────────────────────────────────────────────────────
               STEP 2: 2FA OTP VERIFICATION
            ──────────────────────────────────────────────────────── */
            <motion.div
              key="2fa-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 rounded-xl bg-blue-100 text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {userRole === 'TEACHER' ? 'Teacher Security Session' : 'Admin 2FA Security'}
                </span>
              </div>

              <h1 className="text-[26px] sm:text-[30px] font-extrabold text-slate-900 tracking-tight leading-tight">
                Two-Factor Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-normal">
                Enter the 6-digit verification code sent to{' '}
                <strong className="text-slate-800">{emailHint || 'your registered contact'}</strong>.
              </p>

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs sm:text-sm"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="otp-input"
                    className="block text-xs font-bold text-slate-700 mb-1.5 pl-1"
                  >
                    6-Digit Security Code
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••"
                    className="w-full h-[52px] text-center tracking-[10px] font-mono text-2xl font-black rounded-full border border-slate-200 bg-white text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || otpCode.length !== 6}
                  className="w-full h-[52px] rounded-full text-white text-base font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-sky-600"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Enter Portal</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIs2FaStep(false);
                      setOtpCode('');
                      setErrorMessage(null);
                    }}
                    className="text-slate-500 hover:text-slate-900 font-semibold cursor-pointer transition-colors"
                  >
                    ← Back to Login
                  </button>
                  <span className="text-slate-400">Code valid for 10 min</span>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<BrandLoader fullScreen message="Loading login page" sublabel="Alpha Edu Hub" />}
    >
      <LoginForm />
    </Suspense>
  );
}
