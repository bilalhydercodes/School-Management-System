'use client';

import React from 'react';
import ConnectivityBanner from './ConnectivityBanner';

export default function OfflineProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ConnectivityBanner />
    </>
  );
}
