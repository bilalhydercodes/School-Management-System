'use client';

import { useEffect, useState } from 'react';
import ErrorState from '@/components/ui/ErrorState';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState<string>('');

  useEffect(() => {
    const id = error.digest || `AEH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setErrorId(id);
    // Log to error service
    console.error(`[ROUTE-ERROR] [${id}]`, error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 p-4 m-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
        <ErrorState
          title="Something went wrong"
          message="We couldn't load this section of Alpha Edu Hub. Your data is safe."
          errorId={errorId}
          onRetry={reset}
          showHome={true}
        />
      </div>
    </div>
  );
}
