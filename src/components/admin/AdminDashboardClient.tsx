'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdminHeroBanner from './AdminHeroBanner';
import AdminQuickActions from './AdminQuickActions';
import AdminManageOverview from './AdminManageOverview';
import { publishNoticeAction, type PublishNoticeInput } from '@/actions/admin/notices';
import { Plus, X, Send, Megaphone, AlertCircle, ChevronRight, MessageSquareHeart } from 'lucide-react';
import AdminModal from './ui/AdminModal';
import AdminButton from './ui/AdminButton';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';

export interface AdminDashboardClientProps {
  schoolName: string;
  board: string;
  metrics: {
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    submittedSectionsCount: number;
    totalSectionsCount: number;
    presentCount: number;
    totalFeeCollected: number;
    totalFeePending: number;
    totalFeeInvoiced: number;
    totalOverdueAmount: number;
    overdueCount: number;
    collectionPercentage: number;
    totalNotices: number;
    activeSubstitutions: number;
    pendingAdmissionsCount: number;
  };
  unsubmittedSections: Array<{
    id: string;
    name: string;
  }>;
  recentNotices: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    priority: string;
    targetAudience: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    timestamp: string;
    ipAddress?: string | null;
    userName: string;
  }>;
  classSections: Array<{
    id: string;
    className: string;
    sectionName: string;
    studentCount: number;
    classTeacherName: string;
    isSubmittedToday: boolean;
  }>;
}

export default function AdminDashboardClient({
  schoolName = 'Alpha Edu Hub',
  board = 'CBSE',
  metrics,
  unsubmittedSections,
  recentNotices,
  recentAuditLogs,
  classSections,
}: AdminDashboardClientProps) {
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState<PublishNoticeInput>({
    title: '',
    content: '',
    priority: 'NORMAL',
    targetAudience: 'ALL',
  });
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);
  const [noticeFeedback, setNoticeFeedback] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNotice(true);
    setNoticeFeedback(null);

    const res = await publishNoticeAction(noticeForm);
    setIsSubmittingNotice(false);

    if (res.success) {
      setNoticeFeedback({ success: true, message: 'Circular published successfully.' });
      setTimeout(() => {
        setIsNoticeModalOpen(false);
        setNoticeFeedback(null);
        setNoticeForm({ title: '', content: '', priority: 'NORMAL', targetAudience: 'ALL' });
      }, 1000);
    } else {
      setNoticeFeedback({ success: false, message: res.error || 'Failed to publish circular.' });
    }
  };

  return (
    <div className="w-full space-y-4 lg:space-y-5 pb-6">
      {/* 1. Welcome / Hero Banner */}
      <AdminHeroBanner
        adminName="Admin"
        schoolName={schoolName}
        tagline="Manage · Monitor · Build a Better Learning Experience"
      />

      {/* 2. Quick Action Row */}
      <AdminQuickActions />

      {/* 3. Manage & Overview Section */}
      <AdminManageOverview />

      {/* 3.5 AI Proactive Insights */}
      <AIInsightsWidget role="ADMIN" title="Executive Operational & Academic Insights" />

      {/* 4. Teaching Experience Summary Widget */}
      <div className="w-full bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_2px_14px_rgba(30,100,200,0.03)] border border-slate-100/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center shrink-0 border border-blue-100">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#102A56]">
                  Teaching Experience & Feedback
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B72E7] border border-blue-200/60">
                  Adaptive Portal Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                School-wide student evaluations, teaching quality dimensions, and anonymized faculty insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/admin/feedback"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-[#0B72E7] hover:bg-blue-100/80 text-xs font-bold transition-colors"
            >
              <span>View Feedback Analytics</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Notice Modal (Preserving existing action functionality) */}
      <AdminModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title="Publish Official Circular"
        description="Broadcast notifications to students, teachers, parents, or school-wide."
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setIsNoticeModalOpen(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              isLoading={isSubmittingNotice}
              onClick={handlePublishNotice}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Publish Circular
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handlePublishNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Circular Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Sports Meet Timetable"
              value={noticeForm.title}
              onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0B72E7] focus:ring-2 focus:ring-[#0B72E7]/10 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={noticeForm.priority}
                onChange={(e) =>
                  setNoticeForm({ ...noticeForm, priority: e.target.value as any })
                }
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#0B72E7] outline-none"
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
              <select
                value={noticeForm.targetAudience}
                onChange={(e) =>
                  setNoticeForm({ ...noticeForm, targetAudience: e.target.value as any })
                }
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#0B72E7] outline-none"
              >
                <option value="ALL">All (School-Wide)</option>
                <option value="PARENTS">Parents Only</option>
                <option value="TEACHERS">Teachers Only</option>
                <option value="STUDENTS">Students Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Circular Content *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Enter announcement details..."
              value={noticeForm.content}
              onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#0B72E7] outline-none"
            />
          </div>

          {noticeFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                noticeFeedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {noticeFeedback.message}
            </div>
          )}
        </form>
      </AdminModal>
    </div>
  );
}
