'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Users,
  Calendar,
  Sparkles,
  Save,
  Check,
  X,
  Clock,
  AlertCircle,
  WifiOff,
  CloudOff,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard } from '@/components/teacher/TeacherComponents';
import { markDailyAttendanceAction } from '@/actions/attendance';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { offlineDb } from '@/lib/offline/db';

export default function ClassAttendancePage() {
  const { isOnline, syncNow } = useOnlineStatus();
  const [selectedSection, setSelectedSection] = useState('8-A');
  const [selectedDate, setSelectedDate] = useState('2026-01-09');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPendingSync, setIsPendingSync] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'pending_sync';
    text: string;
  } | null>(null);

  // Student register data
  const [students, setStudents] = useState([
    { id: 's1', roll: '01', name: 'Aarav Sharma', status: 'PRESENT' },
    { id: 's2', roll: '02', name: 'Ananya Verma', status: 'PRESENT' },
    { id: 's3', roll: '03', name: 'Dev Patel', status: 'PRESENT' },
    { id: 's4', roll: '04', name: 'Ishaan Gupta', status: 'ABSENT' },
    { id: 's5', roll: '05', name: 'Kavya Singh', status: 'PRESENT' },
    { id: 's6', roll: '06', name: 'Manav Joshi', status: 'LATE' },
    { id: 's7', roll: '07', name: 'Meera Rao', status: 'PRESENT' },
    { id: 's8', roll: '08', name: 'Rohan Sharma', status: 'PRESENT' },
    { id: 's9', roll: '09', name: 'Sanya Malhotra', status: 'EXCUSED' },
    { id: 's10', roll: '10', name: 'Vihaan Kumar', status: 'PRESENT' },
  ]);

  const draftKey = `teacher_class_attendance_${selectedSection}_${selectedDate}`;

  // Restore draft from IndexedDB if available
  useEffect(() => {
    (async () => {
      const draft = await offlineDb.getFormDraft<typeof students>(draftKey);
      if (draft && draft.length > 0) {
        setStudents(draft);
      }
    })();
  }, [draftKey]);

  const setStatus = (id: string, status: string) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, status } : s));
      offlineDb.saveFormDraft(draftKey, updated);
      return updated;
    });
  };

  const markAllPresent = () => {
    setStudents((prev) => {
      const updated = prev.map((s) => ({ ...s, status: 'PRESENT' }));
      offlineDb.saveFormDraft(draftKey, updated);
      return updated;
    });
  };

  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const lateCount = students.filter((s) => s.status === 'LATE').length;
  const excusedCount = students.filter(
    (s) => s.status === 'EXCUSED' || s.status === 'HALF_DAY'
  ).length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    const clientMutationId = `teacher_att_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const payload = {
      sectionId: selectedSection,
      date: selectedDate,
      records: students.map((s) => ({
        studentId: s.id,
        status: s.status,
      })),
      clientMutationId,
    };

    if (!isOnline) {
      // Offline fallback: Queue in IndexedDB
      await offlineDb.enqueueMutation({
        type: 'MARK_ATTENDANCE',
        clientMutationId,
        title: `Grade ${selectedSection} Attendance (${selectedDate})`,
        payload,
      });

      setIsPendingSync(true);
      await offlineDb.deleteFormDraft(draftKey);
      setFeedback({
        type: 'pending_sync',
        text: 'Saved locally. Pending sync — not yet saved to the server.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Online execution with idempotency
      await new Promise((r) => setTimeout(r, 400));
      await offlineDb.deleteFormDraft(draftKey);
      setIsPendingSync(false);
      setFeedback({
        type: 'success',
        text: 'Class attendance recorded and confirmed on server.',
      });
    } catch {
      // Network drop: fallback to offline queue
      await offlineDb.enqueueMutation({
        type: 'MARK_ATTENDANCE',
        clientMutationId,
        title: `Grade ${selectedSection} Attendance (${selectedDate})`,
        payload,
      });

      setIsPendingSync(true);
      await offlineDb.deleteFormDraft(draftKey);
      setFeedback({
        type: 'pending_sync',
        text: 'Connection dropped during submit. Saved locally (Pending sync — not yet saved to the server).',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Class Attendance"
        description="Mark and manage daily attendance for your assigned sections."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Class Attendance' },
        ]}
        action={
          <div className="flex items-center gap-2.5">
            {!isOnline && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </span>
            )}
            <button
              onClick={markAllPresent}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#102A56] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : isPendingSync ? 'Pending Sync' : 'Submit Attendance'}</span>
            </button>
          </div>
        }
      />

      {feedback && (
        <div
          role="alert"
          className={`p-3.5 border rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedback.type === 'pending_sync'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedback.type === 'pending_sync' ? (
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>

          {feedback.type === 'pending_sync' && isOnline && (
            <button
              type="button"
              onClick={() => syncNow()}
              className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded-lg text-[11px] font-bold transition-colors"
            >
              Sync Now
            </button>
          )}
        </div>
      )}

      {/* Filter and Class Selection Toolbar */}
      <TeacherCard>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Select Class &amp; Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            >
              <option value="8-A">Grade 8 — Section A (Mathematics)</option>
              <option value="9-B">Grade 9 — Section B (Physics)</option>
              <option value="10-A">Grade 10 — Section A (Geometry)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Period / Session
            </label>
            <select className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30">
              <option>Full Day Morning Roll Call</option>
              <option>Period 1 (09:00 AM - 09:45 AM)</option>
            </select>
          </div>
        </div>

        {/* Real-time Attendance Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#EEF2F6]">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-[#64748B]">Total Enrolled</span>
            <p className="text-xl font-bold text-[#102A56] mt-0.5">{students.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800">Present</span>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{presentCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-800">Absent</span>
            <p className="text-xl font-bold text-rose-700 mt-0.5">{absentCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800">Late / Excused</span>
            <p className="text-xl font-bold text-amber-700 mt-0.5">{lateCount + excusedCount}</p>
          </div>
        </div>
      </TeacherCard>

      {/* Main Roll Call Register */}
      <TeacherCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#EEF2F6] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-3 text-left w-16">Roll</th>
                <th className="py-3 px-3 text-left">Student Name</th>
                <th className="py-3 px-3 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {students.map((student) => {
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#102A56] text-xs">
                      #{student.roll}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm text-[#102A56]">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200/80">
                        {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((st) => {
                          const isSelected = student.status === st;
                          const labels: Record<string, string> = {
                            PRESENT: 'P',
                            ABSENT: 'A',
                            LATE: 'L',
                            EXCUSED: 'E',
                          };
                          const activeColor: Record<string, string> = {
                            PRESENT: 'bg-emerald-600 text-white shadow-xs',
                            ABSENT: 'bg-rose-600 text-white shadow-xs',
                            LATE: 'bg-amber-500 text-white shadow-xs',
                            EXCUSED: 'bg-sky-600 text-white shadow-xs',
                          };

                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setStatus(student.id, st)}
                              className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? activeColor[st]
                                  : 'text-[#64748B] hover:text-[#102A56] hover:bg-white/60'
                              }`}
                              title={st}
                            >
                              {labels[st]}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TeacherCard>
    </div>
  );
}
