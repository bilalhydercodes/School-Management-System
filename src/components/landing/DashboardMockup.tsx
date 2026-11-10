import React from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  GraduationCap,
  FileEdit,
  Clock,
  CalendarCheck,
  User,
  Bell,
  Search,
  CheckCircle2,
  FileCheck,
  Palmtree,
  Sparkles,
  CalendarDays,
  ClipboardCheck,
  Send,
} from 'lucide-react';

export default function DashboardMockup() {
  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'My Classes', icon: GraduationCap },
    { name: 'Assignments', icon: FileEdit },
    { name: 'Timetable', icon: Clock },
    { name: 'Attendance', icon: CalendarCheck },
    { name: 'Profile', icon: User },
  ];

  return (
    <div className="w-full max-w-[620px] bg-gradient-to-br from-blue-50/60 via-white to-slate-50 p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-[0_15px_35px_rgba(11,114,231,0.06)] select-none text-left">
      <div className="flex gap-2.5 sm:gap-3 items-stretch">
        {/* Left Sidebar Mockup */}
        <div className="w-36 md:w-38 bg-white rounded-xl p-2.5 border border-slate-100 shadow-xs hidden md:flex flex-col justify-between shrink-0">
          <div>
            {/* School Branding */}
            <div className="flex items-center gap-1.5 px-1 py-1 mb-2 border-b border-slate-100 pb-2">
              <div className="w-6 h-6 rounded-lg bg-[#EEF6FF] border border-blue-100 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                <Image
                  src="/images/dashboard/logo_crest.png"
                  alt="Alpha Edu Hub Logo"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10.5px] font-bold text-slate-900 truncate leading-tight">
                  Alpha Edu Hub
                </div>
                <div className="text-[8px] text-slate-400 font-medium truncate">
                  School ERP
                </div>
              </div>
            </div>

            {/* Menu List */}
            <div className="space-y-0.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      item.active
                        ? 'bg-[#0B72E7] text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick status footer */}
          <div className="pt-2 border-t border-slate-100 text-[9px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Faculty Active</span>
          </div>
        </div>

        {/* Right Dashboard Content */}
        <div className="flex-1 bg-white rounded-xl p-3 sm:p-3.5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            {/* Top Bar inside Mockup */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  SY
                </div>
                <div>
                  <div className="text-[11.5px] font-bold text-slate-900 leading-tight">
                    Prof. Sanjay Yadav
                  </div>
                  <div className="text-[8.5px] text-[#0B72E7] font-medium leading-none mt-0.5">
                    Senior Faculty • Grade 10
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                  <Search className="w-2.5 h-2.5" />
                </div>
                <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 relative">
                  <Bell className="w-2.5 h-2.5" />
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#0B72E7]" />
                </div>
              </div>
            </div>

            {/* Mint Green Check-in Card (Compact & Sleek) */}
            <div className="mt-2.5 bg-[#edfdef] border border-emerald-200/70 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-[9px] text-slate-600 font-semibold border-b border-emerald-200/50 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="bg-emerald-600 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                    TODAY
                  </span>
                  <span>General Shift (08:30 AM - 03:45 PM)</span>
                </div>
                <span className="text-emerald-700 font-medium">Session Active</span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-[15px] font-extrabold text-slate-900 tracking-tight font-mono leading-none">
                    08:30:12 AM
                  </div>
                  <div className="text-[9px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Biometric Punch Verified</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-0.5 text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded-full shadow-xs hover:bg-slate-50 transition-colors"
                >
                  Log Break
                </button>
              </div>
            </div>

            {/* 2 Sleek Interactive Workflow Preview Cards */}
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-900 leading-tight">
                    Sec 10-A Math
                  </div>
                  <div className="text-[8.5px] text-slate-500 mt-0.5 truncate">
                    42/44 Students Present
                  </div>
                </div>
                <span className="text-[8.5px] font-bold text-[#0B72E7] bg-white px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                  09:30 AM
                </span>
              </div>

              <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-900 leading-tight">
                    Term 1 Syllabus
                  </div>
                  <div className="text-[8.5px] text-slate-500 mt-0.5 truncate">
                    88% Completed
                  </div>
                </div>
                <span className="text-[8.5px] font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200 shrink-0">
                  On Track
                </span>
              </div>
            </div>

            {/* 4 Compact Circular Quick Actions */}
            <div className="grid grid-cols-4 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-center">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <Send className="w-3 h-3" />
                </div>
                <span className="text-[8.5px] font-semibold text-slate-600 mt-1 leading-tight">
                  Leave
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
                  <FileCheck className="w-3 h-3" />
                </div>
                <span className="text-[8.5px] font-semibold text-slate-600 mt-1 leading-tight">
                  Salary Slip
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center shadow-xs">
                  <Clock className="w-3 h-3" />
                </div>
                <span className="text-[8.5px] font-semibold text-slate-600 mt-1 leading-tight">
                  Schedule
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shadow-xs">
                  <Palmtree className="w-3 h-3" />
                </div>
                <span className="text-[8.5px] font-semibold text-slate-600 mt-1 leading-tight">
                  Holidays
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
