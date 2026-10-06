'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TeacherSidebar } from './TeacherSidebar';
import { TeacherHeader } from './TeacherHeader';
import AIChat from '@/components/ai/AIChat';

interface TeacherLayoutClientProps {
  teacherName: string;
  gender?: string | null;
  avatarUrl?: string | null;
  children: React.ReactNode;
}

export default function TeacherLayoutClient({
  teacherName,
  gender,
  avatarUrl,
  children,
}: TeacherLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsNavigating(false);
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4bc8fa] via-[#9fe4fc] to-[#eff8fd] text-[#0F172A] font-sans antialiased relative">
      {/* Top Navigation Loading Progress Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 animate-pulse z-[100] shadow-[0_0_12px_rgba(37,99,235,0.8)]" />
      )}

      {/* Floating Standalone Left Sidebar */}
      <TeacherSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        schoolName="Alpha Edu Hub"
        tagline="Learn · Grow · Excel"
        onNavigate={() => setIsNavigating(true)}
      />

      {/* Main Content Area offset by Sidebar on desktop */}
      <div className="lg:pl-[284px] flex flex-col min-h-screen p-3 sm:p-4">
        <div className="w-full max-w-[1536px] mx-auto flex flex-col flex-1 min-w-0">
          <TeacherHeader
            teacherName={teacherName}
            roleTitle="(Teacher)"
            gender={gender}
            avatarUrl={avatarUrl}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* Alpha AI Copilot Floating Assistant */}
      <AIChat
        schoolName="Alpha Edu Hub"
        initialRole="TEACHER"
        initialUserName={teacherName}
      />
    </div>
  );
}
