'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Video, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  User,
  Building,
  Mail,
  Phone,
  CalendarCheck,
  Loader2
} from 'lucide-react';
import { bookConsultationMeetingAction } from '@/actions/institution-registration';

interface MeetingSchedulerProps {
  onFormSwitch?: () => void;
}

const TIME_SLOTS_12H = [
  '10:00 AM',
  '11:00 AM',
  '12:30 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
  '08:00 PM',
];

const TIME_SLOTS_24H = [
  '10:00',
  '11:00',
  '12:30',
  '14:00',
  '15:30',
  '17:00',
  '18:30',
  '20:00',
];

export default function MeetingScheduler({ onFormSwitch }: MeetingSchedulerProps) {
  const [selectedDay, setSelectedDay] = useState<number>(11);
  const [selectedSlot, setSelectedSlot] = useState<string>('02:00 PM');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const [bookingData, setBookingData] = useState({
    name: '',
    institutionName: '',
    email: '',
    phone: '',
  });

  const [isPending, startTransition] = useTransition();
  const [bookingError, setBookingError] = useState<string | null>(null);

  const slots = timeFormat === '12h' ? TIME_SLOTS_12H : TIME_SLOTS_24H;

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
    setBookingError(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.name || !bookingData.email || !bookingData.institutionName) return;
    setBookingError(null);

    startTransition(async () => {
      const res = await bookConsultationMeetingAction({
        name: bookingData.name,
        institutionName: bookingData.institutionName,
        email: bookingData.email,
        dateStr: `Nov ${selectedDay}, 2026`,
        timeSlot: selectedSlot,
      });

      if (res.success) {
        setIsBooked(true);
      } else {
        setBookingError(res.error || 'Failed to record consultation booking. Please try again.');
      }
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
      <AnimatePresence mode="wait">
        {isBooked ? (
          /* ── SUCCESS CONFIRMATION VIEW ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center max-w-lg mx-auto py-20"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Meeting Scheduled
            </span>
            <h3 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
              You&apos;re on the calendar!
            </h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              A 30-minute Google Meet invitation with our education specialist has been sent to{' '}
              <strong>{bookingData.email}</strong> for <strong>Nov {selectedDay}, 2026 at {selectedSlot} (IST)</strong>.
            </p>

            <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Institution:</span>
                <span className="font-bold text-slate-800">{bookingData.institutionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Representative:</span>
                <span className="font-bold text-slate-800">{bookingData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Meeting Platform:</span>
                <span className="font-bold text-indigo-600">Google Meet (Link in email)</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsBooked(false);
                  setShowBookingForm(false);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
              >
                Schedule another time
              </button>
              {onFormSwitch && (
                <button
                  type="button"
                  onClick={onFormSwitch}
                  className="px-5 py-2.5 rounded-full bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition-all"
                >
                  Or Complete Registration Directly →
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* ── MAIN 3-COLUMN CALENDAR & TIME SLOT VIEW ── */
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
            {/* ── LEFT COLUMN: MEETING DETAILS ── */}
            <div className="md:col-span-4 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
                    α
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      Alpha Edu Hub
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Institution Advisory
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  30 min VIP Consultation
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Schedule a private 1-on-1 walkthrough with an Alpha Edu Hub specialist to explore our multi-tenant modules, board compliance, and migration roadmap.
                </p>

                <div className="mt-6 space-y-3 pt-6 border-t border-slate-200/80 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>30 Minutes Duration</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Google Meet Video Link</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>India Standard Time (Asia/Kolkata)</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200/80 text-[11px] text-slate-400 font-medium">
                Prefer immediate onboarding?{' '}
                {onFormSwitch && (
                  <button
                    type="button"
                    onClick={onFormSwitch}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Fill form directly →
                  </button>
                )}
              </div>
            </div>

            {/* ── CENTER COLUMN: CALENDAR DATE PICKER ── */}
            <div className="md:col-span-5 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-base text-slate-900">
                    November <span className="text-slate-400 font-normal">2026</span>
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                    <span key={d} className="text-[10px] font-bold text-slate-400 tracking-wider">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Empty offsets for day 1 */}
                  {[...Array(0)].map((_, i) => (
                    <div key={`empty-${i}`} className="h-10" />
                  ))}

                  {/* 1st to 30th */}
                  {[...Array(30)].map((_, i) => {
                    const day = i + 1;
                    const isPast = day < 10;
                    const isSelected = selectedDay === day;
                    const isToday = day === 10;

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast}
                        onClick={() => {
                          setSelectedDay(day);
                          setShowBookingForm(false);
                        }}
                        className={`h-10 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-sm'
                            : isPast
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                      >
                        <span>{day}</span>
                        {isToday && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-slate-900 absolute bottom-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Selected: Nov {selectedDay}, 2026</span>
                <span className="text-emerald-600 font-bold">● Available Slots</span>
              </div>
            </div>

            {/* ── RIGHT COLUMN: TIME SLOTS & QUICK DETAILS ── */}
            <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-between bg-white">
              <div>
                {/* Header with Format Switcher */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-slate-900">
                    Wed {selectedDay}th
                  </h4>
                  <div className="flex items-center border border-slate-200 rounded-lg p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setTimeFormat('12h')}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        timeFormat === '12h' ? 'bg-slate-900 text-white' : 'text-slate-500'
                      }`}
                    >
                      12h
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFormat('24h')}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        timeFormat === '24h' ? 'bg-slate-900 text-white' : 'text-slate-500'
                      }`}
                    >
                      24h
                    </button>
                  </div>
                </div>

                {/* Slots List */}
                {!showBookingForm ? (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSlotClick(slot)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border text-center ${
                            isSelected
                              ? 'border-2 border-slate-900 bg-slate-50 text-slate-950 font-extrabold shadow-2xs'
                              : 'border-slate-200 hover:border-slate-400 text-slate-700 bg-white hover:bg-slate-50/50'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Quick Booking Form when slot is clicked */
                  <form onSubmit={handleConfirmBooking} className="space-y-3">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-semibold mb-2">
                      Selected Slot: <strong>Nov {selectedDay} at {selectedSlot}</strong>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Ramesh Sharma"
                        value={bookingData.name}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Institution / School Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Green Valley High School"
                        value={bookingData.institutionName}
                        onChange={(e) => setBookingData({ ...bookingData, institutionName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="principal@school.edu.in"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {bookingError && (
                      <p className="text-[11px] font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        {bookingError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full mt-3 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Recording Consultation...</span>
                        </>
                      ) : (
                        <>
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Confirm Consultation</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="w-full text-center text-[10px] font-bold text-slate-500 hover:text-slate-800 pt-1"
                    >
                      ← Back to time slots
                    </button>
                  </form>
                )}
              </div>

              {/* Bottom footer credit matching reference image */}
              <div className="pt-4 mt-4 border-t border-slate-100 text-center">
                <span className="text-[11px] font-extrabold tracking-tight text-slate-400">
                  Cal.com
                </span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
