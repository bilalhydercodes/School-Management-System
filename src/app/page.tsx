import { redirect } from 'next/navigation';
import { getSessionFromCookies, getRoleDefaultPath } from '@/lib/session';
import LandingPage from '@/components/landing/LandingPage';

export const metadata = {
  title: 'Alpha Edu Hub — Next-Gen Multi-Tenant School ERP & Operating System',
  description:
    'Alpha Edu Hub provides complete school automation for Indian K-12 institutions. Student attendance, CBSE/ICSE curriculum grading, online fee collection, teacher workspaces, and mobile portals.',
  alternates: {
    canonical: 'https://alphaeduhub.in',
  },
};

export default async function HomePage() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect(getRoleDefaultPath(session.role));
  }
  return <LandingPage />;
}

