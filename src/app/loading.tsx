import React from 'react';

export default function RootLoading() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 animate-in fade-in duration-150">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs backdrop-blur-sm">
        <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-[#008CFF] animate-spin" />
        <span className="text-xs font-semibold text-slate-600">Loading...</span>
      </div>
    </div>
  );
}
