'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  ListFilter,
  Sparkles,
  Eye,
  Trash2,
  Edit2,
  RefreshCw,
  Bell,
  Settings,
  Share2,
  Layers,
  Flag,
  FileText,
  User,
  Phone,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdminCard from '@/components/admin/ui/AdminCard';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminSearchInput from '@/components/admin/ui/AdminSearchInput';
import AdminModal from '@/components/admin/ui/AdminModal';
import AdminDrawer from '@/components/admin/ui/AdminDrawer';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  getCalendarEventsAction,
  createCalendarEventAction,
  updateCalendarEventAction,
  archiveCalendarEventAction,
  getWorkingDaysConfigAction,
  updateWorkingDaysConfigAction,
  syncLegacyEventsAction,
} from '@/actions/admin/calendar';
import type { CreateCalendarEventInput, UpdateCalendarEventInput } from '@/lib/validations/calendar';
import { DayOfWeek } from '@prisma/client';

export interface CalendarEventViewItem {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  location: string;
  organizer: string;
  contactInfo: string;
  isImportant: boolean;
  audience: string;
  recurrence: string;
  status: string;
  isSpecialWorkingDay: boolean;
  isHoliday: boolean;
  academicYearId: string | null;
  academicYearName: string | null;
  creatorName: string | null;
  sourceType: string;
  sourceId: string | null;
}

export interface AcademicYearOption {
  id: string;
  name: string;
  isCurrent: boolean;
  startDate: Date | string;
  endDate: Date | string;
}

interface CalendarViewClientProps {
  initialEvents: CalendarEventViewItem[];
  academicYears: AcademicYearOption[];
  userRole?: 'ADMIN' | 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  readOnly?: boolean;
}

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  HOLIDAY: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  VACATION: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  EXAM: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  ACADEMIC: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  SCHOOL_EVENT: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  SPORTS: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  CULTURAL: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500' },
  PARENT_TEACHER_MEETING: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  ADMISSION: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  RESULT: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  DEADLINE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  STAFF_EVENT: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  MEETING: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
  OTHER: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' },
};

const ALL_EVENT_TYPES = [
  'ALL',
  'HOLIDAY',
  'VACATION',
  'ACADEMIC',
  'EXAM',
  'SCHOOL_EVENT',
  'SPORTS',
  'CULTURAL',
  'PARENT_TEACHER_MEETING',
  'ADMISSION',
  'RESULT',
  'DEADLINE',
  'STAFF_EVENT',
  'MEETING',
  'OTHER',
];

const ALL_AUDIENCES = [
  'ALL',
  'EVERYONE',
  'STUDENTS',
  'PARENTS',
  'TEACHERS',
  'STAFF',
  'STUDENTS_AND_PARENTS',
  'TEACHERS_AND_STAFF',
  'ADMIN_ONLY',
];

