'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminHeader from './SuperAdminHeader';
import AIChat from '@/components/ai/AIChat';

interface SuperAdminLayoutClientProps {
  adminName: string;
  adminEmail: string;
  children: React.ReactNode;
}

export default function SuperAdminLayoutClient({
  adminName,
  adminEmail,
  children,
}: SuperAdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 relative">
      {/* Top Navigation Loading Progress Indicator */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-indigo-400 to-purple-600 animate-pulse z-[100] shadow-[0_0_12px_rgba(147,51,234,0.8)]" />
      )}

      <SuperAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        adminName={adminName}
        adminEmail={adminEmail}
        onNavigate={() => setIsNavigating(true)}
      />

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <SuperAdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          adminName={adminName}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Alpha AI Copilot Floating Assistant */}
      <AIChat
        schoolName="Platform Admin"
        initialRole="SUPER_ADMIN"
        initialUserName={adminName}
      />
    </div>
  );
}

