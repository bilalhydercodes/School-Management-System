import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { Role } from '@prisma/client';
import { getAdminFeedbackAnalyticsAction } from '@/actions/feedback';
import { getAdminStudentGrievancesAction } from '@/actions/admin/grievances';
import AdminFeedbackDashboardClient from '@/components/admin/AdminFeedbackDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Feedback & Student Grievances | Admin Portal',
  description: 'School-wide teaching evaluations and student grievance redressal management.',
};

export default async function AdminFeedbackPage() {
  const context = await getAuthenticatedContext();
  if (!context || (context.user.role !== Role.ADMIN && context.user.role !== Role.SUPER_ADMIN)) {
    redirect('/login?redirect=/admin/feedback');
  }

  const [feedbackResult, grievanceResult] = await Promise.all([
    getAdminFeedbackAnalyticsAction(),
    getAdminStudentGrievancesAction(),
  ]);

  const emptyAnalytics = {
    totalSubmissions: 0,
    averageRating: 0,
    totalTeachersEvaluated: 0,
    activeCycle: null,
    categoryAverages: {},
    gradeGroupBreakdown: {},
    teachersSummary: [],
  };

  return (
    <AdminFeedbackDashboardClient
      initialAnalytics={feedbackResult.success ? feedbackResult.analytics || emptyAnalytics : emptyAnalytics}
      cycles={feedbackResult.success ? feedbackResult.cycles || [] : []}
      initialGrievances={grievanceResult.success ? grievanceResult.grievances || [] : []}
    />
  );
}
