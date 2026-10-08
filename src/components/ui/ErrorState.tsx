'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  errorId?: string;
  onRetry?: () => void;
  showHome?: boolean;
  showBack?: boolean;
  isNotFound?: boolean;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this part of Alpha Edu Hub. Your data is safe.',
  errorId,
  onRetry,
  showHome = true,
  showBack = false,
  isNotFound = false,
}: ErrorStateProps) {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
      <div className={`p-4 rounded-full mb-6 ${isNotFound ? 'bg-slate-100' : 'bg-red-50'}`}>
        <AlertTriangle className={`w-8 h-8 ${isNotFound ? 'text-slate-400' : 'text-red-500'}`} />
      </div>
      
      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      {errorId && (
        <div className="mb-6 px-3 py-1 bg-slate-100 rounded-md border border-slate-200">
          <span className="text-xs font-mono text-slate-500">Reference: {errorId}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Try again
          </button>
        )}

        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        )}

        {showHome && (
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
