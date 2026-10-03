'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BrandLoader from '@/components/ui/BrandLoader';

interface GetStartedButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export default function GetStartedButton({
  children = 'Get Started',
  className = '',
  onClick,
  ariaLabel = 'Get Started',
}: GetStartedButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Eager prefetch in background as soon as component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const preloadImg = new window.Image();
      preloadImg.src = '/login_left_panel_image.png';
      router.prefetch('/login');
    }
  }, [router]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) onClick();
    setIsLoading(true);

    if (typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = '/login_left_panel_image.png';

      const proceed = () => {
        router.push('/login');
      };

      if (img.complete) {
        // If image is already fully loaded in memory, give it 10ms lead
        setTimeout(proceed, 10);
      } else {
        img.onload = () => {
          setTimeout(proceed, 10);
        };
        img.onerror = () => {
          proceed();
        };
        // Safety timeout so user is never blocked
        setTimeout(proceed, 500);
      }
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={className}
        aria-label={ariaLabel}
        disabled={isLoading}
      >
        {children}
      </button>

      {/* Loading animation overlay while waiting for login page & images */}
      {isLoading && (
        <BrandLoader
          message="Opening sign in portal"
          sublabel="Loading Alpha Edu Hub"
          fullScreen
        />
      )}
    </>
  );
}
