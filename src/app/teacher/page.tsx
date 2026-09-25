'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  FileText,
  Phone,
  Mail,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Eye,
  Megaphone,
  Moon,
  Sun,
  Settings,
  Bug,
  Footprints,
  FileCheck2,
  LogOut,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Send,
  UserCheck,
  Check,
  Download,
  Trash2,
  Edit3,
  Filter,
  Printer,
  Share2,
  X,
  Award,
  TrendingUp,
  BarChart3,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  User,
  CheckCheck,
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { recordSectionDailyAttendance } from '@/actions/attendance';
import { saveRapidMarksGrid } from '@/actions/examinations';
import { getBroadcastNotices } from '@/actions/notices';
import { getStudentsList } from '@/actions/students';

// Types & Interfaces
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
type WorkspaceTab = 'Attendance' | 'Marks' | 'Diary' | 'StaffNotices' | 'LessonPlanner' | 'Timetable' | 'ProxySubstitution';

interface StudentRosterItem {
  id: string;
  rollNo: number;
  name: string;
  admNo: string;
  status: AttendanceStatus;
  parentContact: string;
  parentName: string;
  gender: 'M' | 'F';
  address: string;
  bloodGroup: string;
  attendancePct: number;
  avgMarksPct: number;
  behaviorNote: string;
}

interface MarkEntryItem {
  id: string;
  rollNo: number;
  name: string;
  admNo: string;
  marks: number | '';
  maxMarks: number;
}

interface HomeworkItem {
  id: number;
  classSec: string;
  subject: string;
  topic: string;
  dueDate: string;
  assignedDate: string;
  status: 'Published' | 'Active' | 'Review Completed';
  submissionsCount: number;
  totalStudents: number;
}

interface NoticeItem {
  id: number;
  refNo: string;
  title: string;
  category: 'Academic' | 'Examination' | 'Administration' | 'HR';
  date: string;
  sender: string;
  body: string;
  attachmentName?: string;
  attachmentSize?: string;
  priority: 'NORMAL' | 'URGENT' | 'HIGH';
}

interface LessonPlanItem {
  id: number;
  subject: string;
  classSec: string;
  chapter: string;
  subtopic: string;
  durationPeriods: number;
  pedagogy: string;
  nepCompetency: string;
  assessmentMethod: string;
  status: 'Approved' | 'Pending Review' | 'Draft';
  hodRemarks?: string;
}

// Multi-class sample datasets
const INITIAL_CLASSES = [
  { code: 'MATH-041', classSec: 'Class 10-A', subject: 'Mathematics (Standard)', count: 45, progress: 84, room: 'Room 204' },
  { code: 'MATH-041', classSec: 'Class 9-B', subject: 'Mathematics & Lab Practical', count: 42, progress: 78, room: 'Room 108' },
  { code: 'ALG-102', classSec: 'Class 10-C', subject: 'Advanced Algebra (Remedial)', count: 18, progress: 92, room: 'Room 206' },
  { code: 'SCI-086', classSec: 'Class 8-A', subject: 'Applied Mathematics', count: 40, progress: 70, room: 'Room 104' },
];

const ROSTER_10A: StudentRosterItem[] = [
  { id: '1', rollNo: 1, name: 'Aarav Patel', admNo: 'DPS-2022-4801', status: 'PRESENT', parentContact: '+91 98112 34501', parentName: 'Mr. Rajesh Patel', gender: 'M', address: 'B-14, Vasant Kunj, New Delhi', bloodGroup: 'B+', attendancePct: 96, avgMarksPct: 92, behaviorNote: 'Exemplary conduct and mathematical reasoning skills.' },
  { id: '2', rollNo: 2, name: 'Aditi Sharma', admNo: 'DPS-2022-4802', status: 'PRESENT', parentContact: '+91 98112 34502', parentName: 'Mrs. Sunita Sharma', gender: 'F', address: 'C-202, Dwarka Sector 11, New Delhi', bloodGroup: 'O+', attendancePct: 98, avgMarksPct: 96, behaviorNote: 'Consistent academic topper in CBSE mock assessments.' },
  { id: '3', rollNo: 3, name: 'Ananya Roy', admNo: 'DPS-2022-4803', status: 'PRESENT', parentContact: '+91 98112 34503', parentName: 'Dr. Debasish Roy', gender: 'F', address: 'Plot 45, Saket, New Delhi', bloodGroup: 'A+', attendancePct: 91, avgMarksPct: 88, behaviorNote: 'Active participant in Math Olympiad training.' },
  { id: '4', rollNo: 4, name: 'Arjun Mehra', admNo: 'DPS-2022-4804', status: 'ABSENT', parentContact: '+91 98112 34504', parentName: 'Mr. Vikram Mehra', gender: 'M', address: 'E-88, Greater Kailash 1, New Delhi', bloodGroup: 'AB+', attendancePct: 68, avgMarksPct: 64, behaviorNote: 'Parent meeting required regarding consecutive absences.' },
  { id: '5', rollNo: 5, name: 'Bhavna Joshi', admNo: 'DPS-2022-4805', status: 'PRESENT', parentContact: '+91 98112 34505', parentName: 'Mr. Rakesh Joshi', gender: 'F', address: 'Flat 12B, Lajpat Nagar III, New Delhi', bloodGroup: 'O-', attendancePct: 94, avgMarksPct: 82, behaviorNote: 'Very diligent with geometry homework.' },
  { id: '6', rollNo: 6, name: 'Chirag Sethi', admNo: 'DPS-2022-4806', status: 'PRESENT', parentContact: '+91 98112 34506', parentName: 'Mrs. Ritu Sethi', gender: 'M', address: 'D-4, Model Town, New Delhi', bloodGroup: 'A+', attendancePct: 90, avgMarksPct: 78, behaviorNote: 'Showing steady improvement in quadratic equations.' },
  { id: '7', rollNo: 7, name: 'Devansh Nair', admNo: 'DPS-2022-4807', status: 'LATE', parentContact: '+91 98112 34507', parentName: 'Mr. Suresh Nair', gender: 'M', address: '78, Mayur Vihar Phase 1, New Delhi', bloodGroup: 'B+', attendancePct: 86, avgMarksPct: 72, behaviorNote: 'Bus delay reported this morning.' },
  { id: '8', rollNo: 8, name: 'Ishita Kapoor', admNo: 'DPS-2022-4808', status: 'PRESENT', parentContact: '+91 98112 34508', parentName: 'Mrs. Kavita Kapoor', gender: 'F', address: 'A-901, Hauz Khas Enclave, New Delhi', bloodGroup: 'O+', attendancePct: 99, avgMarksPct: 98, behaviorNote: 'Subject topper potential for Class 10 Board Examinations.' },
  { id: '9', rollNo: 9, name: 'Kabir Malhotra', admNo: 'DPS-2022-4809', status: 'PRESENT', parentContact: '+91 98112 34509', parentName: 'Mr. Sameer Malhotra', gender: 'M', address: 'Villa 14, Punjabi Bagh, New Delhi', bloodGroup: 'B-', attendancePct: 92, avgMarksPct: 90, behaviorNote: 'Excellent analytical aptitude in trigonometry.' },
  { id: '10', rollNo: 10, name: 'Kavya Singhania', admNo: 'DPS-2022-4810', status: 'PRESENT', parentContact: '+91 98112 34510', parentName: 'Mr. Arvind Singhania', gender: 'F', address: '32, Golf Links, New Delhi', bloodGroup: 'A-', attendancePct: 89, avgMarksPct: 84, behaviorNote: 'Well organized class notes and lab file.' },
  { id: '11', rollNo: 11, name: 'Manav Aggarwal', admNo: 'DPS-2022-4811', status: 'ABSENT', parentContact: '+91 98112 34511', parentName: 'Mr. Deepesh Aggarwal', gender: 'M', address: '8/12, Civil Lines, New Delhi', bloodGroup: 'O+', attendancePct: 75, avgMarksPct: 69, behaviorNote: 'Medical leave certificate pending submission.' },
  { id: '12', rollNo: 12, name: 'Pooja Bhatt', admNo: 'DPS-2022-4812', status: 'PRESENT', parentContact: '+91 98112 34512', parentName: 'Mrs. Neeta Bhatt', gender: 'F', address: 'G-10, Karol Bagh, New Delhi', bloodGroup: 'AB+', attendancePct: 93, avgMarksPct: 86, behaviorNote: 'Enthusiastic participant in group problem solving.' },
  { id: '13', rollNo: 13, name: 'Pranav Saxena', admNo: 'DPS-2022-4813', status: 'PRESENT', parentContact: '+91 98112 34513', parentName: 'Mr. Sanjay Saxena', gender: 'M', address: 'House 55, Defense Colony, New Delhi', bloodGroup: 'A+', attendancePct: 95, avgMarksPct: 91, behaviorNote: 'Strong mastery in arithmetic progressions.' },
  { id: '14', rollNo: 14, name: 'Rohan Sharma', admNo: 'DPS-2022-4891', status: 'PRESENT', parentContact: '+91 98112 34567', parentName: 'Mr. Manoj Sharma', gender: 'M', address: '22-B, Paschim Vihar, New Delhi', bloodGroup: 'B+', attendancePct: 97, avgMarksPct: 94, behaviorNote: 'Very disciplined and punctual.' },
  { id: '15', rollNo: 15, name: 'Sanya Mukherjee', admNo: 'DPS-2022-4815', status: 'PRESENT', parentContact: '+91 98112 34515', parentName: 'Dr. Indranil Mukherjee', gender: 'F', address: 'Flat 402, CR Park, New Delhi', bloodGroup: 'O+', attendancePct: 96, avgMarksPct: 90, behaviorNote: 'Active math peer-tutor for struggling classmates.' },
];

const TEACHER_TAB_URL_SLUGS: Record<WorkspaceTab, string> = {
  Attendance: 'Daily Attendance Register',
  Marks: 'Rapid Marks Grid',
  Diary: 'Digital Diary',
  LessonPlanner: 'Lesson Planner NEP',
  Timetable: 'Weekly Timetable Matrix',
  StaffNotices: 'Staff Circulars',
  ProxySubstitution: 'Proxy Duty & Leave',
};

function mapTeacherSlugToTab(slug?: string): WorkspaceTab {
  if (!slug) return 'Attendance';
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  if (decoded.includes('attend') || decoded.includes('register')) return 'Attendance';
  if (decoded.includes('mark') || decoded.includes('grade')) return 'Marks';
  if (decoded.includes('diary') || decoded.includes('homework') || decoded.includes('assignment')) return 'Diary';
  if (decoded.includes('lesson') || decoded.includes('plan') || decoded.includes('nep')) return 'LessonPlanner';
  if (decoded.includes('timetable') || decoded.includes('schedule')) return 'Timetable';
  if (decoded.includes('notice') || decoded.includes('circular')) return 'StaffNotices';
  if (decoded.includes('proxy') || decoded.includes('leave') || decoded.includes('substitut')) return 'ProxySubstitution';
  return 'Attendance';
}

