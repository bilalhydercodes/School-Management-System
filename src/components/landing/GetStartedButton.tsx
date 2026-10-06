'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  // Eager prefetch in background as soon as component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      router.prefetch('/register/institution');
    }
  }, [router]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) onClick();
    router.push('/register/institution');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
