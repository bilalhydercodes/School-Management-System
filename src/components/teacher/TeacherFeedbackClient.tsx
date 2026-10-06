'use client';

import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Star,
  TrendingUp,
  ThumbsUp,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Users,
  Award,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard } from '@/components/teacher/TeacherComponents';
import type { TeacherFeedbackSummary } from '@/actions/feedback';

interface TeacherFeedbackClientProps {
  initialFeedback: TeacherFeedbackSummary | null;
  cycles: Array<{ id: string; title: string }>;
}

export default function TeacherFeedbackClient({
  initialFeedback,
  cycles,
}: TeacherFeedbackClientProps) {
  const [feedback, setFeedback] = useState<TeacherFeedbackSummary | null>(initialFeedback);
  const [selectedCycleId, setSelectedCycleId] = useState<string>(initialFeedback?.cycleId || '');

  const handleCycleChange = async (cId: string) => {
    setSelectedCycleId(cId);
    // Reload feedback for selected cycle
    const { getTeacherAggregatedFeedbackAction } = await import('@/actions/feedback');
    const res = await getTeacherAggregatedFeedbackAction(cId);
    if (res.success && res.feedback) {
      setFeedback(res.feedback);
    }
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Student Feedback & Experience Insights"
        description="Aggregated and anonymized evaluations from your assigned class sections and subject batches."
      />

      {/* Privacy Notice Strip */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-2xs text-[#0B72E7] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950">Strict Student Anonymity Enforced</h4>
            <p className="text-[11px] text-blue-700/90 mt-0.5">
              Individual student identities are protected by institutional policy. All ratings, suggestions, and comments shown below are strictly aggregated and decoupled from student profiles.
            </p>
          </div>
        </div>

        {cycles.length > 0 && (
          <div className="shrink-0">
            <select
              value={selectedCycleId}
              onChange={(e) => handleCycleChange(e.target.value)}
              className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0B72E7]"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!feedback || feedback.responseCount === 0 ? (
        <TeacherCard className="p-12 text-center max-w-md mx-auto">
          <MessageSquareHeart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Feedback Responses Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Students have not yet submitted feedback for this cycle or the evaluation period is underway.
          </p>
        </TeacherCard>
      ) : (
        <>
          {/* Top KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TeacherCard className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Responses</span>
              <div className="text-3xl font-black text-slate-900 mt-2">{feedback.responseCount}</div>
              <p className="text-xs text-slate-400 mt-1">Students evaluated your classes</p>
            </TeacherCard>

            <TeacherCard className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Rating</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-[#0B72E7]">{feedback.overallRating}</span>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(feedback.overallRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
            </TeacherCard>

            <TeacherCard className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Dimension</span>
              {(() => {
                const entries = Object.entries(feedback.categoryScores);
                const top = entries.sort((a, b) => b[1] - a[1])[0];
                return (
                  <>
                    <div className="text-lg font-bold text-slate-900 mt-2 truncate">
                      {top ? top[0] : 'Teaching Clarity'}
                    </div>
                    <p className="text-xs font-semibold text-emerald-600 mt-1">
                      {top ? `${top[1]} / 5.0 rating` : 'N/A'}
                    </p>
                  </>
                );
              })()}
            </TeacherCard>

            <TeacherCard className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cycle Trend</span>
              {feedback.historicalTrends.length > 1 ? (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-800">
                      {feedback.historicalTrends[feedback.historicalTrends.length - 1]?.rating} vs{' '}
                      {feedback.historicalTrends[feedback.historicalTrends.length - 2]?.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Compared to previous evaluation cycle</p>
                </div>
              ) : (
                <div className="mt-2 text-xs font-medium text-slate-400">
                  Baseline established for current academic year
                </div>
              )}
            </TeacherCard>
          </div>

          {/* Dimension Scores Breakdown */}
          <TeacherCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Teaching Dimensions Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(feedback.categoryScores).map(([cat, score]) => {
                const percentage = Math.min(100, Math.round((score / 5) * 100));
                return (
                  <div key={cat} className="space-y-1.5 p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/70">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat}</span>
                      <span className="font-black text-[#0B72E7]">{score} / 5.0</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0B72E7] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </TeacherCard>

          {/* Aggregated Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What Students Appreciate */}
            <TeacherCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <ThumbsUp className="w-4 h-4" />
                <h3 className="text-sm font-bold">Students Appreciate</h3>
              </div>
              <div className="space-y-2">
                {feedback.topStrengths.length === 0 ? (
                  <p className="text-xs text-slate-400">No specific strengths tagged yet</p>
                ) : (
                  feedback.topStrengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-emerald-950">{str.label}</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {str.count} mentions
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TeacherCard>

            {/* Students Would Like */}
            <TeacherCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Lightbulb className="w-4 h-4" />
                <h3 className="text-sm font-bold">Students Would Like</h3>
              </div>
              <div className="space-y-2">
                {feedback.topSuggestions.length === 0 ? (
                  <p className="text-xs text-slate-400">No suggestions recorded yet</p>
                ) : (
                  feedback.topSuggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-amber-950">{sug.label}</span>
                      <span className="font-bold text-amber-700 font-mono">
                        {sug.count} requests
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TeacherCard>
          </div>

          {/* Anonymized Student Comments */}
          {feedback.anonymizedComments.length > 0 && (
            <TeacherCard className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <MessageSquare className="w-4 h-4 text-[#0B72E7]" />
                  <h3 className="text-sm font-bold">Anonymized Student Comments</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {feedback.anonymizedComments.length} comments
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {feedback.anonymizedComments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs text-slate-700 leading-relaxed italic"
                  >
                    &ldquo;{comment}&rdquo;
                  </div>
                ))}
              </div>
            </TeacherCard>
          )}
        </>
      )}
    </div>
  );
}
