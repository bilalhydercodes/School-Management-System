import React from 'react';
import Link from 'next/link';
import { verifyActivationTokenAction } from '@/actions/superadmin-requests';
import AdminActivationClient from '@/components/registration/AdminActivationClient';
import { AlertCircle, ShieldAlert, ArrowLeft } from 'lucide-react';

interface ActivatePageProps {
  searchParams: {
    token?: string;
  };
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Activate Administrator Account — Alpha Edu Hub',
  description: 'Set your administrator password and activate your multi-tenant school workspace on Alpha Edu Hub.',
};

export default async function ActivateAccountPage({ searchParams }: ActivatePageProps) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Missing Activation Token</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            No valid activation token was provided in the URL. Please verify that you copied the complete link from your approval email.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verification = await verifyActivationTokenAction(token);

  if (!verification.success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Activation Link Invalid or Expired</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {verification.error || 'This activation link is invalid, expired, or has already been used.'}
          </p>
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="block w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminActivationClient
      token={token}
      institutionName={verification.institutionName || 'Your Institution'}
      adminEmail={verification.adminEmail || ''}
      adminName={verification.adminName || 'Administrator'}
    />
  );
}
