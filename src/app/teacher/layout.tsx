import React from 'react';
import { getSessionFromCookies } from '@/lib/session';
import { Role } from '@/types';
import { redirect } from 'next/navigation';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { prisma } from '@/lib/db';

import TeacherLayoutClient from '@/components/teacher/TeacherLayoutClient';

export const metadata = {
  title: 'Teacher Portal | Alpha Edu Hub',
  description: 'Faculty workspace and management system',
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

