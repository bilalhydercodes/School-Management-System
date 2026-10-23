'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Calendar,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  HeartPulse,
  SunMedium,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { StatCard, TeacherCard } from '@/components/teacher/TeacherComponents';
import { submitTeacherLeaveAction } from '@/actions/teacher-portal';

export default function ApplyLeavePage() {
  const router = useRouter();
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('2026-01-15');
  const [endDate, setEndDate] = useState('2026-01-16');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; ref?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a reason for the leave request.' });
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFeedback({ type: 'error', message: 'End date cannot be earlier than start date.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await submitTeacherLeaveAction({
        leaveType: leaveType as any,
        startDate,
        endDate,
        reason: reason.trim(),
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || 'Leave request submitted successfully.',
          ref: res.referenceNo,
        });
        setTimeout(() => {
          router.push('/teacher/leave/status');
        }, 1600);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to submit leave request.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'A network error occurred while submitting your leave request.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Apply Leave"
        description="Submit a formal leave application for school principal and HR approval."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Apply Leave' },
        ]}
        action={
          <Link
            href="/teacher/leave/status"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#102A56] hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>View Leave History</span>
          </Link>
        }
      />

      {feedback && (
        <div
          className={`p-3.5 border rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          {feedback.ref && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-mono text-[11px]">
              {feedback.ref}
            </span>
          )}
        </div>
      )}

      {/* Leave Balance Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="CASUAL LEAVE"
          value="8 Days"
          subtext="Available balance for 2026"
          icon={SunMedium}
          variant="yellow"
        />
        <StatCard
          label="SICK LEAVE"
          value="10 Days"
          subtext="Medical leave available"
          icon={HeartPulse}
          variant="peach"
        />
        <StatCard
          label="EARNED LEAVE"
          value="14 Days"
          subtext="Annual accrued leave"
          icon={Briefcase}
          variant="purple"
        />
      </div>

      {/* Leave Request Form */}
      <TeacherCard className="max-w-2xl">
        <div className="pb-4 border-b border-[#EEF2F6]">
          <h3 className="text-base font-bold text-[#102A56]">Leave Application Form</h3>
          <p className="text-xs text-[#64748B]">All fields are reviewed by Principal & Timetable Coordinator</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            >
              <option value="CASUAL">Casual Leave (CL)</option>
              <option value="SICK">Sick / Medical Leave (SL)</option>
              <option value="EARNED">Earned / Privilege Leave (EL)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              />
            </div>
          </div>

          <div>
            <label htmlFor="leave-reason" className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Reason for Absence
            </label>
            <textarea
              id="leave-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for leave (e.g. family function, medical appointment)..."
              className="w-full p-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs text-[#102A56] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-[#EEF2F6] flex justify-end gap-3">
            <Link
              href="/teacher"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#102A56] transition-colors"
            >
              Cancel
            </Link>
            <button
              id="submit-leave-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </div>
        </form>
      </TeacherCard>
    </div>
  );
}
