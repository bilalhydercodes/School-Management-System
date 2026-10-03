'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction, verifyLoginOtpAction } from '@/actions/auth';
import BrandLoader from '@/components/ui/BrandLoader';

function EyeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function LoaderIcon({ className = 'w-4 h-4 animate-spin' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function AlertCircleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ShieldCheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  // Step 1: Credentials
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: 2FA State (For Teachers, Admins, SuperAdmins)
  const [is2FaStep, setIs2FaStep] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userId.trim()) {
      setErrorMessage('Please enter your Roll Number / Admission ID or Email.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userId.trim(),
            password: password.trim(),
          }),
        });

        const result = await response.json();

        if (result.success && result.redirectUrl) {
          setIsNavigating(true);
          const target = redirectParam || result.redirectUrl;
          router.push(target);
          router.refresh();
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname !== target) {
              window.location.href = target;
            }
          }, 800);
        } else {
          setIsNavigating(false);
          setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
        }
      } catch (fetchErr) {
        // Fallback to Server Action
        try {
          const result = await loginAction({
            email: userId.trim(),
            password: password.trim(),
          });

          if (result.success && result.redirectUrl) {
            setIsNavigating(true);
            const target = redirectParam || result.redirectUrl;
            router.push(target);
            router.refresh();
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.location.pathname !== target) {
                window.location.href = target;
              }
            }, 800);
          } else {
            setIsNavigating(false);
            setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
          }
        } catch {
          setIsNavigating(false);
          setErrorMessage('Unable to reach server. Please check your network connection.');
        }
      }
    });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!challengeId) {
      setErrorMessage('Session challenge expired. Please sign in again.');
      setIs2FaStep(false);
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await verifyLoginOtpAction({
          challengeId,
          otp: otpCode.trim(),
        });

        if (result.success && result.redirectUrl) {
          setIsNavigating(true);
          const target = redirectParam || result.redirectUrl;
          router.push(target);
          router.refresh();
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname !== target) {
              window.location.href = target;
            }
          }, 800);
        } else {
          setIsNavigating(false);
          setErrorMessage(result.error || 'Invalid or expired OTP code.');
        }
      } catch {
        setIsNavigating(false);
        setErrorMessage('A network error occurred during verification.');
      }
    });
  };

  if (isNavigating) {
    return <BrandLoader message="Preparing your workspace..." sublabel="Alpha Edu Hub" />;
  }

  return (
    <div
      className="min-h-screen w-full overflow-auto flex items-center justify-center p-4 sm:p-6 bg-[#CBE9FE] select-none"
      style={{
        backgroundImage: "url('/bg-atmosphere.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <main className="relative bg-white rounded-[20px] sm:rounded-[26px] overflow-hidden flex flex-col lg:flex-row border border-white/70 shadow-[0_20px_50px_-10px_rgba(15,45,95,0.16)] w-full max-w-[1055px] min-h-0">

        {/* LEFT COLUMN: BRANDING & SCHOOL ILLUSTRATION — hidden on mobile, shown on lg+ */}
        <section
          className="hidden lg:block relative shrink-0 overflow-hidden"
          style={{
            width: '588px',
            minHeight: '632px',
          }}
          aria-label="Alpha Edu Hub Overview"
        >
          <Image
            src="/login_left_panel_image.png"
            alt="Empowering Brighter Tomorrows - Alpha Edu Hub"
            fill
            priority
            sizes="588px"
            className="object-cover object-center pointer-events-none select-none"
          />
          <div className="sr-only">
            <h1>Alpha Edu Hub</h1>
            <p>Next-Gen School ERP · Manage · Grow · Excel</p>
            <h2>Empowering Brighter Tomorrows</h2>
            <p>A simple, unified platform to manage students, classes, teachers and school operations.</p>
          </div>
        </section>

        {/* MOBILE BRAND HEADER — only shown on mobile/tablet */}
        <div className="lg:hidden bg-gradient-to-br from-[#0C8CFE] to-[#0066CC] px-6 pt-8 pb-6 text-white">
          <Link href="/" className="flex items-center gap-3 mb-2 group inline-flex transition-opacity hover:opacity-90" title="Return to Public Dashboard">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src="/images/dashboard/logo_transparent_bg.png"
                alt="Alpha Edu Hub"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Alpha Edu Hub</h1>
              <p className="text-xs text-white/70 font-medium">Next-Gen School ERP</p>
            </div>
          </Link>
          <p className="text-sm text-white/80 leading-snug">
            Manage · Grow · Excel — Your unified school platform
          </p>
        </div>

        {/* RIGHT COLUMN: LOGIN / 2FA OTP FORM PANEL */}
        <section className="flex-1 bg-white flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-[68px] lg:pr-[50px] select-auto">
          <div className="w-full max-w-[349px] mx-auto lg:mx-0">
            {!is2FaStep ? (
              /* =================================================== */
              /* STEP 1: CREDENTIALS (STUDENT, PARENT, TEACHER, ADMIN) */
              /* =================================================== */
              <>
                <h1 className="font-bold leading-none text-[26px] sm:text-[30px] text-[#000127]" style={{ letterSpacing: '-0.025em' }}>
                  Welcome Back
                </h1>
                <p className="text-[13px] sm:text-[13.5px] text-[#7F81A6] mt-2">
                  Sign in to your Alpha Edu Hub account
                </p>

                {errorMessage && (
                  <div
                    role="alert"
                    className="mt-3 p-2.5 bg-red-50/90 border border-red-200 rounded-[10px] flex items-start gap-2 text-red-700 text-xs animate-in fade-in"
                  >
                    <AlertCircleIcon className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleCredentialsSubmit} className="mt-7">
                  {/* Field 1: Roll Number / Admission ID / Email */}
                  <div>
                    <label
                      htmlFor="roll-number-input"
                      className="block font-semibold text-[12.5px] text-[#0A1344] mb-2"
                    >
                      Roll Number / Admission ID / Email
                    </label>
                    <input
                      id="roll-number-input"
                      type="text"
                      required
                      autoComplete="username"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="e.g. 101 or teacher@school.com"
                      className="w-full h-[47px] px-5 rounded-[11px] border border-[#E2E8F0] bg-white text-[13.5px] text-[#0A1344] transition-all font-normal focus:border-[#008CFF] focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20"
                    />
                  </div>

                  {/* Field 2: Password */}
                  <div className="mt-5">
                    <label
                      htmlFor="password-input"
                      className="block font-semibold text-[12.5px] text-[#0A1344] mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full h-[47px] pl-5 pr-11 rounded-[11px] border border-[#E2E8F0] bg-white text-[13.5px] text-[#0A1344] transition-all font-normal focus:border-[#008CFF] focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3.5 -translate-y-1/2 p-1 transition-colors hover:opacity-80 cursor-pointer text-[#8789AD]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right mt-3">
                    <Link
                      href="/login/forgot-password"
                      className="text-[12.5px] text-[#0080FE] font-medium hover:underline transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-[48px] mt-5 rounded-[11px] text-white text-[14.5px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 hover:brightness-105 active:brightness-95"
                    style={{
                      backgroundColor: '#0C8CFE',
                      boxShadow: '0 6px 18px rgba(12, 140, 254, 0.35)',
                    }}
                  >
                    {isPending ? (
                      <>
                        <LoaderIcon className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="4" y1="12" x2="20" y2="12"></line>
                          <polyline points="13 5 20 12 13 19"></polyline>
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Quick Demo Logins Pill Selector */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Demo Accounts Quick-Fill:
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUserId('admin@dps.edu.in');
                          setPassword('Admin@123');
                          setErrorMessage(null);
                        }}
                        className="py-1 px-1.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[11px] font-medium text-slate-600 transition-colors text-center"
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserId('teacher@dps.edu.in');
                          setPassword('Teacher@123');
                          setErrorMessage(null);
                        }}
                        className="py-1 px-1.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[11px] font-medium text-slate-600 transition-colors text-center"
                      >
                        Teacher
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserId('student@dps.edu.in');
                          setPassword('Student@123');
                          setErrorMessage(null);
                        }}
                        className="py-1 px-1.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[11px] font-medium text-slate-600 transition-colors text-center"
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserId('superadmin@schoolerp.in');
                          setPassword('SuperAdmin@123');
                          setErrorMessage(null);
                        }}
                        className="py-1 px-1.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[11px] font-medium text-slate-600 transition-colors text-center"
                      >
                        Super
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              /* =================================================== */
              /* STEP 2: 2FA OTP VERIFICATION (TEACHER, ADMIN, SUPERADMIN) */
              /* =================================================== */
              <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-[#008CFF]">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#008CFF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {userRole === 'TEACHER' ? 'Teacher 24h Session' : 'Admin Security 2FA'}
                  </span>
                </div>

                <h1 className="font-bold leading-none text-[22px] sm:text-[26px] text-[#000127]" style={{ letterSpacing: '-0.025em' }}>
                  Verify Your Identity
                </h1>
                <p className="text-[13px] text-[#7F81A6] mt-2 leading-normal">
                  Enter the 6-digit verification code dispatched to <strong>{emailHint || 'your contact'}</strong>.
                </p>

                {errorMessage && (
                  <div
                    role="alert"
                    className="mt-3 p-2.5 bg-red-50/90 border border-red-200 rounded-[10px] flex items-start gap-2 text-red-700 text-xs animate-in fade-in"
                  >
                    <AlertCircleIcon className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="mt-6">
                  <div>
                    <label
                      htmlFor="otp-code-input"
                      className="block font-semibold text-[12.5px] text-[#0A1344] mb-2"
                    >
                      6-Digit Security Code
                    </label>
                    <input
                      id="otp-code-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full h-[50px] text-center tracking-[8px] font-mono text-xl font-bold rounded-[11px] border border-[#E2E8F0] bg-white text-[#0A1344] transition-all focus:border-[#008CFF] focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || otpCode.length !== 6}
                    className="w-full h-[48px] mt-5 rounded-[11px] text-white text-[14.5px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 hover:brightness-105 active:brightness-95"
                    style={{
                      backgroundColor: '#0C8CFE',
                      boxShadow: '0 6px 18px rgba(12, 140, 254, 0.35)',
                    }}
                  >
                    {isPending ? (
                      <>
                        <LoaderIcon className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Sign In</span>
                        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="4" y1="12" x2="20" y2="12"></line>
                          <polyline points="13 5 20 12 13 19"></polyline>
                        </svg>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between mt-4 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIs2FaStep(false);
                        setOtpCode('');
                        setErrorMessage(null);
                      }}
                      className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      ← Back to Login
                    </button>
                    <span className="text-slate-400">Valid for 10 minutes</span>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<BrandLoader message="Preparing sign in..." sublabel="Alpha Edu Hub" />}>
      <LoginForm />
    </Suspense>
  );
}
