import React from 'react';

export default function SuperAdminSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
      {/* ─── Top SaaS Page Header Shimmer ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-purple-100 rounded-md" />
            <div className="h-3 w-3 bg-purple-200 rounded-full" />
            <div className="h-4 w-32 bg-purple-100 rounded-md" />
          </div>
          <div className="h-7 w-56 sm:w-72 bg-slate-200 rounded-lg" />
          <div className="h-3.5 w-48 sm:w-96 bg-slate-200 rounded-md" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-28 bg-slate-100 rounded-xl" />
          <div className="h-9 w-36 bg-purple-200/80 rounded-xl" />
        </div>
      </div>

      {/* ─── Global SaaS KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
              <div className="h-7 w-20 bg-slate-200 rounded-md" />
              <div className="h-3 w-28 bg-slate-200 rounded-md" />
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-2xl border border-purple-100 shrink-0" />
          </div>
        ))}
      </div>

      {/* ─── Main Table / Grid Container ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="h-10 w-full sm:w-72 bg-slate-100 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 bg-slate-100 rounded-xl" />
            <div className="h-10 w-24 bg-slate-100 rounded-xl" />
            <div className="h-10 w-10 bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
            <div className="hidden sm:block h-4 w-24 bg-slate-200 rounded-md" />
            <div className="hidden md:block h-4 w-28 bg-slate-200 rounded-md" />
            <div className="h-4 w-20 bg-slate-200 rounded-md" />
            <div className="h-4 w-12 bg-slate-200 rounded-md" />
          </div>

          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div
                key={row}
                className="px-4 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 w-48 sm:w-64">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="h-3.5 w-3/4 bg-slate-200 rounded-md" />
                    <div className="h-2.5 w-1/2 bg-slate-200 rounded-md" />
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                </div>

                <div className="hidden md:block space-y-1 w-32">
                  <div className="h-3 w-24 bg-slate-200 rounded-md" />
                  <div className="h-2.5 w-16 bg-slate-200 rounded-md" />
                </div>

                <div className="w-20">
                  <div className="h-5 w-16 bg-slate-200 rounded-md" />
                </div>

                <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
