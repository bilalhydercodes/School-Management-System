'use client';

import React, { useState, useTransition, Suspense, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Users,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';
import BrandLoader from '@/components/ui/BrandLoader';
import Phone3D from '@/components/login/Phone3D';

/* ────────────────────────────────────────────────────────────
   DEMO ACCOUNTS FOR INSTANT 1-CLICK AUTH
──────────────────────────────────────────────────────────── */
const DEMO_ACCOUNTS = [
  {
    id: 'admin',
    title: 'Admin',
    subtitle: 'Management',
    email: 'admin@dps.edu.in',
    password: 'Admin@123',
    icon: ShieldCheck,
    cardBg: 'bg-indigo-50/70 hover:bg-indigo-100/80 border-indigo-200',
    iconBg: 'bg-indigo-600 text-white',
    textColor: 'text-indigo-950',
    activeRing: 'ring-2 ring-indigo-500',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    subtitle: 'Faculty',
    email: 'teacher@dps.edu.in',
    password: 'Teacher@123',
    icon: Users,
    cardBg: 'bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-200',
    iconBg: 'bg-emerald-600 text-white',
    textColor: 'text-emerald-950',
    activeRing: 'ring-2 ring-emerald-500',
  },
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Class 10',
    email: 'student@dps.edu.in',
    password: 'Student@123',
    icon: GraduationCap,
    cardBg: 'bg-sky-50/70 hover:bg-sky-100/80 border-sky-200',
    iconBg: 'bg-sky-600 text-white',
    textColor: 'text-sky-950',
    activeRing: 'ring-2 ring-sky-500',
  },
] as const;

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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const navigateTo = useCallback((target: string) => {
    window.location.replace(target);
  }, []);

  const executeLogin = (emailToUse: string, passwordToUse: string, roleKey?: string) => {
    setErrorMessage(null);
    setUserId(emailToUse);
    setPassword(passwordToUse);
    setActiveDemoRole(roleKey || null);

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
          setActiveDemoRole(null);
        }
      } catch {
        setErrorMessage('Unable to reach server. Please check your network connection.');
        setActiveDemoRole(null);
      }
    });
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userId.trim()) {
      setErrorMessage('Please enter your Email or Admission ID.');
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

  const handleGoogleLogin = () => {
    // If Clerk is configured, route to sign-in page which mounts Clerk with Google OAuth
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF9F6]">
      {/* ════════════════════════════════════════════════════════════
          LEFT PANEL — 3D INTERACTIVE PHONE ON STUDIO GRID BACKGROUND
          (Reference Image 2)
      ════════════════════════════════════════════════════════════ */}
      <section
        className="relative hidden lg:flex lg:w-[52%] xl:w-[54%] min-h-screen bg-[#F8FAFC] login-grid-pattern items-center justify-center overflow-hidden border-r border-slate-200/70"
        aria-label="Alpha Edu Hub 3D Interactive Preview"
      >
        {/* Top-Left: "Back" Pill Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md border border-slate-200 transition-all duration-200 group"
          title="Return to Home"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-all" />
          <span>Back</span>
        </Link>

        {/* 3D Phone with custom Alpha Edu Hub screen on glowing neon pedestal */}
        <div className="w-full max-w-[480px] h-[680px] flex items-center justify-center">
          <Phone3D />
        </div>

        {/* Bottom Tagline */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Unified School ERP · Next-Gen Digital Campus</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          MOBILE BRAND HEADER (Only visible on small viewports)
      ════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between shadow-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/images/dashboard/logo_crest.png"
              alt="Alpha Edu Hub"
              width={30}
              height={30}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="text-base font-black tracking-tight leading-tight">Alpha Edu Hub</div>
            <div className="text-[10px] text-blue-100 font-medium">School ERP Platform</div>
          </div>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* ════════════════════════════════════════════════════════════
          RIGHT PANEL — CLEAN MODERN LOGIN FORM
          (Reference Image 1: Macbease Clean Aesthetic)
      ════════════════════════════════════════════════════════════ */}
      <section className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-14 xl:px-20 py-10 lg:py-16 bg-[#FAF9F6] overflow-y-auto">
        <div className="w-full max-w-[420px] mx-auto">
          {!is2FaStep ? (
            /* ────────────────────────────────────────────────────────
               STEP 1: CREDENTIALS (STUDENT, TEACHER, ADMIN)
            ──────────────────────────────────────────────────────── */
            <>
              {/* Header Title */}
              <div className="mb-7">
                <h1 className="text-[28px] sm:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Login to <span className="text-[#0B84FE]">Alpha Edu Hub.</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
                  Welcome back! Please enter your institutional credentials.
                </p>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-3 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Field 1: Email Address / Admission ID */}
                <div>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
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
                      placeholder="Email address"
                      className="w-full h-[50px] sm:h-[52px] pl-11 pr-4 rounded-full border border-slate-200 bg-white text-sm sm:text-[14.5px] text-slate-800 placeholder-slate-400 font-medium transition-all shadow-2xs focus:border-[#0B84FE] focus:ring-4 focus:ring-sky-100 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
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
                      className="w-full h-[50px] sm:h-[52px] pl-11 pr-12 rounded-full border border-slate-200 bg-white text-sm sm:text-[14.5px] text-slate-800 placeholder-slate-400 font-medium transition-all shadow-2xs focus:border-[#0B84FE] focus:ring-4 focus:ring-sky-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Forgotten Password Link */}
                  <div className="flex justify-end mt-2 pr-1">
                    <Link
                      href="/login/forgot-password"
                      className="text-xs sm:text-[13px] text-slate-500 hover:text-[#0B84FE] font-medium transition-colors"
                    >
                      Forgotten password?
                    </Link>
                  </div>
                </div>

                {/* Primary Log In Button (Sky Blue as in Reference Image 1) */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-[50px] sm:h-[52px] rounded-full text-white text-base font-bold transition-all shadow-md shadow-sky-200/80 hover:shadow-lg hover:shadow-sky-300/80 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#86C2F4',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#68AFF0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#86C2F4')}
                >
                  {isPending && !activeDemoRole ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <span>Log In</span>
                  )}
                </button>

                {/* OR Divider Line */}
                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="px-3 text-xs font-semibold text-slate-400 tracking-wider">OR</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* "Log in with Google" Button (Reference Image 1) */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-[50px] sm:h-[52px] rounded-full border border-slate-200 bg-white hover:bg-slate-50/80 text-slate-700 font-bold text-sm sm:text-[14.5px] flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                </button>

                {/* Sign up Row (Reference Image 1) */}
                <div className="text-center pt-2">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/register/institution"
                      className="font-bold text-[#0B84FE] hover:text-blue-700 hover:underline transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>

                {/* ════════════════════════════════════════════════════
                    QUICK DEMO LOGINS (1-Click Tester Access)
                ════════════════════════════════════════════════════ */}
                <div className="pt-6 mt-6 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded-md bg-blue-100/70 text-blue-600">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-bold text-slate-900 tracking-tight">Demo Logins</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      1-Click Instant
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-500 mb-3 leading-snug">
                    Click any role below to test the full portal immediately:
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map((account) => {
                      const isThisPending = isPending && activeDemoRole === account.id;
                      const Icon = account.icon;

                      return (
                        <button
                          key={account.id}
                          type="button"
                          disabled={isPending}
                          onClick={() => executeLogin(account.email, account.password, account.id)}
                          title={`Instant login as ${account.title} (${account.email})`}
                          aria-label={`Demo sign in as ${account.title}`}
                          className={`group relative flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${account.cardBg} ${isThisPending ? account.activeRing : ''}`}
                        >
                          {isThisPending ? (
                            <div className="py-2 flex flex-col items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <span className="text-[9px] font-bold text-blue-600 mt-1">Entering...</span>
                            </div>
                          ) : (
                            <>
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-110 shadow-2xs ${account.iconBg}`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[11.5px] font-bold ${account.textColor} mt-1.5 leading-tight`}>
                                {account.title}
                              </span>
                              <span className="text-[9.5px] text-slate-500 font-medium leading-none mt-0.5">
                                {account.subtitle}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-center text-[11px] text-slate-400 gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      Demo Passwords:{' '}
                      <code className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded text-[10px] font-semibold">
                        Role@123
                      </code>
                    </span>
                  </div>
                </div>
              </form>
            </>
          ) : (
            /* ────────────────────────────────────────────────────────
               STEP 2: 2FA OTP VERIFICATION
            ──────────────────────────────────────────────────────── */
            <div className="animate-in fade-in slide-in-from-right-4 duration-200">
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
                  <label htmlFor="otp-input" className="block text-xs font-bold text-slate-700 mb-1.5 pl-1">
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
                    className="w-full h-[52px] text-center tracking-[10px] font-mono text-2xl font-black rounded-full border border-slate-200 bg-white text-slate-900 transition-all focus:border-[#0B84FE] focus:ring-4 focus:ring-sky-100 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || otpCode.length !== 6}
                  className="w-full h-[50px] sm:h-[52px] rounded-full text-white text-base font-bold transition-all shadow-md shadow-sky-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0B84FE' }}
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
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<BrandLoader fullScreen message="Loading login page" sublabel="Alpha Edu Hub" />}>
      <LoginForm />
    </Suspense>
  );
}