const DAYS_HEADER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarViewClient({
  initialEvents,
  academicYears,
  userRole = 'ADMIN',
  readOnly = false,
}: CalendarViewClientProps) {
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  const isEditable = isAdmin && !readOnly;

  const [events, setEvents] = useState<CalendarEventViewItem[]>(initialEvents);
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'LIST'>('MONTH');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedYearId, setSelectedYearId] = useState<string>('ALL');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Drawers & Modals
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventViewItem | null>(null);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWorkingDaysModalOpen, setIsWorkingDaysModalOpen] = useState(false);

  // Working Days state
  const [workingDays, setWorkingDays] = useState<DayOfWeek[]>([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ]);
  const [workingDaysExceptions, setWorkingDaysExceptions] = useState<
    { id: string; title: string; date: string; isSpecialWorkingDay: boolean; isHoliday: boolean }[]
  >([]);

  // Feedback & Action state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ error?: string; success?: string } | null>(null);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  // Add / Edit Form State
  const [formInput, setFormInput] = useState<CreateCalendarEventInput>({
    title: '',
    description: '',
    eventType: 'ACADEMIC',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '01:00 PM',
    isAllDay: true,
    location: '',
    organizer: '',
    contactInfo: '',
    isImportant: false,
    audience: 'EVERYONE',
    recurrence: 'NONE',
    sendNotification: false,
    academicYearId: '',
    isSpecialWorkingDay: false,
    isHoliday: false,
  });

  // Load working days on mount
  useEffect(() => {
    getWorkingDaysConfigAction().then((res) => {
      if (res.success && res.workingDays) {
        setWorkingDays(res.workingDays);
        if (res.exceptions) setWorkingDaysExceptions(res.exceptions);
      }
    });
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchYear =
        selectedYearId === 'ALL' || e.academicYearId === selectedYearId || !e.academicYearId;
      const matchType = selectedEventType === 'ALL' || e.eventType === selectedEventType;
      const matchAudience = selectedAudience === 'ALL' || e.audience === selectedAudience;
      const matchSearch =
        searchTerm === '' ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchYear && matchType && matchAudience && matchSearch;
    });
  }, [events, selectedYearId, selectedEventType, selectedAudience, searchTerm]);

  // Calendar Date Calculations for Month View
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Day of week index for Monday start (0: Mon, 1: Tue, ..., 6: Sun)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Preceding padding days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        date: prevDate,
        dateStr: prevDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentD = new Date(year, month, i);
      days.push({
        date: currentD,
        dateStr: currentD.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Trailing padding days to fill 35 or 42 grid cells
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const nextDate = new Date(year, month + 1, i);
        days.push({
          date: nextDate,
          dateStr: nextDate.toISOString().split('T')[0],
          dayNum: i,
          isCurrentMonth: false,
        });
      }
    }

    return days;
  }, [currentDate]);

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const currentMonthLabel = currentDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to check if a day is a working day
  const isDayAWorkingDay = (d: Date, dateStr: string) => {
    const dayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][
      d.getDay()
    ] as DayOfWeek;

    // Check if day has an explicit special working day exception
    const hasSpecialWorking = workingDaysExceptions.some(
      (e) => e.date === dateStr && e.isSpecialWorkingDay
    );
    if (hasSpecialWorking) return true;

    // Check if day has an explicit holiday exception
    const hasHoliday = workingDaysExceptions.some((e) => e.date === dateStr && e.isHoliday);
    if (hasHoliday) return false;

    return workingDays.includes(dayName);
  };

  // Open Create Modal
  const openCreateModalForDate = (dateStr?: string) => {
    setModalFeedback(null);
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    setFormInput({
      title: '',
      description: '',
      eventType: 'ACADEMIC',
      startDate: targetDate,
      endDate: targetDate,
      startTime: '09:00 AM',
      endTime: '01:00 PM',
      isAllDay: true,
      location: 'Campus Main Hall',
      organizer: 'Academic Committee',
      contactInfo: '',
      isImportant: false,
      audience: 'EVERYONE',
      recurrence: 'NONE',
      sendNotification: false,
      academicYearId: selectedYearId !== 'ALL' ? selectedYearId : '',
      isSpecialWorkingDay: false,
      isHoliday: false,
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (event: CalendarEventViewItem) => {
    setModalFeedback(null);
    setSelectedEvent(event);
    setFormInput({
      title: event.title,
      description: event.description,
      eventType: event.eventType as any,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime || '09:00 AM',
      endTime: event.endTime || '01:00 PM',
      isAllDay: event.isAllDay,
      location: event.location,
      organizer: event.organizer,
      contactInfo: event.contactInfo,
      isImportant: event.isImportant,
      audience: event.audience as any,
      recurrence: event.recurrence as any,
      sendNotification: false,
      academicYearId: event.academicYearId || '',
      isSpecialWorkingDay: event.isSpecialWorkingDay,
      isHoliday: event.isHoliday,
    });
    setIsEditModalOpen(true);
  };

  // Submit Create Event
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInput.title.trim() || !formInput.startDate || !formInput.endDate) {
      setModalFeedback({ error: 'Title, start date, and end date are required.' });
      return;
    }

    setIsSubmitting(true);
    setModalFeedback(null);

    const res = await createCalendarEventAction(formInput);
    if (res.success && res.event) {
      setModalFeedback({ success: 'Event successfully published to the Academic Calendar.' });
      const newEv: CalendarEventViewItem = {
        id: res.event.id,
        title: res.event.title,
        description: res.event.description || '',
        eventType: res.event.eventType,
        startDate: res.event.startDate.toISOString().split('T')[0],
        endDate: res.event.endDate.toISOString().split('T')[0],
        startTime: res.event.startTime,
        endTime: res.event.endTime,
        isAllDay: res.event.isAllDay,
        location: res.event.location || '',
        organizer: res.event.organizer || '',
        contactInfo: res.event.contactInfo || '',
        isImportant: res.event.isImportant,
        audience: res.event.audience,
        recurrence: res.event.recurrence,
        status: res.event.status,
        isSpecialWorkingDay: res.event.isSpecialWorkingDay,
        isHoliday: res.event.isHoliday,
        academicYearId: res.event.academicYearId,
        academicYearName: null,
        creatorName: 'Administrator',
        sourceType: 'CALENDAR',
        sourceId: null,
      };
      setEvents((prev) => [...prev, newEv]);
      setTimeout(() => {
        setIsAddModalOpen(false);
      }, 1000);
    } else {
      setModalFeedback({ error: res.error || 'Failed to create event.' });
    }
    setIsSubmitting(false);
  };

  // Submit Edit Event
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    setModalFeedback(null);

    const res = await updateCalendarEventAction({
      id: selectedEvent.id,
      ...formInput,
    });

    if (res.success && res.event) {
      setModalFeedback({ success: 'Event updated successfully.' });
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEvent.id
            ? {
                ...ev,
                ...formInput,
                startDate: formInput.startDate,
                endDate: formInput.endDate,
              }
            : ev
        )
      );
      setTimeout(() => {
        setIsEditModalOpen(false);
        setIsEventDrawerOpen(false);
      }, 1000);
    } else {
      setModalFeedback({ error: res.error || 'Failed to update event.' });
    }
    setIsSubmitting(false);
  };

  // Archive / Delete Event
  const handleArchiveEvent = (event: CalendarEventViewItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Calendar Event',
      description: `Archive "${event.title}"? It will be safely removed from all active role calendars.`,
      onConfirm: async () => {
        const res = await archiveCalendarEventAction(event.id);
        if (res.success) {
          setEvents((prev) => prev.filter((ev) => ev.id !== event.id));
          setIsEventDrawerOpen(false);
        } else {
          alert(res.error || 'Failed to archive event.');
        }
      },
    });
  };

  // Save Working Days
  const handleSaveWorkingDays = async (updated: DayOfWeek[]) => {
    setIsSubmitting(true);
    const res = await updateWorkingDaysConfigAction(updated);
    if (res.success) {
      setWorkingDays(updated);
      setIsWorkingDaysModalOpen(false);
    } else {
      alert(res.error || 'Failed to update working days configuration.');
    }
    setIsSubmitting(false);
  };

  // Sync Legacy Events
  const handleSyncLegacy = async () => {
    const res = await syncLegacyEventsAction();
    if (res.success) {
      alert(`Consolidated ${res.count} legacy school events and holidays into the Academic Calendar.`);
      // Refresh events
      getCalendarEventsAction().then((cRes) => {
        if (cRes.success && cRes.events) {
          setEvents(cRes.events);
        }
      });
    } else {
      alert(res.error || 'Sync failed.');
    }
  };

  // Upcoming Events slice for side panel
  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter((e) => e.endDate >= todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 5);
  }, [filteredEvents, todayStr]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Institutional Academic Calendar"
        subtitle="Centralized single source of truth for academic schedules, terms, examinations, working days, and school events."
        breadcrumbs={[
          { label: isAdmin ? 'Admin' : 'Portal', href: isAdmin ? '/admin' : '/portal' },
          { label: 'Academic Calendar' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {isEditable && (
              <>
                <AdminButton
                  variant="secondary"
                  icon={<Settings className="w-3.5 h-3.5" />}
                  onClick={() => setIsWorkingDaysModalOpen(true)}
                >
                  Working Days ({workingDays.length})
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={handleSyncLegacy}
                  title="Consolidate legacy events & holidays"
                >
                  Sync Legacy
                </AdminButton>
                <AdminButton
                  variant="primary"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => openCreateModalForDate()}
                >
                  + Add Event
                </AdminButton>
              </>
            )}
          </div>
        }
      />

      {/* 2. Top Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Events</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{filteredEvents.length}</div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">In selected view scope</p>
        </AdminCard>

        <AdminCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{upcomingEvents.length}</div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">Scheduled from today onwards</p>
        </AdminCard>

        <AdminCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Working Days / Week</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{workingDays.length} Days</div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            {workingDays.length === 6 ? 'Mon - Sat' : 'Mon - Fri'} standard schedule
          </p>
        </AdminCard>

        <AdminCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Milestone</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-800 mt-2 truncate">
            {upcomingEvents[0]?.title || 'No upcoming event'}
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            {upcomingEvents[0] ? upcomingEvents[0].startDate : 'Term running smoothly'}
          </p>
        </AdminCard>
      </div>

      {/* 3. Filter Controls & Navigation Bar */}
      <AdminCard className="p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left: Month Navigator */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-3 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-base font-black text-slate-900 tracking-tight">
              {currentMonthLabel}
            </div>
          </div>

          {/* Center: Search & Filter selects */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            <div className="w-full sm:w-56">
              <AdminSearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search events, venues..."
              />
            </div>

            {/* Academic Year Selector */}
            {academicYears.length > 0 && (
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0B72E7]"
              >
                <option value="ALL">All Academic Years</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Event Type Filter */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0B72E7]"
            >
              <option value="ALL">All Event Types</option>
              {ALL_EVENT_TYPES.filter((t) => t !== 'ALL').map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            {/* Audience Filter (Admin only) */}
            {isAdmin && (
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0B72E7]"
              >
                <option value="ALL">All Audiences</option>
                {ALL_AUDIENCES.filter((a) => a !== 'ALL').map((a) => (
                  <option key={a} value={a}>
                    {a.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right: View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#F1F5F9] rounded-xl self-end lg:self-center">
            <button
              type="button"
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'MONTH'
                  ? 'bg-white text-[#0B72E7] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'WEEK'
                  ? 'bg-white text-[#0B72E7] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'LIST'
                  ? 'bg-white text-[#0B72E7] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </AdminCard>

      {/* 4. Main Calendar Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main View Area (Month / Week / List) */}
        <div className="lg:col-span-3 space-y-4">
          {/* MONTH VIEW */}
          {viewMode === 'MONTH' && (
            <AdminCard className="overflow-hidden border border-slate-200/90 shadow-xs">
              {/* Day Header Row */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-[#F8FAFC] text-center">
                {DAYS_HEADER.map((d, idx) => (
                  <div
                    key={d}
                    className={`py-3 text-xs font-bold uppercase tracking-wider ${
                      idx >= 5 ? 'text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
                {calendarDays.map((cell, idx) => {
                  const isToday = cell.dateStr === todayStr;
                  const isWorking = isDayAWorkingDay(cell.date, cell.dateStr);

                  // Events falling on this day
                  const dayEvents = filteredEvents.filter(
                    (e) => cell.dateStr >= e.startDate && cell.dateStr <= e.endDate
                  );

                  return (
                    <div
                      key={idx}
                      className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors relative group ${
                        !cell.isCurrentMonth
                          ? 'bg-slate-50/50 text-slate-400'
                          : !isWorking
                          ? 'bg-slate-50/70'
                          : 'bg-white hover:bg-blue-50/20'
                      }`}
                    >
                      {/* Top Day Number & Badges */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isToday
                              ? 'bg-[#0B72E7] text-white shadow-xs'
                              : cell.isCurrentMonth
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        <div className="flex items-center gap-1">
                          {!isWorking && cell.isCurrentMonth && (
                            <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-slate-200/80 text-slate-500">
                              Off
                            </span>
                          )}
                          {isEditable && cell.isCurrentMonth && (
                            <button
                              type="button"
                              onClick={() => openCreateModalForDate(cell.dateStr)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-blue-100 text-[#0B72E7] transition-opacity"
                              title="Add event on this date"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Event Chips */}
                      <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const style = EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.OTHER;
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => {
                                setSelectedEvent(ev);
                                setIsEventDrawerOpen(true);
                              }}
                              className={`w-full text-left px-1.5 py-1 rounded-md text-[11px] font-semibold truncate border ${style.bg} ${style.text} ${style.border} hover:brightness-95 transition-all flex items-center gap-1 shadow-2xs`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                              <span className="truncate">{ev.title}</span>
                            </button>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEvent(dayEvents[3]);
                              setIsEventDrawerOpen(true);
                            }}
                            className="text-[10px] font-bold text-[#0B72E7] hover:underline pl-1"
                          >
                            +{dayEvents.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminCard>
          )}

          {/* WEEK VIEW */}
          {viewMode === 'WEEK' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                {calendarDays.slice(0, 7).map((dayCol, colIdx) => {
                  const dayEvents = filteredEvents.filter(
                    (e) => dayCol.dateStr >= e.startDate && dayCol.dateStr <= e.endDate
                  );
                  const isToday = dayCol.dateStr === todayStr;

                  return (
                    <AdminCard
                      key={colIdx}
                      className={`p-3 min-h-[300px] flex flex-col justify-between ${
                        isToday ? 'border-[#0B72E7] ring-1 ring-blue-200' : ''
                      }`}
                    >
                      <div>
                        <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            {DAYS_HEADER[colIdx]}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                              isToday ? 'bg-blue-100 text-[#0B72E7]' : 'text-slate-400'
                            }`}
                          >
                            {dayCol.date.getDate()}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {dayEvents.map((ev) => {
                            const style =
                              EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.OTHER;
                            return (
                              <div
                                key={ev.id}
                                onClick={() => {
                                  setSelectedEvent(ev);
                                  setIsEventDrawerOpen(true);
                                }}
                                className={`p-2 rounded-lg border text-xs cursor-pointer hover:shadow-xs transition-shadow ${style.bg} ${style.border}`}
                              >
                                <span className={`font-bold block truncate ${style.text}`}>
                                  {ev.title}
                                </span>
                                {ev.startTime && (
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {ev.startTime}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {dayEvents.length === 0 && (
                            <p className="text-[11px] text-slate-400 text-center py-6">
                              No events
                            </p>
                          )}
                        </div>
                      </div>

                      {isEditable && (
                        <button
                          type="button"
                          onClick={() => openCreateModalForDate(dayCol.dateStr)}
                          className="mt-2 w-full py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-[#0B72E7] hover:bg-blue-50 border border-dashed border-slate-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </AdminCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'LIST' && (
            <AdminCard className="p-0 overflow-hidden divide-y divide-slate-100">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">No events found matching your criteria</p>
                  <p className="text-xs text-slate-400 mt-1">Adjust filters or search parameters</p>
                </div>
              ) : (
                filteredEvents.map((ev) => {
                  const style = EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.OTHER;
                  return (
                    <div
                      key={ev.id}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-mono shrink-0 ${style.bg} ${style.border} ${style.text}`}
                        >
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {new Date(ev.startDate).toLocaleDateString('en-IN', { month: 'short' })}
                          </span>
                          <span className="text-base font-black leading-tight">
                            {new Date(ev.startDate).getDate()}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.bg} ${style.border} ${style.text}`}
                            >
                              {ev.eventType.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              Audience: {ev.audience.replace(/_/g, ' ')}
                            </span>
                            {ev.isImportant && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                Important
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 mt-1">{ev.title}</h4>

                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                            {ev.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {ev.location}
                              </span>
                            )}
                            {ev.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {ev.startTime} - {ev.endTime || ''}
                              </span>
                            )}
                            {ev.startDate !== ev.endDate && (
                              <span className="text-slate-400">
                                Until {ev.endDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <AdminButton
                          variant="secondary"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setSelectedEvent(ev);
                            setIsEventDrawerOpen(true);
                          }}
                        >
                          View
                        </AdminButton>

                        {isEditable && ev.sourceType === 'CALENDAR' && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(ev)}
                              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Event"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchiveEvent(ev)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Archive Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </AdminCard>
          )}
        </div>

        {/* Right Side Panel: Upcoming Events & Quick Insights */}
        <div className="space-y-4">
          <AdminCard className="p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0B72E7]" />
                Upcoming Milestones
              </h4>
              <span className="text-[11px] font-semibold text-slate-400">Next 5</span>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No upcoming events scheduled</p>
              ) : (
                upcomingEvents.map((ue) => {
                  const style = EVENT_TYPE_COLORS[ue.eventType] || EVENT_TYPE_COLORS.OTHER;
                  return (
                    <div
                      key={ue.id}
                      onClick={() => {
                        setSelectedEvent(ue);
                        setIsEventDrawerOpen(true);
                      }}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}
                        >
                          {ue.eventType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {ue.startDate}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 truncate">{ue.title}</h5>
                      {ue.location && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ue.location}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </AdminCard>

          {/* Working Days Status Widget */}
          <AdminCard className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Institutional Schedule
              </span>
              <CalendarDays className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-black mt-1">
              {workingDays.length} Working Days
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Active timetable cycle automatically aligns with the central academic working days.
            </p>
            {isEditable && (
              <button
                type="button"
                onClick={() => setIsWorkingDaysModalOpen(true)}
                className="mt-3 w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Configure Working Days
              </button>
            )}
          </AdminCard>
        </div>
      </div>

      {/* 5. EVENT DETAILS DRAWER */}
      <AdminDrawer
        isOpen={isEventDrawerOpen}
        onClose={() => setIsEventDrawerOpen(false)}
        title={selectedEvent?.title || 'Event Details'}
        subtitle={`Categorized under ${selectedEvent?.eventType.replace(/_/g, ' ')}`}
      >
        {selectedEvent && (
          <div className="space-y-5">
            {/* Badges strip */}
            <div className="flex items-center gap-2 flex-wrap">
              {(() => {
                const style = EVENT_TYPE_COLORS[selectedEvent.eventType] || EVENT_TYPE_COLORS.OTHER;
                return (
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${style.bg} ${style.border} ${style.text}`}
                  >
                    {selectedEvent.eventType.replace(/_/g, ' ')}
                  </span>
                );
              })()}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Audience: {selectedEvent.audience.replace(/_/g, ' ')}
              </span>
              {selectedEvent.isImportant && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                  High Priority
                </span>
              )}
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                {selectedEvent.description}
              </div>
            )}

            {/* Date & Time metadata */}
            <div className="space-y-2.5 border-t border-b border-slate-100 py-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Dates:</span>
                <span className="font-bold text-slate-800">
                  {selectedEvent.startDate}
                  {selectedEvent.startDate !== selectedEvent.endDate ? ` to ${selectedEvent.endDate}` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Time:</span>
                <span className="font-bold text-slate-800">
                  {selectedEvent.isAllDay
                    ? 'All Day'
                    : `${selectedEvent.startTime || ''} - ${selectedEvent.endTime || ''}`}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Location:</span>
                  <span className="font-bold text-slate-800">{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.organizer && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Organizer:</span>
                  <span className="font-bold text-slate-800">{selectedEvent.organizer}</span>
                </div>
              )}
              {selectedEvent.contactInfo && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Contact:</span>
                  <span className="font-bold text-slate-800">{selectedEvent.contactInfo}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Source:</span>
                <span className="font-bold font-mono text-slate-800">{selectedEvent.sourceType}</span>
              </div>
            </div>

            {/* Admin Management Actions */}
            {isEditable && selectedEvent.sourceType === 'CALENDAR' && (
              <div className="flex items-center gap-2.5 pt-2">
                <AdminButton
                  variant="secondary"
                  className="w-full"
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => openEditModal(selectedEvent)}
                >
                  Edit Event
                </AdminButton>
                <AdminButton
                  variant="destructive"
                  className="w-full"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => handleArchiveEvent(selectedEvent)}
                >
                  Archive Event
                </AdminButton>
              </div>
            )}
          </div>
        )}
      </AdminDrawer>

      {/* 6. CREATE / EDIT EVENT MODAL */}
      <AdminModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Calendar Event' : 'Create New Calendar Event'}
        description="Schedule institutional activities, examinations, holidays, or meetings."
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <AdminButton
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              isLoading={isSubmitting}
              onClick={isEditModalOpen ? handleEditSubmit : handleCreateSubmit}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {isEditModalOpen ? 'Save Changes' : 'Publish to Calendar'}
            </AdminButton>
          </div>
        }
      >
        <form
          onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit}
          className="space-y-4"
        >
          {modalFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                modalFeedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {modalFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{modalFeedback.success || modalFeedback.error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formInput.title}
              onChange={(e) => setFormInput({ ...formInput, title: e.target.value })}
              placeholder="e.g. Annual Athletic Meet 2026 / Term 1 Mid-Term Examination"
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formInput.eventType}
                onChange={(e) => setFormInput({ ...formInput, eventType: e.target.value as any })}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
              >
                {ALL_EVENT_TYPES.filter((t) => t !== 'ALL').map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Audience Scope <span className="text-red-500">*</span>
              </label>
              <select
                value={formInput.audience}
                onChange={(e) => setFormInput({ ...formInput, audience: e.target.value as any })}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
              >
                {ALL_AUDIENCES.filter((a) => a !== 'ALL').map((a) => (
                  <option key={a} value={a}>
                    {a.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formInput.startDate}
                onChange={(e) => setFormInput({ ...formInput, startDate: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formInput.endDate}
                onChange={(e) => setFormInput({ ...formInput, endDate: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
              />
            </div>

            {!formInput.isAllDay && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formInput.startTime || ''}
                    onChange={(e) => setFormInput({ ...formInput, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={formInput.endTime || ''}
                    onChange={(e) => setFormInput({ ...formInput, endTime: e.target.value })}
                    placeholder="01:00 PM"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Venue</label>
              <input
                type="text"
                value={formInput.location || ''}
                onChange={(e) => setFormInput({ ...formInput, location: e.target.value })}
                placeholder="Main Auditorium, Ground, etc."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organizer</label>
              <input
                type="text"
                value={formInput.organizer || ''}
                onChange={(e) => setFormInput({ ...formInput, organizer: e.target.value })}
                placeholder="Examination Cell / Department of Sports"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formInput.description || ''}
              onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
              placeholder="Additional details, agenda, instructions for attendees..."
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none resize-none"
            />
          </div>

          {/* Checkboxes row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formInput.isAllDay}
                onChange={(e) => setFormInput({ ...formInput, isAllDay: e.target.checked })}
                className="w-4 h-4 rounded text-[#0B72E7]"
              />
              <span className="text-xs font-semibold text-slate-700">All Day Event</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formInput.isImportant}
                onChange={(e) => setFormInput({ ...formInput, isImportant: e.target.checked })}
                className="w-4 h-4 rounded text-[#0B72E7]"
              />
              <span className="text-xs font-semibold text-slate-700">Mark as Important (High Priority)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formInput.isSpecialWorkingDay}
                onChange={(e) => setFormInput({ ...formInput, isSpecialWorkingDay: e.target.checked })}
                className="w-4 h-4 rounded text-[#0B72E7]"
              />
              <span className="text-xs font-semibold text-slate-700">Special Working Day (e.g. Saturday)</span>
            </label>

            {!isEditModalOpen && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formInput.sendNotification}
                  onChange={(e) => setFormInput({ ...formInput, sendNotification: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0B72E7]"
                />
                <span className="text-xs font-semibold text-slate-700">Send Instant Notification Broadcast</span>
              </label>
            )}
          </div>
        </form>
      </AdminModal>

      {/* 7. WORKING DAYS CONFIGURATION MODAL */}
      <AdminModal
        isOpen={isWorkingDaysModalOpen}
        onClose={() => setIsWorkingDaysModalOpen(false)}
        title="Institutional Working Days Configuration"
        description="Set the baseline weekly operational schedule for the school. Timetable and attendance modules adhere to this configuration."
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <AdminButton variant="secondary" onClick={() => setIsWorkingDaysModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              isLoading={isSubmitting}
              onClick={() => handleSaveWorkingDays(workingDays)}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Save Schedule
            </AdminButton>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl text-xs text-blue-900 leading-relaxed">
            Select standard active working days. Days marked as non-working will automatically be treated as weekly recesses across Timetable and Calendar views.
          </div>

          <div className="space-y-2">
            {(
              [
                { day: 'MONDAY', label: 'Monday' },
                { day: 'TUESDAY', label: 'Tuesday' },
                { day: 'WEDNESDAY', label: 'Wednesday' },
                { day: 'THURSDAY', label: 'Thursday' },
                { day: 'FRIDAY', label: 'Friday' },
                { day: 'SATURDAY', label: 'Saturday' },
                { day: 'SUNDAY', label: 'Sunday' },
              ] as const
            ).map((item) => {
              const isChecked = workingDays.includes(item.day as DayOfWeek);
              return (
                <label
                  key={item.day}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-blue-50/40 border-[#0B72E7] text-slate-900'
                      : 'bg-[#F8FAFC] border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="text-xs font-bold">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setWorkingDays([...workingDays, item.day as DayOfWeek]);
                      } else {
                        setWorkingDays(workingDays.filter((d) => d !== item.day));
                      }
                    }}
                    className="w-4 h-4 rounded text-[#0B72E7]"
                  />
                </label>
              );
            })}
          </div>

          {workingDaysExceptions.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Special Date Exceptions:
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {workingDaysExceptions.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-700">{ex.title}</span>
                    <span className="font-mono text-[10px] text-slate-500">{ex.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AdminModal>

      {/* 8. CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          await confirmDialog.onConfirm();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="danger"
        confirmLabel="Archive"
      />
    </div>
  );
}
