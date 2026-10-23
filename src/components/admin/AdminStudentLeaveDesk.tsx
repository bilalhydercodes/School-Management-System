'use client';

import React, { useState } from 'react';
import {
  CalendarMinus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  GraduationCap,
  Calendar,
  Phone,
  ShieldCheck,
  Send,
  Eye,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminSearchInput from './ui/AdminSearchInput';
import AdminDrawer from './ui/AdminDrawer';
import {
  type AdminStudentLeaveItem,
  updateStudentLeaveDecisionAction,
} from '@/actions/admin/leaves';

interface AdminStudentLeaveDeskProps {
  initialLeaves: AdminStudentLeaveItem[];
}

export default function AdminStudentLeaveDesk({
  initialLeaves,
}: AdminStudentLeaveDeskProps) {
  const [leaves, setLeaves] = useState<AdminStudentLeaveItem[]>(initialLeaves);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Review Drawer State
  const [selectedLeave, setSelectedLeave] = useState<AdminStudentLeaveItem | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filtered list
  const filteredLeaves = leaves.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      q === '' ||
      l.requestId.toLowerCase().includes(q) ||
      l.studentName.toLowerCase().includes(q) ||
      l.leaveType.toLowerCase().includes(q) ||
      l.reason.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // KPI Metrics
  const totalCount = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  const handleOpenReview = (leave: AdminStudentLeaveItem) => {
    setSelectedLeave(leave);
    setAdminRemarks(leave.adminRemarks || '');
    setActionSuccess(null);
    setActionError(null);
  };

  const handleDecision = async (decision: 'Approved' | 'Rejected') => {
    if (!selectedLeave) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await updateStudentLeaveDecisionAction({
        requestId: selectedLeave.requestId,
        status: decision,
        adminRemarks,
      });

      if (res.success) {
        setActionSuccess(`Leave application ${selectedLeave.requestId} successfully ${decision.toLowerCase()}.`);
        setLeaves((prev) =>
          prev.map((item) =>
            item.requestId === selectedLeave.requestId
              ? { ...item, status: decision, adminRemarks }
              : item
          )
        );
        setSelectedLeave((prev) =>
          prev ? { ...prev, status: decision, adminRemarks } : null
        );
      } else {
        setActionError(res.error || 'Failed to update leave decision.');
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Network communication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-4 border-l-4 border-l-[#0B72E7]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Applications
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <CalendarMinus className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pending Sanction
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Approved Leaves
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{approvedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Rejected
              </span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{rejectedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* 2. Controls & Search */}
      <AdminCard className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <AdminSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search reference, student name, or reason..."
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0B72E7]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Sanction</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* 3. Leave Applications Table */}
      <AdminCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Ref ID</th>
                <th className="py-3.5 px-4">Student & Class</th>
                <th className="py-3.5 px-4">Leave Category</th>
                <th className="py-3.5 px-4">Dates & Duration</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CalendarMinus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No student leave applications match the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.requestId} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B72E7]">
                      {leave.requestId}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{leave.studentName}</span>
                      <span className="text-[11px] text-slate-400 block">Class {leave.className}-{leave.sectionName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{leave.leaveType}</span>
                      <span className="text-[11px] text-slate-400 block">Contact: {leave.guardianPhone}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800 block">
                        {leave.startDate} → {leave.endDate}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 block">
                        {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 line-clamp-1 italic font-normal">&ldquo;{leave.reason}&rdquo;</p>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {leave.status === 'Approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      ) : leave.status === 'Rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <AdminButton
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenReview(leave)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Review
                      </AdminButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* 4. DRAWER: Review & Sanction Student Leave */}
      <AdminDrawer
        isOpen={Boolean(selectedLeave)}
        onClose={() => setSelectedLeave(null)}
        title={selectedLeave ? `Leave Request ${selectedLeave.requestId}` : 'Leave Review'}
        subtitle={selectedLeave ? `${selectedLeave.studentName} · Class ${selectedLeave.className}-${selectedLeave.sectionName}` : ''}
      >
        {selectedLeave && (
          <div className="space-y-5 text-xs">
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Leave Details Card */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800">{selectedLeave.leaveType}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0B72E7]">
                  {selectedLeave.daysCount} {selectedLeave.daysCount === 1 ? 'Day' : 'Days'} Duration
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block font-medium">Start Date:</span>
                  <span className="font-bold text-slate-800">{selectedLeave.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">End Date:</span>
                  <span className="font-bold text-slate-800">{selectedLeave.endDate}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-medium text-[11px] mb-1">Reason for Absence:</span>
                <p className="p-3 bg-white border border-slate-200/60 rounded-xl text-slate-700 leading-relaxed font-normal">
                  {selectedLeave.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Emergency Contact: {selectedLeave.guardianPhone || 'N/A'}</span>
                <span>Submitted: {selectedLeave.submittedAt}</span>
              </div>
            </div>

            {/* Current Decision Status Strip */}
            <div className="p-3.5 rounded-xl border flex items-center justify-between bg-slate-50/60">
              <span className="font-bold text-slate-700">Current Sanction Status:</span>
              <span
                className={`font-black text-xs px-2.5 py-1 rounded-full ${
                  selectedLeave.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedLeave.status === 'Rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedLeave.status.toUpperCase()}
              </span>
            </div>

            {/* Administrative Action Form */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0B72E7]" />
                Institutional Decision & Remarks
              </h4>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Administrator Remarks / Attendance Sanction Note
                </label>
                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="e.g. Approved under medical quota with valid physician certificate verified."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#0B72E7] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Sanction remarks are recorded in student attendance audit logs and reflected in the Student Portal.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <AdminButton
                  variant="primary"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('Approved')}
                  icon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                >
                  Approve Leave
                </AdminButton>

                <AdminButton
                  variant="danger"
                  className="w-full py-2.5"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('Rejected')}
                  icon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                >
                  Reject Leave
                </AdminButton>
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
