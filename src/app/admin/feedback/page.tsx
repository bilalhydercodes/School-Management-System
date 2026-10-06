import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { Role } from '@prisma/client';
import { getAdminFeedbackAnalyticsAction } from '@/actions/feedback';
import AdminFeedbackDashboardClient from '@/components/admin/AdminFeedbackDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Teacher Feedback Analytics | Admin Portal',
  description: 'School-wide student evaluations, teaching quality dimensions, and cycle management.',
};

export default async function AdminFeedbackPage() {
  const context = await getAuthenticatedContext();
  if (!context || (context.user.role !== Role.ADMIN && context.user.role !== Role.SUPER_ADMIN)) {
    redirect('/login?redirect=/admin/feedback');
  }

  const result = await getAdminFeedbackAnalyticsAction();

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
      initialAnalytics={result.success ? result.analytics || emptyAnalytics : emptyAnalytics}
      cycles={result.success ? result.cycles || [] : []}
    />
  );
}
