import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ApplicationStatusClient from '@/components/registration/ApplicationStatusClient';

interface StatusPageProps {
  params: {
    applicationId: string;
  };
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Application Status — Alpha Edu Hub',
  description: 'Track the status and verification progression of your institution onboarding application.',
};

export default async function ApplicationStatusPage({ params }: StatusPageProps) {
  const application = await prisma.institutionApplication.findUnique({
    where: { id: params.applicationId },
  });

  if (!application) {
    notFound();
  }

  return <ApplicationStatusClient application={application} />;
}
