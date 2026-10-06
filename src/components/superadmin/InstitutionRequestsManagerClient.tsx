'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  School,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  User,
  ExternalLink,
  Loader2,
  Eye,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  approveInstitutionApplicationAction,
  rejectInstitutionApplicationAction,
  markApplicationUnderReviewAction,
} from '@/actions/superadmin-requests';

interface InstitutionApplicationItem {
  id: string;
  applicationNumber: string;
  institutionName: string;
  institutionType: string;
  officialEmail: string;
  officialPhone: string;
  website: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  studentCount: number | null;
  teacherCount: number | null;
  staffCount: number | null;
  campusCount: number | null;
  academicLevels: string[];
  administratorName: string;
  administratorEmail: string;
  administratorPhone: string;
  administratorDesignation: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewedById: string | null;
  reviewedAt: Date | string | null;
  rejectionReason: string | null;
  tenantId: string | null;
  adminUserId: string | null;
  activationToken: string | null;
  activatedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface Props {
  initialApplications: InstitutionApplicationItem[];
  totalCount: number;
}

export default function InstitutionRequestsManagerClient({
  initialApplications,
  totalCount,
}: Props) {
  const router = useRouter();
  const [applications, setApplications] = useState<InstitutionApplicationItem[]>(initialApplications);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<InstitutionApplicationItem | null>(null);

  // Modals state
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const [isActionPending, startActionTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [generatedActivationLink, setGeneratedActivationLink] = useState<string | null>(null);

  // Client filtering
  const filteredApps = applications.filter((app) => {
    const matchesStatus =
      selectedStatus === 'ALL' || app.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.institutionName.toLowerCase().includes(q) ||
      app.applicationNumber.toLowerCase().includes(q) ||
      app.administratorEmail.toLowerCase().includes(q) ||
      app.officialEmail.toLowerCase().includes(q) ||
      app.city.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Counts
  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;
  const underReviewCount = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  const handleOpenDetail = (app: InstitutionApplicationItem) => {
    setSelectedApp(app);
    setActionError(null);
    setActionSuccess(null);
    setGeneratedActivationLink(null);

    // If currently PENDING, automatically trigger UNDER_REVIEW tracking
    if (app.status === 'PENDING') {
      startActionTransition(async () => {
        await markApplicationUnderReviewAction(app.id);
        setApplications((prev) =>
          prev.map((item) =>
            item.id === app.id ? { ...item, status: 'UNDER_REVIEW' } : item
          )
        );
      });
    }
  };

  const handleApprove = () => {
    if (!selectedApp) return;
    setActionError(null);
    setActionSuccess(null);

    startActionTransition(async () => {
      const res = await approveInstitutionApplicationAction(selectedApp.id);
      if (res.success) {
        setActionSuccess('Institution successfully approved! Tenant workspace provisioned and activation invite prepared.');
        if (res.activationLink) {
          setGeneratedActivationLink(res.activationLink);
        }
        setIsApproveModalOpen(false);
        // Refresh local state
        setApplications((prev) =>
          prev.map((a) =>
            a.id === selectedApp.id
              ? {
                  ...a,
                  status: 'APPROVED',
                  tenantId: res.tenantId || a.tenantId,
                  reviewedAt: new Date(),
                }
              : a
          )
        );
        router.refresh();
      } else {
        setActionError(res.error || 'Failed to approve institution application.');
      }
    });
  };

  const handleReject = () => {
    if (!selectedApp || !rejectionReason.trim()) return;
    setActionError(null);
    setActionSuccess(null);

    startActionTransition(async () => {
      const res = await rejectInstitutionApplicationAction({
        applicationId: selectedApp.id,
        reason: rejectionReason,
      });

      if (res.success) {
        setActionSuccess('Application marked as REJECTED and applicant notified.');
        setIsRejectModalOpen(false);
        setRejectionReason('');
        // Refresh local state
        setApplications((prev) =>
          prev.map((a) =>
            a.id === selectedApp.id
              ? {
                  ...a,
                  status: 'REJECTED',
                  rejectionReason: rejectionReason.trim(),
                  reviewedAt: new Date(),
                }
              : a
          )
        );
        router.refresh();
      } else {
        setActionError(res.error || 'Failed to reject application.');
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Eye className="w-3 h-3" /> Under Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-indigo-600" />
            Institution Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review onboarding submissions, verify accreditation parameters, and approve multi-tenant workspace provisioning.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Review</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount + underReviewCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved Tenants</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Rejected</span>
          <p className="text-2xl font-black text-red-600 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'ALL', label: 'All Requests' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'UNDER_REVIEW', label: 'Under Review' },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No institution requests match your criteria</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or search queries</p>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex flex-col">
                        <span>{app.institutionName}</span>
                        {app.website && (
                          <a
                            href={app.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Visit website</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 font-medium">
                        {app.institutionType === 'College' ? (
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <School className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        {app.institutionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {app.city}, {app.state}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>
                        <strong className="block text-slate-900 font-semibold">{app.administratorName}</strong>
                        <span className="text-[11px] text-slate-400">{app.administratorEmail}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(app)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* APPLICATION DETAIL MODAL / DRAWER */}
      {/* ========================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl xl:max-w-6xl w-full my-6 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col h-[88vh] max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 sm:px-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-base sm:text-lg">
                      Application {selectedApp.applicationNumber}
                    </h2>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                  <p className="text-xs text-slate-500">
                    Submitted on{' '}
                    {new Date(selectedApp.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-7 text-xs sm:text-sm text-slate-700 flex-1">
              {/* Action alert message */}
              {actionSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Success</strong>
                    <p className="mt-0.5">{actionSuccess}</p>
                  </div>
                </div>
              )}

              {actionError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Action Failed</strong>
                    <p className="mt-0.5">{actionError}</p>
                  </div>
                </div>
              )}

              {/* Activation Link Banner if available */}
              {(generatedActivationLink || (selectedApp.status === 'APPROVED' && selectedApp.activationToken)) && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
                  <span className="font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    Administrator Activation Link (Valid for 7 Days)
                  </span>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-indigo-100 font-mono text-xs text-slate-800 overflow-x-auto">
                    <span className="truncate flex-1 select-all">
                      {generatedActivationLink ||
                        `${typeof window !== 'undefined' ? window.location.origin : ''}/register/activate?token=${selectedApp.activationToken}`}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          generatedActivationLink ||
                            `${window.location.origin}/register/activate?token=${selectedApp.activationToken}`
                        )
                      }
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-md font-sans text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1 shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-indigo-700 leading-tight">
                    An activation email has also been dispatched to {selectedApp.administratorEmail}.
                  </p>
                </div>
              )}

              {/* 1. Institution Profile */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  1. Institution Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-xs">Institution Name</span>
                    <strong className="text-slate-900 text-sm font-semibold">{selectedApp.institutionName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Category</span>
                    <strong className="text-slate-900 text-sm font-semibold">{selectedApp.institutionType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Official Email</span>
                    <span className="text-slate-900 font-mono text-sm font-medium">{selectedApp.officialEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Official Phone</span>
                    <span className="text-slate-900 text-sm font-medium">{selectedApp.officialPhone}</span>
                  </div>
                  {selectedApp.website && (
                    <div className="sm:col-span-2 lg:col-span-4 pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-xs">Official Website</span>
                      <a
                        href={selectedApp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline font-medium text-sm"
                      >
                        {selectedApp.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Campus Location */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  2. Campus Location
                </h3>
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                  <p className="text-slate-800 text-sm leading-relaxed font-medium">
                    {selectedApp.address}
                  </p>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1.5">
                    {selectedApp.city}, {selectedApp.state} &bull; PIN: <strong>{selectedApp.postalCode}</strong> &bull; {selectedApp.country}
                  </p>
                </div>
              </div>

              {/* 3. Scope & Numbers */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <School className="w-4 h-4 text-indigo-600" />
                  3. Scale & Academic Scope
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 text-center mb-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-slate-400 block text-xs uppercase font-medium">Students</span>
                    <strong className="text-slate-900 text-base sm:text-lg font-bold">{selectedApp.studentCount ?? '—'}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-slate-400 block text-xs uppercase font-medium">Teachers</span>
                    <strong className="text-slate-900 text-base sm:text-lg font-bold">{selectedApp.teacherCount ?? '—'}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-slate-400 block text-xs uppercase font-medium">Staff</span>
                    <strong className="text-slate-900 text-base sm:text-lg font-bold">{selectedApp.staffCount ?? '—'}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-slate-400 block text-xs uppercase font-medium">Campuses</span>
                    <strong className="text-slate-900 text-base sm:text-lg font-bold">{selectedApp.campusCount ?? 1}</strong>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedApp.academicLevels.map((lvl) => (
                    <span
                      key={lvl}
                      className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold"
                    >
                      {lvl}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. Administrator Profile */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  4. Administrator Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-xs">Administrator Name</span>
                    <strong className="text-slate-900 text-sm font-semibold">{selectedApp.administratorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Designation</span>
                    <strong className="text-slate-900 text-sm font-semibold">{selectedApp.administratorDesignation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Administrator Email</span>
                    <span className="text-slate-900 font-mono text-sm font-medium">{selectedApp.administratorEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Mobile Phone</span>
                    <span className="text-slate-900 text-sm font-medium">{selectedApp.administratorPhone}</span>
                  </div>
                </div>
              </div>

              {/* 5. Review Info if reviewed */}
              {selectedApp.reviewedAt && (
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Review & Audit Metadata
                  </h3>
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <p>
                      Reviewed by: <strong>{selectedApp.reviewedBy?.email || 'Platform Super Admin'}</strong>
                    </p>
                    <p>
                      Timestamp: {new Date(selectedApp.reviewedAt).toLocaleString('en-IN')}
                    </p>
                    {selectedApp.rejectionReason && (
                      <p className="text-red-700 font-semibold mt-1">
                        Rejection Reason: {selectedApp.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 sm:px-8 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedApp.status !== 'APPROVED' && selectedApp.status !== 'REJECTED' && (
                  <>
                    <button
                      type="button"
                      disabled={isActionPending}
                      onClick={() => setIsRejectModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Reject Application
                    </button>

                    <button
                      type="button"
                      disabled={isActionPending}
                      onClick={() => setIsApproveModalOpen(true)}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Institution</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* APPROVE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {isApproveModalOpen && selectedApp && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Approve this institution?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Approving will create and activate the <strong>{selectedApp.institutionName}</strong> multi-tenant database records, provision a primary subdomain, and dispatch an account activation link to <strong>{selectedApp.administratorEmail}</strong>.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-tight">
              &bull; Account will remain inactive until the administrator creates a password through the activation link.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleApprove}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
              >
                {isActionPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Approve & Provision</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REJECT CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {isRejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Reject Application
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Please provide an official reason for rejection. This reason will be emailed to {selectedApp.administratorEmail}.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Unable to verify official institution affiliation or duplicate application submitted."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionPending || !rejectionReason.trim()}
                onClick={handleReject}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isActionPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
