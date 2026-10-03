import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — Alpha Edu Hub School ERP',
  description:
    'Securely log in to Alpha Edu Hub — the all-in-one school management platform for administrators, teachers, and students. Access your personalized dashboard in one click.',
  alternates: {
    canonical: 'https://alphaeduhub.in/login',
  },
  openGraph: {
    type: 'website',
    url: 'https://alphaeduhub.in/login',
    title: 'Login — Alpha Edu Hub School ERP',
    description:
      'Access your Alpha Edu Hub dashboard. Secure multi-role login for school admins, teachers, and students.',
    siteName: 'Alpha Edu Hub',
    images: [
      {
        url: '/images/dashboard/open_graph_image.png',
        width: 1730,
        height: 909,
        alt: 'Alpha Edu Hub — School ERP Login',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login — Alpha Edu Hub School ERP',
    description:
      'Secure multi-role login for school admins, teachers, and students.',
    images: ['/images/dashboard/open_graph_image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
