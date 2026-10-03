'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, Bell, ChevronDown, LogOut, User, Shield, Menu } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { getTeacherAvatarUrl } from '@/lib/teacher-avatar';

interface TeacherHeaderProps {
  teacherName?: string;
  roleTitle?: string;
  gender?: string | null;
  avatarUrl?: string | null;
  onToggleSidebar?: () => void;
}

export function TeacherHeader({
  teacherName = 'Sanjay Yadav',
  roleTitle = 'Teacher',
  gender,
  avatarUrl,
  onToggleSidebar,
}: TeacherHeaderProps) {
  const resolvedAvatar = getTeacherAvatarUrl({ avatarUrl, gender, teacherName });
  const [searchValue, setSearchValue] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between gap-2.5 sm:gap-4 mb-4 select-none">
      {/* Mobile Hamburger & Search Bar */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 max-w-[460px]">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 sm:p-2.5 rounded-xl text-[#102A56] hover:bg-white/80 lg:hidden transition-colors bg-white shadow-[0_2px_12px_rgba(30,100,200,0.04)] border border-white/80 shrink-0 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[#94A3B8]">
            <Search className="w-4 h-4 stroke-[2]" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search students, classes, etc..."
            className="w-full h-10 sm:h-11 pl-9 sm:pl-11 pr-3 sm:pr-4 rounded-[14px] sm:rounded-[16px] bg-white text-xs sm:text-[13.5px] text-[#102A56] placeholder-[#94A3B8] shadow-[0_2px_12px_rgba(30,100,200,0.04)] border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all truncate"
          />
        </div>
      </div>

      {/* Header Actions (Notification Bell & Profile) */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#64748B] hover:text-[#102A56] shadow-[0_2px_12px_rgba(30,100,200,0.04)] border border-white/80 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {/* Small red notification indicator dot */}
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-[#102A56]">Notifications</span>
                <span className="text-[11px] font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                  1 New
                </span>
              </div>
              <div className="py-3 space-y-2.5">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#102A56]">
                      Mid-term exam marks due by Friday
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Academic Office • 2h ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 cursor-pointer group focus:outline-none"
          >
            <div className="relative w-9 h-9 rounded-full ring-2 ring-[#2563EB] ring-offset-2 overflow-hidden bg-slate-100">
              <Image
                src={resolvedAvatar}
                alt={teacherName}
                fill
                priority
                className="object-cover"
              />
            </div>
            <ChevronDown className="w-4 h-4 text-[#64748B] group-hover:text-[#102A56] transition-transform duration-150" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-[#102A56] truncate">{teacherName}</p>
                <p className="text-[11px] text-[#64748B]">{roleTitle}</p>
              </div>
              <div className="py-1">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#64748B] hover:text-[#102A56] hover:bg-slate-50 cursor-pointer">
                  <User className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>My Profile</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#64748B] hover:text-[#102A56] hover:bg-slate-50 cursor-pointer">
                  <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Staff ID: EMP-DPS-101</span>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
