'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  UserCheck,
  Calendar,
  CalendarRange,
  CheckSquare,
  Users,
  FileSpreadsheet,
  UploadCloud,
  MessageSquare,
  Briefcase,
  ClipboardList,
  Bell,
  CalendarHeart,
  BookOpen,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react';

interface TeacherSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  schoolName?: string;
  tagline?: string;
  onNavigate?: (href: string) => void;
}

export function TeacherSidebar({
  isOpen = false,
  onClose,
  schoolName = 'Alpha Edu Hub',
  tagline = 'Learn · Grow · Excel',
  onNavigate,
}: TeacherSidebarProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleLinkClick = (href: string) => {
    if (pathname !== href) {
      setPendingHref(href);
      onNavigate?.(href);
    }
    onClose?.();
  };

  const isNavActive = (href: string) => {
    if (href === '/teacher') {
      return pathname === '/teacher';
    }
    return pathname.startsWith(href);
  };

  const navGroups = [
    {
      items: [
        { name: 'Dashboard', href: '/teacher', icon: Home },
        { name: 'My Attendance', href: '/teacher/attendance', icon: UserCheck },
        { name: "Today's Schedule", href: '/teacher/schedule', icon: Calendar },
        { name: 'Timetable', href: '/teacher/timetable', icon: CalendarRange },
      ],
    },
    {
      items: [
        { name: 'Class Attendance', href: '/teacher/class-attendance', icon: CheckSquare },
        { name: 'Student Roster', href: '/teacher/students', icon: Users },
        { name: 'Exam Marks Entry', href: '/teacher/marks', icon: FileSpreadsheet },
        { name: 'Bulk Marks Import', href: '/teacher/marks/import', icon: UploadCloud },
        { name: 'Student Remarks', href: '/teacher/remarks', icon: MessageSquare },
      ],
    },
    {
      items: [
        { name: 'Apply Leave', href: '/teacher/leave/apply', icon: Briefcase },
        { name: 'Leave Status', href: '/teacher/leave/status', icon: ClipboardList },
        { name: 'Notices & Circulars', href: '/teacher/notices', icon: Bell },
        { name: 'Events & Holidays', href: '/teacher/events', icon: CalendarHeart },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Floating Standalone Sidebar Card */}
      <aside
        className={`fixed top-3 bottom-3 left-3 z-50 w-[268px] bg-white rounded-[26px] p-4 flex flex-col justify-between shadow-[0_4px_24px_rgba(30,100,200,0.06)] border border-white/80 select-none transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-[115%]'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-4 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-3 group transition-opacity hover:opacity-90"
              title="Return to Public Dashboard"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50/80 border border-blue-100/80 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/images/dashboard/logo_transparent_bg.png"
                  alt="Alpha Edu Hub"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-[14.5px] font-bold text-[#102A56] leading-tight truncate group-hover:text-blue-600 transition-colors">
                  {schoolName}
                </h1>
                <p className="text-[11px] font-medium text-[#64748B] mt-0.5 tracking-wide truncate">
                  {tagline}
                </p>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Scrollable on small heights) */}
          <nav className="space-y-1 mt-1 overflow-y-auto flex-1 pr-1 -mr-1">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                {groupIdx > 0 && (
                  <div className="my-2 border-t border-[#EEF2F6] mx-2" />
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isNavActive(item.href);
                    const isPending = pendingHref === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        prefetch={true}
                        onClick={() => handleLinkClick(item.href)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-[13.5px] font-medium transition-all ${
                          active
                            ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.28)]'
                            : isPending
                            ? 'bg-[#2563EB]/10 text-[#2563EB] ring-1 ring-[#2563EB]/30'
                            : 'text-[#64748B] hover:text-[#102A56] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isPending ? (
                            <Loader2 className="w-4 h-4 shrink-0 text-[#2563EB] animate-spin" />
                          ) : (
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                active ? 'text-white stroke-[2.2]' : 'text-[#64748B] stroke-[1.8]'
                              }`}
                            />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isPending && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Help & Support */}
        <div className="pt-2 shrink-0">
          <Link
            href="/teacher/help"
            prefetch={true}
            onClick={() => handleLinkClick('/teacher/help')}
            className={`flex items-center justify-between p-2.5 rounded-[16px] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#E0F2FE] transition-colors group cursor-pointer ${
              pendingHref === '/teacher/help' ? 'ring-1 ring-[#0284C7]/40' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] group-hover:bg-white flex items-center justify-center text-[#0284C7] shrink-0 transition-colors">
                {pendingHref === '/teacher/help' ? (
                  <Loader2 className="w-4 h-4 stroke-[2] animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4 stroke-[2]" />
                )}
              </div>
              <span className="text-[13px] font-semibold text-[#102A56]">
                Help & Support
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0284C7] transition-colors" />
          </Link>
        </div>
      </aside>
    </>
  );
}

