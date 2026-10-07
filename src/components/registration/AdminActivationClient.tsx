'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  School,
  User,
} from 'lucide-react';
import { activateAdminAccountAction } from '@/actions/superadmin-requests';

interface Props {
  token: string;
  institutionName: string;
  adminEmail: string;
  adminName: string;
}

export default function AdminActivationClient({
  token,
  institutionName,
  adminEmail,
  adminName,
}: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    startTransition(async () => {
      const res = await activateAdminAccountAction({ token, password });
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.error || 'Failed to activate account. The link may have expired.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-[#EEF6FF] border border-blue-100 flex items-center justify-center p-0.5 shadow-2xs overflow-hidden">
              <Image
                src="/images/dashboard/logo_crest.png"
                alt="Alpha Edu Hub"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight block group-hover:text-blue-600 transition-colors">
                Alpha Edu Hub
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Account Activation
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {!isSuccess ? (
            <>
              {/* Top Emblem */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Activate Administrator Account
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Create your administrator password to activate your school management console.
                </p>
              </div>

              {/* Institution & Admin Target Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <School className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    Institution: <strong className="text-slate-900 font-semibold">{institutionName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    Administrator: <strong className="text-slate-900 font-semibold">{adminName}</strong> ({adminEmail})
                  </span>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating Account...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Activate Account</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-black text-slate-900">
                Administrator Account Activated!
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your credentials have been securely stored. You can now log in to the Alpha Edu Hub portal to access your school dashboard and start onboarding your teachers, staff, and students.
              </p>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        <p>Alpha Edu Hub &bull; Multi-Tenant School & College Management Operating System</p>
      </footer>
    </div>
  );
}
