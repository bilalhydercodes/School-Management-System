import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ variant, children, dot = false, className = '' }: StatusBadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-[#26C281] border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    error: 'bg-red-50 text-red-600 border-red-100',
    info: 'bg-blue-50 text-[#1F51FF] border-blue-100',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const dotColors = {
    success: 'bg-[#26C281]',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-[#1F51FF]',
    neutral: 'bg-gray-500',
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${variants[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
