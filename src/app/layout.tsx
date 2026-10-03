import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alpha Edu Hub — School ERP & Management System',
  description: 'Enterprise-grade multi-tenant school operating system for K-12 schools',
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
