'use client';

import React, { useState, useTransition, Suspense, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Sparkles, GraduationCap, Users, ShieldCheck } from 'lucide-react';
import BrandLoader from '@/components/ui/BrandLoader';
import dynamic from 'next/dynamic';

// Lazy-load the 3D phone so it doesn't block first paint
const Phone3D = dynamic(() => import('@/components/login/Phone3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

/* ────────────────────────────────────────────────────────────
   INLINE SVG ICONS (keep bundle lean — no extra icon lib needed)
──────────────────────────────────────────────────────────── */

function MailIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

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

/* ────────────────────────────────────────────────────────────
   DEMO ACCOUNTS
──────────────────────────────────────────────────────────── */
const DEMO_ACCOUNTS = [
  {
    id: 'admin',
    title: 'Admin',
    subtitle: 'Management',
    email: 'admin@dps.edu.in',
    password: 'Admin@123',
    icon: ShieldCheck,
    cardBg: 'bg-indigo-50/60 hover:bg-indigo-50/90 border-indigo-200/80 hover:border-indigo-300',
    iconBg: 'bg-indigo-100 text-indigo-700',
    titleColor: 'text-[#0A1344]',
    activeRing: 'ring-2 ring-indigo-400',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    subtitle: 'Faculty',
    email: 'teacher@dps.edu.in',
    password: 'Teacher@123',
    icon: Users,
    cardBg: 'bg-emerald-50/60 hover:bg-emerald-50/90 border-emerald-200/80 hover:border-emerald-300',
    iconBg: 'bg-emerald-100 text-emerald-700',
    titleColor: 'text-[#0A1344]',
    activeRing: 'ring-2 ring-emerald-400',
  },
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Class 10',
    email: 'student@dps.edu.in',
    password: 'Student@123',
    icon: GraduationCap,
    cardBg: 'bg-violet-50/60 hover:bg-violet-50/90 border-violet-200/80 hover:border-violet-300',
    iconBg: 'bg-violet-100 text-violet-700',
    titleColor: 'text-[#0A1344]',
    activeRing: 'ring-2 ring-violet-400',
  },
] as const;

/* ────────────────────────────────────────────────────────────
   LOGIN FORM COMPONENT
──────────────────────────────────────────────────────────── */
function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect') ?? null;

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
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Redirect cleanly after successful login
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
        // Primary fast-path: use the REST API route (no server-action overhead)
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailToUse.trim(),
            password: passwordToUse.trim(),
          }),
        });

        if (!response.ok && response.status !== 401) {
          // Non-auth server error: throw to trigger fallback
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.redirectUrl) {
          navigateTo(redirectParam || result.redirectUrl);
        } else if (result.requiresOtp && result.challengeId) {
          setChallengeId(result.challengeId);
          setEmailHint(result.emailHint || null);
          setUserRole(result.role || null);
          setIs2FaStep(true);
        } else {
          setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
          setActiveDemoRole(null);
        }
      } catch {
        // Network-level failure only: server is unreachable
        setErrorMessage('Unable to reach server. Please check your network connection.');
        setActiveDemoRole(null);
      }
    });
  };

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

    executeLogin(userId, password);
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
        // Import server action lazily so it doesn't bloat the initial bundle
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



  return (
    <div className="login-page-root">
      {/* ═══════════════════════════════════════════════════════════
          LEFT PANEL — 3D Phone on Grid Background (Desktop only)
      ═══════════════════════════════════════════════════════════ */}
      <section className="login-left-panel" aria-label="Alpha Edu Hub 3D Preview">
        {/* Grid pattern background */}
        <div className="login-grid-bg" />

        {/* Back button */}
        <Link
          href="/"
          className="login-back-btn"
          title="Go back to Home"
          aria-label="Go back to Home"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back</span>
        </Link>

        {/* 3D Phone */}
        <div className="login-phone-container">
          <Phone3D />
        </div>

        {/* Brand tagline at bottom */}
        <div className="login-left-tagline">
          <span className="login-tagline-dot" />
          <span>Next-Gen School ERP — Powered by AI</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE BRAND HEADER — only on small screens
      ═══════════════════════════════════════════════════════════ */}
      <div className="login-mobile-header">
        <Link href="/" className="login-mobile-brand-link" title="Return to Home">
          <div className="login-mobile-logo-wrap">
            <Image
              src="/images/dashboard/logo_crest.png"
              alt="Alpha Edu Hub"
              width={38}
              height={38}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Alpha Edu Hub</h1>
            <p className="text-xs text-white/70 font-medium">Next-Gen School ERP</p>
          </div>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT PANEL — Login Form (Macbease-inspired)
      ═══════════════════════════════════════════════════════════ */}
      <section className="login-right-panel">
        <div className="login-form-container">
          {!is2FaStep ? (
            /* ════════════════════════════════════════════════════════
               STEP 1: CREDENTIALS
            ════════════════════════════════════════════════════════ */
            <>
              {/* Header */}
              <div className="login-form-header">
                <h1 className="login-title">
                  Login to{' '}
                  <span className="login-title-brand">Alpha Edu Hub.</span>
                </h1>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div
                  role="alert"
                  className="login-error-banner"
                >
                  <AlertCircleIcon className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form ref={formRef} onSubmit={handleCredentialsSubmit} className="login-form">
                {/* Email / ID field */}
                <div className="login-field">
                  <div className="login-input-wrap">
                    <MailIcon className="login-input-icon" />
                    <input
                      id="roll-number-input"
                      type="text"
                      required
                      autoComplete="username"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Email address"
                      className="login-input"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="login-field">
                  <div className="login-input-wrap">
                    <LockIcon className="login-input-icon" />
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="login-input login-input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-eye-btn"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="login-forgot-row">
                  <Link
                    href="/login/forgot-password"
                    className="login-forgot-link"
                  >
                    Forgotten password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="login-submit-btn"
                >
                  {isPending ? (
                    <>
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Log In</span>
                  )}
                </button>

                {/* Divider */}
                <div className="login-divider">
                  <span className="login-divider-line" />
                  <span className="login-divider-text">OR</span>
                  <span className="login-divider-line" />
                </div>

                {/* Registration Link */}
                <div className="login-register-row">
                  <p>
                    New institution?{' '}
                    <Link
                      href="/register/institution"
                      className="login-register-link"
                    >
                      Register your institution →
                    </Link>
                  </p>
                </div>

                {/* ─── DEMO LOGINS ─── */}
                <div className="login-demo-section">
                  <div className="login-demo-header">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded-md bg-blue-50 text-[#0C8CFE]">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[12px] font-bold text-[#000127] tracking-tight">
                        Demo Logins
                      </span>
                    </div>
                    <span className="login-demo-badge">
                      1-Click Access
                    </span>
                  </div>

                  <p className="login-demo-hint">
                    Click any role below to explore the portal instantly:
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
                          className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${account.cardBg} ${isThisPending ? account.activeRing : ''}`}
                        >
                          {isThisPending ? (
                            <div className="py-2 flex flex-col items-center justify-center">
                              <LoaderIcon className="w-4 h-4 animate-spin text-[#0C8CFE]" />
                              <span className="text-[9.5px] font-semibold text-[#0C8CFE] mt-1 leading-none">
                                Entering...
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-150 group-hover:scale-110 shadow-2xs ${account.iconBg}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[12px] font-bold ${account.titleColor} mt-1.5 leading-tight`}>
                                {account.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                                {account.subtitle}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="login-demo-footer">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Demo Passwords: <code className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded text-[10px] font-medium">Role@123</code></span>
                  </div>
                </div>
              </form>
            </>
          ) : (
            /* ════════════════════════════════════════════════════════
               STEP 2: 2FA OTP VERIFICATION
            ════════════════════════════════════════════════════════ */
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
                  className="login-error-banner"
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
                    className="w-full h-[50px] text-center tracking-[8px] font-mono text-xl font-bold rounded-full border border-[#E2E8F0] bg-white text-[#0A1344] transition-all focus:border-[#008CFF] focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || otpCode.length !== 6}
                  className="login-submit-btn mt-5"
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

      {/* ═══════════════════════════════════════════════════════════
          SCOPED STYLES
      ═══════════════════════════════════════════════════════════ */}
      <style jsx>{`
        /* ── Page Root: Full-screen split layout ────────────────── */
        .login-page-root {
          display: flex;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          overflow: hidden;
        }

        /* ── LEFT PANEL ──────────────────────────────────────────── */
        .login-left-panel {
          display: none;
          position: relative;
          width: 55%;
          min-height: 100vh;
          background: #f5f6f8;
          overflow: hidden;
          flex-shrink: 0;
        }

        @media (min-width: 1024px) {
          .login-left-panel {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        /* Grid pattern */
        .login-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* Back button */
        .login-back-btn {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 30;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 50px;
          background: white;
          color: #1e293b;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.06);
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .login-back-btn:hover {
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
          transform: translateX(-2px);
        }

        /* Phone container */
        .login-phone-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          height: 620px;
        }

        /* Bottom tagline */
        .login-left-tagline {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          white-space: nowrap;
        }
        .login-tagline-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        /* ── MOBILE HEADER ───────────────────────────────────────── */
        .login-mobile-header {
          display: none;
        }

        @media (max-width: 1023px) {
          .login-mobile-header {
            display: block;
            background: linear-gradient(135deg, #0C8CFE 0%, #0066CC 100%);
            padding: 28px 24px 20px;
          }
        }

        .login-mobile-brand-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .login-mobile-logo-wrap {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        /* ── RIGHT PANEL ─────────────────────────────────────────── */
        .login-right-panel {
          flex: 1;
          background: #f5f5f0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          overflow-y: auto;
        }

        @media (min-width: 1024px) {
          .login-right-panel {
            padding: 48px 56px;
          }
        }

        @media (max-width: 1023px) {
          .login-page-root {
            flex-direction: column;
          }
          .login-right-panel {
            min-height: 0;
            flex: 1;
          }
        }

        /* ── FORM CONTAINER ──────────────────────────────────────── */
        .login-form-container {
          width: 100%;
          max-width: 380px;
        }

        /* Title */
        .login-title {
          font-size: 26px;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }
        .login-title-brand {
          color: #0C8CFE;
        }

        @media (min-width: 640px) {
          .login-title { font-size: 30px; }
        }

        .login-form-header {
          margin-bottom: 28px;
        }

        /* Error banner */
        .login-error-banner {
          margin-top: 12px;
          margin-bottom: 4px;
          padding: 10px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #b91c1c;
          font-size: 12px;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Input field wrapper */
        .login-field {}

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 16px;
          width: 16px;
          height: 16px;
          color: #94a3b8;
          pointer-events: none;
          z-index: 2;
        }

        .login-input {
          width: 100%;
          height: 52px;
          padding-left: 44px;
          padding-right: 16px;
          border-radius: 50px;
          border: 1.5px solid #e2e8f0;
          background: white;
          font-size: 14px;
          color: #1a1a2e;
          transition: all 0.15s ease;
          outline: none;
        }
        .login-input::placeholder {
          color: #a0a4b8;
          font-weight: 400;
        }
        .login-input:focus {
          border-color: #0C8CFE;
          box-shadow: 0 0 0 3px rgba(12, 140, 254, 0.1);
        }

        .login-input-password {
          padding-right: 48px;
        }

        .login-eye-btn {
          position: absolute;
          right: 14px;
          padding: 4px;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.15s;
          background: none;
          border: none;
          z-index: 2;
        }
        .login-eye-btn:hover { color: #64748b; }

        /* Forgot password */
        .login-forgot-row {
          text-align: right;
          margin-top: -4px;
        }
        .login-forgot-link {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s;
        }
        .login-forgot-link:hover {
          color: #0C8CFE;
        }

        /* Submit button */
        .login-submit-btn {
          width: 100%;
          height: 52px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(135deg, #7DBFFF 0%, #5BB0FF 50%, #7DBFFF 100%);
          color: white;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(91, 176, 255, 0.3);
          letter-spacing: 0.01em;
        }
        .login-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #6DB5FF 0%, #4AA5FF 50%, #6DB5FF 100%);
          box-shadow: 0 6px 22px rgba(91, 176, 255, 0.4);
          transform: translateY(-1px);
        }
        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divider */
        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .login-divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .login-divider-text {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        /* Register row */
        .login-register-row {
          text-align: center;
        }
        .login-register-row p {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        .login-register-link {
          font-weight: 700;
          color: #0C8CFE;
          text-decoration: none;
          transition: color 0.15s;
        }
        .login-register-link:hover {
          color: #0066CC;
          text-decoration: underline;
        }

        /* Demo section */
        .login-demo-section {
          border-top: 1px solid #e8e8e0;
          padding-top: 16px;
          margin-top: 2px;
        }
        .login-demo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .login-demo-badge {
          font-size: 10px;
          font-weight: 700;
          color: #0C8CFE;
          background: #eff6ff;
          padding: 3px 8px;
          border-radius: 20px;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }
        .login-demo-hint {
          font-size: 11.5px;
          color: #7F81A6;
          margin-bottom: 10px;
          line-height: 1.4;
        }
        .login-demo-footer {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   PAGE EXPORT
──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <Suspense fallback={<BrandLoader fullScreen message="Loading login page" sublabel="Alpha Edu Hub" />}>
      <LoginForm />
    </Suspense>
  );
}
