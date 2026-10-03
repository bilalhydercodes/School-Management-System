'use client';

import React from 'react';

interface ScreenSkeletonProps {
  rows?: number;
  hasHeader?: boolean;
  hasCards?: boolean;
}

/**
 * Universal skeleton loader — shown instantly while the screen JS chunk loads.
 * Matches the card-based layout of portal screens so the transition feels seamless.
 */
export default function ScreenSkeleton({ rows = 4, hasHeader = true, hasCards = true }: ScreenSkeletonProps) {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Page header skeleton */}
      {hasHeader && (
        <div className="bg-white rounded-[22px] p-5 border border-blue-50/80 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded-lg" />
            <div className="h-3 w-72 bg-slate-100 rounded-md" />
          </div>
          <div className="h-9 w-24 bg-slate-100 rounded-xl" />
        </div>
      )}

      {/* Top stats cards */}
      {hasCards && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[18px] p-4 border border-blue-50/80 shadow-sm space-y-2">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-7 w-20 bg-slate-200 rounded-lg" />
              <div className="h-2 w-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Content rows */}
      <div className="bg-white rounded-[22px] p-6 border border-blue-50/80 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div
                  className="h-3 bg-slate-200 rounded"
                  style={{ width: `${60 + ((i * 17) % 35)}%` }}
                />
                <div
                  className="h-2.5 bg-slate-100 rounded"
                  style={{ width: `${40 + ((i * 13) % 40)}%` }}
                />
              </div>
              <div className="h-6 w-16 bg-slate-100 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Second content block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-[22px] p-6 border border-blue-50/80 shadow-sm space-y-3">
          <div className="h-4 w-32 bg-slate-200 rounded-lg" />
          {[70, 55, 80, 45].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-2.5 rounded-full bg-slate-100" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-[22px] p-6 border border-blue-50/80 shadow-sm space-y-3">
          <div className="h-4 w-32 bg-slate-200 rounded-lg" />
          {[85, 60, 70].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 rounded-xl bg-slate-100" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
