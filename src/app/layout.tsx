import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#008CFF',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://alphaeduhub.in'),
  title: {
    default: 'Alpha Edu Hub | School Management System & School ERP',
    template: '%s | Alpha Edu Hub',
  },
  description:
    'Alpha Edu Hub is an all-in-one school management platform that helps schools manage attendance, fee records, administration, and communication through a centralized web application.',
  keywords: [
    'Alpha Edu Hub',
    'AlphaEduHub',
    'alpha edu hub',
    'alphaeduhub.in',
    'Alpha Edu Hub school management system',
    'Alpha Edu Hub founder',
    'Mahammad Bilal Hyder Alpha Edu Hub',
    'Mahammad Bilal Hyder',
    'School ERP',
    'School Management System',
    'School Management Software India',
    'Student Information System',
    'CBSE School ERP',
    'School Fee Management Software',
    'Student Attendance Management',
    'Student Portal',
    'Teacher Management Portal',
  ],
  authors: [
    { name: 'Alpha Edu Hub', url: 'https://alphaeduhub.in' },
    { name: 'Mahammad Bilal Hyder', url: 'https://www.linkedin.com/in/mahammad-bilal-hyder-493295356/' },
  ],
  creator: 'Mahammad Bilal Hyder',
  publisher: 'Alpha Edu Hub',
  applicationName: 'Alpha Edu Hub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://alphaeduhub.in',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://alphaeduhub.in',
    title: 'Alpha Edu Hub | School Management System & School ERP',
    description:
      'Alpha Edu Hub is an all-in-one school management platform that helps schools manage attendance, fee records, administration, and communication through a centralized web application.',
    siteName: 'Alpha Edu Hub',
    images: [
      {
        url: '/images/dashboard/open_graph_image.png',
        width: 1730,
        height: 909,
        alt: 'Alpha Edu Hub — School Management System & School ERP',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alpha Edu Hub | School Management System & School ERP',
    description:
      'Alpha Edu Hub is an all-in-one school management platform that helps schools manage attendance, fee records, administration, and communication.',
    images: ['/images/dashboard/open_graph_image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
  verification: {
    google: 'google5ccf3405d93d58e9',
    other: {
      'google-site-verification': ['google5ccf3405d93d58e9', 'google5ccf3405d93d58e9.html'],
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://alphaeduhub.in/#organization',
      name: 'Alpha Edu Hub',
      alternateName: ['AlphaEduHub', 'Alpha Edu Hub ERP'],
      url: 'https://alphaeduhub.in',
      logo: 'https://alphaeduhub.in/images/dashboard/logo_transparent_bg.png',
      description:
        'Alpha Edu Hub is an all-in-one school management platform that helps schools manage attendance, fee records, administration, and communication through a centralized web application.',
      founder: {
        '@type': 'Person',
        '@id': 'https://alphaeduhub.in/#founder',
        name: 'Mahammad Bilal Hyder',
        jobTitle: 'Founder',
        url: 'https://alphaeduhub.in/about',
        sameAs: ['https://www.linkedin.com/in/mahammad-bilal-hyder-493295356/'],
      },
      sameAs: [
        'https://alphaeduhub.in',
        'https://www.linkedin.com/company/143961171/',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        telephone: ['+91-8277300451', '+91-9845488621'],
        email: 'support@alphaeduhub.in',
        url: 'https://alphaeduhub.in/contact',
        availableLanguage: ['English', 'Hindi'],
      },
    },
    {
      '@type': 'Person',
      '@id': 'https://alphaeduhub.in/#founder',
      name: 'Mahammad Bilal Hyder',
      jobTitle: 'Founder',
      url: 'https://alphaeduhub.in/about',
      worksFor: {
        '@id': 'https://alphaeduhub.in/#organization',
      },
      sameAs: ['https://www.linkedin.com/in/mahammad-bilal-hyder-493295356/'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://alphaeduhub.in/#website',
      url: 'https://alphaeduhub.in',
      name: 'Alpha Edu Hub',
      alternateName: 'AlphaEduHub',
      description:
        'Centralized multi-tenant school management system and school ERP platform for K-12 institutions.',
      publisher: {
        '@id': 'https://alphaeduhub.in/#organization',
      },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://alphaeduhub.in/#software',
      name: 'Alpha Edu Hub',
      operatingSystem: 'Web Browser, Cloud-based',
      applicationCategory: 'EducationalApplication, BusinessApplication',
      description:
        'Multi-tenant school management and ERP platform with student information system, attendance, automated fee invoicing, examination grading, and role-based portals.',
      url: 'https://alphaeduhub.in',
      author: {
        '@id': 'https://alphaeduhub.in/#organization',
      },
    },
  ],
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasClerkKey = Boolean(
  clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('placeholder')
);

import OfflineProvider from '@/components/offline/OfflineProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${plusJakartaSans.variable} font-sans min-h-screen bg-brand-subtle text-brand-dark antialiased`} suppressHydrationWarning>
        <OfflineProvider>
          {children}
        </OfflineProvider>
      </body>
    </html>
  );

  if (hasClerkKey && clerkKey) {
    return <ClerkProvider publishableKey={clerkKey}>{content}</ClerkProvider>;
  }

  return content;
}
