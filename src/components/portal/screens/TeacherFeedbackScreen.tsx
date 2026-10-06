'use client';

import React, { useState, useEffect } from 'react';
import PortalPageHeader from '../PortalPageHeader';
import {
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Star,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  ChevronLeft,
  MessageSquare,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  getStudentFeedbackDataAction,
  submitFeedbackAction,
} from '@/actions/feedback';
import type { FeedbackAnswerInput } from '@/lib/validations/feedback';

interface TeacherFeedbackScreenProps {
  onBackToDashboard: () => void;
}

export default function TeacherFeedbackScreen({ onBackToDashboard }: TeacherFeedbackScreenProps) {
  const [loading, setLoading] = useState(true);
  const [feedbackContext, setFeedbackContext] = useState<any>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // Form State
  const [answers, setAnswers] = useState<Record<string, FeedbackAnswerInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ success?: string; error?: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getStudentFeedbackDataAction();
    if (res.success && res.assignedTeachers) {
      setFeedbackContext(res);
      // Auto-select first pending teacher if available
      const pendingTeacher = res.assignedTeachers.find((t: any) => !t.hasSubmitted);
      if (pendingTeacher) {
        setSelectedTeacherId(pendingTeacher.teacherId);
      } else if (res.assignedTeachers.length > 0) {
        setSelectedTeacherId(res.assignedTeachers[0].teacherId);
      }
    }
    setLoading(false);
  };

  const selectedTeacher = feedbackContext?.assignedTeachers?.find(
    (t: any) => t.teacherId === selectedTeacherId
  );

  const gradeGroup = feedbackContext?.student?.gradeGroup || 'MIDDLE';
  const questions = feedbackContext?.template?.questions || [];

  const handleRatingChange = (questionId: string, val: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        ratingValue: val,
      },
    }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        textValue: text.slice(0, 500),
      },
    }));
  };

  const handleOptionToggle = (questionId: string, optVal: string) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.selectedOptions || [];
      const updated = current.includes(optVal)
        ? current.filter((v: string) => v !== optVal)
        : [...current, optVal];
      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId,
          selectedOptions: updated,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !feedbackContext?.activeCycle?.id) return;

    setIsSubmitting(true);
    setSubmitFeedback(null);

    const answersList = Object.values(answers);
    const res = await submitFeedbackAction({
      teacherId: selectedTeacherId,
      feedbackCycleId: feedbackContext.activeCycle.id,
      subjectId: selectedTeacher?.subjects[0]?.id,
      answers: answersList,
    });

    if (res.success) {
      setSubmitFeedback({ success: res.message });
      // Reset answers & reload
      setAnswers({});
      setTimeout(() => {
        setSubmitFeedback(null);
        loadData();
      }, 1500);
    } else {
      setSubmitFeedback({ error: res.error || 'Failed to submit feedback.' });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B72E7] mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-500">Loading Teacher Feedback...</p>
      </div>
    );
  }

  if (!feedbackContext || !feedbackContext.activeCycle) {
    return (
      <div className="space-y-6">
        <PortalPageHeader
          title="Teacher Feedback"
          subtitle="Share your classroom learning experience with your subject mentors"
          onBackToDashboard={onBackToDashboard}
        />
        <div className="bg-white rounded-[22px] border border-slate-200/80 p-8 text-center max-w-md mx-auto">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Active Feedback Cycle</h3>
          <p className="text-xs text-slate-500 mt-1">
            Teacher evaluation is currently closed. You will be notified when the next academic cycle opens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Teacher Feedback"
        subtitle={`Active Cycle: ${feedbackContext.activeCycle.title} · ${feedbackContext.student.className}-${feedbackContext.student.sectionName}`}
        onBackToDashboard={onBackToDashboard}
      />

      {/* Privacy Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-2xs text-[#0B72E7] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950">100% Anonymous Feedback</h4>
            <p className="text-[11px] text-blue-700/90 mt-0.5">
              Your identity, admission number, and name are NEVER revealed to your teachers. Teachers only receive aggregated scores and suggestions to improve lessons.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-[#0B72E7]">
          {gradeGroup.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Teacher Selection Row */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Select Your Teacher ({feedbackContext.assignedTeachers.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {feedbackContext.assignedTeachers.map((t: any) => {
            const isSelected = selectedTeacherId === t.teacherId;
            return (
              <button
                key={t.teacherId}
                type="button"
                onClick={() => {
                  setSelectedTeacherId(t.teacherId);
                  setSubmitFeedback(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#0B72E7] ring-2 ring-blue-100 shadow-md'
                    : 'bg-white border-slate-200/80 hover:border-blue-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold text-xs">
                      {t.teacherName.charAt(0)}
                    </div>
                    {t.hasSubmitted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{t.teacherName}</h4>
                  <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                    {t.subjects.map((s: any) => s.name).join(', ')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Questionnaire Form */}
      {selectedTeacher && (
        <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B72E7]">
                Evaluating
              </span>
              <h3 className="text-base font-black text-slate-900">{selectedTeacher.teacherName}</h3>
              <p className="text-xs text-slate-500">
                Subjects: {selectedTeacher.subjects.map((s: any) => `${s.name} (${s.code})`).join(', ')}
              </p>
            </div>
            {selectedTeacher.hasSubmitted && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Submitted for this cycle
              </div>
            )}
          </div>

          {submitFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                submitFeedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {submitFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{submitFeedback.success || submitFeedback.error}</span>
            </div>
          )}

          {selectedTeacher.hasSubmitted ? (
            <div className="py-8 text-center max-w-sm mx-auto space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Feedback Already Submitted</h4>
              <p className="text-xs text-slate-500">
                You have already shared your thoughts for {selectedTeacher.teacherName} during this feedback cycle.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question list dynamically rendered based on Grade Group */}
              <div className="space-y-6">
                {questions.map((q: any, qIdx: number) => {
                  const currentAns = answers[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B72E7] block mb-0.5">
                            {q.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {qIdx + 1}. {q.questionText}
                          </h4>
                          {q.helperText && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{q.helperText}</p>
                          )}
                        </div>
                      </div>

                      {/* FOUNDATION UX (EMOJI_RATING) */}
                      {q.questionType === 'EMOJI_RATING' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                          {q.options.map((opt: any) => {
                            const valNum = parseInt(opt.value, 10);
                            const isSelected = currentAns?.ratingValue === valNum;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleRatingChange(q.id, valNum)}
                                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-blue-50 border-[#0B72E7] ring-2 ring-blue-200 shadow-sm'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-3xl select-none">{opt.emoji || '🙂'}</span>
                                <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* RATING SCALE (1 - 5) for PRIMARY / MIDDLE / SECONDARY / SENIOR SECONDARY */}
                      {q.questionType === 'RATING' && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isSelected = currentAns?.ratingValue === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleRatingChange(q.id, val)}
                                className={`w-12 h-12 rounded-xl font-black text-sm border transition-all flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#0B72E7] border-[#0B72E7] text-white shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                          <span className="text-[11px] font-semibold text-slate-400 ml-2">
                            (1: Needs Improvement · 5: Outstanding)
                          </span>
                        </div>
                      )}

                      {/* MULTI_SELECT SUGGESTIONS / STRENGTHS */}
                      {q.questionType === 'MULTI_SELECT' && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {q.options.map((opt: any) => {
                            const isSelected =
                              currentAns?.selectedOptions?.includes(opt.value) || false;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleOptionToggle(q.id, opt.value)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  isSelected
                                    ? 'bg-blue-50 border-[#0B72E7] text-[#0B72E7] shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* OPTIONAL TEXT COMMENT (MAX 500 CHARACTERS) */}
                      {q.questionType === 'TEXT' && (
                        <div className="space-y-1 pt-1">
                          <textarea
                            rows={3}
                            maxLength={500}
                            value={currentAns?.textValue || ''}
                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                            placeholder="Share constructive, polite suggestions to help your teacher..."
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#0B72E7] resize-none"
                          />
                          <div className="flex justify-end text-[10px] text-slate-400 font-mono">
                            {(currentAns?.textValue || '').length} / 500 characters
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  By submitting, you confirm this feedback is fair and constructive.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0B72E7] hover:bg-[#095bc0] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Anonymously
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
