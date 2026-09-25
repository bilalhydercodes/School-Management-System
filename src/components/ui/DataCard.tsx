import React from 'react';

interface DataCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function DataCard({ children, className = '', hover = false }: DataCardProps) {
  return (
    <div
      className={`bg-white rounded-[22px] border border-[#EBF0F5] p-6 shadow-[0_2px_14px_rgba(19,32,51,0.03)] ${
        hover ? 'hover:shadow-[0_10px_25px_-4px_rgba(19,32,51,0.08)] hover:-translate-y-0.5 transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
