import React from 'react';
import { getSessionFromCookies } from '@/lib/session';
import { Role } from '@/types';
import { redirect } from 'next/navigation';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
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

  // In development, allow seamless preview if no session cookie exists
  let effectiveSession = session;
  if (!effectiveSession && process.env.NODE_ENV === 'development') {
    try {
      const demoTeacher = await prisma.user.findFirst({
        where: { role: Role.TEACHER },
      });
      if (demoTeacher) {
        effectiveSession = {
          sub: demoTeacher.id,
          tenantId: demoTeacher.tenantId || 'dps',
          role: Role.TEACHER,
          firstName: demoTeacher.firstName || 'Sanjay',
          lastName: demoTeacher.lastName || 'Yadav',
          email: demoTeacher.email,
        };
      } else {
        effectiveSession = {
          sub: 'dev-teacher',
          tenantId: 'dev-tenant',
          role: Role.TEACHER,
          firstName: 'Sanjay',
          lastName: 'Yadav',
          email: 'teacher@dps.edu.in',
        };
      }
    } catch {
      effectiveSession = {
        sub: 'dev-teacher',
        tenantId: 'dev-tenant',
        role: Role.TEACHER,
        firstName: 'Sanjay',
        lastName: 'Yadav',
        email: 'teacher@dps.edu.in',
      };
    }
  }

  if (!effectiveSession) {
    redirect('/login?redirect=/teacher');
  }

  if (
    effectiveSession.role !== Role.TEACHER &&
    effectiveSession.role !== Role.SUPER_ADMIN &&
    effectiveSession.role !== Role.ADMIN
  ) {
    redirect('/unauthorized');
  }

  const teacherName =
    effectiveSession.firstName && effectiveSession.lastName
      ? `${effectiveSession.firstName} ${effectiveSession.lastName}`
      : 'Sanjay Yadav';

  return (
    <TeacherLayoutClient teacherName={teacherName}>
      {children}
    </TeacherLayoutClient>
  );
}

