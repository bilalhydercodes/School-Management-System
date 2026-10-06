import React from 'react';
import { Role } from '@/types';
import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth-context';
import TeacherLayoutClient from '@/components/teacher/TeacherLayoutClient';

export const metadata = {
  title: 'Teacher Portal — Alpha Edu Hub',
  description:
    'Alpha Edu Hub teacher workspace: manage timetables, attendance, assignments, student grades, and class schedules — all in one intelligent dashboard.',
  alternates: {
    canonical: 'https://alphaeduhub.in/teacher',
  },
  openGraph: {
    type: 'website',
    url: 'https://alphaeduhub.in/teacher',
    title: 'Teacher Portal — Alpha Edu Hub',
    description:
      'Streamlined faculty workspace with timetables, attendance, grading, and communication tools for modern K-12 schools.',
    siteName: 'Alpha Edu Hub',
    images: [
      {
        url: '/images/dashboard/open_graph_image.png',
        width: 1730,
        height: 909,
        alt: 'Alpha Edu Hub — Teacher Portal Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teacher Portal — Alpha Edu Hub',
    description:
      'Manage timetables, attendance, and student grades from one powerful teacher dashboard.',
    images: ['/images/dashboard/open_graph_image.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function TeacherPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getAuthenticatedContext();

  if (!context) {
    redirect('/login?redirect=/teacher');
  }

  if (
    context.role !== Role.TEACHER &&
    context.role !== Role.SUPER_ADMIN &&
    context.role !== Role.ADMIN
  ) {
    redirect('/unauthorized');
  }

  const teacherName = context.user.fullName || 'Teacher';
  const teacherAvatarUrl = context.user.avatarUrl;

  return (
    <TeacherLayoutClient
      teacherName={teacherName}
      avatarUrl={teacherAvatarUrl}
    >
      {children}
    </TeacherLayoutClient>
  );
}
