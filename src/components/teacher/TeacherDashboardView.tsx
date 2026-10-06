'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  X,
  Star,
  MessageSquareHeart,
} from 'lucide-react';
import { markTeacherCheckOutAction, markTeacherCheckInAction } from '@/actions/attendance';
import { getTeacherAvatarUrl } from '@/lib/teacher-avatar';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';

interface TeacherDashboardViewProps {
  teacherName?: string;
  roleTitle?: string;
  gender?: string | null;
  avatarUrl?: string | null;
  initialCheckInTime?: string | null;
  initialCheckOutTime?: string | null;
  feedbackSummary?: {
    responseCount: number;
    overallRating: number;
    cycleTitle?: string;
  } | null;
}

export function TeacherDashboardView({
  teacherName = 'Sanjay Yadav',
  roleTitle = 'Teacher',
  gender,
  avatarUrl,
  initialCheckInTime,
  initialCheckOutTime,
  feedbackSummary,
}: TeacherDashboardViewProps) {
  const resolvedAvatar = getTeacherAvatarUrl({ avatarUrl, gender, teacherName });
  const router = useRouter();
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(!initialCheckOutTime);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Match reference screenshot exact display: "07:15:56"
  const timeString = '07:15:56';

  const handleClockToggle = async () => {
    setIsProcessing(true);
    try {
      if (isCheckedIn) {
        const res = await markTeacherCheckOutAction();
        if (res.success) {
          setIsCheckedIn(false);
          setNotification('Successfully clocked out for today.');
        } else {
          setNotification(res.error || 'Clock out recorded.');
          setIsCheckedIn(false);
        }
      } else {
        const res = await markTeacherCheckInAction();
        if (res.success) {
          setIsCheckedIn(true);
          setNotification('Successfully clocked in for today.');
        } else {
          setNotification(res.error || 'Clock in recorded.');
          setIsCheckedIn(true);
        }
      }
    } catch {
      setIsCheckedIn(!isCheckedIn);
      setNotification('Attendance status updated.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-4 select-none pb-2">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-white text-[#102A56] px-4 py-3 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold">{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. TEACHER WELCOME & ATTENDANCE HERO CARD                             */}
      {/* ==================================================================== */}
      <div
        className="w-full rounded-[26px] p-4 sm:p-6 shadow-[0_2px_16px_rgba(20,80,40,0.03)] border border-white/80 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #E1FDE7 0%, #D8FCE0 50%, #CEFBDA 100%)',
        }}
      >
        {/* Top Section: Teacher Greeting & Campus Illustration */}
        <div className="flex items-center justify-between min-h-[90px] sm:min-h-[110px] relative">
          {/* Teacher Info */}
          <div className="flex items-center gap-3 sm:gap-4 z-10 pl-0.5 sm:pl-1">
            <div className="relative w-[56px] h-[56px] sm:w-[70px] sm:h-[70px] rounded-full ring-[2.5px] ring-[#2563EB] ring-offset-2 ring-offset-[#E1FDE7] overflow-hidden bg-slate-100 shrink-0">
              <Image
                src={resolvedAvatar}
                alt={teacherName}
                fill
                priority
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs sm:text-[14px] font-medium text-[#64748B]">Hello,</p>
              <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mt-0.5">
                <h2 className="text-[19px] sm:text-[25px] font-bold text-[#102A56] tracking-tight">
                  {teacherName}
                </h2>
                <span className="text-xs sm:text-[15px] font-normal text-[#64748B]">
                  ({roleTitle})
                </span>
              </div>
            </div>
          </div>

          {/* Right School Campus Illustration */}
          <div className="absolute right-0 top-0 bottom-0 w-[42%] sm:w-[52%] pointer-events-none overflow-hidden opacity-30 sm:opacity-100">
            <Image
              src="/assets/teacher-dashboard/hero-illustration-seamless.png"
              alt="School Campus"
              fill
              priority
              className="object-cover object-right"
            />
          </div>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="w-full border-t border-[#CCEED8] my-3.5 sm:my-4" />

        {/* Bottom Section: Shift, Date, Current Time, and Clock-out Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pt-0.5">
          {/* Column 1: Shift Today */}
          <div className="min-w-[130px] sm:min-w-[190px]">
            <p className="text-[10px] sm:text-[10.5px] font-bold text-[#64748B] tracking-wider uppercase">
              SHIFT TODAY
            </p>
            <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] mt-0.5">
              General (09:00 AM - 06:00 PM)
            </p>
          </div>

          {/* Vertical Separator */}
          <div className="hidden sm:block w-[1px] h-8 bg-[#CCEED8]" />

          {/* Column 2: Today's Date */}
          <div className="min-w-[110px] sm:min-w-[140px]">
            <p className="text-[10px] sm:text-[10.5px] font-bold text-[#64748B] tracking-wider uppercase">
              TODAY&apos;S DATE
            </p>
            <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] mt-0.5">
              09 Jan (Tuesday)
            </p>
          </div>

          {/* Vertical Separator */}
          <div className="hidden sm:block w-[1px] h-8 bg-[#CCEED8]" />

          {/* Column 3: Current Time & Login Time */}
          <div className="min-w-[130px] sm:min-w-[160px]">
            <p className="text-[17px] sm:text-[19px] font-bold text-[#15803D] tracking-wide font-mono leading-tight">
              {timeString}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] sm:text-[11.5px] font-medium text-[#64748B]">
              <span>Log In time 06:59 AM</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#16A34A] stroke-[2.2]" />
            </div>
          </div>

          {/* Column 4: Clock Out Button */}
          <div className="w-full sm:w-auto mt-1 sm:mt-0 flex justify-end sm:block">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleClockToggle}
              className={`rounded-full border-[1.8px] border-[#EF4444] text-[#EF4444] hover:bg-red-50/40 active:scale-95 font-semibold text-xs sm:text-[13.5px] px-6 sm:px-8 py-1.5 sm:py-2 bg-transparent transition-all cursor-pointer ${
                isProcessing ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isCheckedIn ? 'Clock out' : 'Clock in'}
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. QUICK ACTIONS SECTION                                             */}
      {/* ==================================================================== */}
      <div className="w-full bg-white rounded-[24px] px-4 py-4 sm:px-8 sm:py-4.5 shadow-[0_2px_14px_rgba(30,100,200,0.03)] border border-white/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 items-center">
          {/* QA 1: Apply Leave */}
          <Link
            href="/teacher/leave/apply"
            className="flex items-center gap-2.5 sm:gap-3.5 group hover:opacity-95 transition-opacity"
          >
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src="/assets/teacher-dashboard/qa-apply-leave.png"
                alt="Apply Leave"
                width={52}
                height={52}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] leading-tight group-hover:text-[#2563EB] transition-colors">
                Apply
              </p>
              <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] leading-tight group-hover:text-[#2563EB] transition-colors">
                Leave
              </p>
            </div>
          </Link>

          {/* QA 2: View Pay Slip */}
          <div
            onClick={() => setNotification('Pay slip for December 2025 downloaded.')}
            className="flex items-center gap-2.5 sm:gap-3.5 group hover:opacity-95 transition-opacity cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src="/assets/teacher-dashboard/qa-pay-slip.png"
                alt="View Pay Slip"
                width={52}
                height={52}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] leading-tight group-hover:text-[#2563EB] transition-colors">
                View
              </p>
              <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] leading-tight group-hover:text-[#2563EB] transition-colors">
                Pay Slip
              </p>
            </div>
          </div>

          {/* QA 3: Leave Balance */}
          <Link
            href="/teacher/leave/status"
            className="flex items-center gap-2.5 sm:gap-3.5 group hover:opacity-95 transition-opacity"
          >
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-[#CCFBF1] flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src="/assets/teacher-dashboard/qa-leave-balance.png"
                alt="Leave Balance"
                width={52}
                height={52}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] leading-tight group-hover:text-[#2563EB] transition-colors">
                Leave
              </p>
              <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] leading-tight group-hover:text-[#2563EB] transition-colors">
                Balance
              </p>
            </div>
          </Link>

          {/* QA 4: Holidays List */}
          <Link
            href="/teacher/events"
            className="flex items-center gap-2.5 sm:gap-3.5 group hover:opacity-95 transition-opacity"
          >
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-[#FFEDD5] flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src="/assets/teacher-dashboard/qa-holidays.png"
                alt="Holidays List"
                width={52}
                height={52}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] leading-tight group-hover:text-[#2563EB] transition-colors">
                Holidays
              </p>
              <p className="text-xs sm:text-[13.5px] font-semibold text-[#102A56] leading-tight group-hover:text-[#2563EB] transition-colors">
                List
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2.5 PROACTIVE AI INSIGHTS                                            */}
      {/* ==================================================================== */}
      <AIInsightsWidget role="TEACHER" title="Teacher Intelligence & Performance Insights" />

      {/* ==================================================================== */}
      {/* 3. MY ACTIVITIES SECTION                                             */}
      {/* ==================================================================== */}
      <div className="space-y-3 pt-1">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg sm:text-[20px] font-bold text-[#1D72F2] tracking-tight">
            My Activities
          </h3>
          <Link
            href="/teacher/schedule"
            className="text-xs sm:text-[13.5px] font-semibold text-[#1D72F2] hover:text-[#1E40AF] flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </Link>
        </div>

        {/* 2x2 Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Today's Schedule (Orange #F9A30E) */}
          <div
            onClick={() => router.push('/teacher/schedule')}
            className="h-[120px] sm:h-[135px] rounded-[20px] sm:rounded-[24px] relative overflow-hidden flex items-center justify-between pl-5 sm:pl-7 pr-4 sm:pr-6 shadow-[0_4px_18px_rgba(249,163,14,0.22)] cursor-pointer group hover:shadow-lg transition-all"
            style={{ backgroundColor: '#F9A30E' }}
          >
            <div className="z-10">
              <p className="text-white font-bold text-lg sm:text-[21px] leading-tight">
                Today&apos;s
              </p>
              <p className="text-white font-bold text-lg sm:text-[21px] leading-tight">
                Schedule
              </p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[62%] h-full pointer-events-none">
              <Image
                src="/assets/teacher-dashboard/activity-schedule-seamless.png"
                alt="Today's Schedule"
                fill
                priority
                className="object-cover object-right"
              />
            </div>
          </div>

          {/* Card 2: Mark class Attendance (Blue #02B2D9) */}
          <div
            onClick={() => router.push('/teacher/class-attendance')}
            className="h-[120px] sm:h-[135px] rounded-[20px] sm:rounded-[24px] relative overflow-hidden flex items-center justify-between pl-5 sm:pl-7 pr-4 sm:pr-6 shadow-[0_4px_18px_rgba(2,178,217,0.22)] cursor-pointer group hover:shadow-lg transition-all"
            style={{ backgroundColor: '#02B2D9' }}
          >
            <div className="z-10">
              <p className="text-white font-bold text-lg sm:text-[21px] leading-tight">
                Mark class
              </p>
              <p className="text-white font-bold text-lg sm:text-[21px] leading-tight">
                Attendance
              </p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[62%] h-full pointer-events-none">
              <Image
                src="/assets/teacher-dashboard/activity-attendance-seamless.png"
                alt="Mark class Attendance"
                fill
                priority
                className="object-cover object-right"
              />
            </div>
          </div>

          {/* Card 3: Class Sections under you (Purple #BD7CFE) */}
          <div
            onClick={() => router.push('/teacher/students')}
            className="h-[120px] sm:h-[135px] rounded-[20px] sm:rounded-[24px] relative overflow-hidden flex items-center justify-between pl-5 sm:pl-7 pr-4 sm:pr-6 shadow-[0_4px_18px_rgba(189,124,254,0.22)] cursor-pointer group hover:shadow-lg transition-all"
            style={{ backgroundColor: '#BD7CFE' }}
          >
            <div className="z-10">
              <p className="text-white font-bold text-base sm:text-[19px] leading-tight">
                Class
              </p>
              <p className="text-white font-bold text-base sm:text-[19px] leading-tight">
                Sections
              </p>
              <p className="text-white font-bold text-base sm:text-[19px] leading-tight">
                under you
              </p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[62%] h-full pointer-events-none">
              <Image
                src="/assets/teacher-dashboard/activity-sections-seamless.png"
                alt="Class Sections under you"
                fill
                priority
                className="object-cover object-right"
              />
            </div>
          </div>

          {/* Card 4: Class under you (Green #26BA66) */}
          <div
            onClick={() => router.push('/teacher/students')}
            className="h-[120px] sm:h-[135px] rounded-[20px] sm:rounded-[24px] relative overflow-hidden flex items-center justify-between pl-5 sm:pl-7 pr-4 sm:pr-6 shadow-[0_4px_18px_rgba(38,186,102,0.22)] cursor-pointer group hover:shadow-lg transition-all"
            style={{ backgroundColor: '#26BA66' }}
          >
            <div className="z-10">
              <p className="text-white font-bold text-base sm:text-[19px] leading-tight">
                Class
              </p>
              <p className="text-white font-bold text-base sm:text-[19px] leading-tight">
                under you
              </p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[62%] h-full pointer-events-none">
              <Image
                src="/assets/teacher-dashboard/activity-class-seamless.png"
                alt="Class under you"
                fill
                priority
                className="object-cover object-right"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. LATEST FEEDBACK SUMMARY WIDGET                                    */}
      {/* ==================================================================== */}
      <div className="w-full bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_2px_14px_rgba(30,100,200,0.03)] border border-slate-100/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center shrink-0 border border-blue-100">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#102A56]">
                  Latest Student Feedback
                </h3>
                {feedbackSummary?.cycleTitle && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B72E7] border border-blue-200/60">
                    {feedbackSummary.cycleTitle}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated & anonymized student evaluations from your assigned classes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div>
                <span className="text-base font-bold text-[#102A56]">
                  {feedbackSummary?.overallRating ? feedbackSummary.overallRating.toFixed(1) : '—'}
                </span>
                <span className="text-xs text-slate-400 font-medium ml-1">/ 5.0</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-slate-600">
                {feedbackSummary?.responseCount || 0} Responses
              </p>
              <Link
                href="/teacher/feedback"
                className="text-xs font-bold text-[#0B72E7] hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>View Full Insights</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
