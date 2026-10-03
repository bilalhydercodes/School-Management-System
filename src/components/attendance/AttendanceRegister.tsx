'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronDown,
  Search,
  Users,
  Check,
  X,
  Clock,
  Save,
  Loader2,
  RefreshCw,
  Lock,
  Edit2,
  WifiOff,
  CloudOff,
  Layers,
} from 'lucide-react';
import {
  getSectionAttendanceRosterAction,
  markDailyAttendanceAction,
} from '@/actions/attendance';
import type {
  StudentRosterItem,
  SectionInfo,
} from '@/services/attendance.service';
import type { AttendanceStatus } from '@prisma/client';
import { offlineDb } from '@/lib/offline/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface AttendanceRegisterProps {
  initialSections: SectionInfo[];
  defaultSectionId?: string;
  defaultDate?: string;
}

export function AttendanceRegister({
  initialSections,
  defaultSectionId,
  defaultDate,
}: AttendanceRegisterProps) {
  const { isOnline, syncNow, pendingCount } = useOnlineStatus();
  const todayStr = defaultDate || new Date().toISOString().split('T')[0];

  const [sections] = useState<SectionInfo[]>(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    defaultSectionId || initialSections[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isPendingSync, setIsPendingSync] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);

  // Status feedback: null | success | error | pending_sync
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'pending_sync';
    text: string;
    canRetry?: boolean;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const draftFormKey = `attendance_${selectedSectionId}_${selectedDate}`;

  // Load roster whenever section or date changes (with offline IndexedDB fallback)
  const loadRoster = useCallback(async () => {
    if (!selectedSectionId) return;

    setIsLoadingRoster(true);
    setStatusMessage(null);
    setIsDirty(false);

    try {
      // 1. Try fetching online if connected
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await getSectionAttendanceRosterAction(selectedSectionId, selectedDate);
        if (res.success && res.data) {
          setStudents(res.data.students);
          setIsAlreadyMarked(res.data.isAlreadyMarked);
          setIsEditMode(!res.data.isAlreadyMarked);
          if (res.data.isAlreadyMarked) {
            setLastSavedTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
          }

          // Cache roster locally in IndexedDB for offline access
          await offlineDb.cacheRoster({
            sectionId: selectedSectionId,
            sectionName: res.data.section.name,
            cachedAt: new Date().toISOString(),
            students: res.data.students,
          });

          // Check if there is an unsaved local draft to restore
          const savedDraft = await offlineDb.getFormDraft<StudentRosterItem[]>(draftFormKey);
          if (savedDraft && savedDraft.length > 0) {
            setStudents(savedDraft);
            setIsDirty(true);
          }
          return;
        }
      }

      // 2. Offline Fallback: Load cached roster & local drafts from IndexedDB
      const cached = await offlineDb.getCachedRoster(selectedSectionId);
      const savedDraft = await offlineDb.getFormDraft<StudentRosterItem[]>(draftFormKey);

      if (savedDraft && savedDraft.length > 0) {
        setStudents(savedDraft);
        setIsDirty(true);
        setIsEditMode(true);
      } else if (cached && cached.students.length > 0) {
        setStudents(
          cached.students.map((s) => ({
            id: s.id,
            userId: '',
            admissionNumber: s.admissionNumber,
            rollNumber: s.rollNumber,
            firstName: s.firstName,
            lastName: s.lastName,
            avatarUrl: s.avatarUrl || null,
            status: (s.status as AttendanceStatus) || ('PRESENT' as AttendanceStatus),
            remarks: s.remarks || null,
          }))
        );
        setIsEditMode(true);
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Roster not cached locally. Connect to internet to download section roster.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Unable to connect to server. Viewing local offline roster if available.',
      });
    } finally {
      setIsLoadingRoster(false);
    }
  }, [selectedSectionId, selectedDate, draftFormKey]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  // Auto-save drafts into IndexedDB when students array changes
  useEffect(() => {
    if (isDirty && students.length > 0 && selectedSectionId) {
      const timer = setTimeout(() => {
        offlineDb.saveFormDraft(draftFormKey, students);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [students, isDirty, draftFormKey, selectedSectionId]);

  // Unsaved changes guard: beforeunload listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Fast-path: Mark All Present
  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: 'PRESENT' as AttendanceStatus,
      }))
    );
    setIsDirty(true);
    setStatusMessage(null);
  };

  // Reset all with explicit confirmation
  const handleResetAll = () => {
    if (window.confirm('Reset all students to Absent? You will need to submit to save changes.')) {
      setStudents((prev) =>
        prev.map((student) => ({
          ...student,
          status: 'ABSENT' as AttendanceStatus,
        }))
      );
      setIsDirty(true);
      setStatusMessage(null);
    }
  };

  // Status toggle handler
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!isEditMode && isAlreadyMarked && !isPendingSync) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
    setIsDirty(true);
    setStatusMessage(null);
  };

  // Remark change
  const handleRemarkChange = (studentId: string, remarks: string) => {
    if (!isEditMode && isAlreadyMarked && !isPendingSync) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, remarks } : student
      )
    );
    setIsDirty(true);
  };

  // Selected section object
  const currentSection = sections.find((s) => s.id === selectedSectionId);

  // Save attendance atomically with complete offline fallback & idempotency
  const handleSaveAttendance = () => {
    if (!selectedSectionId || students.length === 0) return;

    setStatusMessage(null);
    startTransition(async () => {
      const clientMutationId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const payload = {
        sectionId: selectedSectionId,
        date: selectedDate,
        records: students.map((s) => ({
          studentId: s.id,
          status: s.status,
          remarks: s.remarks || undefined,
        })),
        clientMutationId,
      };

      // Check if browser is currently online
      const online = typeof navigator !== 'undefined' && navigator.onLine;

      if (!online) {
        // OFFLINE PATH: Queue in IndexedDB
        await offlineDb.enqueueMutation({
          type: 'MARK_ATTENDANCE',
          clientMutationId,
          title: `${currentSection?.classGradeName || 'Class'} ${currentSection?.name || 'Section'} Attendance (${selectedDate})`,
          payload,
          metadata: {
            studentCount: students.length,
            sectionId: selectedSectionId,
            date: selectedDate,
          },
        });

        setIsAlreadyMarked(true);
        setIsPendingSync(true);
        setIsEditMode(false);
        setIsDirty(false);
        await offlineDb.deleteFormDraft(draftFormKey);

        setStatusMessage({
          type: 'pending_sync',
          text: 'Saved locally. Pending sync — not yet saved to the server.',
        });
        return;
      }

      // ONLINE PATH: Submit directly to Server Action
      try {
        const res = await markDailyAttendanceAction(payload);
        if (res.success) {
          setIsAlreadyMarked(true);
          setIsPendingSync(false);
          setIsEditMode(false);
          setIsDirty(false);
          await offlineDb.deleteFormDraft(draftFormKey);

          const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          setLastSavedTimestamp(timeStr);
          setStatusMessage({
            type: 'success',
            text: `Attendance recorded successfully on server at ${timeStr} for ${res.count} students.`,
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: res.error || 'Failed to submit attendance.',
            canRetry: true,
          });
        }
      } catch {
        // Network failure during submission: fallback to offline queue
        await offlineDb.enqueueMutation({
          type: 'MARK_ATTENDANCE',
          clientMutationId,
          title: `${currentSection?.classGradeName || 'Class'} ${currentSection?.name || 'Section'} Attendance (${selectedDate})`,
          payload,
        });

        setIsAlreadyMarked(true);
        setIsPendingSync(true);
        setIsEditMode(false);
        setIsDirty(false);
        await offlineDb.deleteFormDraft(draftFormKey);

        setStatusMessage({
          type: 'pending_sync',
          text: 'Network disconnected during submission. Saved locally (Pending sync — not yet saved to the server).',
        });
      }
    });
  };

  // Metrics calculation
  const totalCount = students.length;
  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const lateCount = students.filter((s) => s.status === 'LATE').length;
  const halfDayCount = students.filter((s) => s.status === 'HALF_DAY').length;
  const excusedCount = students.filter((s) => s.status === 'EXCUSED').length;
  const hasExceptions = absentCount > 0 || lateCount > 0 || halfDayCount > 0 || excusedCount > 0;

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return (
      fullName.includes(query) ||
      s.admissionNumber.toLowerCase().includes(query) ||
      (s.rollNumber && s.rollNumber.toString().includes(query))
    );
  });

  const formattedDisplayDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 md:p-6 border-b border-slate-100 bg-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Daily Attendance Register
              </h2>

              {!isOnline && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-slate-700">
                  <WifiOff className="w-3 h-3" />
                  Offline Mode
                </span>
              )}

              {isPendingSync ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Pending sync — not yet saved to server
                </span>
              ) : isAlreadyMarked && !isEditMode ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Submitted for {formattedDisplayDate}
                </span>
              ) : isDirty ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved draft (Auto-saved locally)
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Defaults to all present
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentSection?.classGradeName} - {currentSection?.name} • Class Roll-Call
            </p>
          </div>

          {/* Section & Date Pickers */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Section Picker */}
            <div className="relative">
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                aria-label="Select Class Section"
                className="bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 py-2 pl-3 pr-8 rounded-lg border border-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-[#C2410C]"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.classGradeName} - {sec.name} {sec.isClassTeacher ? '(Class Teacher)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Picker */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-[#C2410C]">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Attendance Date"
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>

            {/* Lock / Edit Mode Toggle if already marked */}
            {isAlreadyMarked && (
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isEditMode
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {isEditMode ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lock Register</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Attendance</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Compact Single-Line Metric Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-600 font-medium">
              Total Enrolled: <strong className="text-slate-900">{totalCount}</strong>
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Present: {presentCount}
            </span>
            <span className="text-red-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Absent: {absentCount}
            </span>
            {lateCount > 0 && (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Late: {lateCount}
              </span>
            )}
            {halfDayCount > 0 && (
              <span className="text-blue-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Half Day: {halfDayCount}
              </span>
            )}
            {excusedCount > 0 && (
              <span className="text-purple-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Excused: {excusedCount}
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          {(isEditMode || !isAlreadyMarked || isPendingSync) && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
              >
                Mark All Present
              </button>
              {hasExceptions && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search Filter Strip */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students by name, roll number, or admission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#C2410C]"
          />
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          role="alert"
          className={`p-3.5 text-xs font-semibold flex items-center justify-between gap-2 border-b animate-in fade-in duration-150 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusMessage.type === 'pending_sync'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'pending_sync' ? (
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {statusMessage.type === 'pending_sync' && isOnline && (
              <button
                type="button"
                onClick={() => syncNow()}
                className="px-2.5 py-1 bg-amber-200/60 hover:bg-amber-300 text-amber-900 rounded-md text-[11px] font-bold transition-colors"
              >
                Sync Now
              </button>
            )}
            {statusMessage.canRetry && (
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-md text-[11px] font-bold transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Student List View */}
      <div className="divide-y divide-slate-100">
        {isLoadingRoster ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C2410C]" />
            <p className="text-xs font-medium">Loading roster &amp; attendance...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-1">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium text-slate-600">No students found matching filter</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isException =
              student.status === 'ABSENT' ||
              student.status === 'LATE' ||
              student.status === 'HALF_DAY' ||
              student.status === 'EXCUSED';

            return (
              <div
                key={student.id}
                className={`p-3.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  student.status === 'ABSENT'
                    ? 'bg-red-50/40 hover:bg-red-50/60'
                    : student.status === 'LATE'
                    ? 'bg-amber-50/40 hover:bg-amber-50/60'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <span className="w-7 text-xs font-mono font-bold text-slate-400 text-right">
                    {student.rollNumber ? `#${student.rollNumber}` : '—'}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono leading-tight mt-0.5">
                      Adm: {student.admissionNumber}
                    </p>
                  </div>
                </div>

                {/* Status Pills Selector + Optional Exception Remark */}
                <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-center">
                  {/* PRESENT */}
                  <button
                    type="button"
                    disabled={!isEditMode && isAlreadyMarked && !isPendingSync}
                    onClick={() => handleStatusChange(student.id, 'PRESENT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      student.status === 'PRESENT'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Present
                  </button>

                  {/* ABSENT */}
                  <button
                    type="button"
                    disabled={!isEditMode && isAlreadyMarked && !isPendingSync}
                    onClick={() => handleStatusChange(student.id, 'ABSENT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      student.status === 'ABSENT'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Absent
                  </button>

                  {/* LATE */}
                  <button
                    type="button"
                    disabled={!isEditMode && isAlreadyMarked && !isPendingSync}
                    onClick={() => handleStatusChange(student.id, 'LATE')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      student.status === 'LATE'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Late
                  </button>

                  {/* HALF DAY */}
                  <button
                    type="button"
                    disabled={!isEditMode && isAlreadyMarked && !isPendingSync}
                    onClick={() => handleStatusChange(student.id, 'HALF_DAY')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      student.status === 'HALF_DAY'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Half Day
                  </button>

                  {/* Progressive Disclosure: Remark input reveals on exception */}
                  {isException && (
                    <input
                      type="text"
                      disabled={!isEditMode && isAlreadyMarked && !isPendingSync}
                      placeholder="Note..."
                      value={student.remarks || ''}
                      onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                      className="w-24 sm:w-32 text-xs bg-slate-50 focus:bg-white focus:border-[#C2410C] rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none ml-1 text-slate-900 placeholder:text-slate-400 transition-colors"
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Save Action Bar */}
      <div className="sticky bottom-0 z-20 p-4 border-t border-slate-200 bg-white/95 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="text-xs text-slate-600">
          <span>{presentCount} Present</span>
          <span className="mx-1.5 text-slate-300">•</span>
          <span className={absentCount > 0 ? 'text-red-700 font-semibold' : ''}>
            {absentCount} Absent
          </span>
          {isPendingSync && (
            <span className="ml-2 text-amber-700 font-semibold">
              (Queued locally for sync)
            </span>
          )}
          {lastSavedTimestamp && !isDirty && !isPendingSync && (
            <span className="ml-2 text-slate-400">
              (Saved on server at {lastSavedTimestamp})
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveAttendance}
          disabled={isPending || students.length === 0 || (!isDirty && isAlreadyMarked && !isEditMode && !isPendingSync)}
          className="inline-flex items-center justify-center gap-2 bg-[#1d8cfd] hover:bg-blue-600 active:scale-[0.99] text-white font-semibold py-2.5 px-6 rounded-xl shadow-xs transition-colors text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isOnline ? 'Submitting to Server...' : 'Saving Locally...'}</span>
            </>
          ) : isPendingSync ? (
            <>
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Pending Server Sync</span>
            </>
          ) : isAlreadyMarked && !isDirty ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Attendance Confirmed</span>
            </>
          ) : !isOnline ? (
            <>
              <CloudOff className="w-4 h-4" />
              <span>Save Locally (Offline)</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Submit Attendance</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
