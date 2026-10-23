'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Users,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Calendar as CalendarIcon,
  X,
  Loader2,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdminCard from '@/components/admin/ui/AdminCard';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminSearchInput from '@/components/admin/ui/AdminSearchInput';
import AdminModal from '@/components/admin/ui/AdminModal';
import {
  createAppointmentAction,
  confirmPendingRequestAction,
  updateAppointmentStatusAction,
  type FormattedAppointment,
  type PendingAppointmentRequest,
  type AuthorityOption,
  type CreateAppointmentInput,
} from '@/actions/admin/appointments';

interface AppointmentsClientProps {
  initialAppointments: FormattedAppointment[];
  initialPendingRequests: PendingAppointmentRequest[];
  authorities: AuthorityOption[];
}

export default function AppointmentsClient({
  initialAppointments,
  initialPendingRequests,
  authorities,
}: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState<FormattedAppointment[]>(initialAppointments);
  const [pendingRequests, setPendingRequests] = useState<PendingAppointmentRequest[]>(initialPendingRequests);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PENDING' | 'COMPLETED' | 'ALL'>('UPCOMING');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');

  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<PendingAppointmentRequest | null>(null);

  // Form states for New Appointment
  const [formData, setFormData] = useState<CreateAppointmentInput>({
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    requesterRole: 'PARENT',
    authorityName: authorities[0]?.name || 'Principal',
    authorityUserId: authorities[0]?.userId || null,
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '10:30 AM',
    location: "Principal's Office",
    mode: 'IN_PERSON',
    purpose: '',
    notes: '',
  });

  // Form states for Confirming Request
  const [confirmDate, setConfirmDate] = useState(new Date().toISOString().split('T')[0]);
  const [confirmStartTime, setConfirmStartTime] = useState('11:00 AM');
  const [confirmEndTime, setConfirmEndTime] = useState('11:30 AM');
  const [confirmLocation, setConfirmLocation] = useState("Principal's Office");
  const [confirmNotes, setConfirmNotes] = useState('');

  // Loading & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null);

  // Metrics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = appointments.filter((a) => a.date === todayStr && a.status === 'SCHEDULED').length;
    const upcomingCount = appointments.filter((a) => a.status === 'SCHEDULED').length;
    const pendingCount = pendingRequests.length;
    const totalCount = appointments.length;

    return {
      todayCount,
      upcomingCount,
      pendingCount,
      totalCount,
    };
  }, [appointments, pendingRequests]);

  // Filtered lists
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      // Tab filter
      if (activeTab === 'UPCOMING' && app.status !== 'SCHEDULED') return false;
      if (activeTab === 'COMPLETED' && app.status !== 'COMPLETED') return false;

      // Authority filter
      if (selectedAuthority !== 'ALL' && app.authorityName !== selectedAuthority) return false;

      // Mode filter
      if (selectedMode !== 'ALL' && app.mode !== selectedMode) return false;

      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchRequester = app.requesterName.toLowerCase().includes(query);
        const matchAuthority = app.authorityName.toLowerCase().includes(query);
        const matchPurpose = app.purpose.toLowerCase().includes(query);
        const matchLocation = app.location.toLowerCase().includes(query);
        if (!matchRequester && !matchAuthority && !matchPurpose && !matchLocation) return false;
      }

      return true;
    });
  }, [appointments, activeTab, selectedAuthority, selectedMode, searchTerm]);

  const filteredPendingRequests = useMemo(() => {
    return pendingRequests.filter((req) => {
      if (selectedAuthority !== 'ALL' && req.authorityName !== selectedAuthority) return false;
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchRequester = req.requestedBy.toLowerCase().includes(query);
        const matchAuthority = req.authorityName.toLowerCase().includes(query);
        const matchPurpose = req.purpose.toLowerCase().includes(query);
        if (!matchRequester && !matchAuthority && !matchPurpose) return false;
      }
      return true;
    });
  }, [pendingRequests, selectedAuthority, searchTerm]);

  // Handle New Appointment Submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await createAppointmentAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ success: 'Appointment scheduled successfully!' });
      setIsScheduleModalOpen(false);
      // Optimistic update
      const newApp: FormattedAppointment = {
        id: `temp-${Date.now()}`,
        title: `[Appointment] ${formData.authorityName} with ${formData.requesterName}`,
        requesterName: formData.requesterName,
        requesterRole: formData.requesterRole,
        requesterContact: formData.requesterPhone || formData.requesterEmail || null,
        authorityName: formData.authorityName,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location || "Principal's Office",
        mode: formData.mode,
        purpose: formData.purpose,
        notes: formData.notes || null,
        status: 'SCHEDULED',
        rawEventId: `temp-${Date.now()}`,
      };
      setAppointments((prev) => [newApp, ...prev]);
      // Reset form
      setFormData({
        requesterName: '',
        requesterPhone: '',
        requesterEmail: '',
        requesterRole: 'PARENT',
        authorityName: authorities[0]?.name || 'Principal',
        authorityUserId: authorities[0]?.userId || null,
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00 AM',
        endTime: '10:30 AM',
        location: "Principal's Office",
        mode: 'IN_PERSON',
        purpose: '',
        notes: '',
      });
    } else {
      setFeedback({ error: res.error || 'Failed to schedule appointment.' });
    }
  };

  // Open Confirm Request Modal
  const handleOpenConfirmModal = (req: PendingAppointmentRequest) => {
    setSelectedPendingRequest(req);
    setConfirmDate(req.requestedDate || new Date().toISOString().split('T')[0]);
    setConfirmStartTime('11:00 AM');
    setConfirmEndTime('11:30 AM');
    setConfirmLocation("Principal's Office");
    setConfirmNotes('');
    setIsConfirmModalOpen(true);
  };

  // Handle Confirm Request Submit
  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPendingRequest) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await confirmPendingRequestAction({
      notificationId: selectedPendingRequest.id,
      confirmedDate: confirmDate,
      startTime: confirmStartTime,
      endTime: confirmEndTime,
      location: confirmLocation,
      notes: confirmNotes,
    });

    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ success: `Consultation with ${selectedPendingRequest.requestedBy} confirmed successfully!` });
      setIsConfirmModalOpen(false);

      // Optimistic update
      setPendingRequests((prev) => prev.filter((r) => r.id !== selectedPendingRequest.id));
      const confirmedApp: FormattedAppointment = {
        id: `conf-${Date.now()}`,
        title: `[Appointment] ${selectedPendingRequest.authorityName} with ${selectedPendingRequest.requestedBy}`,
        requesterName: selectedPendingRequest.requestedBy,
        requesterRole: 'PARENT',
        requesterContact: null,
        authorityName: selectedPendingRequest.authorityName,
        date: confirmDate,
        startTime: confirmStartTime,
        endTime: confirmEndTime,
        location: confirmLocation,
        mode: 'IN_PERSON',
        purpose: selectedPendingRequest.purpose,
        notes: confirmNotes || null,
        status: 'SCHEDULED',
        rawEventId: `conf-${Date.now()}`,
      };
      setAppointments((prev) => [confirmedApp, ...prev]);
      setSelectedPendingRequest(null);
    } else {
      setFeedback({ error: res.error || 'Failed to confirm request.' });
    }
  };

  // Handle Cancel Appointment
  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    const res = await updateAppointmentStatusAction({
      appointmentId: id,
      status: 'CANCELLED',
    });

    if (res.success) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
      );
      setFeedback({ success: 'Appointment cancelled.' });
    } else {
      setFeedback({ error: res.error || 'Failed to cancel appointment.' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <PageHeader
        title="Appointments & Consultations"
        subtitle="Schedule, review, and manage parent-teacher meetings, authority consultations, and visitor appointments."
        icon={CalendarCheck}
        badgeText="Institutional Hub"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Appointment</span>
            </button>
          </div>
        }
      />

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-medium ${
            feedback.error
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.error ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{feedback.error || feedback.success}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Schedule
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.todayCount}</span>
            <span className="text-xs text-slate-500 font-medium">appointments</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('PENDING')}
          className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all ${
            stats.pendingCount > 0
              ? 'border-amber-300 ring-2 ring-amber-100 hover:border-amber-400'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">{stats.pendingCount}</span>
            {stats.pendingCount > 0 && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Action required
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Upcoming Confirmed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.upcomingCount}</span>
            <span className="text-xs text-slate-500 font-medium">active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Logged
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.totalCount}</span>
            <span className="text-xs text-slate-500 font-medium">all records</span>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'UPCOMING'
                  ? 'bg-[#0B72E7] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Upcoming ({stats.upcomingCount})
            </button>

            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <span>Pending Requests</span>
              {stats.pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {stats.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'COMPLETED'
                  ? 'bg-[#0B72E7] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Past / Completed
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-[#0B72E7] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Records ({stats.totalCount})
            </button>
          </div>

          {/* Quick Authority Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Authority:</span>
            <select
              value={selectedAuthority}
              onChange={(e) => setSelectedAuthority(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
            >
              <option value="ALL">All Authorities</option>
              {authorities.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} ({a.designation})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <AdminSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by requester, authority, purpose..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
            >
              <option value="ALL">All Meeting Modes</option>
              <option value="IN_PERSON">In-Person at Campus</option>
              <option value="VIDEO_CALL">Online Video Call</option>
              <option value="PHONE">Telephonic Consultation</option>
            </select>
          </div>
        </div>

        {/* Content Display: Tab = PENDING */}
        {activeTab === 'PENDING' ? (
          <div className="space-y-3">
            {filteredPendingRequests.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No pending consultation requests</h4>
                <p className="text-xs text-slate-500 mt-1">
                  All requests from parents and students have been reviewed and scheduled.
                </p>
              </div>
            ) : (
              filteredPendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                        Request for: {req.authorityName}
                      </span>
                      <span className="text-xs text-slate-500">
                        Submitted: {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                        Preferred Date: {req.requestedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {req.requestedBy.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{req.requestedBy}</span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      <span className="text-slate-500 font-normal">Purpose: </span>
                      {req.purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => handleOpenConfirmModal(req)}
                      className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept & Schedule</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Content Display: Appointments List (Upcoming, Completed, All) */
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No appointments found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {searchTerm
                    ? 'Try adjusting your search filters.'
                    : 'Click "Schedule Appointment" to book your first institutional consultation.'}
                </p>
              </div>
            ) : (
              filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    app.status === 'CANCELLED'
                      ? 'bg-rose-50/30 border-rose-200 opacity-75'
                      : app.status === 'COMPLETED'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-200/90 hover:border-[#0B72E7]/40 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'SCHEDULED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>

                      {/* Mode Badge */}
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        {app.mode === 'VIDEO_CALL' ? (
                          <>
                            <Video className="w-3 h-3 text-blue-600" />
                            <span>Video Call</span>
                          </>
                        ) : app.mode === 'PHONE' ? (
                          <>
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Phone</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3 text-purple-600" />
                            <span>In-Person</span>
                          </>
                        )}
                      </span>

                      {/* Authority Tag */}
                      <span className="text-[11px] font-semibold text-[#0B72E7] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                        Authority: {app.authorityName}
                      </span>
                    </div>

                    {/* Requester & Schedule Details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0B72E7] flex items-center justify-center font-bold text-xs shrink-0">
                          {app.requesterName.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{app.requesterName}</span>
                        {app.requesterContact && (
                          <span className="text-xs text-slate-400">({app.requesterContact})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.date}</span>
                        <span className="text-slate-300">•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {app.startTime} - {app.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Purpose & Venue */}
                    <p className="text-xs text-slate-600 font-normal">
                      <span className="font-semibold text-slate-700">Agenda: </span>
                      {app.purpose}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{app.location}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {app.status === 'SCHEDULED' && (
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleCancelAppointment(app.id)}
                        className="w-full md:w-auto px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Schedule New Appointment */}
      <AdminModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule New Appointment"
        subtitle="Create an institutional consultation with a parent, student, or visitor."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Requester Name *
              </label>
              <input
                type="text"
                required
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Requester Role
              </label>
              <select
                value={formData.requesterRole}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requesterRole: e.target.value as CreateAppointmentInput['requesterRole'],
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              >
                <option value="PARENT">Parent / Guardian</option>
                <option value="STUDENT">Student</option>
                <option value="STAFF">Teaching / Staff</option>
                <option value="VISITOR">External Visitor / Vendor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone / Email
              </label>
              <input
                type="text"
                value={formData.requesterPhone || ''}
                onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consultation Authority / Host *
              </label>
              <select
                value={formData.authorityName}
                onChange={(e) => {
                  const auth = authorities.find((a) => a.name === e.target.value);
                  setFormData({
                    ...formData,
                    authorityName: e.target.value,
                    authorityUserId: auth?.userId || null,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              >
                {authorities.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} ({a.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
              <input
                type="text"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time *</label>
              <input
                type="text"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="10:30 AM"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meeting Mode
              </label>
              <select
                value={formData.mode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mode: e.target.value as CreateAppointmentInput['mode'],
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              >
                <option value="IN_PERSON">In-Person at Campus</option>
                <option value="VIDEO_CALL">Online Video Call (Meet/Zoom)</option>
                <option value="PHONE">Telephonic Consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location / Venue / Link
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Principal's Office or Meet Link"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Purpose / Agenda *
            </label>
            <textarea
              required
              rows={2}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. Academic progress review, Leave consultation, Fee discussion"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Confirm & Book</span>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* MODAL 2: Confirm Pending Request */}
      <AdminModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Consultation Request"
        subtitle="Assign a confirmed time slot and venue for the parent's requested appointment."
        maxWidth="max-w-lg"
      >
        {selectedPendingRequest && (
          <form onSubmit={handleConfirmSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Requester:</span>
                <span className="font-bold text-slate-900">{selectedPendingRequest.requestedBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Meeting Authority:</span>
                <span className="font-bold text-[#0B72E7]">{selectedPendingRequest.authorityName}</span>
              </div>
              <div>
                <span className="text-slate-500">Requested Agenda:</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedPendingRequest.purpose}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={confirmDate}
                  onChange={(e) => setConfirmDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
                <input
                  type="text"
                  required
                  value={confirmStartTime}
                  onChange={(e) => setConfirmStartTime(e.target.value)}
                  placeholder="11:00 AM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Time *</label>
                <input
                  type="text"
                  required
                  value={confirmEndTime}
                  onChange={(e) => setConfirmEndTime(e.target.value)}
                  placeholder="11:30 AM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Location</label>
              <input
                type="text"
                value={confirmLocation}
                onChange={(e) => setConfirmLocation(e.target.value)}
                placeholder="e.g. Principal's Office"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Instructions</label>
              <textarea
                rows={2}
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                placeholder="e.g. Please bring student report card or relevant medical records."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <span>Accept & Schedule</span>
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
