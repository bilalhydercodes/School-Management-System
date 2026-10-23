'use client';

import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  GraduationCap,
  Calendar,
  ShieldCheck,
  Send,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminSearchInput from './ui/AdminSearchInput';
import AdminBadge from './ui/AdminBadge';
import AdminDrawer from './ui/AdminDrawer';
import {
  type AdminStudentGrievanceItem,
  updateStudentGrievanceStatusAction,
} from '@/actions/admin/grievances';

interface AdminStudentGrievanceDeskProps {
  initialGrievances: AdminStudentGrievanceItem[];
}

export default function AdminStudentGrievanceDesk({
  initialGrievances,
}: AdminStudentGrievanceDeskProps) {
  const [grievances, setGrievances] = useState<AdminStudentGrievanceItem[]>(initialGrievances);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');

  // Drawer review state
  const [selectedTicket, setSelectedTicket] = useState<AdminStudentGrievanceItem | null>(null);
  const [newStatus, setNewStatus] = useState<'Pending' | 'In Progress' | 'Resolved' | 'Closed'>('In Progress');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filtered grievances
  const filteredGrievances = grievances.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      q === '' ||
      g.ticketNumber.toLowerCase().includes(q) ||
      g.studentName.toLowerCase().includes(q) ||
      g.subject.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || g.status === statusFilter;
    const matchUrgency = urgencyFilter === 'ALL' || g.urgency === urgencyFilter;

    return matchSearch && matchStatus && matchUrgency;
  });

  // KPI counts
  const totalCount = grievances.length;
  const inProgressCount = grievances.filter((g) => g.status === 'In Progress' || g.status === 'Pending').length;
  const resolvedCount = grievances.filter((g) => g.status === 'Resolved' || g.status === 'Closed').length;
  const urgentCount = grievances.filter((g) => g.urgency === 'URGENT').length;

  const handleOpenTicket = (ticket: AdminStudentGrievanceItem) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setAdminRemarks(ticket.adminNote || '');
    setActionSuccess(null);
    setActionError(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await updateStudentGrievanceStatusAction({
        ticketNumber: selectedTicket.ticketNumber,
        status: newStatus,
        adminRemarks,
      });

      if (res.success) {
        setActionSuccess(`Ticket ${selectedTicket.ticketNumber} updated to ${newStatus}. Student notified.`);
        // Update local state
        setGrievances((prev) =>
          prev.map((item) =>
            item.ticketNumber === selectedTicket.ticketNumber
              ? { ...item, status: newStatus, adminNote: adminRemarks }
              : item
          )
        );
        setSelectedTicket((prev) =>
          prev ? { ...prev, status: newStatus, adminNote: adminRemarks } : null
        );
      } else {
        setActionError(res.error || 'Failed to update ticket status.');
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Server communication failure.');
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
                Total Grievances
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pending / In Progress
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{inProgressCount}</span>
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
                Resolved / Closed
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{resolvedCount}</span>
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
                Urgent Priority
              </span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{urgentCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* 2. Controls, Search, and Filters */}
      <AdminCard className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <AdminSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search reference, student, or issue..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0B72E7]"
              >
                <option value="ALL">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Urgency Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold">Urgency:</span>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0B72E7]"
              >
                <option value="ALL">All Priorities</option>
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* 3. Grievances Data Table */}
      <AdminCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Ref Ticket #</th>
                <th className="py-3.5 px-4">Student & Class</th>
                <th className="py-3.5 px-4">Category & Subject</th>
                <th className="py-3.5 px-3 text-center">Urgency</th>
                <th className="py-3.5 px-4">Submitted On</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrievances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <MessageSquareHeart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No student grievances match the active criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredGrievances.map((ticket) => (
                  <tr key={ticket.ticketNumber} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B72E7]">
                      {ticket.ticketNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{ticket.studentName}</span>
                      <span className="text-[11px] text-slate-400 block">{ticket.classInfo}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block line-clamp-1">{ticket.subject}</span>
                      <span className="text-[11px] text-slate-400 block">{ticket.category}</span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {ticket.urgency === 'URGENT' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                          URGENT
                        </span>
                      ) : ticket.urgency === 'IMPORTANT' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          IMPORTANT
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          NORMAL
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {ticket.submittedAt}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {ticket.status === 'Resolved' || ticket.status === 'Closed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {ticket.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          {ticket.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <AdminButton
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenTicket(ticket)}
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

      {/* 4. DRAWER: Review Ticket & Status Transition */}
      <AdminDrawer
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `Grievance ${selectedTicket.ticketNumber}` : 'Ticket Review'}
        subtitle={selectedTicket ? `${selectedTicket.studentName} · ${selectedTicket.classInfo}` : ''}
      >
        {selectedTicket && (
          <div className="space-y-5 text-xs">
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Ticket Info Card */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Category: {selectedTicket.category}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedTicket.urgency === 'URGENT'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedTicket.urgency === 'IMPORTANT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {selectedTicket.urgency} Urgency
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</h4>
                <p className="text-slate-600 mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60 font-normal">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Submitted: {selectedTicket.submittedAt}</span>
                <span className="font-medium text-slate-600">ID: {selectedTicket.studentId}</span>
              </div>
            </div>

            {/* Action Form */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0B72E7]" />
                Administrative Action & Remarks
              </h4>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
                >
                  <option value="In Progress">In Progress (Under Active Investigation)</option>
                  <option value="Pending">Pending (Awaiting Committee Review)</option>
                  <option value="Resolved">Resolved (Corrective Action Completed)</option>
                  <option value="Closed">Closed (Case Concluded)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Administrator Remarks / Response to Student
                </label>
                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Enter remarks explaining the investigation, resolution steps, or institutional feedback..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#0B72E7] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  These remarks will be securely synced to the student&apos;s portal inquiry tracker.
                </span>
              </div>

              <AdminButton
                variant="primary"
                className="w-full py-2.5"
                disabled={isSubmitting}
                onClick={handleUpdateStatus}
                icon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {isSubmitting ? 'Updating...' : 'Save & Notify Student'}
              </AdminButton>
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
