import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { Role } from '@prisma/client';
import { getTeacherAggregatedFeedbackAction } from '@/actions/feedback';
import TeacherFeedbackClient from '@/components/teacher/TeacherFeedbackClient';

export const metadata = {
  title: 'My Feedback | Teacher Portal',
  description: 'View student feedback and teaching experience insights.',
};

export default async function TeacherFeedbackPage() {
  const context = await getAuthenticatedContext();
  if (!context) {
    redirect('/login?redirect=/teacher/feedback');
  }

  if (context.user.role !== Role.TEACHER && context.user.role !== Role.SUPER_ADMIN) {
    redirect('/teacher');
  }

  const result = await getTeacherAggregatedFeedbackAction();

  return (
    <TeacherFeedbackClient
      initialFeedback={result.success ? result.feedback || null : null}
      cycles={result.success ? result.cycles || [] : []}
    />
  );
}
