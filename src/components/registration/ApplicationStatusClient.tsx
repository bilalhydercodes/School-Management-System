'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  Building,
  Mail,
  User,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

import type { ApplicationStatus } from '@prisma/client';

export interface ApplicationRecord {
  id: string;
  applicationNumber: string;
  institutionName: string;
  institutionType: string;
  officialEmail: string;
  officialPhone?: string | null;
  administratorName: string;
  administratorEmail: string;
  administratorPhone?: string | null;
  administratorDesignation?: string | null;
  status: ApplicationStatus;
  rejectionReason?: string | null;
  activationToken?: string | null;
  activatedAt?: Date | string | null;
  createdAt: Date | string;
}

interface Props {
  application: ApplicationRecord;
}

export default function ApplicationStatusClient({ application }: Props) {
  const [copied, setCopied] = useState(false);

  const isApproved = application.status === 'APPROVED';
  const isRejected = application.status === 'REJECTED';
  const isUnderReview =
    application.status === 'PENDING' || application.status === 'UNDER_REVIEW';

  const copyReference = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(application.applicationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(application.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen md:h-[100dvh] md:max-h-[100dvh] flex flex-col bg-[#F8FAFC] text-slate-800 antialiased overflow-x-hidden md:overflow-hidden justify-between">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* COMPACT APPLICATION HEADER                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20 shadow-2xs">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-2xl bg-[#EEF6FF] border border-blue-100 flex items-center justify-center p-0.5 shadow-2xs group-hover:bg-blue-100/70 transition-colors overflow-hidden">
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
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base leading-none group-hover:text-blue-600 transition-colors">
                Alpha Edu Hub
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md leading-normal">
                Institution Application Tracking
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
        >
          <span>Return to Home</span>
        </Link>
      </header>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* WORKSPACE TRACKING BODY                                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col justify-start md:justify-center items-center">
        <div className="w-full max-w-4xl my-auto space-y-4 sm:space-y-5">
          {/* Status Hero Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 text-center">
            {isApproved ? (
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3 shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : isRejected ? (
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 mb-3 shadow-2xs">
                <AlertCircle className="w-6 h-6" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-3 shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isApproved
                ? 'Institution Approved'
                : isRejected
                ? 'Application Requires Attention'
                : 'Application Submitted Successfully'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
              {isApproved
                ? 'Your institution has been approved. An activation invitation has been sent to the primary administrator.'
                : isRejected
                ? 'Our review team was unable to complete verification. Please review the note below or contact our onboarding support desk.'
                : 'Thank you for your submission. Your application has been logged and is in our verification queue.'}
            </p>
          </div>

          {/* 2-Column Balanced Dashboard (Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Left Card: Application Reference & Institution Profile */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
              <div>
                {/* Header & Monospace Reference Number with Copy */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    APPLICATION REFERENCE
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs sm:text-sm font-bold text-blue-700 bg-blue-50/80 border border-blue-100 px-2.5 py-0.5 rounded-lg tracking-wider">
                      {application.applicationNumber}
                    </span>
                    <button
                      type="button"
                      onClick={copyReference}
                      title="Copy Reference Number"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-slate-400 text-[11px] block">Institution</span>
                      <strong className="text-slate-900 font-semibold truncate block">
                        {application.institutionName}
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        {application.institutionType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-slate-400 text-[11px] block">Administrator</span>
                      <strong className="text-slate-900 font-semibold block">
                        {application.administratorName}
                      </strong>
                      {application.administratorDesignation && (
                        <span className="text-[11px] text-slate-500">
                          {application.administratorDesignation}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-slate-400 text-[11px] block">Contact Email</span>
                      <strong className="text-slate-800 font-semibold truncate block">
                        {application.officialEmail}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[11px] block">Submitted On</span>
                      <strong className="text-slate-800 font-semibold">{formattedDate}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge Footer */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Current Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                    isApproved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                      : isRejected
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                      : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isRejected ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                  )}
                  <span>
                    {isApproved
                      ? 'Approved'
                      : isRejected
                      ? 'Requires Attention'
                      : 'Under Review'}
                  </span>
                </span>
              </div>
            </div>

            {/* Right Card: Verification Progression Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
              <div>
                <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    APPLICATION TIMELINE
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    5 Progression Stages
                  </span>
                </div>

                <div className="space-y-3.5 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Info submitted */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="pt-0.5">
                      <h3 className="text-xs font-bold text-slate-900 leading-none">
                        Information submitted
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Institution parameters and contact profile logged securely.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Request received */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="pt-0.5">
                      <h3 className="text-xs font-bold text-slate-900 leading-none">
                        Request received
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Dispatched acknowledgment confirmation to {application.administratorEmail}.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Under review */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-all ${
                        isApproved
                          ? 'bg-emerald-500 text-white'
                          : isRejected
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white ring-4 ring-blue-100'
                      }`}
                    >
                      {isApproved ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : isRejected ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <h3
                        className={`text-xs font-bold leading-none ${
                          isUnderReview ? 'text-blue-700' : 'text-slate-900'
                        }`}
                      >
                        Under review
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Our platform team is verifying your institution details and academic scope.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Institution approval */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isApproved
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : 'bg-slate-100 border border-slate-300 text-slate-400'
                      }`}
                    >
                      {isApproved ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <h3
                        className={`text-xs font-bold leading-none ${
                          isApproved ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        Institution approval
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Once approved, your institution workspace will be provisioned.
                      </p>
                    </div>
                  </div>

                  {/* Step 5: Account activation */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        application.activatedAt
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : 'bg-slate-100 border border-slate-300 text-slate-400'
                      }`}
                    >
                      {application.activatedAt ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <h3
                        className={`text-xs font-bold leading-none ${
                          application.activatedAt ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        Account activation
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        The primary administrator will receive a secure activation invitation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Note or Rejection Reason */}
              {isRejected && application.rejectionReason && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-snug">
                  <span className="font-bold block mb-0.5">Reviewer Feedback:</span>
                  {application.rejectionReason}
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            {isApproved ? (
              <>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Public Website</span>
                </Link>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    href={`/register/activate${
                      application.activationToken ? `?token=${application.activationToken}` : ''
                    }`}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Activate Administrator Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            ) : isRejected ? (
              <>
                <Link
                  href="/register/institution"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Submit New Application</span>
                </Link>
                <a
                  href="mailto:support@alphaeduhub.in?subject=Application Inquiry"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Contact Onboarding Support</span>
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors order-2 sm:order-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Website</span>
                </Link>
                <div className="flex items-center gap-2 text-xs text-slate-500 order-1 sm:order-2 w-full sm:w-auto justify-end">
                  <span className="hidden md:inline">Already have an activated workspace?</span>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <span>Sign in &rarr;</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Compact Footnote */}
      <footer className="h-12 shrink-0 border-t border-slate-200/80 bg-white px-4 flex items-center justify-center text-center text-[11px] text-slate-400">
        Alpha Edu Hub &bull; Multi-Tenant Educational Operating System &bull; Secure Institution Portal
      </footer>
    </div>
  );
}
