import React from 'react';

export default function AdminSkeleton() {
  return (
    <div className="w-full space-y-5 animate-pulse" aria-busy="true" aria-live="polite">
      {/* ─── Top Page Header Shimmer ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(11,114,231,0.03)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-slate-200 rounded-md" />
            <div className="h-3 w-3 bg-slate-200 rounded-full" />
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
          </div>
          <div className="h-7 w-52 sm:w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-40 sm:w-80 bg-slate-200 rounded-md" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* ─── KPI Stats Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
              <div className="h-7 w-16 bg-slate-200 rounded-md" />
              <div className="h-3 w-28 bg-slate-200 rounded-md" />
            </div>
            <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0" />
          </div>
        ))}
      </div>

      {/* ─── Main Content Container (Search + Table) ───────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)] p-4 sm:p-6 space-y-5">
        {/* Search Bar & Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="h-10 w-full sm:w-72 bg-slate-200 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-slate-200 rounded-xl" />
            <div className="h-10 w-28 bg-slate-200 rounded-xl" />
            <div className="h-10 w-10 bg-slate-200 rounded-xl" />
          </div>
        </div>

        {/* Table Skeleton Header */}
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
            <div className="hidden sm:block h-4 w-24 bg-slate-200 rounded-md" />
            <div className="hidden md:block h-4 w-28 bg-slate-200 rounded-md" />
            <div className="h-4 w-20 bg-slate-200 rounded-md" />
            <div className="h-4 w-12 bg-slate-200 rounded-md" />
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div
                key={row}
                className="px-4 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                {/* Column 1: Avatar + Name + Subtext */}
                <div className="flex items-center gap-3 min-w-0 w-48 sm:w-60">
                  <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="h-3.5 w-3/4 bg-slate-200 rounded-md" />
                    <div className="h-2.5 w-1/2 bg-slate-200 rounded-md" />
                  </div>
                </div>

                {/* Column 2: Badge/Category */}
                <div className="hidden sm:block">
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                </div>

                {/* Column 3: Secondary Meta */}
                <div className="hidden md:block space-y-1 w-32">
                  <div className="h-3 w-24 bg-slate-200 rounded-md" />
                  <div className="h-2.5 w-16 bg-slate-200 rounded-md" />
                </div>

                {/* Column 4: Status Indicator */}
                <div className="w-20">
                  <div className="h-5 w-16 bg-slate-200 rounded-md" />
                </div>

                {/* Column 5: Action Button */}
                <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Footer Shimmer */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-36 bg-slate-200 rounded-md" />
          <div className="flex items-center gap-1.5">
            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
