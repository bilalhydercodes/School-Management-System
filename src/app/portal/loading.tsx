import React from 'react';
import ScreenSkeleton from '@/components/portal/ScreenSkeleton';

export default function PortalLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <ScreenSkeleton />
    </div>
  );
}
