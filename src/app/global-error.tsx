'use client';

import { useEffect, useState } from 'react';
import ErrorState from '@/components/ui/ErrorState';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState<string>('');

  useEffect(() => {
    // Generate an ID for reference if digest isn't available
    const id = error.digest || `AEH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setErrorId(id);
    
    // In production, log to monitoring service here using the id
    console.error(`[GLOBAL-ERROR] [${id}]`, error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full mx-4">
            <ErrorState
              title="Application Error"
              message="A critical error occurred while loading the application. We've been notified and are looking into it. Your data remains secure."
              errorId={errorId}
              onRetry={() => {
                reset();
                window.location.reload();
              }}
              showHome={false}
            />
          </div>
        </div>
      </body>
    </html>
  );
}
