'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { logoutAction } from '@/actions/auth';

// Always-loaded shell & primary landing screen (instant 0ms first render)
import PortalSidebar from './PortalSidebar';
import PortalHeader from './PortalHeader';
import ScreenSkeleton from './ScreenSkeleton';
import DashboardScreen from './screens/DashboardScreen';

// ─── Lazy-loaded secondary screen chunks ──────────────────────────────────────
// Secondary tabs are code-split and fetched on demand when clicked.
const skeleton = () => <ScreenSkeleton />;

const StudentIdCardScreen    = dynamic(() => import('./screens/StudentIdCardScreen'),    { loading: skeleton });
const ProfileSettingsScreen  = dynamic(() => import('./screens/ProfileSettingsScreen'),  { loading: skeleton });
const TodayTimetableScreen   = dynamic(() => import('./screens/TodayTimetableScreen'),   { loading: skeleton });
const WeeklyTimetableScreen  = dynamic(() => import('./screens/WeeklyTimetableScreen'),  { loading: skeleton });
const SyllabusCurriculumScreen = dynamic(() => import('./screens/SyllabusCurriculumScreen'), { loading: skeleton });
const MyAttendanceScreen     = dynamic(() => import('./screens/MyAttendanceScreen'),     { loading: skeleton });
const AttendanceCalendarScreen = dynamic(() => import('./screens/AttendanceCalendarScreen'), { loading: skeleton });
const ExamDateSheetScreen    = dynamic(() => import('./screens/ExamDateSheetScreen'),    { loading: skeleton });
const ResultsMarksScreen     = dynamic(() => import('./screens/ResultsMarksScreen'),     { loading: skeleton });
const ReportCardScreen       = dynamic(() => import('./screens/ReportCardScreen'),       { loading: skeleton });
const ExamGuidelinesScreen   = dynamic(() => import('./screens/ExamGuidelinesScreen'),   { loading: skeleton });
const FeeSummaryScreen       = dynamic(() => import('./screens/FeeSummaryScreen'),       { loading: skeleton });
const FeeInvoicesScreen      = dynamic(() => import('./screens/FeeInvoicesScreen'),      { loading: skeleton });
const PaymentHistoryScreen   = dynamic(() => import('./screens/PaymentHistoryScreen'),   { loading: skeleton });
const OnlinePaymentScreen    = dynamic(() => import('./screens/OnlinePaymentScreen'),    { loading: skeleton });
const NotificationsScreen    = dynamic(() => import('./screens/NotificationsScreen'),    { loading: skeleton });
const CircularsNoticesScreen = dynamic(() => import('./screens/CircularsNoticesScreen'), { loading: skeleton });
const SchoolEventsScreen     = dynamic(() => import('./screens/SchoolEventsScreen'),     { loading: skeleton });
const HolidayCalendarScreen  = dynamic(() => import('./screens/HolidayCalendarScreen'),  { loading: skeleton });
const KnowAuthoritiesScreen  = dynamic(() => import('./screens/KnowAuthoritiesScreen'),  { loading: skeleton });
const EmergencyContactsScreen = dynamic(() => import('./screens/EmergencyContactsScreen'), { loading: skeleton });
const GrievanceFeedbackScreen = dynamic(() => import('./screens/GrievanceFeedbackScreen'), { loading: skeleton });
const HelpSupportScreen      = dynamic(() => import('./screens/HelpSupportScreen'),      { loading: skeleton });

// Modals are also lazy — they're rarely needed on first load
const LeaveRequestModal      = dynamic(() => import('./LeaveRequestModal'),      { ssr: false });
const AppointmentBookingModal = dynamic(() => import('./AppointmentBookingModal'), { ssr: false });
// ─────────────────────────────────────────────────────────────────────────────

export interface ChildOption {
  id: string;
  name: string;
  rollNumber: number | null;
  admissionNumber: string;
  className: string;
  sectionName: string;
  isPrimary: boolean;
}

export interface StudentDashboardProps {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    rollNumber: number | null;
    sectionName: string;
    className: string;
    board: string;
    batchYear: string;
    avatarUrl?: string | null;
  };
  parentContext?: {
    isParentView: boolean;
    parentName: string;
    relationship: string;
    children: ChildOption[];
  };
  stats: {
    attendancePercentage: number;
    totalClasses: number;
    presentClasses: number;
    cgpa: number;
    feeStatus: {
      isOverdue: boolean;
      pendingAmount: number;
      nextDueDate: string;
      totalPaid: number;
      statusText: string;
    };
    counts: {
      happenings: number;
      messages: number;
      assignments: number;
      events: number;
    };
  };
  subjects: Array<{
    code: string;
    percent: number;
    name: string;
  }>;
  todaySchedule: Array<{
    type: string;
    subject: string;
    code: string;
    room: string;
    section: string;
    teacher: string;
    time: string;
    isSubstitute?: boolean;
  }>;
  notices: Array<{
    id: string;
    title: string;
    date: string;
    category: string;
    priority: string;
  }>;
  faculty: Array<{
    id?: string;
    roleBadge: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
  }>;
  events?: Array<{
    id: string;
    title: string;
    description: string;
    eventDate: string;
    eventTime: string | null;
    location: string | null;
    category: string;
    imageUrl?: string | null;
  }>;
  holidays?: Array<{
    id: string;
    name: string;
    date: string;
    type: string;
  }>;
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    title: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    dueDate: string;
    status: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
    items: Array<{
      category: string;
      amount: number;
      paid: number;
      status: 'Paid' | 'Pending';
    }>;
  }>;
  initialView?: string;
}

