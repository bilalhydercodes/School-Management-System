import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#008CFF',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://alphaeduhub.in'),
  title: {
    default: 'Alpha Edu Hub — Best Multi-Tenant School ERP & Management System',
    template: '%s | Alpha Edu Hub',
  },
  description:
    'Alpha Edu Hub is India’s premier enterprise-grade multi-tenant school operating system & ERP for K-12 institutions, CBSE/ICSE schools, student portals, fee management, and academic administration.',
  keywords: [
    'Alpha Edu Hub',
    'AlphaEduHub',
    'alpha edu hub',
    'alphaeduhub.in',
    'School ERP',
    'School Management System',
    'School Management Software India',
    'Student Information System',
    'CBSE School ERP',
    'School Fee Management Software',
    'Student Portal',
    'Teacher Management Portal',
  ],
  authors: [{ name: 'Alpha Edu Hub', url: 'https://alphaeduhub.in' }],
  creator: 'Alpha Edu Hub',
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
    title: 'Alpha Edu Hub — School ERP & Management System',
    description:
      'Enterprise-grade multi-tenant school operating system for K-12 schools, CBSE/ICSE boards, academic scheduling, attendance, and online fee collection.',
    siteName: 'Alpha Edu Hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alpha Edu Hub — School ERP & Management System',
    description:
      'Unified school management platform for administration, faculty, students, and parents.',
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
      url: 'https://alphaeduhub.in',
      logo: 'https://alphaeduhub.in/logo.png',
      description: 'Enterprise Multi-Tenant School ERP & Operating System for K-12 Institutions in India',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://alphaeduhub.in/#website',
      url: 'https://alphaeduhub.in',
      name: 'Alpha Edu Hub',
      description: 'Multi-Tenant School Management Platform & ERP',
      publisher: {
        '@id': 'https://alphaeduhub.in/#organization',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Alpha Edu Hub',
      operatingSystem: 'Web Browser, Cloud-based',
      applicationCategory: 'EducationalApplication, BusinessApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '128',
      },
    },
  ],
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasClerkKey = Boolean(
  clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('placeholder')
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-brand-subtle text-brand-dark antialiased">
        {children}
      </body>
    </html>
  );

  if (hasClerkKey && clerkKey) {
    return <ClerkProvider publishableKey={clerkKey}>{content}</ClerkProvider>;
  }

  return content;
}
