import React from 'react';

export default function TeacherSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse" aria-busy="true" aria-live="polite">
      {/* ─── Top Teacher Page Header Shimmer ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-[22px] border border-white/80 shadow-[0_4px_20px_rgba(30,100,200,0.04)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-sky-100 rounded-md" />
            <div className="h-3 w-3 bg-sky-200 rounded-full" />
            <div className="h-4 w-28 bg-sky-100 rounded-md" />
          </div>
          <div className="h-6 w-48 sm:w-60 bg-slate-200 rounded-lg" />
          <div className="h-3.5 w-36 sm:w-72 bg-slate-200 rounded-md" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-24 bg-sky-100/70 rounded-xl" />
          <div className="h-9 w-32 bg-blue-200/80 rounded-xl" />
        </div>
      </div>

      {/* ─── Faculty Metrics / Class Status Grid ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-sm p-4 rounded-[20px] border border-white/80 shadow-[0_2px_12px_rgba(30,100,200,0.03)] flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded-md" />
              <div className="h-6 w-14 bg-slate-200 rounded-md" />
              <div className="h-2.5 w-24 bg-slate-200 rounded-md" />
            </div>
            <div className="w-10 h-10 bg-sky-100 rounded-xl shrink-0" />
          </div>
        ))}
      </div>

      {/* ─── Main Content Area (Roster / Timetable / Marks Grid) ────────── */}
      <div className="bg-white rounded-[24px] border border-white/90 shadow-[0_4px_24px_rgba(30,100,200,0.05)] p-4 sm:p-6 space-y-4">
        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="h-9 w-full sm:w-64 bg-slate-100 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-slate-100 rounded-xl" />
            <div className="h-9 w-24 bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* List / Table Shimmer */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
            <div className="hidden sm:block h-3.5 w-20 bg-slate-200 rounded-md" />
            <div className="hidden md:block h-3.5 w-24 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-20 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-14 bg-slate-200 rounded-md" />
          </div>

          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div
                key={row}
                className="px-4 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 w-44 sm:w-56">
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="h-3.5 w-3/4 bg-slate-200 rounded-md" />
                    <div className="h-2.5 w-1/2 bg-slate-200 rounded-md" />
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                </div>

                <div className="hidden md:block space-y-1 w-28">
                  <div className="h-3 w-20 bg-slate-200 rounded-md" />
                  <div className="h-2 w-12 bg-slate-200 rounded-md" />
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
