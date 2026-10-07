import React from 'react';
import Image from 'next/image';

interface SchoolLogoProps {
  className?: string;
  size?: number;
}

export default function SchoolLogo({ className = '', size = 38 }: SchoolLogoProps) {
  return (
    <div
      className={`shrink-0 rounded-2xl bg-[#EEF6FF] border border-blue-100 flex items-center justify-center p-1 overflow-hidden shadow-xs ${className}`}
      style={{ width: size, height: size }}
      aria-label="Alpha Edu Hub Logo"
    >
      <Image
        src="/images/dashboard/logo_crest.png"
        alt="Alpha Edu Hub"
        width={size}
        height={size}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}
