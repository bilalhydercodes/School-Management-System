'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AIChat from '@/components/ai/AIChat';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  schoolName: string;
  board: string;
  academicYear: string;
  adminName: string;
  adminEmail: string;
  role: string;
}

export default function AdminLayoutClient({
  children,
  schoolName,
  board,
  academicYear,
  adminName,
  adminEmail,
  role,
}: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  // Reset navigation indicator whenever the route changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D8EEFE] via-[#E6F3FE] to-[#EDF6FD] text-[#0F172A] font-sans antialiased selection:bg-[#0B72E7]/20 selection:text-[#0B72E7] relative">
      {/* Sleek Top Navigation Loading Progress Indicator */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B72E7] via-[#38BDF8] to-[#0B72E7] animate-pulse z-[100] shadow-[0_0_12px_rgba(11,114,231,0.8)]" />
      )}

      {/* Floating Standalone Left Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        schoolName={schoolName}
        tagline="Learn · Grow · Excel"
        onNavigate={() => setIsNavigating(true)}
      />

      {/* Main Content Area offset by Sidebar on desktop */}
      <div className="lg:pl-[304px] flex flex-col min-h-screen p-3 md:p-4">
        {/* Top Header */}
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          adminName="Admin"
          adminEmail={adminEmail}
          role={role}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full max-w-[1536px] mx-auto py-2.5 space-y-4">
          {children}
        </main>
      </div>

      {/* Alpha AI Copilot Floating Assistant */}
      <AIChat
        schoolName={schoolName}
        initialRole={role}
        initialUserName={adminName}
      />
    </div>
  );
}

