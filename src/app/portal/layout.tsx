import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student & Parent Portal — Alpha Edu Hub',
  description:
    'Access your personalised student or parent dashboard on Alpha Edu Hub — view attendance, timetables, grades, fee status, notices, and school events in real time.',
  alternates: {
    canonical: 'https://alphaeduhub.in/portal',
  },
  openGraph: {
    type: 'website',
    url: 'https://alphaeduhub.in/portal',
    title: 'Student & Parent Portal — Alpha Edu Hub',
    description:
      'Your school at a glance — attendance, timetable, exam results, fee receipts, and live notices from your school administration.',
    siteName: 'Alpha Edu Hub',
    images: [
      {
        url: '/images/dashboard/open_graph_image.png',
        width: 1730,
        height: 909,
        alt: 'Alpha Edu Hub — Student & Parent Portal',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student & Parent Portal — Alpha Edu Hub',
    description:
      'Stay connected with your school: attendance, results, timetable, and more in one smart portal.',
    images: ['/images/dashboard/open_graph_image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
