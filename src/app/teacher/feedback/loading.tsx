import React from 'react';

export default function TeacherFeedbackLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-14 bg-slate-200/70 rounded-2xl w-1/3" />
      <div className="h-16 bg-blue-100/50 rounded-2xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-44 bg-slate-200/60 rounded-3xl" />
        <div className="h-44 bg-slate-200/60 rounded-3xl" />
        <div className="h-44 bg-slate-200/60 rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-200/60 rounded-3xl" />
        <div className="h-80 bg-slate-200/60 rounded-3xl" />
      </div>
    </div>
  );
}
