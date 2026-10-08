'use client';

import ErrorState from '@/components/ui/ErrorState';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <ErrorState
        title="Page not found"
        message="This page may have been moved or the resource no longer exists."
        isNotFound={true}
        showBack={true}
        showHome={true}
      />
    </div>
  );
}
