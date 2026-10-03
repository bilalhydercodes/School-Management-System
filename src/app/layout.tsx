import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alpha Edu Hub — School ERP & Management System',
  description: 'Enterprise-grade multi-tenant school operating system for K-12 schools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-brand-subtle text-brand-dark antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
