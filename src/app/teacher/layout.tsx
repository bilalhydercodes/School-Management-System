import React from 'react';
import { getSessionFromCookies } from '@/lib/session';
import { Role } from '@/types';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
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
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/login?redirect=/teacher');
  }

  if (
    session.role !== Role.TEACHER &&
    session.role !== Role.SUPER_ADMIN &&
    session.role !== Role.ADMIN
  ) {
    redirect('/unauthorized');
  }

  let teacherName =
    session.firstName && session.lastName
      ? `${session.firstName} ${session.lastName}`
      : 'Teacher';
  let teacherAvatarUrl: string | null = null;
  let teacherGender: string | null = (session as any).gender || null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (session.sub && isUuid.test(session.sub)) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { firstName: true, lastName: true, avatarUrl: true },
      });
      if (dbUser) {
        if (dbUser.firstName && dbUser.lastName) {
          teacherName = `${dbUser.firstName} ${dbUser.lastName}`;
        }
        teacherAvatarUrl = dbUser.avatarUrl;
      }
    } catch {
      // Graceful fallback
    }
  }

  return (
    <TeacherLayoutClient
      teacherName={teacherName}
      gender={teacherGender}
      avatarUrl={teacherAvatarUrl}
    >
      {children}
    </TeacherLayoutClient>
  );
}

