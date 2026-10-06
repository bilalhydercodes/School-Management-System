'use client';

import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Star,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Search,
  Plus,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import AdminPageHeader from './ui/AdminPageHeader';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminBadge from './ui/AdminBadge';
import AdminDrawer from './ui/AdminDrawer';
import AdminModal from './ui/AdminModal';
import {
  createFeedbackCycleAction,
  getAdminTeacherFeedbackDetailAction,
  type AdminFeedbackOverview,
} from '@/actions/feedback';
import { FeedbackCycleFrequency, FeedbackCycleStatus, GradeGroup } from '@prisma/client';

interface AdminFeedbackDashboardClientProps {
  initialAnalytics: AdminFeedbackOverview;
  cycles: Array<{ id: string; title: string; status: string; startDate: Date; endDate: Date }>;
}

export default function AdminFeedbackDashboardClient({
  initialAnalytics,
  cycles,
}: AdminFeedbackDashboardClientProps) {
  const [analytics, setAnalytics] = useState<AdminFeedbackOverview>(initialAnalytics);
  const [cycleList, setCycleList] = useState(cycles);
  const [selectedCycleId, setSelectedCycleId] = useState<string>(analytics.activeCycle?.id || (cycles[0]?.id || ''));
  const [selectedGradeGroup, setSelectedGradeGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Teacher Detail Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // New Cycle Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingCycle, setIsSubmittingCycle] = useState(false);
  const [cycleError, setCycleError] = useState<string | null>(null);
  const [newCycleForm, setNewCycleForm] = useState<{
    title: string;
    description: string;
    frequency: FeedbackCycleFrequency;
    startDate: string;
    endDate: string;
  }>({
    title: 'Quarterly Evaluation Q2 (2026-27)',
    description: 'Comprehensive student feedback cycle across all academic faculties.',
    frequency: FeedbackCycleFrequency.QUARTERLY,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleCycleFilterChange = async (cId: string) => {
    setSelectedCycleId(cId);
    const { getAdminFeedbackAnalyticsAction } = await import('@/actions/feedback');
    const res = await getAdminFeedbackAnalyticsAction({
      cycleId: cId,
      gradeGroup: selectedGradeGroup,
    });
    if (res.success && res.analytics) {
      setAnalytics(res.analytics);
    }
  };

  const handleGradeFilterChange = async (gg: string) => {
    setSelectedGradeGroup(gg);
    const { getAdminFeedbackAnalyticsAction } = await import('@/actions/feedback');
    const res = await getAdminFeedbackAnalyticsAction({
      cycleId: selectedCycleId,
      gradeGroup: gg,
    });
    if (res.success && res.analytics) {
      setAnalytics(res.analytics);
    }
  };

  const handleViewTeacherDetail = async (teacherId: string) => {
    setIsDrawerOpen(true);
    setLoadingDetail(true);
    setSelectedTeacherDetail(null);
    try {
      const res = await getAdminTeacherFeedbackDetailAction(teacherId, selectedCycleId);
      if (res.success) {
        setSelectedTeacherDetail(res);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCycle(true);
    setCycleError(null);
    try {
      const res = await createFeedbackCycleAction({
        title: newCycleForm.title,
        description: newCycleForm.description,
        frequency: newCycleForm.frequency,
        startDate: newCycleForm.startDate,
        endDate: newCycleForm.endDate,
        isPublished: true,
      });

      if (!res.success) {
        setCycleError(res.error || 'Failed to create cycle.');
      } else if (res.cycle) {
        setIsModalOpen(false);
        setCycleList((prev) => [
          {
            id: res.cycle!.id,
            title: res.cycle!.title,
            status: res.cycle!.status,
            startDate: res.cycle!.startDate,
            endDate: res.cycle!.endDate,
          },
          ...prev,
        ]);
        setSelectedCycleId(res.cycle.id);
        const { getAdminFeedbackAnalyticsAction } = await import('@/actions/feedback');
        const refreshed = await getAdminFeedbackAnalyticsAction({ cycleId: res.cycle.id });
        if (refreshed.success && refreshed.analytics) {
          setAnalytics(refreshed.analytics);
        }
      }
    } catch (err: any) {
      setCycleError(err?.message || 'Error creating cycle.');
    } finally {
      setIsSubmittingCycle(false);
    }
  };

  const filteredTeachers = analytics.teachersSummary.filter(
    (t) =>
      t.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Teacher Feedback & Experience Insights"
        description="Monitor school-wide student evaluations, teaching quality dimensions, and feedback cycles."
        breadcrumbs={[{ label: 'Staff Management', href: '/admin/teachers' }, { label: 'Teacher Feedback' }]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Cycle Selector */}
            <div className="relative">
              <select
                value={selectedCycleId}
                onChange={(e) => handleCycleFilterChange(e.target.value)}
                className="appearance-none bg-white text-xs font-semibold text-slate-700 pl-3.5 pr-8 py-2 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]/20"
              >
                {cycleList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.status})
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <AdminButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Configure Cycle
            </AdminButton>
          </div>
        }
      />

      {/* Institutional Privacy & Policy Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-2xs text-[#0B72E7] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950">
              Institutional Privacy & Constructive Growth Standard
            </h4>
            <p className="text-[11px] text-blue-700/90 mt-0.5">
              Teacher evaluations are collected for faculty mentoring and institutional enhancement. Individual student responses remain anonymous to protect student voice and prevent grading bias.
            </p>
          </div>
        </div>
        <AdminBadge variant="info">Quarterly Active</AdminBadge>
      </div>

      {/* 4 Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Submissions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B72E7] flex items-center justify-center">
              <MessageSquareHeart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {analytics.totalSubmissions}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Student evaluations recorded</p>
        </div>

        {/* Metric 2: Average Rating */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Rating
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <p className="text-2xl font-bold text-slate-900">
              {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : '—'}
            </p>
            <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Institutional satisfaction index</p>
        </div>

        {/* Metric 3: Teachers Evaluated */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faculty Evaluated
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {analytics.totalTeachersEvaluated}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Teachers with active responses</p>
        </div>

        {/* Metric 4: Feedback Cycle */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cycle Status
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 mt-2 truncate">
            {analytics.activeCycle?.title || 'No Active Cycle'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Status: {analytics.activeCycle?.status || 'PENDING'}
          </p>
        </div>
      </div>

      {/* Two Column Section: Category Scores & Grade-Group Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimension Scores (Category Averages) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dimension Score Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Average scores across key teaching dimensions</p>
            </div>
            <Sparkles className="w-4 h-4 text-[#0B72E7]" />
          </div>

          <div className="space-y-4 mt-5">
            {Object.keys(analytics.categoryAverages).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No dimension data recorded for this cycle yet.
              </p>
            ) : (
              Object.entries(analytics.categoryAverages).map(([category, score]) => {
                const pct = Math.min(100, Math.round((score / 5.0) * 100));
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{category}</span>
                      <span className="font-bold text-[#0B72E7]">{score.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0B72E7] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Grade-Group Response Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Submissions by Grade Level</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across adaptive grade brackets</p>
            </div>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            {[
              { key: 'FOUNDATION', label: 'Foundation (Classes 1–2)', desc: 'Emoji scale & visual cards' },
              { key: 'PRIMARY', label: 'Primary (Classes 3–5)', desc: '5-star & predefined areas' },
              { key: 'MIDDLE', label: 'Middle (Classes 6–8)', desc: '7 dimensions & suggestions' },
              { key: 'SECONDARY', label: 'Secondary (Classes 9–10)', desc: 'Curriculum & exam clarity' },
              { key: 'SENIOR_SECONDARY', label: 'Senior Sec (Classes 11–12)', desc: 'Concept depth & pace' },
            ].map((gg) => {
              const count = analytics.gradeGroupBreakdown[gg.key] || 0;
              return (
                <div
                  key={gg.key}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{gg.label}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{gg.desc}</p>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Submissions:</span>
                    <span className="text-sm font-bold text-[#0B72E7]">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Teaching Experience Insights Table (NO LEADERBOARD) */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Teaching Experience Insights</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review faculty evaluation summaries, response counts, and detailed dimensions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-slate-50 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]/20 w-44"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Grade Group Filter */}
            <select
              value={selectedGradeGroup}
              onChange={(e) => handleGradeFilterChange(e.target.value)}
              className="text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden text-slate-700 font-medium"
            >
              <option value="ALL">All Grade Groups</option>
              <option value="FOUNDATION">Foundation (1-2)</option>
              <option value="PRIMARY">Primary (3-5)</option>
              <option value="MIDDLE">Middle (6-8)</option>
              <option value="SECONDARY">Secondary (9-10)</option>
              <option value="SENIOR_SECONDARY">Senior Sec (11-12)</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        {filteredTeachers.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareHeart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No Teacher Evaluations Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no student feedback records matching the selected cycle or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-5">Faculty Member</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5 text-center">Responses</th>
                  <th className="py-3 px-5 text-center">Overall Score</th>
                  <th className="py-3 px-5">Top Strength Area</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => (
                  <tr key={t.teacherId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {t.teacherName}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-medium">
                        {t.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center font-bold text-slate-700">
                      {t.responseCount}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span className="font-bold text-amber-700">{t.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {t.topCategory || 'Balanced Dimensions'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleViewTeacherDetail(t.teacherId)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0B72E7] hover:underline cursor-pointer"
                      >
                        <span>View Insights</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Teacher Detail Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Faculty Feedback Detail"
        subtitle={selectedTeacherDetail?.teacher?.name || 'Detailed Dimension Analysis'}
        width="2xl"
      >
        {loadingDetail ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-slate-100 rounded-2xl" />
            <div className="h-40 bg-slate-100 rounded-2xl" />
            <div className="h-32 bg-slate-100 rounded-2xl" />
          </div>
        ) : selectedTeacherDetail ? (
          <div className="space-y-6">
            {/* Teacher Profile Strip */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedTeacherDetail.teacher.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTeacherDetail.teacher.designation} · {selectedTeacherDetail.teacher.department} (Emp ID: {selectedTeacherDetail.teacher.employeeId})
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="text-base font-bold text-amber-800">
                    {selectedTeacherDetail.analytics.overallRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-amber-600 font-medium">/ 5.0</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedTeacherDetail.analytics.responseCount} student evaluations
                </p>
              </div>
            </div>

            {/* Dimension Breakdown */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Dimension Scores
              </h5>
              <div className="space-y-2.5">
                {Object.entries(selectedTeacherDetail.analytics.categoryScores).map(
                  ([category, score]: [string, any]) => (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{category}</span>
                        <span className="font-bold text-[#0B72E7]">{score.toFixed(1)} / 5.0</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0B72E7] rounded-full"
                          style={{ width: `${Math.min(100, Math.round((score / 5.0) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Strengths & Improvement Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
                <h6 className="text-xs font-bold text-emerald-900 mb-2">Top Strengths Appreciated</h6>
                {selectedTeacherDetail.analytics.topStrengths.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No specific tags recorded.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {selectedTeacherDetail.analytics.topStrengths.map((s: any, idx: number) => (
                      <li key={idx} className="text-xs text-emerald-800 flex items-center justify-between">
                        <span>• {s.label}</span>
                        <span className="font-bold bg-white px-1.5 py-0.5 rounded text-[10px] border border-emerald-200">
                          {s.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Suggestions */}
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40">
                <h6 className="text-xs font-bold text-amber-900 mb-2">Student Suggested Areas</h6>
                {selectedTeacherDetail.analytics.topSuggestions.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No specific tags recorded.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {selectedTeacherDetail.analytics.topSuggestions.map((s: any, idx: number) => (
                      <li key={idx} className="text-xs text-amber-800 flex items-center justify-between">
                        <span>• {s.label}</span>
                        <span className="font-bold bg-white px-1.5 py-0.5 rounded text-[10px] border border-amber-200">
                          {s.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Anonymized Written Comments */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Anonymized Student Comments</span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {selectedTeacherDetail.analytics.comments.length}
                </span>
              </h5>
              {selectedTeacherDetail.analytics.comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No written comments submitted.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTeacherDetail.analytics.comments.map((c: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700 leading-relaxed"
                    >
                      &ldquo;{c}&rdquo;
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </AdminDrawer>

      {/* Create Cycle Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure Feedback Cycle"
        description="Schedule a new student feedback evaluation window for your institution."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCycle} className="space-y-4">
          {cycleError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {cycleError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cycle Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newCycleForm.title}
              onChange={(e) => setNewCycleForm({ ...newCycleForm, title: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]/20"
              placeholder="e.g. Quarterly Feedback Q2 2026-27"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Frequency Pattern
            </label>
            <select
              value={newCycleForm.frequency}
              onChange={(e) =>
                setNewCycleForm({ ...newCycleForm, frequency: e.target.value as FeedbackCycleFrequency })
              }
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]/20 bg-white"
            >
              <option value={FeedbackCycleFrequency.QUARTERLY}>Quarterly (Default)</option>
              <option value={FeedbackCycleFrequency.MONTHLY}>Monthly</option>
              <option value={FeedbackCycleFrequency.HALF_YEARLY}>Half-Yearly</option>
              <option value={FeedbackCycleFrequency.CUSTOM}>Custom Period</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={newCycleForm.startDate}
                onChange={(e) => setNewCycleForm({ ...newCycleForm, startDate: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={newCycleForm.endDate}
                onChange={(e) => setNewCycleForm({ ...newCycleForm, endDate: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={2}
              value={newCycleForm.description}
              onChange={(e) => setNewCycleForm({ ...newCycleForm, description: e.target.value })}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B72E7]/20"
              placeholder="Instructions or context for this evaluation cycle..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <AdminButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingCycle}
            >
              Launch Cycle
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