export default function TeacherPortalPage({
  params,
  searchParams,
}: {
  params?: { slug?: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const initialSlug = params?.slug;
  // Theme & Navigation State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('Class 10-A');
  const [activeScheduleTab, setActiveScheduleTab] = useState<'8-12' | '12-3' | '3-6'>('8-12');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>(() => mapTeacherSlugToTab(initialSlug));
  const [activeClassIndex, setActiveClassIndex] = useState(0);

  useEffect(() => {
    if (initialSlug) {
      setActiveWorkspaceTab(mapTeacherSlugToTab(initialSlug));
    } else if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 1 && pathParts[0] === 'teacher') {
        const slugFromPath = pathParts[1];
        setActiveWorkspaceTab(mapTeacherSlugToTab(slugFromPath));
      }
    }
  }, [initialSlug]);

  // Load live database notices & students
  useEffect(() => {
    getBroadcastNotices()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setNoticesList(
            res.data.map((n: any, idx: number) => ({
              id: idx + 1,
              refNo: `DPS/CIRCULAR/2026/${String(idx + 1).padStart(3, '0')}`,
              title: n.title,
              category: 'Administration',
              date: n.date,
              sender: n.author,
              body: n.content,
              attachmentName: 'Official_DPS_Circular.pdf',
              attachmentSize: '1.2 MB',
              priority: n.priority === 'URGENT' ? 'URGENT' : n.priority === 'IMPORTANT' ? 'HIGH' : 'NORMAL',
            }))
          );
        }
      })
      .catch(() => {});

    getStudentsList()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setStudents(
            res.data.map((s: any) => ({
              id: s.id,
              rollNo: s.rollNo,
              name: s.name,
              admNo: s.admNo,
              gender: s.gender || 'M',
              status: 'PRESENT' as const,
              attendancePct: s.attendanceRate || 95,
              parentContact: s.parentPhone,
              parentName: s.parentName,
              bloodGroup: s.bloodGroup,
              classSec: s.classSec,
              address: s.address || 'New Delhi',
              avgMarksPct: 91,
              behaviorNote: 'Consistently attentive and active in class.',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const switchTab = (tabId: WorkspaceTab, customSlug?: string) => {
    setActiveWorkspaceTab(tabId);
    const targetSlug = customSlug || TEACHER_TAB_URL_SLUGS[tabId];
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/teacher/${encodeURIComponent(targetSlug)}`);
    }
  };

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [attendanceDate, setAttendanceDate] = useState<string>('2026-09-25');
  const [examType, setExamType] = useState<'Unit Test 2' | 'Mid Term' | 'Unit Test 1' | 'Pre-Board'>('Unit Test 2');
  const [noticeFilter, setNoticeFilter] = useState<string>('All');

  // Interactive Modals State
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<StudentRosterItem | null>(null);
  const [selectedNoticeForReader, setSelectedNoticeForReader] = useState<NoticeItem | null>(null);
  const [showLessonPlanModal, setShowLessonPlanModal] = useState(false);
  const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [proxyAcknowledged, setProxyAcknowledged] = useState(false);

  // Roster & Live Attendance State
  const [students, setStudents] = useState<StudentRosterItem[]>(ROSTER_10A);
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Live Marks State
  const [marksList, setMarksList] = useState<MarkEntryItem[]>([
    { id: '1', rollNo: 1, name: 'Aarav Patel', admNo: 'DPS-2022-4801', marks: 46, maxMarks: 50 },
    { id: '2', rollNo: 2, name: 'Aditi Sharma', admNo: 'DPS-2022-4802', marks: 48, maxMarks: 50 },
    { id: '3', rollNo: 3, name: 'Ananya Roy', admNo: 'DPS-2022-4803', marks: 44, maxMarks: 50 },
    { id: '4', rollNo: 4, name: 'Arjun Mehra', admNo: 'DPS-2022-4804', marks: 32, maxMarks: 50 },
    { id: '5', rollNo: 5, name: 'Bhavna Joshi', admNo: 'DPS-2022-4805', marks: 41, maxMarks: 50 },
    { id: '6', rollNo: 6, name: 'Chirag Sethi', admNo: 'DPS-2022-4806', marks: 39, maxMarks: 50 },
    { id: '7', rollNo: 7, name: 'Devansh Nair', admNo: 'DPS-2022-4807', marks: 36, maxMarks: 50 },
    { id: '8', rollNo: 8, name: 'Ishita Kapoor', admNo: 'DPS-2022-4808', marks: 49, maxMarks: 50 },
    { id: '9', rollNo: 9, name: 'Kabir Malhotra', admNo: 'DPS-2022-4809', marks: 45, maxMarks: 50 },
    { id: '10', rollNo: 10, name: 'Kavya Singhania', admNo: 'DPS-2022-4810', marks: 42, maxMarks: 50 },
    { id: '11', rollNo: 11, name: 'Manav Aggarwal', admNo: 'DPS-2022-4811', marks: 28, maxMarks: 50 },
    { id: '12', rollNo: 12, name: 'Pooja Bhatt', admNo: 'DPS-2022-4812', marks: 43, maxMarks: 50 },
    { id: '13', rollNo: 13, name: 'Pranav Saxena', admNo: 'DPS-2022-4813', marks: 45, maxMarks: 50 },
    { id: '14', rollNo: 14, name: 'Rohan Sharma', admNo: 'DPS-2022-4891', marks: 47, maxMarks: 50 },
    { id: '15', rollNo: 15, name: 'Sanya Mukherjee', admNo: 'DPS-2022-4815', marks: 45, maxMarks: 50 },
  ]);
  const [marksSaved, setMarksSaved] = useState(false);

  // Homework Diary State
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([
    {
      id: 1,
      classSec: 'Class 10-A',
      subject: 'Mathematics (Standard)',
      topic: 'Chapter 4: Quadratic Equations - Exercise 4.3 (Q1 to Q7) in HW Notebook',
      dueDate: '26 Sept 2026',
      assignedDate: '25 Sept 2026',
      status: 'Published',
      submissionsCount: 38,
      totalStudents: 45,
    },
    {
      id: 2,
      classSec: 'Class 9-B',
      subject: 'Mathematics & Lab',
      topic: 'NCERT Geometry: Theorem 6.1 proof and summary sheet for Lab Record',
      dueDate: '28 Sept 2026',
      assignedDate: '25 Sept 2026',
      status: 'Published',
      submissionsCount: 32,
      totalStudents: 42,
    },
    {
      id: 3,
      classSec: 'Class 10-C',
      subject: 'Algebra Remedial',
      topic: 'Practice Worksheet on Factorisation & Quadratic Formula with Step Analysis',
      dueDate: '29 Sept 2026',
      assignedDate: '24 Sept 2026',
      status: 'Active',
      submissionsCount: 16,
      totalStudents: 18,
    },
    {
      id: 4,
      classSec: 'Class 8-A',
      subject: 'Applied Mathematics',
      topic: 'Linear Equations in One Variable - Word Problem Case Studies',
      dueDate: '27 Sept 2026',
      assignedDate: '23 Sept 2026',
      status: 'Review Completed',
      submissionsCount: 40,
      totalStudents: 40,
    },
  ]);

  // Homework Input Form State
  const [newHwClass, setNewHwClass] = useState('Class 10-A');
  const [newHwSubject, setNewHwSubject] = useState('Mathematics (Standard)');
  const [newHwTopic, setNewHwTopic] = useState('');
  const [newHwDueDate, setNewHwDueDate] = useState('2026-09-28');

  // Lesson Plans State
  const [lessonPlans, setLessonPlans] = useState<LessonPlanItem[]>([
    {
      id: 1,
      classSec: 'Class 10-A',
      subject: 'Mathematics',
      chapter: 'Chapter 4: Quadratic Equations',
      subtopic: 'Derivation of Quadratic Formula & Nature of Roots (Discriminant)',
      durationPeriods: 3,
      pedagogy: 'Inquiry-based algebraic proofs + GeoGebra graphing software visuals',
      nepCompetency: 'Critical Thinking & Mathematical Modelling',
      assessmentMethod: 'Short formative quiz & 3 real-world parabolic projectile problems',
      status: 'Approved',
      hodRemarks: 'Excellent integration of graphing tools. Approved by Dr. S. K. Gupta.',
    },
    {
      id: 2,
      classSec: 'Class 9-B',
      subject: 'Mathematics & Lab',
      chapter: 'Chapter 6: Lines and Angles',
      subtopic: 'Parallel Lines and Transversal Theorems (Theorem 6.2 & 6.3)',
      durationPeriods: 2,
      pedagogy: 'Hands-on paper folding experiment & geometric angle verification',
      nepCompetency: 'Spatial Reasoning & Proof Construction',
      assessmentMethod: 'Lab record rubric + peer verification worksheet',
      status: 'Approved',
      hodRemarks: 'Good experimental setup.',
    },
    {
      id: 3,
      classSec: 'Class 10-A',
      subject: 'Mathematics',
      chapter: 'Chapter 5: Arithmetic Progressions',
      subtopic: 'Sum of First n Terms with Financial Literacy Applications (Compound Interest/EMI)',
      durationPeriods: 4,
      pedagogy: 'Contextual real-world financial story problems + spreadsheet modeling',
      nepCompetency: 'Financial Literacy & Problem Solving',
      assessmentMethod: 'Case study assignment',
      status: 'Pending Review',
      hodRemarks: 'Awaiting Vice Principal curriculum audit.',
    },
  ]);

  // New Lesson Plan Form State
  const [newLpChapter, setNewLpChapter] = useState('');
  const [newLpSubtopic, setNewLpSubtopic] = useState('');
  const [newLpPedagogy, setNewLpPedagogy] = useState('');
  const [newLpCompetency, setNewLpCompetency] = useState('Critical Thinking & Analysis');
  const [newLpAssessment, setNewLpAssessment] = useState('');

  // Staff Notices State
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([
    {
      id: 1,
      refNo: 'DPS/STAFF/2026/044',
      title: 'Submission of Term 1 Continuous Assessment & Practical Marks on ERP Portal',
      category: 'Examination',
      date: '24 Sept 2026',
      sender: 'Dr. Anandita Sen (Principal) via Exam Cell',
      body: 'All Subject Teachers and Class Mentors for Classes 9 through 12 are requested to finalize and freeze the internal assessment (IA), practical record marks, and periodic test scores on the ERP portal no later than 5:00 PM, October 10, 2026. Automated report card generation will commence on October 12, 2026.',
      attachmentName: 'CBSE_Assessment_Guidelines_2026_27.pdf',
      attachmentSize: '1.4 MB',
      priority: 'HIGH',
    },
    {
      id: 2,
      refNo: 'DPS/TIMETABLE/2026/012',
      title: 'Teacher Substitution Guidelines & Automated Proxy Engine Workflow',
      category: 'Administration',
      date: '22 Sept 2026',
      sender: 'Mr. Arvind Saxena (Vice Principal)',
      body: 'Faculty members needing casual or medical leave must apply at least 24 hours prior via the Teacher Portal leave workflow. In emergency situations, please acknowledge proxy duty allocations on your dashboard before 8:15 AM to ensure zero student supervision gaps.',
      attachmentName: 'Substitution_Protocol_SOP.pdf',
      attachmentSize: '480 KB',
      priority: 'NORMAL',
    },
    {
      id: 3,
      refNo: 'DPS/HR/2026/018',
      title: 'Annual Staff Development Workshop on NEP 2020 Pedagogical Framework',
      category: 'HR',
      date: '20 Sept 2026',
      sender: 'Department of Training & Academic Research',
      body: 'A full-day experiential teaching workshop will take place in the Main Auditorium on Saturday, October 5th. Keynote address by Dr. K. Kasturirangan committee panel members on competency-based assessment design.',
      attachmentName: 'NEP_Workshop_Schedule.pdf',
      attachmentSize: '820 KB',
      priority: 'NORMAL',
    },
    {
      id: 4,
      refNo: 'DPS/EXAM/2026/091',
      title: 'Class 10 CBSE Board Examination Registration Verification List (LOC Check)',
      category: 'Academic',
      date: '19 Sept 2026',
      sender: 'CBSE Liaison Office',
      body: 'Class Teachers of 10-A, 10-B, and 10-C must cross-check each candidate spelling, Date of Birth, Aadhar linkage, and subject codes with parents during upcoming PTM.',
      attachmentName: 'LOC_Checklist_10A.pdf',
      attachmentSize: '2.1 MB',
      priority: 'URGENT',
    },
    {
      id: 5,
      refNo: 'DPS/ADMIN/2026/033',
      title: 'Parent-Teacher Meeting (PTM) Seating Arrangement & Duty Allocation',
      category: 'Administration',
      date: '18 Sept 2026',
      sender: 'Administrative Wing',
      body: 'PTM for Term 1 Mid-Evaluation will take place this Saturday (08:30 AM - 01:30 PM). Class 10-A mentor desk will be situated in Senior Wing Room 204. Refreshments provided in Staff Lounge.',
      priority: 'NORMAL',
    },
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Proxy Allocated', desc: 'Period 4 in Class 9-B assigned for Mr. Sharma', time: '10 mins ago', unread: true },
    { id: 2, title: 'Attendance Pending', desc: 'Please lock Class 10-A attendance for morning register', time: '45 mins ago', unread: true },
    { id: 3, title: 'Lesson Plan Approved', desc: 'Chapter 4 Quadratic Equations plan approved by HOD', time: '2 hours ago', unread: false },
  ]);

  // Leave Request State
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-10-02');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-10-02');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // Bug Report Form State
  const [bugSubject, setBugSubject] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);

  // Filtered Students for Active Search
  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        s.admNo.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        s.rollNo.toString().includes(studentSearchQuery)
    );
  }, [students, studentSearchQuery]);

  // Attendance Statistics
  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const lateCount = students.filter((s) => s.status === 'LATE').length;
  const totalCount = students.length;
  const attendanceRate = Math.round(((presentCount + lateCount) / totalCount) * 100);

  // Marks Statistics
  const marksStats = useMemo(() => {
    const validMarks = marksList.map((m) => (m.marks === '' ? 0 : Number(m.marks)));
    const avg = validMarks.reduce((a, b) => a + b, 0) / (validMarks.length || 1);
    const max = Math.max(...validMarks, 0);
    const min = Math.min(...validMarks, 50);
    const passCount = validMarks.filter((m) => m >= 17).length; // 33% of 50 = 16.5
    return {
      average: avg.toFixed(1),
      highest: max,
      lowest: min,
      passPercentage: Math.round((passCount / (validMarks.length || 1)) * 100),
    };
  }, [marksList]);

  // Cycle Attendance Status: PRESENT -> ABSENT -> LATE -> PRESENT
  const cycleOrder: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE'];
  const cycleStudentStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const currentIndex = cycleOrder.indexOf(s.status as 'PRESENT' | 'ABSENT' | 'LATE');
        const nextIndex = (currentIndex + 1) % cycleOrder.length;
        return { ...s, status: cycleOrder[nextIndex] };
      })
    );
    setAttendanceSaved(false);
  };

  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })));
    setAttendanceSaved(false);
  };

  const markAllAbsent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'ABSENT' })));
    setAttendanceSaved(false);
  };

  const calculateGrade = (marks: number | '', max: number): { grade: string; color: string; points: string } => {
    if (marks === '') return { grade: '—', color: 'text-gray-400', points: '0.0' };
    const pct = (Number(marks) / max) * 100;
    if (pct >= 91) return { grade: 'A1', color: 'text-[#26C281]', points: '10.0' };
    if (pct >= 81) return { grade: 'A2', color: 'text-[#26C281]', points: '9.0' };
    if (pct >= 71) return { grade: 'B1', color: 'text-blue-600', points: '8.0' };
    if (pct >= 61) return { grade: 'B2', color: 'text-blue-600', points: '7.0' };
    if (pct >= 51) return { grade: 'C1', color: 'text-amber-600', points: '6.0' };
    if (pct >= 41) return { grade: 'C2', color: 'text-amber-600', points: '5.0' };
    if (pct >= 33) return { grade: 'D', color: 'text-orange-600', points: '4.0' };
    return { grade: 'E (Needs Help)', color: 'text-red-500', points: '0.0' };
  };

  const handleMarkChange = (id: string, val: string) => {
    const num = val === '' ? '' : Math.min(50, Math.max(0, Number(val)));
    setMarksList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, marks: num } : item))
    );
    setMarksSaved(false);
  };

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTopic.trim()) return;
    setHomeworkList([
      {
        id: Date.now(),
        classSec: newHwClass,
        subject: newHwSubject,
        topic: newHwTopic,
        dueDate: newHwDueDate || '28 Sept 2026',
        assignedDate: 'Today',
        status: 'Published',
        submissionsCount: 0,
        totalStudents: newHwClass === 'Class 10-A' ? 45 : newHwClass === 'Class 9-B' ? 42 : 18,
      },
      ...homeworkList,
    ]);
    setNewHwTopic('');
    setNewHwDueDate('2026-09-28');
  };

  const handleDeleteHomework = (id: number) => {
    setHomeworkList((prev) => prev.filter((hw) => hw.id !== id));
  };

  const handleCreateLessonPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLpChapter.trim()) return;
    setLessonPlans([
      {
        id: Date.now(),
        classSec: selectedClass,
        subject: 'Mathematics',
        chapter: newLpChapter,
        subtopic: newLpSubtopic || 'Comprehensive syllabus unit breakdown',
        durationPeriods: 3,
        pedagogy: newLpPedagogy || 'Experiential demonstration & guided problem solving',
        nepCompetency: newLpCompetency,
        assessmentMethod: newLpAssessment || 'Formative class test & homework review',
        status: 'Pending Review',
      },
      ...lessonPlans,
    ]);
    setNewLpChapter('');
    setNewLpSubtopic('');
    setNewLpPedagogy('');
    setNewLpAssessment('');
    setShowLessonPlanModal(false);
  };

  // CSV Exporters
  const downloadAttendanceCSV = () => {
    const header = 'Roll No,Student Name,Admission No,Status,Parent Name,Parent Phone\n';
    const rows = students
      .map((s) => `${s.rollNo},"${s.name}",${s.admNo},${s.status},"${s.parentName}",${s.parentContact}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${selectedClass.replace(' ', '_')}_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadMarksCSV = () => {
    const header = 'Roll No,Student Name,Admission No,Marks Obtained,Max Marks,CBSE Grade,Grade Points\n';
    const rows = marksList
      .map((m) => {
        const g = calculateGrade(m.marks, m.maxMarks);
        return `${m.rollNo},"${m.name}",${m.admNo},${m.marks},${m.maxMarks},${g.grade},${g.points}`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Marksheet_${selectedClass.replace(' ', '_')}_${examType.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const absentStudents = students.filter((s) => s.status === 'ABSENT');

  return (
    <div
      className={`min-h-screen font-sans antialiased selection:bg-[#FF7555]/20 selection:text-[#FF7555] transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0B1320] text-[#E2E8F0]' : 'bg-[#F4F8FA] text-[#132033]'
      }`}
    >
      {/* ==================================================================== */}
      {/* 1. TOP GLOBAL NAVIGATION (Two-Tier Institutional ERP Header)        */}
      {/* ==================================================================== */}
      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#111C2D] border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
            : 'bg-white border-[#EBF0F5] shadow-[0_1px_4px_rgba(19,32,51,0.02)]'
        }`}
      >
        {/* Tier 1: Main Institution Branding & Global Quick Actions */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-[64px] flex items-center justify-between">
          {/* Left: School Management System / DPS Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group">
              <span className={`text-xl font-black tracking-tight flex items-center ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                <span className="text-[#FF7555] font-black text-2xl group-hover:scale-105 transition-transform">D</span>PS
              </span>
              <div className="ml-2.5 pl-2.5 border-l border-slate-300 dark:border-slate-700 text-left">
                <span className={`text-[9px] font-bold tracking-widest uppercase block leading-none ${isDarkMode ? 'text-slate-200' : 'text-[#132033]'}`}>
                  DELHI PUBLIC SCHOOL
                </span>
                <span className="text-[8px] font-semibold tracking-wider uppercase block text-[#6F7D8D] leading-tight">
                  CBSE AFFILIATED • FACULTY ERP PORTAL
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Search Pill, Dark Mode Toggle, Notification Bell, Teacher Profile */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search Pill */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs w-44 md:w-60 focus-within:border-[#FF7555] transition-all shadow-2xs ${
                isDarkMode ? 'bg-[#1E293B] border-[#334155] text-slate-300' : 'bg-white border-[#D9E2EC] text-[#6F7D8D]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#6F7D8D]" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setStudentSearchQuery(e.target.value);
                }}
                placeholder="Search student, roll, syllabus..."
                className={`bg-transparent border-none outline-none w-full text-xs placeholder:text-[#8FA0B2] ${
                  isDarkMode ? 'text-white' : 'text-[#132033]'
                }`}
              />
              {globalSearch && (
                <button onClick={() => { setGlobalSearch(''); setStudentSearchQuery(''); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle theme"
              className={`p-2 rounded-full transition-colors ${
                isDarkMode ? 'text-amber-400 hover:bg-[#1E293B]' : 'text-[#6F7D8D] hover:text-[#132033] hover:bg-[#F4F8FA]'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setShowNotificationsDrawer(true)}
              aria-label="Notifications"
              className={`relative p-2 rounded-full transition-colors ${
                isDarkMode ? 'text-slate-300 hover:bg-[#1E293B]' : 'text-[#6F7D8D] hover:text-[#132033] hover:bg-[#F4F8FA]'
              }`}
            >
              <Bell className="w-4 h-4" />
              {notifications.filter((n) => n.unread).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF7555] text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                  {notifications.filter((n) => n.unread).length}
                </span>
              )}
            </button>

            {/* User Profile Avatar with Teacher Info & Sign Out */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-[#E2E8F0] border border-slate-300 overflow-hidden shrink-0 relative ring-2 ring-[#FF7555]/20">
                <img
                  src="/teacher-avatar.jpg"
                  alt="Dr. Neha Verma"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                  Dr. Neha Verma
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  Faculty • Class 10-A Mentor
                </span>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="ml-1 p-1.5 rounded-lg text-[#6F7D8D] hover:text-[#FF7555] hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Tier 2: Quick Modular Category Navigation Bar */}
        <div className={`border-t transition-colors duration-300 ${isDarkMode ? 'border-[#1E293B] bg-[#0E1726]' : 'border-[#F0F4F8] bg-white'}`}>
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-[44px] flex items-center justify-between text-xs font-medium">
            {/* Left Category Tabs */}
            <div className="flex items-center gap-5 md:gap-7 overflow-x-auto no-scrollbar">
              {[
                { id: 'Attendance' as const, label: 'Daily Attendance' },
                { id: 'Marks' as const, label: 'Marks & Grading' },
                { id: 'Diary' as const, label: 'Digital Diary' },
                { id: 'LessonPlanner' as const, label: 'Lesson Planner (NEP)' },
                { id: 'Timetable' as const, label: 'Weekly Timetable' },
                { id: 'StaffNotices' as const, label: 'Staff Circulars' },
                { id: 'ProxySubstitution' as const, label: 'Proxy / Substitutions' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    switchTab(tab.id);
                    const el = document.getElementById('workspace-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1 cursor-pointer transition-colors py-1 whitespace-nowrap ${
                    activeWorkspaceTab === tab.id
                      ? 'text-[#FF7555] font-bold border-b-2 border-[#FF7555]'
                      : isDarkMode
                      ? 'text-slate-300 hover:text-[#FF7555]'
                      : 'text-[#132033] hover:text-[#FF7555]'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Right: Quick Portals Switcher */}
            <div className="flex items-center gap-4 shrink-0 pl-3">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#6F7D8D] hover:text-[#FF7555] transition-colors"
              >
                <span>Admin View</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-800 px-3 py-1 rounded-full hover:opacity-90 transition-opacity"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Student Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN BODY CONTAINER                                                  */}
      {/* ==================================================================== */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 py-7 space-y-12">
        {/* ================================================================== */}
        {/* SCREEN 1: HERO VIEWPORT (Faculty Identity + 4 Coral Action Stat Cards) */}
        {/* ================================================================== */}
        <section className="min-h-[calc(100vh-130px)] flex flex-col justify-between space-y-5 pb-4">
          {/* Row 1: Teacher Identity Card (54%) + 4 Coral Action Stat Cards (46%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Teacher Identity Card */}
            <div
              className={`lg:col-span-6 rounded-[22px] border p-6 flex items-center justify-between gap-5 min-h-[128px] transition-all shadow-[0_2px_14px_rgba(19,32,51,0.03)] ${
                isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
              }`}
            >
              <div className="flex items-center gap-5 min-w-0">
                {/* Profile Image Frame with Ring */}
                <div className="w-[68px] h-[68px] rounded-[16px] bg-[#E8F0FE] border border-[#D0E1FD] shrink-0 overflow-hidden shadow-inner relative">
                  <img
                    src="/teacher-avatar.jpg"
                    alt="Dr. Neha Verma"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold text-[#FF6F50] leading-tight truncate">
                      Dr. Neha Verma
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#26C281] font-bold text-[10px] border border-emerald-100 shrink-0">
                      Active On Duty
                    </span>
                  </div>
                  <p className={`text-xs mt-1.5 font-medium truncate ${isDarkMode ? 'text-slate-300' : 'text-[#132033]'}`}>
                    Emp ID: <span className="font-bold">TCH-2021-084</span> | Class Teacher:{' '}
                    <span className="font-bold text-[#FF7555]">10-A</span> | Dept:{' '}
                    <span className="font-bold">Mathematics</span> | Room:{' '}
                    <span className="font-bold">204</span>
                  </p>
                  <p className="text-xs text-[#6F7D8D] truncate mt-1">
                    PGT Senior Wing • CBSE Affiliation No: 2130048 • DPS R.K. Puram
                  </p>
                </div>
              </div>

              {/* Action Buttons Stack */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  onClick={() => {
                    switchTab('Attendance');
                    const el = document.getElementById('workspace-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff623e] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Attendance
                </button>
                <button
                  onClick={() => setShowLeaveRequestModal(true)}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all border ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      : 'bg-[#FFF2EE] text-[#FF6F50] border-[#FFE3DB] hover:bg-[#FFE3DB]'
                  }`}
                >
                  Apply Leave
                </button>
              </div>
            </div>

            {/* 4 Coral Action Stat Cards */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Card 1: Present Today */}
              <button
                onClick={() => {
                  switchTab('Attendance');
                  const el = document.getElementById('workspace-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px] text-left hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <svg className="absolute top-0 right-0 w-14 h-14 pointer-events-none" viewBox="0 0 50 50" fill="none">
                  <path d="M50 0H20C20 18 32 30 50 30V0Z" fill="#FDCB6E" fillOpacity="0.45" />
                </svg>
                <UserCheck className="w-5 h-5 text-white/95" />
                <div>
                  <span className="text-3xl font-black block leading-none tracking-tight">
                    {presentCount + lateCount}
                  </span>
                  <span className="text-xs font-semibold text-white/95 mt-1.5 block">
                    Present Today ({attendanceRate}%)
                  </span>
                </div>
              </button>

              {/* Card 2: Periods Today */}
              <button
                onClick={() => {
                  switchTab('Timetable');
                  const el = document.getElementById('workspace-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px] text-left hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <svg className="absolute top-0 right-0 w-14 h-14 pointer-events-none" viewBox="0 0 50 50" fill="none">
                  <path d="M50 0H18C18 20 30 32 50 32V0Z" fill="#FFA07A" fillOpacity="0.4" />
                </svg>
                <Clock className="w-5 h-5 text-white/95" />
                <div>
                  <span className="text-3xl font-black block leading-none tracking-tight">05</span>
                  <span className="text-xs font-semibold text-white/95 mt-1.5 block">Periods Today</span>
                </div>
              </button>

              {/* Card 3: Pending Marks Entry */}
              <button
                onClick={() => {
                  switchTab('Marks');
                  const el = document.getElementById('workspace-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px] text-left hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <svg className="absolute top-0 right-0 w-14 h-14 pointer-events-none" viewBox="0 0 50 50" fill="none">
                  <path d="M50 0H22C22 18 32 28 50 28V0Z" fill="#FF8A65" fillOpacity="0.5" />
                </svg>
                <FileCheck2 className="w-5 h-5 text-white/95" />
                <div>
                  <span className="text-3xl font-black block leading-none tracking-tight">
                    {marksSaved ? '00' : '01'}
                  </span>
                  <span className="text-xs font-semibold text-white/95 mt-1.5 block">Unit Test Entry</span>
                </div>
              </button>

              {/* Card 4: Proxy Duty */}
              <button
                onClick={() => {
                  switchTab('ProxySubstitution');
                  const el = document.getElementById('workspace-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px] text-left hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <svg className="absolute top-0 right-0 w-14 h-14 pointer-events-none" viewBox="0 0 50 50" fill="none">
                  <path d="M50 0H15C15 22 28 35 50 35V0Z" fill="#35C1E8" fillOpacity="0.85" />
                </svg>
                <ShieldCheck className="w-5 h-5 text-white/95" />
                <div>
                  <span className="text-3xl font-black block leading-none tracking-tight">
                    {proxyAcknowledged ? '00' : '01'}
                  </span>
                  <span className="text-xs font-semibold text-white/95 mt-1.5 block">
                    {proxyAcknowledged ? 'Proxy Confirmed' : 'Proxy Assigned'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Row 2: Hero Institutional Spotlight (~58%) + Metrics Stack (~42%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
            {/* Left: Academic Faculty Command Spotlight */}
            <div
              className={`lg:col-span-7 rounded-[22px] border p-6 flex flex-col justify-between relative overflow-hidden min-h-[360px] shadow-[0_2px_14px_rgba(19,32,51,0.03)] ${
                isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
              }`}
            >
              <div
                className={`w-full h-full rounded-[16px] p-7 flex flex-col justify-between relative overflow-hidden border ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#17253B] via-[#1A2C46] to-[#1E3250] border-[#2A3E5C]'
                    : 'bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF9] to-[#FFF6ED] border-[#F6E7D2]'
                }`}
              >
                {/* Status Badges Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-[#FF7555] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    CBSE FACULTY DESK • CLASS 10-A MENTORSHIP
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF7555] animate-ping" />
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Term 1 Board Window Open
                    </span>
                  </div>
                </div>

                {/* Main Headline & Big Percentage */}
                <div className="my-4">
                  <div className="flex items-center gap-5">
                    <div className="flex items-baseline">
                      <span className="text-5xl md:text-6xl font-black text-[#D4AF37] leading-none">
                        100
                      </span>
                      <span className="text-2xl font-bold text-[#D4AF37]">%</span>
                    </div>
                    <div>
                      <h3 className={`text-lg md:text-xl font-extrabold leading-tight ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        MORNING ASSEMBLY REGISTRATION READY
                      </h3>
                      <p className="text-xs text-[#6F7D8D] font-medium leading-relaxed mt-1">
                        Class 10-A attendance roster ready for submission. 45 students registered under CBSE batch 2026-27.
                        Parent notifications automatically queued on save.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer text with Pre-board Schedule Announcement */}
                <div className="pt-4 border-t border-[#F6E7D2]/80 dark:border-slate-700/80 text-xs text-[#6F7D8D] font-medium flex flex-wrap items-center justify-between gap-3">
                  <span>Pre-Board practical exam marks verification deadline: <strong>Oct 10, 2026</strong></span>
                  <button
                    onClick={() => {
                      switchTab('Marks');
                      const el = document.getElementById('workspace-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[#FF7555] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Open Grade Sheet →
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Metrics Stack (Class Attendance + Syllabus Donut + Proxy Alert) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              {/* Top Row: Two Donut Cards Side-by-Side */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* 1. Class 10-A Attendance Donut Card */}
                <div
                  className={`rounded-[22px] border p-5 flex flex-col justify-between shadow-[0_2px_14px_rgba(19,32,51,0.03)] ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-4 h-4 text-[#FF7555]" />
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>10-A Attendance</span>
                    </div>
                    <span className="font-extrabold text-[#26C281] text-sm">{attendanceRate}%</span>
                  </div>

                  {/* Donut Chart Indicator (Emerald Green) */}
                  <div className="flex items-center justify-center my-2">
                    <div className="relative w-[112px] h-[112px]">
                      <svg className="w-[112px] h-[112px] -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="44"
                          stroke={isDarkMode ? '#1E293B' : '#F7EEEE'}
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="44"
                          stroke="#26C281"
                          strokeWidth="10"
                          strokeDasharray="276.4"
                          strokeDashoffset={276.4 - (276.4 * attendanceRate) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        {presentCount}/{totalCount}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-[#26C281] font-bold">
                      {absentCount === 0 ? 'Full Attendance' : `${absentCount} Absent • ${lateCount} Late`}
                    </span>
                  </div>
                </div>

                {/* 2. Syllabus Completion Donut Card */}
                <div
                  className={`rounded-[22px] border p-5 flex flex-col justify-between shadow-[0_2px_14px_rgba(19,32,51,0.03)] ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>Syllabus Pace</span>
                    </div>
                    <span className="font-extrabold text-[#1F51FF] text-sm">84.0%</span>
                  </div>

                  {/* Donut Chart Indicator (Amber/Orange) */}
                  <div className="flex items-center justify-center my-2">
                    <div className="relative w-[112px] h-[112px]">
                      <svg className="w-[112px] h-[112px] -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="44"
                          stroke={isDarkMode ? '#1E293B' : '#FDF6ED'}
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="44"
                          stroke="#FFA756"
                          strokeWidth="10"
                          strokeDasharray="276.4"
                          strokeDashoffset={276.4 - (276.4 * 84) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        84%
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-[#8FA0B2] font-medium">10 of 12 Units Done</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Active Substitution Notice */}
              <div
                className={`rounded-[22px] border px-6 py-4 flex items-center justify-between gap-4 shadow-[0_2px_14px_rgba(19,32,51,0.03)] ${
                  isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#132033] text-white flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-[#FF7555]">
                    <ShieldCheck className="w-5 h-5 text-[#FF7555]" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>Proxy Duty</span>
                    <span className="text-sm font-bold text-[#FF7555]">Period 4 • 9-B</span>
                    <span className="text-xs font-semibold text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-800 px-2.5 py-0.5 rounded-full w-fit">
                      Cover for Mr. Sharma
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8FA0B2] hidden md:inline">11:00 AM - 11:45 AM</span>
                  <button
                    onClick={() => setProxyAcknowledged(!proxyAcknowledged)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      proxyAcknowledged
                        ? 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-[#26C281] text-white hover:bg-[#20a76f]'
                    }`}
                  >
                    {proxyAcknowledged ? 'Acknowledged' : 'Acknowledge'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SCREEN 2: ACADEMIC ENGAGEMENT (Classes Strip + 6 Action Tiles)      */}
        {/* ================================================================== */}
        <section className="min-h-[calc(100vh-130px)] flex flex-col justify-between space-y-6 pt-4">
          {/* Row 1: Spacious 3-Card Assigned Class Strip */}
          <div className="relative">
            {/* Carousel Navigation Chevrons */}
            <button
              onClick={() => setActiveClassIndex(Math.max(0, activeClassIndex - 1))}
              aria-label="Previous classes"
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-[#D0E1FD] dark:border-slate-700 text-[#1F51FF] flex items-center justify-center shadow-md hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setActiveClassIndex(Math.min(INITIAL_CLASSES.length - 3, activeClassIndex + 1))
              }
              aria-label="Next classes"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-[#D0E1FD] dark:border-slate-700 text-[#1F51FF] flex items-center justify-center shadow-md hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 3 Spacious Class Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {INITIAL_CLASSES.slice(activeClassIndex, activeClassIndex + 3).map((cls, idx) => {
                const isSelected = selectedClass === cls.classSec;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedClass(cls.classSec)}
                    className={`rounded-[22px] border p-6 shadow-[0_2px_12px_rgba(19,32,51,0.02)] flex flex-col justify-between min-h-[110px] cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#FF7555] ring-2 ring-[#FF7555]/20 bg-[#FFFDFB] dark:bg-slate-800'
                        : isDarkMode
                        ? 'bg-[#111C2D] border-[#1E293B]'
                        : 'bg-white border-[#EBF0F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-bold block ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                            {cls.classSec}
                          </span>
                          {cls.classSec === 'Class 10-A' && (
                            <span className="text-[10px] font-bold text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-700 px-2 py-0.5 rounded-full">
                              Class Mentor
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-[#8FA0B2]">
                          {cls.code} • {cls.count} Students • {cls.room}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                          {cls.progress}%
                        </span>
                        <div className="w-24 sm:w-28 h-2 bg-[#E8F5E9] dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#26C281] rounded-full"
                            style={{ width: `${cls.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#6F7D8D] truncate">
                        {cls.subject}
                      </p>
                      <span className="text-[11px] text-[#FF7555] font-bold flex items-center gap-0.5 hover:underline">
                        Switch Active Class →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2: 6 Coral Quick-Access Tiles (38%) + Today's Schedule Card (62%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
            {/* Left: 6 Coral Quick-Access Tiles */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-4">
              {[
                {
                  title: 'Morning\nRegister',
                  icon: CheckCircle2,
                  accent: 'yellow',
                  tab: 'Attendance' as const,
                },
                {
                  title: 'Class\nDiary',
                  icon: BookOpen,
                  accent: 'peach',
                  tab: 'Diary' as const,
                },
                {
                  title: 'Rapid\nMarks Grid',
                  icon: FileCheck2,
                  accent: 'cyan',
                  tab: 'Marks' as const,
                },
                {
                  title: 'Lesson\nPlanner',
                  icon: GraduationCap,
                  accent: 'peach',
                  tab: 'LessonPlanner' as const,
                },
                {
                  title: 'Weekly\nTimetable',
                  icon: Calendar,
                  accent: 'yellow',
                  tab: 'Timetable' as const,
                },
                {
                  title: 'Staff\nCirculars',
                  icon: Megaphone,
                  accent: 'cyan',
                  tab: 'StaffNotices' as const,
                },
              ].map((tile, idx) => {
                const IconComp = tile.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      switchTab(tile.tab);
                      const el = document.getElementById('workspace-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-4 min-h-[125px] flex flex-col justify-between text-left shadow-[0_4px_14px_rgba(255,117,85,0.2)] hover:opacity-95 hover:scale-[1.02] transition-all group cursor-pointer"
                  >
                    {/* Decorative Corner Art */}
                    {tile.accent === 'cyan' && (
                      <svg className="absolute top-0 right-0 w-12 h-12 pointer-events-none" viewBox="0 0 40 40" fill="none">
                        <path d="M40 0H12C12 18 22 28 40 28V0Z" fill="#35C1E8" fillOpacity="0.85" />
                      </svg>
                    )}
                    {tile.accent === 'yellow' && (
                      <svg className="absolute top-0 right-0 w-12 h-12 pointer-events-none" viewBox="0 0 40 40" fill="none">
                        <path d="M40 0H15C15 16 24 25 40 25V0Z" fill="#FDCB6E" fillOpacity="0.45" />
                      </svg>
                    )}
                    {tile.accent === 'peach' && (
                      <svg className="absolute top-0 right-0 w-12 h-12 pointer-events-none" viewBox="0 0 40 40" fill="none">
                        <path d="M40 0H16C16 16 26 26 40 26V0Z" fill="#FFA07A" fillOpacity="0.4" />
                      </svg>
                    )}

                    <IconComp className="w-5 h-5 text-white/95" />
                    <span className="text-xs font-bold leading-tight whitespace-pre-line text-white/95">
                      {tile.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Today's Teaching Schedule Card */}
            <div
              className={`lg:col-span-7 rounded-[22px] border p-6 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex flex-col justify-between ${
                isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
              }`}
            >
              {/* Header with Calendar Icon & Current Period Live Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#FF7555]" />
                  <h3 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                    Today&apos;s Teaching Schedule (Friday)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#26C281] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#26C281] animate-ping" />
                    Period 2 Ongoing
                  </span>
                  <button
                    onClick={() => {
                      switchTab('Timetable');
                      const el = document.getElementById('workspace-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-1 text-gray-400 hover:text-[#FF7555]"
                    title="View Full Week Timetable"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time Segment Filter Tabs */}
              <div className="flex items-center gap-2 mb-4">
                {(['8-12', '12-3', '3-6'] as const).map((seg) => (
                  <button
                    key={seg}
                    onClick={() => setActiveScheduleTab(seg)}
                    className={`px-6 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                      activeScheduleTab === seg
                        ? 'bg-[#FF7555] text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'text-[#132033] hover:bg-[#F4F8FA]'
                    }`}
                  >
                    {seg === '8-12' ? '08:30 - 12:00' : seg === '12-3' ? '12:00 - 03:00' : '03:00 - 05:00'}
                  </button>
                ))}
              </div>

              {/* Schedule Item Rows */}
              <div className="space-y-3">
                {activeScheduleTab === '8-12' && (
                  <>
                    <div
                      className={`border border-l-4 border-l-[#26C281] rounded-[14px] p-4 flex flex-col justify-between ${
                        isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-[#132033]'}`}>
                          <span className="font-bold">Period 1</span> (Regular Lecture) | Subject:{' '}
                          <span className="font-bold">MATH-041</span> | Room: <span className="font-bold">204</span> | Section:{' '}
                          <span className="font-bold">10-A</span>
                        </p>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                          Completed
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#6F7D8D] mt-2 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#26C281]" />
                          <span>08:30 - 09:15 AM</span>
                        </div>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                          Algebra: Quadratic Roots Verification
                        </span>
                      </div>
                    </div>

                    <div
                      className={`border border-l-4 border-l-[#FF7555] rounded-[14px] p-4 flex flex-col justify-between ${
                        isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-[#132033]'}`}>
                          <span className="font-bold">Period 2</span> (Regular Lecture) | Subject:{' '}
                          <span className="font-bold">MATH-041</span> | Room: <span className="font-bold">108</span> | Section:{' '}
                          <span className="font-bold">9-B</span>
                        </p>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF7555] text-white animate-pulse">
                          Live Now
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#6F7D8D] mt-2 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#FF7555]" />
                          <span>09:20 - 10:05 AM</span>
                        </div>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                          Geometry: Theorem 6.1 Demonstration
                        </span>
                      </div>
                    </div>

                    <div
                      className={`border border-l-4 border-l-[#1F51FF] rounded-[14px] p-4 flex flex-col justify-between ${
                        isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-[#132033]'}`}>
                          <span className="font-bold">Period 4</span> (Substitution / Proxy) | Room:{' '}
                          <span className="font-bold">102</span> | Section: <span className="font-bold">9-B</span>
                        </p>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1F51FF] dark:bg-blue-950/50">
                          Proxy Duty
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#6F7D8D] mt-2 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#1F51FF]" />
                          <span>11:00 - 11:45 AM</span>
                        </div>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                          Supervised Study & Revision
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {activeScheduleTab === '12-3' && (
                  <div
                    className={`border border-l-4 border-l-[#26C281] rounded-[14px] p-4 flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-[#132033]'}`}>
                        <span className="font-bold">Period 6</span> (Remedial Batch) | Room: <span className="font-bold">206</span> | Section:{' '}
                        <span className="font-bold">10-C</span>
                      </p>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#26C281] border border-emerald-100">
                        Upcoming
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6F7D8D] mt-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#26C281]" />
                        <span>01:30 - 02:15 PM</span>
                      </div>
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        Advanced Algebra Practice & Doubt Solving
                      </span>
                    </div>
                  </div>
                )}

                {activeScheduleTab === '3-6' && (
                  <div
                    className={`border border-l-4 border-l-amber-500 rounded-[14px] p-4 flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-[#132033]'}`}>
                        <span className="font-bold">Department Meeting</span> | Room: <span className="font-bold">Staff Lounge</span>
                      </p>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                        Faculty Sync
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6F7D8D] mt-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>03:15 - 04:00 PM</span>
                      </div>
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        Math Department Term 1 Syllabus & Exam Paper Moderation
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SCREEN 3: TEACHER WORKSPACE (Complete Interactive Operational Desk) */}
        {/* ================================================================== */}
        <section id="workspace-section" className="min-h-[calc(100vh-130px)] flex flex-col justify-between pt-4">
          <div
            className={`rounded-[24px] border p-8 shadow-[0_2px_16px_rgba(19,32,51,0.03)] flex-1 flex flex-col justify-between transition-colors ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
            }`}
          >
            <div>
              {/* Top Operational Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#FFF2EE] dark:bg-slate-800 text-[#FF7555]">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                      Faculty Operational Desk
                    </h3>
                    <p className="text-xs text-[#6F7D8D]">
                      Active Workspace: <span className="font-bold text-[#FF7555]">{selectedClass}</span> • Academic Session:{' '}
                      <span className="font-bold">2026-27</span>
                    </p>
                  </div>
                </div>

                {/* Class Switcher Pill Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6F7D8D] font-bold uppercase">Class:</span>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold outline-none border cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-[#FAFCFE] border-[#D9E2EC] text-[#132033]'
                    }`}
                  >
                    {INITIAL_CLASSES.map((c) => (
                      <option key={c.classSec} value={c.classSec}>
                        {c.classSec} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Underlined Category Tabs */}
              <div className="flex items-center gap-6 md:gap-8 border-b border-[#F0F4F8] dark:border-slate-800 overflow-x-auto text-xs pb-1 mb-6">
                {[
                  { id: 'Attendance' as const, label: `Daily Attendance (${presentCount}/${totalCount})` },
                  { id: 'Marks' as const, label: `Rapid Marks Grid (${examType})` },
                  { id: 'Diary' as const, label: `Digital Diary (${homeworkList.length})` },
                  { id: 'LessonPlanner' as const, label: `Lesson Planner (${lessonPlans.length})` },
                  { id: 'Timetable' as const, label: 'Weekly Timetable Matrix' },
                  { id: 'StaffNotices' as const, label: `Staff Circulars (${noticesList.length})` },
                  { id: 'ProxySubstitution' as const, label: 'Proxy Duty & Leave' },
                ].map((tab) => {
                  const isActive = activeWorkspaceTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveWorkspaceTab(tab.id)}
                      className={`py-2.5 px-1 font-bold whitespace-nowrap transition-all border-b-2 -mb-[2px] cursor-pointer ${
                        isActive
                          ? 'border-[#FF7555] text-[#FF7555]'
                          : isDarkMode
                          ? 'border-transparent text-slate-300 hover:text-[#FF7555]'
                          : 'border-transparent text-[#132033] hover:text-[#FF7555]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ========================================================== */}
              {/* TAB 1: MORNING ATTENDANCE REGISTER                         */}
              {/* ========================================================== */}
              {activeWorkspaceTab === 'Attendance' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-[16px] border ${
                      isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        {selectedClass} Attendance
                      </span>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold outline-none ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                        }`}
                      />
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#26C281] font-bold border border-emerald-100">
                        {presentCount} Present
                      </span>
                      {absentCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 font-bold border border-red-100">
                          {absentCount} Absent
                        </span>
                      )}
                      {lateCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-bold border border-amber-100">
                          {lateCount} Late
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={markAllPresent}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                            : 'bg-white border-[#D9E2EC] text-[#132033] hover:bg-[#F4F8FA]'
                        }`}
                      >
                        Mark All Present
                      </button>
                      <button
                        onClick={markAllAbsent}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer text-red-600 ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                            : 'bg-white border-[#D9E2EC] hover:bg-red-50'
                        }`}
                      >
                        Clear
                      </button>
                      <button
                        onClick={downloadAttendanceCSV}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                            : 'bg-white border-[#D9E2EC] text-[#132033] hover:bg-[#F4F8FA]'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                      </button>
                      <button
                        onClick={() => {
                          setAttendanceSaved(true);
                          recordSectionDailyAttendance({
                            sectionId: '00000000-0000-0000-0000-000000000001',
                            date: attendanceDate,
                            records: students.map((s) => ({
                              studentId: s.id.length === 36 ? s.id : '00000000-0000-0000-0000-000000000001',
                              status: s.status as any,
                            })),
                          }).catch((err) => console.warn('Attendance sync error:', err));
                          if (absentCount > 0) setShowSmsModal(true);
                        }}
                        className="px-5 py-1.5 rounded-full text-xs font-bold text-white bg-[#26C281] hover:bg-[#20a76f] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {attendanceSaved ? 'Saved & Synced' : 'Save Attendance'}
                      </button>
                    </div>
                  </div>

                  {attendanceSaved && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[#26C281] rounded-xl text-xs font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          Attendance successfully locked to central ERP. Real-time parent push notifications and SMS dispatches queued.
                        </span>
                      </div>
                      {absentCount > 0 && (
                        <button
                          onClick={() => setShowSmsModal(true)}
                          className="underline font-bold text-emerald-700 dark:text-emerald-300 hover:opacity-80 ml-2"
                        >
                          View SMS Dispatch Logs ({absentCount})
                        </button>
                      )}
                    </div>
                  )}

                  {/* Attendance Table with Live Search Filter */}
                  <div className={`rounded-[20px] border overflow-hidden text-xs ${isDarkMode ? 'border-[#1E293B]' : 'border-[#EBF0F5]'}`}>
                    {/* Header Row */}
                    <div
                      className={`py-3 px-5 grid grid-cols-12 font-bold uppercase tracking-wider text-[11px] ${
                        isDarkMode ? 'bg-[#1E293B] text-slate-300' : 'bg-[#F8FAFC] text-[#6F7D8D]'
                      }`}
                    >
                      <div className="col-span-1">Roll</div>
                      <div className="col-span-4">Student Name & ID</div>
                      <div className="col-span-3">Parent Contact</div>
                      <div className="col-span-2 text-center">Term Avg</div>
                      <div className="col-span-2 text-right">Cycle Status</div>
                    </div>

                    {filteredStudents.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No students matching &quot;{studentSearchQuery}&quot; found in {selectedClass}.
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className={`py-3 px-5 grid grid-cols-12 items-center transition-colors border-t ${
                            isDarkMode
                              ? 'border-[#1E293B] hover:bg-slate-800/50'
                              : 'border-[#F1F5F9] hover:bg-[#FAFCFE]'
                          }`}
                        >
                          <div className={`col-span-1 font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                            {student.rollNo}
                          </div>
                          <div className="col-span-4">
                            <button
                              onClick={() => setSelectedStudentForDossier(student)}
                              className={`font-bold block text-left hover:text-[#FF7555] hover:underline cursor-pointer ${
                                isDarkMode ? 'text-white' : 'text-[#132033]'
                              }`}
                            >
                              {student.name}
                            </button>
                            <span className="text-[11px] text-[#8FA0B2]">{student.admNo}</span>
                          </div>
                          <div className="col-span-3 text-[#6F7D8D] flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#8FA0B2]" />
                            <span>{student.parentContact}</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="font-bold text-[#26C281]">{student.attendancePct}% att.</span>
                          </div>
                          <div className="col-span-2 flex items-center justify-end">
                            {/* Tap-to-cycle toggle pill */}
                            <button
                              onClick={() => cycleStudentStatus(student.id)}
                              title="Tap to cycle: Present → Absent → Late"
                              className={`
                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold
                                transition-all duration-200 cursor-pointer select-none w-[105px] justify-center
                                ${
                                  student.status === 'PRESENT'
                                    ? 'bg-emerald-50 text-[#26C281] border border-emerald-200 hover:bg-[#26C281] hover:text-white'
                                    : student.status === 'ABSENT'
                                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white'
                                    : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white'
                                }
                              `}
                            >
                              {student.status === 'PRESENT' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                              {student.status === 'ABSENT' && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                              {student.status === 'LATE' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                              <span>
                                {student.status === 'PRESENT' && 'Present'}
                                {student.status === 'ABSENT' && 'Absent'}
                                {student.status === 'LATE' && 'Late'}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* TAB 2: MARKS & RAPID GRADING GRID                          */}
              {/* ========================================================== */}
              {activeWorkspaceTab === 'Marks' && (
                <div className="space-y-4">
                  {/* Action Bar & Exam Selector */}
                  <div
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-[16px] border ${
                      isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                          {selectedClass} • Mathematics
                        </span>
                        <select
                          value={examType}
                          onChange={(e) => setExamType(e.target.value as any)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold outline-none ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                          }`}
                        >
                          <option>Unit Test 2</option>
                          <option>Mid Term</option>
                          <option>Unit Test 1</option>
                          <option>Pre-Board</option>
                        </select>
                      </div>
                      <span className="text-[11px] text-[#6F7D8D]">
                        Maximum Marks: 50 | Passing: 17 | Weightage: 10% CBSE Internal Assessment
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={downloadMarksCSV}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                            : 'bg-white border-[#D9E2EC] text-[#132033] hover:bg-[#F4F8FA]'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Marksheet
                      </button>
                      <button
                        onClick={() => {
                          setMarksSaved(true);
                          saveRapidMarksGrid({
                            examName: examType,
                            subjectCode: 'MATH-041',
                            sectionName: selectedClass,
                            maxMarks: 50,
                            marks: marksList.map((m) => ({
                              studentId: m.id.length === 36 ? m.id : '00000000-0000-0000-0000-000000000001',
                              marksObtained: typeof m.marks === 'number' ? m.marks : 0,
                            })),
                          }).catch((err) => console.warn('Marks save sync error:', err));
                        }}
                        className="px-5 py-1.5 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {marksSaved ? 'Marks Locked & Verified' : 'Submit & Lock Marks'}
                      </button>
                    </div>
                  </div>

                  {/* Class Analytics Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className={`p-3 rounded-xl border text-center ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EBF0F5]'}`}>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Class Average</span>
                      <span className="text-xl font-black text-[#FF7555]">{marksStats.average}/50</span>
                    </div>
                    <div className={`p-3 rounded-xl border text-center ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EBF0F5]'}`}>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Highest Score</span>
                      <span className="text-xl font-black text-[#26C281]">{marksStats.highest}/50</span>
                    </div>
                    <div className={`p-3 rounded-xl border text-center ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EBF0F5]'}`}>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Lowest Score</span>
                      <span className="text-xl font-black text-amber-500">{marksStats.lowest}/50</span>
                    </div>
                    <div className={`p-3 rounded-xl border text-center ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EBF0F5]'}`}>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Pass Rate</span>
                      <span className="text-xl font-black text-blue-600">{marksStats.passPercentage}%</span>
                    </div>
                  </div>

                  {marksSaved && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-[#26C281] rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Marksheet saved. Automated CBSE 10-point scale grades generated for student report cards.
                    </div>
                  )}

                  {/* Marks Table */}
                  <div className={`rounded-[20px] border overflow-hidden text-xs ${isDarkMode ? 'border-[#1E293B]' : 'border-[#EBF0F5]'}`}>
                    <div
                      className={`py-3 px-5 grid grid-cols-12 font-bold uppercase tracking-wider text-[11px] ${
                        isDarkMode ? 'bg-[#1E293B] text-slate-300' : 'bg-[#F8FAFC] text-[#6F7D8D]'
                      }`}
                    >
                      <div className="col-span-1">Roll</div>
                      <div className="col-span-4">Student Name & ID</div>
                      <div className="col-span-3 text-center">Marks Obtained (/50)</div>
                      <div className="col-span-2 text-center">CBSE Grade</div>
                      <div className="col-span-2 text-right">Grade Point</div>
                    </div>

                    {marksList.map((item) => {
                      const gradeInfo = calculateGrade(item.marks, item.maxMarks);
                      return (
                        <div
                          key={item.id}
                          className={`py-3 px-5 grid grid-cols-12 items-center transition-colors border-t ${
                            isDarkMode
                              ? 'border-[#1E293B] hover:bg-slate-800/50'
                              : 'border-[#F1F5F9] hover:bg-[#FAFCFE]'
                          }`}
                        >
                          <div className={`col-span-1 font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                            {item.rollNo}
                          </div>
                          <div className="col-span-4">
                            <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                              {item.name}
                            </span>
                            <span className="text-[11px] text-[#8FA0B2]">{item.admNo}</span>
                          </div>
                          <div className="col-span-3 flex justify-center">
                            <input
                              type="number"
                              min={0}
                              max={50}
                              value={item.marks}
                              onChange={(e) => handleMarkChange(item.id, e.target.value)}
                              className={`w-20 px-3 py-1.5 text-center font-bold border rounded-xl focus:border-[#FF7555] outline-none text-xs ${
                                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC] text-[#132033]'
                              }`}
                            />
                          </div>
                          <div className="col-span-2 text-center">
                            <span className={`font-extrabold text-sm ${gradeInfo.color}`}>
                              {gradeInfo.grade}
                            </span>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#132033]'}`}>
                              {gradeInfo.points} / 10.0
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* TAB 3: DIGITAL DIARY & HOMEWORK                            */}
              {/* ========================================================== */}
              {activeWorkspaceTab === 'Diary' && (
                <div className="space-y-6">
                  {/* Create Homework Form */}
                  <form
                    onSubmit={handleAddHomework}
                    className={`p-5 rounded-[18px] border space-y-3.5 ${
                      isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#FF7555]">
                      <Plus className="w-4 h-4" />
                      <span>Post Daily Homework & Classwork Assignment</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#6F7D8D] block mb-1">Class</label>
                        <select
                          value={newHwClass}
                          onChange={(e) => setNewHwClass(e.target.value)}
                          className={`w-full border rounded-xl px-3 py-1.5 text-xs outline-none ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC] text-[#132033]'
                          }`}
                        >
                          <option>Class 10-A</option>
                          <option>Class 9-B</option>
                          <option>Class 10-C</option>
                          <option>Class 8-A</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#6F7D8D] block mb-1">Subject</label>
                        <select
                          value={newHwSubject}
                          onChange={(e) => setNewHwSubject(e.target.value)}
                          className={`w-full border rounded-xl px-3 py-1.5 text-xs outline-none ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC] text-[#132033]'
                          }`}
                        >
                          <option>Mathematics (Standard)</option>
                          <option>Mathematics & Lab</option>
                          <option>Algebra Remedial</option>
                          <option>Applied Mathematics</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#6F7D8D] block mb-1">Due Date</label>
                        <input
                          type="date"
                          value={newHwDueDate}
                          onChange={(e) => setNewHwDueDate(e.target.value)}
                          className={`w-full border rounded-xl px-3 py-1.5 text-xs outline-none ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC] text-[#132033]'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#6F7D8D] block mb-1">
                        Topic & Instructions (Visible in Parent & Student App)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. NCERT Chapter 4: Complete Exercise 4.3 questions 1 to 5 in homework notebook."
                        value={newHwTopic}
                        onChange={(e) => setNewHwTopic(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2 text-xs outline-none ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC] text-[#132033]'
                        }`}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Publish to Student App
                      </button>
                    </div>
                  </form>

                  {/* Existing Homework List */}
                  <div className={`rounded-[20px] border overflow-hidden text-xs ${isDarkMode ? 'border-[#1E293B]' : 'border-[#EBF0F5]'}`}>
                    {homeworkList.map((hw) => (
                      <div
                        key={hw.id}
                        className={`py-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors border-b last:border-b-0 ${
                          isDarkMode
                            ? 'border-[#1E293B] hover:bg-slate-800/40'
                            : 'border-[#F1F5F9] hover:bg-[#FAFCFE]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                              {hw.classSec}
                            </span>
                            <span className="text-[#8FA0B2]">•</span>
                            <span className="font-bold text-[#FF7555]">{hw.subject}</span>
                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-[#26C281] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                              {hw.status}
                            </span>
                          </div>
                          <p className={`text-xs mt-1.5 font-medium ${isDarkMode ? 'text-slate-300' : 'text-[#132033]'}`}>
                            {hw.topic}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-[#6F7D8D] shrink-0">
                          <span>
                            Submissions: <strong>{hw.submissionsCount}/{hw.totalStudents}</strong>
                          </span>
                          <span>
                            Due: <strong className={isDarkMode ? 'text-white' : 'text-[#132033]'}>{hw.dueDate}</strong>
                          </span>
                          <button
                            onClick={() => handleDeleteHomework(hw.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* TAB 4: LESSON PLANNER (NEP 2020 PEDAGOGY)                   */}
              {/* ========================================================== */}
              {activeWorkspaceTab === 'LessonPlanner' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        NEP 2020 Competency-Based Lesson Plans
                      </h4>
                      <p className="text-xs text-[#6F7D8D]">
                        Draft, align, and submit weekly pedagogical lesson blueprints for HOD & Academic Supervisor endorsement.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowLessonPlanModal(true)}
                      className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Lesson Plan
                    </button>
                  </div>

                  <div className="space-y-4">
                    {lessonPlans.map((lp) => (
                      <div
                        key={lp.id}
                        className={`p-5 rounded-[18px] border transition-all ${
                          isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="font-extrabold text-[#FF7555] text-sm">{lp.classSec}</span>
                            <span className="text-[#8FA0B2]">•</span>
                            <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                              {lp.chapter}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full w-fit ${
                              lp.status === 'Approved'
                                ? 'bg-emerald-50 text-[#26C281] border border-emerald-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}
                          >
                            {lp.status}
                          </span>
                        </div>

                        <p className={`text-xs mt-2 font-semibold ${isDarkMode ? 'text-slate-200' : 'text-[#132033]'}`}>
                          Subtopic: {lp.subtopic} ({lp.durationPeriods} Periods)
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-[#6F7D8D]">
                          <div>
                            <strong className="block text-[#132033] dark:text-slate-200">Pedagogy:</strong>
                            <span>{lp.pedagogy}</span>
                          </div>
                          <div>
                            <strong className="block text-[#132033] dark:text-slate-200">NEP Competency:</strong>
                            <span>{lp.nepCompetency}</span>
                          </div>
                          <div>
                            <strong className="block text-[#132033] dark:text-slate-200">Assessment Tool:</strong>
                            <span>{lp.assessmentMethod}</span>
                          </div>
                        </div>

                        {lp.hodRemarks && (
                          <div className="mt-3 p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl text-[11px] text-[#26C281] flex items-center gap-1.5 font-medium">
                            <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>HOD Note: {lp.hodRemarks}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* TAB 5: WEEKLY TIMETABLE MATRIX                             */}
              {/* ========================================================== */}
              {activeWorkspaceTab === 'Timetable' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        Weekly Faculty Master Timetable
                      </h4>
                      <p className="text-xs text-[#6F7D8D]">
                        Total 24 teaching periods/week + 2 Remedial clinics + 1 Proxy duty buffer.
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Matrix
                    </button>
                  </div>

                  <div className={`rounded-[20px] border overflow-x-auto text-xs ${isDarkMode ? 'border-[#1E293B]' : 'border-[#EBF0F5]'}`}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-[#1E293B] text-slate-300' : 'bg-[#F8FAFC] text-[#6F7D8D]'}`}>
                          <th className="p-3.5">Day</th>
                          <th className="p-3.5">P1 (08:30)</th>
                          <th className="p-3.5">P2 (09:20)</th>
                          <th className="p-3.5">P3 (10:10)</th>
                          <th className="p-3.5">P4 (11:15)</th>
                          <th className="p-3.5">P5 (12:05)</th>
                          <th className="p-3.5">P6 (01:30)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                          { day: 'Monday', p1: '10-A (Math)', p2: '9-B (Math)', p3: 'Free / Prep', p4: '10-C (Alg)', p5: '8-A (Math)', p6: 'Free' },
                          { day: 'Tuesday', p1: '9-B (Lab)', p2: '10-A (Math)', p3: '10-A (Math)', p4: 'Free / Prep', p5: '10-C (Alg)', p6: '8-A (Math)' },
                          { day: 'Wednesday', p1: '8-A (Math)', p2: 'Free', p3: '10-A (Math)', p4: '9-B (Math)', p5: '10-C (Alg)', p6: 'Remedial 10' },
                          { day: 'Thursday', p1: '10-C (Alg)', p2: '8-A (Math)', p3: 'Free / Prep', p4: '10-A (Math)', p5: '9-B (Lab)', p6: 'Free' },
                          { day: 'Friday', p1: '10-A (Math)', p2: '9-B (Math)', p3: 'Free / Prep', p4: 'Proxy 9-B', p5: '8-A (Math)', p6: '10-C (Alg)' },
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                              row.day === 'Friday' ? 'bg-[#FFF9F6] dark:bg-slate-800/60 font-medium' : ''
                            }`}
                          >
                            <td className={`p-3.5 font-bold ${row.day === 'Friday' ? 'text-[#FF7555]' : isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                              {row.day} {row.day === 'Friday' && '(Today)'}
                            </td>
                            <td className="p-3.5">{row.p1}</td>
                            <td className="p-3.5">{row.p2}</td>
                            <td className="p-3.5 text-gray-400">{row.p3}</td>
                            <td className="p-3.5">{row.p4}</td>
                            <td className="p-3.5">{row.p5}</td>
                            <td className="p-3.5">{row.p6}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* TAB 6: STAFF NOTICES & CIRCULARS                           */}
              {/* ========================================================== */}
              {activeWorkspaceTab === 'StaffNotices' && (
                <div className="space-y-4">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    {['All', 'Examination', 'Administration', 'HR', 'Academic'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNoticeFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                          noticeFilter === cat
                            ? 'bg-[#FF7555] text-white'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-white border border-[#D9E2EC] text-[#132033]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Circulars List */}
                  <div className={`rounded-[20px] border overflow-hidden divide-y text-xs ${isDarkMode ? 'border-[#1E293B] divide-slate-800' : 'border-[#EBF0F5] divide-[#F1F5F9]'}`}>
                    {noticesList
                      .filter((n) => noticeFilter === 'All' || n.category === noticeFilter)
                      .map((notice) => (
                        <div
                          key={notice.id}
                          onClick={() => setSelectedNoticeForReader(notice)}
                          className={`py-3.5 px-5 flex items-center justify-between cursor-pointer transition-colors group ${
                            isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-[#FAFCFE]'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0 pr-4">
                            <span className="text-[#FF7555] text-sm leading-none">•</span>
                            <div className="truncate">
                              <span className={`font-semibold group-hover:text-[#FF7555] truncate block ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                                {notice.title}
                              </span>
                              <span className="text-[10px] text-[#8FA0B2]">
                                Ref: {notice.refNo} • {notice.sender}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3.5 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                notice.priority === 'URGENT'
                                  ? 'bg-red-50 text-red-600 border border-red-200'
                                  : notice.priority === 'HIGH'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300'
                              }`}
                            >
                              {notice.priority}
                            </span>
                            <span className="text-xs font-bold text-[#FF7555]">{notice.date}</span>
                            <ChevronRight className="w-4 h-4 text-[#8FA0B2] group-hover:text-[#FF7555] transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* TAB 7: PROXY & LEAVE MANAGEMENT                            */}
              {/* ========================================================== */}
              {activeWorkspaceTab === 'ProxySubstitution' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Active Substitutions Assigned to Dr. Neha Verma */}
                    <div className={`p-5 rounded-[20px] border ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'}`}>
                      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#FF7555]">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Active Proxy Substitution Duty</span>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-[#132033] dark:text-white">Class 9-B • Room 102</span>
                          <span className="text-[10px] font-bold bg-[#FF7555] text-white px-2 py-0.5 rounded-full">Period 4 (11:00 AM)</span>
                        </div>
                        <p className="text-xs text-[#6F7D8D]">
                          Covering for <strong>Mr. Rajesh Sharma</strong> (Medical Emergency Leave).
                        </p>
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 text-xs">
                          <span>Status: <strong>{proxyAcknowledged ? 'Confirmed' : 'Pending Confirmation'}</strong></span>
                          <button
                            onClick={() => setProxyAcknowledged(!proxyAcknowledged)}
                            className="px-3 py-1 bg-[#26C281] text-white rounded-full font-bold text-xs"
                          >
                            {proxyAcknowledged ? 'Acknowledged' : 'Acknowledge'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Leave Application Box */}
                    <div className={`p-5 rounded-[20px] border ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'}`}>
                      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#132033] dark:text-white">
                        <Calendar className="w-4 h-4 text-[#FF7555]" />
                        <span>Apply For Teacher Leave / On-Duty (OD)</span>
                      </div>
                      <p className="text-xs text-[#6F7D8D] mb-4">
                        Applying for leave automatically triggers the automated Timetable Substitution Engine to allocate proxy teachers.
                      </p>
                      <button
                        onClick={() => setShowLeaveRequestModal(true)}
                        className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Open Leave Application
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Summary */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6F7D8D] border-t border-slate-100 dark:border-slate-800 mt-6 gap-2">
              <span>Class 10-A Mentor Desk • Real-time Sync Active with CBSE Portal</span>
              <button
                onClick={downloadAttendanceCSV}
                className="text-[#FF7555] font-bold cursor-pointer hover:underline text-left"
              >
                Export Complete Attendance Register (PDF / CSV) →
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SCREEN 4: FACULTY LEADERSHIP & PEER NETWORK                        */}
        {/* ================================================================== */}
        <section className="min-h-[calc(100vh-130px)] flex flex-col justify-between pt-4">
          <div className="relative flex-1 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                  Faculty Leadership & Peer Network
                </h3>
                <p className="text-xs text-[#6F7D8D]">
                  Institution leadership and student grievance contact points.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch flex-1">
              {[
                {
                  roleBadge: 'Head of Institution',
                  name: 'Dr. Anandita Sen',
                  designation: 'Principal',
                  department: 'Senior Wing & General Administration',
                  email: 'principal@dpsdelhi.edu.in',
                  phone: '+91 11 2345 6789',
                },
                {
                  roleBadge: 'Vice Principal',
                  name: 'Mr. Arvind Saxena',
                  designation: 'Academic Supervisor',
                  department: 'Curriculum & Examination Affairs',
                  email: 'viceprincipal@dpsdelhi.edu.in',
                  phone: '+91 11 2345 6790',
                },
                {
                  roleBadge: 'Class 10-A Mentor',
                  name: 'Dr. Neha Verma',
                  designation: 'Class Teacher & PGT Mathematics',
                  department: 'Department of Mathematics',
                  email: 'nverma@dpsdelhi.edu.in',
                  phone: '+91 98112 34567',
                },
                {
                  roleBadge: 'Grievance Officer',
                  name: 'Dr. S. K. Gupta',
                  designation: 'HOD Science',
                  department: 'Department of Sciences',
                  email: 'skgupta@dpsdelhi.edu.in',
                  phone: '+91 98223 45678',
                },
              ].map((person, idx) => (
                <div
                  key={idx}
                  className={`rounded-[24px] border p-7 text-center shadow-[0_2px_16px_rgba(19,32,51,0.03)] flex flex-col justify-between min-h-[440px] ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
                  }`}
                >
                  <div>
                    {/* Circular Portrait Frame */}
                    <div className="w-24 h-24 rounded-full bg-[#F4F8FA] dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mx-auto flex items-center justify-center shadow-sm mb-4 overflow-hidden relative">
                      <img
                        src="/teacher-avatar.jpg"
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Role Pill Badge */}
                    <span className="inline-block px-5 py-1.5 rounded-full text-xs font-bold bg-[#FFF2EE] dark:bg-slate-800 text-[#FF7555] mb-3">
                      {person.roleBadge}
                    </span>

                    {/* Name & Designation */}
                    <h4 className={`text-base font-extrabold leading-tight ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                      {person.name}
                    </h4>
                    <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-slate-300' : 'text-[#132033]'}`}>
                      {person.designation}
                    </p>
                    <p className="text-xs text-[#6F7D8D] mt-2 mb-4 leading-relaxed">
                      {person.department}
                    </p>

                    {/* Contact Info with Icons */}
                    <div className="space-y-2 text-xs font-medium flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#FF7555]" />
                        <span className={isDarkMode ? 'text-slate-300' : 'text-[#132033]'}>{person.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#26C281]" />
                        <span className={isDarkMode ? 'text-slate-300' : 'text-[#132033]'}>{person.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Action */}
                  <a
                    href={`mailto:${person.email}`}
                    className="mt-6 w-fit mx-auto px-7 py-2 rounded-full text-xs font-bold text-[#FF7555] bg-white dark:bg-slate-800 border border-[#FFE3DB] dark:border-slate-700 hover:bg-[#FF7555] hover:text-white transition-all shadow-2xs cursor-pointer block"
                  >
                    Contact Faculty
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================================== */}
      {/* FLOATING QUICK ACTION BUTTONS                                        */}
      {/* ==================================================================== */}
      <div className="fixed right-4 bottom-8 z-50 flex flex-col gap-3">
        {/* Activity Tracker */}
        <button
          onClick={() => setShowActivityDrawer(true)}
          aria-label="Activity tracker"
          className="w-11 h-11 rounded-full bg-[#FF7555] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
          title="Teacher Activity Log"
        >
          <Footprints className="w-5 h-5" />
        </button>

        {/* Bug / Grievance Report */}
        <button
          onClick={() => setShowBugModal(true)}
          aria-label="Report issue"
          className="w-11 h-11 rounded-full bg-[#FF7555] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
          title="Report Bug / Grievance"
        >
          <Bug className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowSettingsModal(true)}
          aria-label="Settings"
          className="w-11 h-11 rounded-full bg-[#FF7555] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
          title="Portal ERP Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: STUDENT 360 DOSSIER                                         */}
      {/* ==================================================================== */}
      {selectedStudentForDossier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-2xl rounded-[24px] border p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setSelectedStudentForDossier(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b pb-5 border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 rounded-full bg-[#FFF2EE] text-[#FF7555] font-black text-xl flex items-center justify-center border-2 border-[#FF7555]">
                {selectedStudentForDossier.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-extrabold">{selectedStudentForDossier.name}</h3>
                <p className="text-xs text-[#6F7D8D]">
                  Adm No: <strong>{selectedStudentForDossier.admNo}</strong> • Roll No: <strong>{selectedStudentForDossier.rollNo}</strong> • Class: <strong>10-A</strong>
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#26C281] font-bold text-[10px] border border-emerald-100">
                  {selectedStudentForDossier.status} Today
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Attendance</span>
                <span className="text-lg font-black text-[#26C281]">{selectedStudentForDossier.attendancePct}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Math Score</span>
                <span className="text-lg font-black text-[#FF7555]">{selectedStudentForDossier.avgMarksPct}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Blood Group</span>
                <span className="text-lg font-black text-blue-600">{selectedStudentForDossier.bloodGroup}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Gender</span>
                <span className="text-lg font-black">{selectedStudentForDossier.gender === 'M' ? 'Male' : 'Female'}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <strong className="block text-gray-500 mb-1">Parent & Guardian Contact:</strong>
                <p>Parent: <strong>{selectedStudentForDossier.parentName}</strong></p>
                <p>Phone: <strong>{selectedStudentForDossier.parentContact}</strong></p>
                <p>Residential Address: <strong>{selectedStudentForDossier.address}</strong></p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <strong className="block text-amber-700 dark:text-amber-400 mb-1">Faculty Mentor Behavioral Remarks:</strong>
                <p>{selectedStudentForDossier.behaviorNote}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <a
                href={`tel:${selectedStudentForDossier.parentContact}`}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#26C281] hover:bg-[#20a76f] flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Parent
              </a>
              <button
                onClick={() => setSelectedStudentForDossier(null)}
                className="px-5 py-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: NOTICE READER                                               */}
      {/* ==================================================================== */}
      {selectedNoticeForReader && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-2xl rounded-[24px] border p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setSelectedNoticeForReader(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Letterhead Header */}
            <div className="text-center border-b pb-4 border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black tracking-widest text-[#FF7555] uppercase block">
                DELHI PUBLIC SCHOOL • OFFICIAL NOTIFICATION
              </span>
              <h3 className="text-lg font-extrabold mt-1">{selectedNoticeForReader.title}</h3>
              <p className="text-xs text-[#6F7D8D] mt-1">
                Ref No: <strong>{selectedNoticeForReader.refNo}</strong> • Date: <strong>{selectedNoticeForReader.date}</strong>
              </p>
            </div>

            <div className="my-5 text-xs leading-relaxed space-y-3">
              <p className="text-gray-500 font-bold">Issued By: {selectedNoticeForReader.sender}</p>
              <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                {selectedNoticeForReader.body}
              </p>
            </div>

            {selectedNoticeForReader.attachmentName && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FFFDFB] dark:bg-slate-800 flex items-center justify-between text-xs mb-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF7555]" />
                  <span>
                    <strong>{selectedNoticeForReader.attachmentName}</strong> ({selectedNoticeForReader.attachmentSize})
                  </span>
                </div>
                <button
                  onClick={() => alert(`Downloading ${selectedNoticeForReader.attachmentName}`)}
                  className="px-3 py-1 rounded-full bg-[#FF7555] text-white font-bold text-[11px] flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedNoticeForReader(null)}
                className="px-6 py-2 rounded-full text-xs font-bold bg-[#FF7555] text-white"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CREATE LESSON PLAN                                          */}
      {/* ==================================================================== */}
      {showLessonPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-xl rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setShowLessonPlanModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold mb-1">Create NEP 2020 Pedagogical Lesson Plan</h3>
            <p className="text-xs text-[#6F7D8D] mb-4">Class: {selectedClass} • Mathematics</p>

            <form onSubmit={handleCreateLessonPlan} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-500 block mb-1">Chapter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 5: Arithmetic Progressions"
                  value={newLpChapter}
                  onChange={(e) => setNewLpChapter(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 block mb-1">Specific Subtopic & Learning Objectives</label>
                <input
                  type="text"
                  placeholder="e.g. Sum of n terms using standard summation formula"
                  value={newLpSubtopic}
                  onChange={(e) => setNewLpSubtopic(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">NEP 2020 Competency</label>
                  <select
                    value={newLpCompetency}
                    onChange={(e) => setNewLpCompetency(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  >
                    <option>Critical Thinking & Problem Solving</option>
                    <option>Experiential & Inquiry-Based Proofs</option>
                    <option>Financial Literacy & Application</option>
                    <option>Mathematical Modelling</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Pedagogy / Tool</label>
                  <input
                    type="text"
                    placeholder="e.g. GeoGebra & graph grids"
                    value={newLpPedagogy}
                    onChange={(e) => setNewLpPedagogy(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-500 block mb-1">Formative Assessment Tool</label>
                <input
                  type="text"
                  placeholder="e.g. 5-question quiz & practice sheet"
                  value={newLpAssessment}
                  onChange={(e) => setNewLpAssessment(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                  }`}
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLessonPlanModal(false)}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541]"
                >
                  Submit for HOD Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: LEAVE APPLICATION                                           */}
      {/* ==================================================================== */}
      {showLeaveRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => { setShowLeaveRequestModal(false); setLeaveSubmitted(false); }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold mb-1">Teacher Leave Application</h3>
            <p className="text-xs text-[#6F7D8D] mb-4">Dr. Neha Verma • Class 10-A Mentor</p>

            {leaveSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#26C281] mx-auto" />
                <h4 className="font-extrabold text-sm text-[#26C281]">Leave Application Dispatched</h4>
                <p className="text-xs text-[#6F7D8D]">
                  Application forwarded to Vice Principal for sanction. Automated substitution engine will assign proxy for your periods.
                </p>
                <button
                  onClick={() => { setShowLeaveRequestModal(false); setLeaveSubmitted(false); }}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-[#FF7555] text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLeaveSubmitted(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  >
                    <option>Casual Leave (CL)</option>
                    <option>Medical Leave (ML)</option>
                    <option>On-Duty (OD - CBSE Workshop)</option>
                    <option>Earned Leave (EL)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-500 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border outline-none ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-500 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border outline-none ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-500 block mb-1">Reason for Leave</label>
                  <textarea
                    rows={3}
                    placeholder="Provide justification or medical details..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLeaveRequestModal(false)}
                    className="px-5 py-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541]"
                  >
                    Submit Leave Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: SMS DISPATCH PREVIEW                                        */}
      {/* ==================================================================== */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setShowSmsModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-[#FF7555] font-bold text-sm">
              <MessageSquare className="w-5 h-5" />
              <span>Automated Parent SMS & Push Notification Dispatch</span>
            </div>
            <p className="text-xs text-[#6F7D8D] mb-4">
              Triggered automatically for {absentStudents.length} absent student(s) in {selectedClass}.
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto text-xs">
              {absentStudents.map((st) => (
                <div key={st.id} className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#132033] dark:text-white">{st.name} ({st.admNo})</span>
                    <span className="text-red-600">{st.parentContact}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    &quot;Dear {st.parentName}, your ward {st.name} (Class 10-A) is marked ABSENT today ({attendanceDate}). Kindly contact DPS Faculty Desk if this is an error.&quot;
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowSmsModal(false)}
                className="px-6 py-2 rounded-full text-xs font-bold bg-[#FF7555] text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DRAWER: NOTIFICATIONS CENTER                                         */}
      {/* ==================================================================== */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div
            className={`w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111C2D] text-white' : 'bg-white text-[#132033]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#FF7555]" />
                  <h3 className="font-extrabold text-base">Teacher Notifications</h3>
                </div>
                <button
                  onClick={() => setShowNotificationsDrawer(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      n.unread
                        ? 'border-[#FF7555] bg-[#FFF2EE]/40 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{n.title}</span>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#6F7D8D] mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
              }}
              className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-[#FF7555]"
            >
              Mark All As Read
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DRAWER: ACTIVITY TRACKER                                             */}
      {/* ==================================================================== */}
      {showActivityDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div
            className={`w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111C2D] text-white' : 'bg-white text-[#132033]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-[#FF7555]" />
                  <h3 className="font-extrabold text-base">Teacher ERP Activity Tracker</h3>
                </div>
                <button onClick={() => setShowActivityDrawer(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                {[
                  { time: '09:18 AM', event: 'Period 1 attendance locked for Class 10-A (42 present, 2 absent)' },
                  { time: '09:05 AM', event: 'Homework published: Chapter 4 Quadratic Equations Q1-Q7' },
                  { time: '08:45 AM', event: 'Unit Test 2 marks updated for 15 students in Class 10-A' },
                  { time: '08:15 AM', event: 'Biometric Login validated at Faculty Terminal Senior Wing' },
                ].map((act, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-[#FF7555] block text-[10px]">{act.time}</span>
                    <span className="text-[#6F7D8D]">{act.event}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowActivityDrawer(false)}
              className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-[#FF7555]"
            >
              Close Activity Tracker
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: BUG REPORT                                                  */}
      {/* ==================================================================== */}
      {showBugModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => { setShowBugModal(false); setBugSubmitted(false); }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold mb-1">Report ERP Issue / Grievance</h3>
            <p className="text-xs text-[#6F7D8D] mb-4">Direct ticket to DPS IT Systems Helpdesk</p>

            {bugSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#26C281] mx-auto" />
                <h4 className="font-extrabold text-sm text-[#26C281]">Ticket #ERP-9941 Logged</h4>
                <p className="text-xs text-[#6F7D8D]">
                  Thank you Dr. Neha Verma. IT Support will inspect this report within 2 hours.
                </p>
                <button
                  onClick={() => { setShowBugModal(false); setBugSubmitted(false); }}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-[#FF7555] text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setBugSubmitted(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Issue Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Attendance SMS Gateway Delay or Marksheet Printing"
                    value={bugSubject}
                    onChange={(e) => setBugSubject(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Explain steps to reproduce or grievance details..."
                    value={bugDesc}
                    onChange={(e) => setBugDesc(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBugModal(false)}
                    className="px-5 py-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541]"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 7: ERP SETTINGS                                                */}
      {/* ==================================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold mb-1">Teacher Portal Settings</h3>
            <p className="text-xs text-[#6F7D8D] mb-4">Preferences for Dr. Neha Verma (TCH-2021-084)</p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="font-bold block">Instant Parent SMS on Absence</span>
                  <span className="text-[11px] text-gray-400">Trigger SMS gateway automatically on saving</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#FF7555]" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="font-bold block">CBSE 10-Point Grading Display</span>
                  <span className="text-[11px] text-gray-400">Show A1/A2 letter grades alongside raw scores</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#FF7555]" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="font-bold block">Proxy Duty WhatsApp Alerts</span>
                  <span className="text-[11px] text-gray-400">Send mobile alert for substitution assignments</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#FF7555]" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-6 py-2 rounded-full text-xs font-bold bg-[#FF7555] text-white"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
