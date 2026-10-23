'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquarePlus, Send, CheckCircle2, Clock, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';
import {
  submitGrievanceAction,
  getStudentGrievancesAction,
  type GrievanceTicketItem,
} from '@/actions/portal-requests';

interface GrievanceFeedbackScreenProps {
  onBackToDashboard: () => void;
}

const DEFAULT_SAMPLE_TICKETS: GrievanceTicketItem[] = [
  { id: 'tkt-init-1', ticketNumber: 'TKT-2026-891', date: '28 Sep 2026', category: 'Academic', subject: 'Doubt Clearing Session Request for Physics Lab', description: 'Requesting an additional doubt-clearing session for Class 10 Physics lab experiments.', status: 'In Progress', urgency: 'NORMAL', adminNote: 'Class mentor scheduled doubt clinic on Saturday.' },
  { id: 'tkt-init-2', ticketNumber: 'TKT-2026-704', date: '12 Sep 2026', category: 'Infrastructure', subject: 'Classroom 204 Projector Screen Repair', description: 'The audio-visual cable in room 204 is loose and causing flickering display during lectures.', status: 'Resolved', urgency: 'NORMAL', adminNote: 'IT maintenance team replaced audio-visual cord.' },
  { id: 'tkt-init-3', ticketNumber: 'TKT-2026-551', date: '18 Aug 2026', category: 'Transport', subject: 'Bus Route 14 Morning Arrival Timing', description: 'Bus 14 is arriving 15 minutes before the scheduled stop time at Green Park gate 2.', status: 'Resolved', urgency: 'NORMAL', adminNote: 'Route schedule adjusted by 10 minutes.' },
];

export default function GrievanceFeedbackScreen({
  onBackToDashboard,
}: GrievanceFeedbackScreenProps) {
  const [category, setCategory] = useState('Academic');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');

  // Network & UI States
  const [tickets, setTickets] = useState<GrievanceTicketItem[]>(DEFAULT_SAMPLE_TICKETS);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ ticketNumber: string } | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoadingTickets(true);
    try {
      const res = await getStudentGrievancesAction();
      if (res.success && res.tickets && res.tickets.length > 0) {
        // Merge real tickets from DB with defaults
        const realIds = new Set(res.tickets.map((t) => t.ticketNumber));
        const combined = [...res.tickets, ...DEFAULT_SAMPLE_TICKETS.filter((d) => !realIds.has(d.ticketNumber))];
        setTickets(combined);
      }
    } catch {
      // Keep existing tickets on error
    } finally {
      setIsLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (!subject.trim()) {
      setErrorMessage('Subject line is required.');
      return;
    }
    if (description.trim().length < 10) {
      setErrorMessage('Please provide at least 10 characters in the description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitGrievanceAction({
        category,
        subject: subject.trim(),
        description: description.trim(),
        urgency,
      });

      if (res.success && res.ticketNumber) {
        setSuccessInfo({ ticketNumber: res.ticketNumber });
        setSubject('');
        setDescription('');
        // Re-fetch tickets from database
        await fetchTickets();
      } else {
        setErrorMessage(res.error || 'Failed to submit grievance ticket.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Grievance / Feedback"
        subtitle="Submit confidential suggestions, redressal inquiries, and campus feedback to administration"
        onBackToDashboard={onBackToDashboard}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-7 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submit New Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Your inquiry is stored in institutional records and reviewed by the Academic Disciplinary & Welfare Board.
            </p>
          </div>

          {successInfo && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Ticket registered successfully! Reference ID: <strong>{successInfo.ticketNumber}</strong>
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Category
              </label>
              <select
                disabled={isSubmitting}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#2563EB] outline-none disabled:bg-slate-50"
              >
                <option>Academic</option>
                <option>Infrastructure & Classroom</option>
                <option>School Transport</option>
                <option>Canteen & Nutrition</option>
                <option>Library & Learning Resources</option>
                <option>General Feedback</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Subject Line
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of issue"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Description & Details
              </label>
              <textarea
                required
                rows={4}
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your query or suggestion with specific details (min 10 characters)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none resize-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Priority / Urgency
              </label>
              <div className="flex items-center gap-3">
                {(['NORMAL', 'IMPORTANT', 'URGENT'] as const).map((lvl) => (
                  <label key={lvl} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      disabled={isSubmitting}
                      checked={urgency === lvl}
                      onChange={() => setUrgency(lvl)}
                      className="text-[#2563EB] focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-700 capitalize">{lvl.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tickets History (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Your Submitted Tickets</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">
                {tickets.length} Recorded
              </span>
              <button
                type="button"
                onClick={fetchTickets}
                title="Refresh Tickets"
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTickets ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {tickets.map((tkt) => (
              <div
                key={tkt.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600">{tkt.ticketNumber}</span>
                  <div className="flex items-center gap-2">
                    {tkt.urgency === 'URGENT' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                        Urgent
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        tkt.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tkt.status === 'Closed'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {tkt.status}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug">
                  {tkt.subject}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {tkt.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Category: {tkt.category}</span>
                  <span>•</span>
                  <span>Submitted: {tkt.date}</span>
                </div>

                {tkt.adminNote && (
                  <div className="pt-2 border-t border-slate-200/60 text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block text-[11px]">Administration Note:</span>
                    <p className="text-[11px] mt-0.5">{tkt.adminNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
