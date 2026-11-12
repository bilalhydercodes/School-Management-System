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

export default function DashboardMockup({ activeBenefit = 'save-time' }: { activeBenefit?: string }) {
  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: activeBenefit === 'save-time' || !activeBenefit },
    { name: 'Attendance', icon: CalendarCheck, active: activeBenefit === 'save-time' },
    { name: 'Parent Feed', icon: Bell, active: activeBenefit === 'improve-communication' },
    { name: 'Campus Cloud', icon: Clock, active: activeBenefit === 'increase-efficiency' },
    { name: 'CBSE Reports', icon: FileCheck, active: activeBenefit === 'data-driven' },
    { name: 'Profile', icon: User, active: false },
  ];

  // Dynamic focus card matching the selected benefit
  const getBenefitDetails = () => {
    switch (activeBenefit) {
      case 'improve-communication':
        return {
          tag: 'OMNICHANNEL',
          tagBg: 'bg-blue-600',
          title: 'Parent Broadcast & SMS Feed',
          status: 'Gateway Active',
          metric: '98.4% Delivered',
          badgeColor: 'text-blue-700',
          badgeBg: 'bg-blue-50 border-blue-200',
          actionText: 'Compose Alert',
          card1Title: 'Circular #402',
          card1Sub: 'Winter vacation notification',
          card1Status: 'Dispatched',
          card2Title: 'Parent Portal',
          card2Sub: '840 active sessions right now',
          card2Status: 'Live Sync',
        };
      case 'increase-efficiency':
        return {
          tag: 'MULTI-CAMPUS',
          tagBg: 'bg-amber-600',
          title: 'Central Cloud Reconciliation',
          status: 'Sync 99.9%',
          metric: '₹4.8L Reconciled',
          badgeColor: 'text-amber-700',
          badgeBg: 'bg-amber-50 border-amber-200',
          actionText: 'Export Audit',
          card1Title: 'North Campus',
          card1Sub: 'All fee receipts balanced',
          card1Status: '100% Reconciled',
          card2Title: 'Main Campus',
          card2Sub: 'Hostel & transport billing cycle',
          card2Status: 'Processed',
        };
      case 'data-driven':
        return {
          tag: 'COMPLIANCE',
          tagBg: 'bg-purple-600',
          title: 'CBSE & ICSE Statutory Grading',
          status: 'Certified Valid',
          metric: 'Grade 10-A Ready',
          badgeColor: 'text-purple-700',
          badgeBg: 'bg-purple-50 border-purple-200',
          actionText: 'Generate PDFs',
          card1Title: 'Term 1 Marksheets',
          card1Sub: 'CBSE 9-point scale converted',
          card1Status: 'Audited ✓',
          card2Title: 'Student Conduct',
          card2Sub: 'Digitally verified records',
          card2Status: 'Compliant',
        };
      case 'save-time':
      default:
        return {
          tag: 'AUTOMATION',
          tagBg: 'bg-emerald-600',
          title: 'General Shift (08:30 AM - 03:45 PM)',
          status: 'Session Active',
          metric: '08:30:12 AM',
          badgeColor: 'text-emerald-700',
          badgeBg: 'bg-[#edfdef] border-emerald-200/70',
          actionText: 'Log Break',
          card1Title: 'Sec 10-A Math',
          card1Sub: '42/44 Students Present',
          card1Status: '09:30 AM',
          card2Title: 'Term 1 Syllabus',
          card2Sub: '88% Completed',
          card2Status: 'On Track',
        };
    }
  };

  const details = getBenefitDetails();

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

            {/* Dynamic Interactive Benefit Card (Compact & Sleek) */}
            <div className={`mt-2.5 ${details.badgeBg} rounded-xl p-2.5 transition-all duration-300`}>
              <div className="flex items-center justify-between text-[9px] text-slate-600 font-semibold border-b border-black/5 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`${details.tagBg} text-white text-[8px] px-1 py-0.5 rounded font-bold`}>
                    {details.tag}
                  </span>
                  <span className="truncate max-w-[190px]">{details.title}</span>
                </div>
                <span className={`${details.badgeColor} font-medium shrink-0`}>{details.status}</span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-[15px] font-extrabold text-slate-900 tracking-tight font-mono leading-none">
                    {details.metric}
                  </div>
                  <div className={`text-[9px] ${details.badgeColor} font-medium flex items-center gap-1 mt-1`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Live Cloud Feed Verified</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-0.5 text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded-full shadow-xs hover:bg-slate-50 transition-colors"
                >
                  {details.actionText}
                </button>
              </div>
            </div>

            {/* 2 Sleek Interactive Workflow Preview Cards */}
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-900 leading-tight truncate">
                    {details.card1Title}
                  </div>
                  <div className="text-[8.5px] text-slate-500 mt-0.5 truncate">
                    {details.card1Sub}
                  </div>
                </div>
                <span className="text-[8.5px] font-bold text-[#0B72E7] bg-white px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                  {details.card1Status}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-900 leading-tight truncate">
                    {details.card2Title}
                  </div>
                  <div className="text-[8.5px] text-slate-500 mt-0.5 truncate">
                    {details.card2Sub}
                  </div>
                </div>
                <span className="text-[8.5px] font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200 shrink-0">
                  {details.card2Status}
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
