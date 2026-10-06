'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getUpcomingEventsAction } from '@/actions/admin/calendar';

export interface UpcomingEventItem {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
  location?: string;
  isImportant?: boolean;
}

interface UpcomingEventsWidgetProps {
  initialEvents?: UpcomingEventItem[];
  calendarHref?: string;
  className?: string;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  HOLIDAY: { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  VACATION: { bg: 'bg-teal-50 text-teal-700', text: 'text-teal-700', dot: 'bg-teal-500' },
  EXAM: { bg: 'bg-purple-50 text-purple-700', text: 'text-purple-700', dot: 'bg-purple-500' },
  ACADEMIC: { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', dot: 'bg-blue-500' },
  SPORTS: { bg: 'bg-orange-50 text-orange-700', text: 'text-orange-700', dot: 'bg-orange-500' },
  CULTURAL: { bg: 'bg-pink-50 text-pink-700', text: 'text-pink-700', dot: 'bg-pink-500' },
  PARENT_TEACHER_MEETING: { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-700', dot: 'bg-rose-500' },
  RESULT: { bg: 'bg-indigo-50 text-indigo-700', text: 'text-indigo-700', dot: 'bg-indigo-500' },
};

export default function UpcomingEventsWidget({
  initialEvents,
  calendarHref = '/admin/calendar',
  className = '',
}: UpcomingEventsWidgetProps) {
  const [events, setEvents] = useState<UpcomingEventItem[]>(initialEvents || []);
  const [loading, setLoading] = useState(!initialEvents);

  useEffect(() => {
    if (!initialEvents) {
      let isSubscribed = true;
      getUpcomingEventsAction(4).then((res) => {
        if (isSubscribed && res.success && res.events) {
          setEvents(res.events);
        }
        if (isSubscribed) setLoading(false);
      });
      return () => {
        isSubscribed = false;
      };
    }
  }, [initialEvents]);

  return (
    <div
      className={`bg-white rounded-[22px] border border-slate-200/90 shadow-[0_4px_20px_rgba(0,100,200,0.04)] p-5 space-y-3.5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none">Upcoming Milestones</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Central Academic Calendar</p>
          </div>
        </div>

        <Link
          href={calendarHref}
          className="text-xs font-bold text-[#0B72E7] hover:underline flex items-center gap-1"
        >
          View Full <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">
            Loading upcoming schedule...
          </div>
        ) : events.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">
            No upcoming events scheduled
          </div>
        ) : (
          events.map((evt) => {
            const dateObj = new Date(evt.startDate);
            const monthStr = dateObj.toLocaleDateString('en-IN', { month: 'short' });
            const dayNum = dateObj.getDate();
            const style = TYPE_STYLES[evt.eventType] || {
              bg: 'bg-slate-100 text-slate-700',
              text: 'text-slate-700',
              dot: 'bg-slate-400',
            };

            return (
              <Link
                key={evt.id}
                href={calendarHref}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all group"
              >
                {/* Date Block */}
                <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                    {monthStr}
                  </span>
                  <span className="text-sm font-black text-slate-900 leading-tight">
                    {dayNum}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-sm ${style.bg}`}
                    >
                      {evt.eventType.replace(/_/g, ' ')}
                    </span>
                    {evt.isImportant && (
                      <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded-sm bg-red-100 text-red-700">
                        High Priority
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#0B72E7] transition-colors">
                    {evt.title}
                  </h4>
                  {evt.location && (
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {evt.location}
                    </p>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B72E7] transition-colors shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
