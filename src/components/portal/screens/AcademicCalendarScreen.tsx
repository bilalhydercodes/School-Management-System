'use client';

import React, { useState, useEffect } from 'react';
import PortalPageHeader from '../PortalPageHeader';
import CalendarViewClient, { type CalendarEventViewItem } from '@/components/calendar/CalendarViewClient';
import { getCalendarEventsAction } from '@/actions/admin/calendar';
import { Loader2 } from 'lucide-react';

interface AcademicCalendarScreenProps {
  onBackToDashboard: () => void;
  userRole?: 'STUDENT' | 'PARENT';
}

export default function AcademicCalendarScreen({
  onBackToDashboard,
  userRole = 'STUDENT',
}: AcademicCalendarScreenProps) {
  const [events, setEvents] = useState<CalendarEventViewItem[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCalendarEventsAction().then((res) => {
      if (mounted) {
        if (res.success && res.events) {
          setEvents(res.events);
          setAcademicYears(res.academicYears || []);
        }
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Academic Calendar"
        subtitle="Official institution schedule for terms, examinations, vacations, and cultural events"
        onBackToDashboard={onBackToDashboard}
      />

      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Loading Academic Calendar...</p>
        </div>
      ) : (
        <CalendarViewClient
          initialEvents={events}
          academicYears={academicYears}
          userRole={userRole}
          readOnly={true}
        />
      )}
    </div>
  );
}
