'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  ShieldAlert,
  Loader2,
  AlertCircle,
  FileText,
  History,
  RefreshCw,
} from 'lucide-react';
import {
  submitStudentLeaveAction,
  getStudentLeaveRequestsAction,
  type StudentLeaveRequestItem,
} from '@/actions/portal-requests';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  className: string;
  sectionName: string;
}

export default function LeaveRequestModal({
  isOpen,
  onClose,
  studentName,
  className,
  sectionName,
}: LeaveRequestModalProps) {
  const [activeTab, setActiveTab] = useState<'apply' | 'history'>('apply');
  const [leaveType, setLeaveType] = useState('Medical / Sick Leave');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [reason, setReason] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+91 98112 34567');

  // Async States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ requestId: string } | null>(null);

  // History State
  const [requests, setRequests] = useState<StudentLeaveRequestItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadLeaveHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await getStudentLeaveRequestsAction();
      if (res.success && res.requests) {
        setRequests(res.requests);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadLeaveHistory();
    }
  }, [isOpen, loadLeaveHistory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage('End date cannot be earlier than start date.');
      return;
    }

    if (reason.trim().length < 5) {
      setErrorMessage('Please provide a reason of at least 5 characters.');
      return;
    }

    if (!guardianPhone.trim()) {
      setErrorMessage('Guardian phone number is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitStudentLeaveAction({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
        guardianPhone: guardianPhone.trim(),
      });

      if (res.success && res.requestId) {
        setSuccessInfo({ requestId: res.requestId });
        setReason('');
        // Re-fetch request history so it appears immediately
        await loadLeaveHistory();
      } else {
        setErrorMessage(res.error || 'Failed to submit leave application.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during submission.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-[24px] shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Leave Management</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {studentName} (Class {className}-{sectionName})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100/70 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'apply'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              loadLeaveHistory();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Leave History & Status ({requests.length})</span>
          </button>
        </div>

        {activeTab === 'apply' ? (
          <div>
            {successInfo && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold">Leave application successfully registered!</span>
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    Reference ID: <strong>{successInfo.requestId}</strong>. Mentors and attendance staff have been notified.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700"
                >
                  View Status
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Category of Leave
                </label>
                <select
                  disabled={isSubmitting}
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#2563EB] outline-none disabled:bg-slate-50"
                >
                  <option>Medical / Sick Leave</option>
                  <option>Family Emergency / Bereavement</option>
                  <option>Sanctioned Academic / Sports Representation</option>
                  <option>Religious / Festival Observance</option>
                  <option>Prior Planned Absence</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    disabled={isSubmitting}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] outline-none disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    disabled={isSubmitting}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] outline-none disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Reason / Detailed Explanation
                </label>
                <textarea
                  required
                  rows={3}
                  disabled={isSubmitting}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the specific reason for absence (min 5 characters)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none resize-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Parent / Guardian Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  disabled={isSubmitting}
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] outline-none disabled:bg-slate-50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Leave Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* History & Status Tab */
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-slate-500 font-medium">
                Showing all recorded leave applications
              </span>
              <button
                type="button"
                onClick={loadLeaveHistory}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                <span>Retrieving leave records...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No leave applications submitted yet</p>
                <p className="text-[11px] text-slate-400">
                  Applications submitted by you or your guardian will appear here with live review statuses.
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600">{req.requestId}</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-800">
                    {req.leaveType}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duration: <strong>{req.startDate}</strong> to <strong>{req.endDate}</strong></span>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-100">
                    Reason: {req.reason}
                  </p>

                  {req.adminRemarks && (
                    <div className="text-[10px] text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700">Remarks:</span> {req.adminRemarks}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
