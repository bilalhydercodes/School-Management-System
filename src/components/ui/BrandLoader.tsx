'use client';

import React from 'react';
import Image from 'next/image';

export interface BrandLoaderProps {
  /**
   * Main status message displayed beneath the logo emblem.
   * @default 'Preparing your workspace'
   */
  message?: string;
  /**
   * Small brand label beneath the main message.
   * @default 'Alpha Edu Hub'
   */
  sublabel?: string;
  /**
   * Whether the loader should fill the entire viewport or fit its container.
   * @default true
   */
  fullScreen?: boolean;
  /**
   * Optional custom CSS classes for the root container.
   */
  className?: string;
  /**
   * Visual size variant for the central logo emblem.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    container: 'w-16 h-16',
    logo: 36,
    ring: 'w-20 h-20',
    title: 'text-sm',
    badge: 'text-[10px]',
  },
  md: {
    container: 'w-24 h-24 sm:w-28 sm:h-28',
    logo: 56,
    ring: 'w-28 h-28 sm:w-32 sm:h-32',
    title: 'text-base sm:text-lg',
    badge: 'text-xs',
  },
  lg: {
    container: 'w-32 h-32 sm:w-36 sm:h-36',
    logo: 72,
    ring: 'w-36 h-36 sm:w-40 sm:h-40',
    title: 'text-lg sm:text-xl',
    badge: 'text-xs',
  },
};

export default function BrandLoader({
  message = 'Preparing your workspace',
  sublabel = 'Alpha Edu Hub',
  fullScreen = true,
  className = '',
  size = 'md',
}: BrandLoaderProps) {
  const config = sizeConfig[size] || sizeConfig.md;

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-[9999] h-screen w-screen bg-[#F3F4F6] flex flex-col items-center justify-center select-none overflow-hidden'
    : 'relative w-full min-h-[300px] bg-[#F3F4F6] rounded-2xl flex flex-col items-center justify-center p-8 select-none';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Alpha Edu Hub"
      className={`${containerClasses} ${className}`}
    >
      {/* Background ambient subtle gradient or atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(29, 140, 253, 0.08) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Central Logo Emblem with Spinner Ring */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Spinner Ring */}
          <div
            className={`absolute ${config.ring} rounded-full border-2 border-slate-200/80 border-t-[#008CFF] border-r-[#008CFF]/40 motion-safe:animate-spin pointer-events-none`}
            style={{
              animationDuration: '1.2s',
            }}
          />

          {/* Glowing Aura */}
          <div
            className={`absolute ${config.container} rounded-full bg-blue-400/20 blur-xl motion-safe:animate-pulse pointer-events-none`}
          />

          {/* White Emblem Badge with Shadow */}
          <div
            className={`relative ${config.container} rounded-full bg-white border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.08)] flex items-center justify-center p-3.5 sm:p-4 overflow-hidden transform transition-transform duration-300 hover:scale-105`}
          >
            <Image
              src="/images/dashboard/logo_transparent_bg.png"
              alt="Alpha Edu Hub Logo"
              width={config.logo}
              height={config.logo}
              priority
              className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-7 sm:mt-8 space-y-1.5 flex flex-col items-center">
          <p
            className={`${config.title} font-bold text-slate-800 tracking-tight flex items-center gap-1.5`}
          >
            <span>{message}</span>
            <span className="inline-flex gap-0.5 text-[#008CFF] font-black motion-safe:animate-pulse">
              <span className="inline-block animate-[bounce_1.4s_infinite_0.1s]">.</span>
              <span className="inline-block animate-[bounce_1.4s_infinite_0.2s]">.</span>
              <span className="inline-block animate-[bounce_1.4s_infinite_0.3s]">.</span>
            </span>
          </p>

          {/* Brand Sublabel Badge */}
          {sublabel && (
            <span
              className={`${config.badge} font-bold uppercase tracking-[0.18em] text-[#008CFF] bg-blue-50/90 border border-blue-100/90 px-3 py-0.5 rounded-full shadow-2xs mt-1`}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