export default function StudentParentDashboardClient({
  student,
  parentContext,
  stats,
  subjects,
  todaySchedule,
  notices,
  faculty,
  events = [],
  holidays = [],
  invoices = [],
  initialView = 'dashboard',
}: StudentDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const viewFromQuery = searchParams?.get('view') || initialView;
  const [activeNav, setActiveNav] = useState<string>(viewFromQuery || 'dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Fee state — updated optimistically after payment
  const [feeStatusState, setFeeStatusState] = useState(stats.feeStatus);
  const [selectedPaymentInvoiceId, setSelectedPaymentInvoiceId] = useState<string | null>(null);
  const [selectedPaymentAmount, setSelectedPaymentAmount] = useState<number | null>(null);

  // Modals
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<(typeof faculty)[0] | null>(null);

  // Sync nav with URL query param
  useEffect(() => {
    const qView = searchParams?.get('view');
    if (qView && qView !== activeNav) setActiveNav(qView);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectNav = useCallback((navId: string) => {
    setActiveNav(navId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = new URL(window.location.href);
    if (navId === 'dashboard') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', navId);
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  const handlePaymentSuccess = useCallback((paidAmount: number, _receiptNo: string) => {
    setFeeStatusState((prev) => {
      const newPending = Math.max(0, prev.pendingAmount - paidAmount);
      return {
        ...prev,
        pendingAmount: newPending,
        totalPaid: prev.totalPaid + paidAmount,
        statusText: newPending === 0 ? 'Fully Paid' : 'Payment Due',
      };
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    await logoutAction();
  }, []);

  const handleOpenAppointment = useCallback((person: (typeof faculty)[0]) => {
    setSelectedAuthority(person);
    setAppointmentModalOpen(true);
  }, []);

  const handleSelectChild = useCallback((childId: string) => {
    router.push(`/portal?child=${childId}`);
  }, [router]);

  const backToDashboard = useCallback(() => handleSelectNav('dashboard'), [handleSelectNav]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#22B8FD] via-[#D3EEFD]/60 to-[#EBF6FD] text-slate-900 font-sans antialiased relative">
      <div className="flex min-h-screen p-3 sm:p-4 gap-4 sm:gap-5">
        {/* Left Sidebar */}
        <PortalSidebar
          activeNav={activeNav}
          onSelectNav={handleSelectNav}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          unreadCount={stats.counts.messages}
        />

        {/* Main Content */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 space-y-4 sm:space-y-5">
          <PortalHeader
            studentName={student.name}
            className={student.className}
            sectionName={student.sectionName}
            avatarUrl={student.avatarUrl}
            unreadCount={stats.counts.messages}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onSelectNav={handleSelectNav}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            parentContext={parentContext}
            onSelectChild={handleSelectChild}
            selectedChildId={student.id}
          />

          {/* Screen renderer — Suspense boundary catches any async within screens */}
          <main className="flex-1 min-w-0">
            <Suspense fallback={<ScreenSkeleton />}>
              {activeNav === 'dashboard' && (
                <DashboardScreen
                  student={student}
                  onSelectNav={handleSelectNav}
                  onRequestLeave={() => setLeaveModalOpen(true)}
                />
              )}

              {activeNav === 'student-id-card' && (
                <StudentIdCardScreen student={student} onBackToDashboard={backToDashboard} />
              )}

              {activeNav === 'profile-settings' && (
                <ProfileSettingsScreen student={student} onBackToDashboard={backToDashboard} />
              )}

              {activeNav === 'today-timetable' && (
                <TodayTimetableScreen
                  todaySchedule={todaySchedule}
                  onBackToDashboard={backToDashboard}
                  onSelectNav={handleSelectNav}
                />
              )}

              {activeNav === 'weekly-timetable' && (
                <WeeklyTimetableScreen onBackToDashboard={backToDashboard} onSelectNav={handleSelectNav} />
              )}

              {activeNav === 'syllabus-curriculum' && (
                <SyllabusCurriculumScreen onBackToDashboard={backToDashboard} />
              )}

              {activeNav === 'my-attendance' && (
                <MyAttendanceScreen
                  stats={stats}
                  onBackToDashboard={backToDashboard}
                  onSelectNav={handleSelectNav}
                  onRequestLeave={() => setLeaveModalOpen(true)}
                />
              )}

              {activeNav === 'attendance-calendar' && (
                <AttendanceCalendarScreen onBackToDashboard={backToDashboard} onSelectNav={handleSelectNav} />
              )}

              {activeNav === 'exam-datesheet' && (
                <ExamDateSheetScreen onBackToDashboard={backToDashboard} onSelectNav={handleSelectNav} />
              )}

              {activeNav === 'results-marks' && (
                <ResultsMarksScreen
                  subjects={subjects}
                  onBackToDashboard={backToDashboard}
                  onSelectNav={handleSelectNav}
                />
              )}

              {activeNav === 'report-card' && (
                <ReportCardScreen student={student} onBackToDashboard={backToDashboard} />
              )}

              {activeNav === 'exam-guidelines' && (
                <ExamGuidelinesScreen onBackToDashboard={backToDashboard} onSelectNav={handleSelectNav} />
              )}

              {activeNav === 'fee-summary' && (
                <FeeSummaryScreen
                  feeStatus={feeStatusState}
                  onPayInvoice={(invoiceId, amount) => {
                    setSelectedPaymentInvoiceId(invoiceId || null);
                    setSelectedPaymentAmount(amount || null);
                    handleSelectNav('online-payment');
                  }}
                  onBackToDashboard={backToDashboard}
                  onSelectNav={handleSelectNav}
                />
              )}

              {activeNav === 'fee-invoices' && (
                <FeeInvoicesScreen
                  invoices={invoices}
                  onBackToDashboard={backToDashboard}
                  onSelectNav={handleSelectNav}
                />
              )}

              {activeNav === 'payment-history' && (
                <PaymentHistoryScreen onBackToDashboard={backToDashboard} onSelectNav={handleSelectNav} />
              )}

              {activeNav === 'online-payment' && (
                <OnlinePaymentScreen
                  student={{
                    id: student.id,
                    name: student.name,
                    admissionNumber: student.admissionNumber,
                    rollNumber: student.rollNumber,
                    sectionName: student.sectionName,
                    className: student.className,
                    board: student.board,
                    avatarUrl: student.avatarUrl,
                  }}
                  parentContext={parentContext}
                  feeStatus={feeStatusState}
                  invoices={invoices}
                  initialInvoiceId={selectedPaymentInvoiceId}
                  initialAmount={selectedPaymentAmount}
                  onPaymentSuccess={handlePaymentSuccess}
                  onBackToDashboard={backToDashboard}
                  onSelectNav={handleSelectNav}
                />
              )}

              {activeNav === 'notifications' && (
                <NotificationsScreen onBackToDashboard={backToDashboard} onSelectNav={handleSelectNav} />
              )}

              {activeNav === 'circulars-notices' && (
                <CircularsNoticesScreen notices={notices} onBackToDashboard={backToDashboard} />
              )}

              {activeNav === 'school-events' && (
                <SchoolEventsScreen events={events} onBackToDashboard={backToDashboard} />
              )}

              {activeNav === 'holiday-calendar' && (
                <HolidayCalendarScreen holidays={holidays} onBackToDashboard={backToDashboard} />
              )}

              {activeNav === 'know-authorities' && (
                <KnowAuthoritiesScreen
                  faculty={faculty}
                  onBackToDashboard={backToDashboard}
                  onBookAppointment={handleOpenAppointment}
                />
              )}

              {activeNav === 'emergency-contacts' && (
                <EmergencyContactsScreen onBackToDashboard={backToDashboard} />
              )}

              {activeNav === 'grievance-feedback' && (
                <GrievanceFeedbackScreen onBackToDashboard={backToDashboard} />
              )}

              {activeNav === 'help-support' && (
                <HelpSupportScreen onBackToDashboard={backToDashboard} />
              )}
            </Suspense>
          </main>
        </div>
      </div>

      {/* Lazy modals — only mounted when first opened */}
      {leaveModalOpen && (
        <LeaveRequestModal
          isOpen={leaveModalOpen}
          onClose={() => setLeaveModalOpen(false)}
          studentName={student.name}
          className={student.className}
          sectionName={student.sectionName}
        />
      )}

      {appointmentModalOpen && (
        <AppointmentBookingModal
          isOpen={appointmentModalOpen}
          onClose={() => {
            setAppointmentModalOpen(false);
            setSelectedAuthority(null);
          }}
          selectedAuthority={selectedAuthority}
        />
      )}
    </div>
  );
}
