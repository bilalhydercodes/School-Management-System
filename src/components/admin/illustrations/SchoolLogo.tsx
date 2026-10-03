'use client';

import React from 'react';
import Image from 'next/image';

interface SchoolLogoProps {
  className?: string;
  size?: number;
}

export default function SchoolLogo({ className = '', size = 42 }: SchoolLogoProps) {
  return (
    <div
      className={`shrink-0 flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-label="Alpha Edu Hub Logo"
    >
      <Image
        src="/images/dashboard/logo_transparent_bg.png"
        alt="Alpha Edu Hub"
        width={size}
        height={size}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}
