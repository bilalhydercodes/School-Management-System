'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Eye,
  Megaphone,
  Moon,
  Sun,
  Settings,
  Bug,
  LogOut,
  Users,
  CheckCircle2,
  AlertCircle,
  Send,
  Check,
  ShieldCheck,
  Building2,
  BarChart3,
  Edit2,
  Download,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Award,
  Plus,
  Trash2,
  X,
  Phone,
  Mail,
  UserCheck,
  BookOpen,
  Layers,
  Sparkles,
  Filter,
  CheckCheck,
  Printer,
  FileSpreadsheet,
  Key,
  Copy,
  Lock,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { logoutAction, adminResetUserPasswordAction } from '@/actions/auth';
import {
  createAcademicYear,
  activateAcademicYear,
  getAcademicYears,
  getAllClassSections,
  assignSectionClassTeacher,
  createSection,
} from '@/actions/academic';
import { createStudentAdmission, getStudentsList } from '@/actions/students';
import { createTeacherProfile, toggleTeacherActiveStatus, getFacultyDirectory } from '@/actions/teachers';
import { createBroadcastNotice, getBroadcastNotices } from '@/actions/notices';
import { getAdminAttendanceAudit } from '@/actions/attendance';
import { getAdminDashboardKpis } from '@/actions/dashboard';

// Types & Interfaces
type AdminWorkspaceTab =
  | 'Staff'
  | 'Students'
  | 'ClassAllocation'
  | 'Sessions'
  | 'Timetable'
  | 'Attendance'
  | 'Notices';

type OpsTab = 'AttendanceStatus' | 'Substitutions' | 'FeeActivity';
type NoticePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';
type NoticeAudience = 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';

interface StaffMember {
  id: string;
  name: string;
  empId: string;
  dept: string;
  qualification: string;
  subjects: string;
  assignedClasses: string;
  isClassTeacher: boolean;
  classTeacherOf?: string;
  isActive: boolean;
  phone: string;
  email: string;
  joiningDate?: string;
}

interface StudentItem {
  id: string;
  name: string;
  admNo: string;
  rollNo: number;
  classSec: string;
  gender: 'M' | 'F';
  dob: string;
  bloodGroup: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  attendanceRate: number;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
}

interface ClassSectionItem {
  id: string;
  grade: string;
  section: string;
  students: number;
  capacity: number;
  attendance: number;
  classTeacher: string;
  teacherEmpId: string;
  room: string;
  submitted: boolean;
}

interface AcademicSessionItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  board: string;
  isCurrent: boolean;
  totalStudents: number;
  totalClasses: number;
  status: 'Active' | 'Upcoming' | 'Archived';
}

interface NoticeItem {
  id: number;
  title: string;
  audience: NoticeAudience;
  priority: NoticePriority;
  date: string;
  expiresAt: string;
  author: string;
  channel: 'Portal + SMS + WhatsApp' | 'Portal Only';
}

// Initial Sample Datasets
const INIT_SESSIONS: AcademicSessionItem[] = [
  {
    id: '1',
    name: 'Academic Year 2026-27',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    board: 'CBSE New Delhi',
    isCurrent: true,
    totalStudents: 847,
    totalClasses: 24,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Academic Year 2027-28',
    startDate: '2027-04-01',
    endDate: '2028-03-31',
    board: 'CBSE New Delhi',
    isCurrent: false,
    totalStudents: 120,
    totalClasses: 26,
    status: 'Upcoming',
  },
  {
    id: '3',
    name: 'Academic Year 2025-26',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    board: 'CBSE New Delhi',
    isCurrent: false,
    totalStudents: 812,
    totalClasses: 22,
    status: 'Archived',
  },
];

const INIT_CLASSES: ClassSectionItem[] = [
  { id: '10-A', grade: 'Class 10', section: 'A', students: 45, capacity: 45, attendance: 96, classTeacher: 'Dr. Neha Verma', teacherEmpId: 'TCH-2021-084', room: 'Room 204', submitted: true },
  { id: '10-B', grade: 'Class 10', section: 'B', students: 43, capacity: 45, attendance: 91, classTeacher: 'Mr. Vikram Mehta', teacherEmpId: 'TCH-2020-077', room: 'Room 205', submitted: true },
  { id: '10-C', grade: 'Class 10', section: 'C', students: 42, capacity: 45, attendance: 90, classTeacher: 'Ms. Sunita Roy', teacherEmpId: 'TCH-2020-071', room: 'Room 206', submitted: true },
  { id: '9-A', grade: 'Class 9', section: 'A', students: 41, capacity: 45, attendance: 93, classTeacher: 'Ms. Priya Sharma', teacherEmpId: 'TCH-2022-092', room: 'Room 106', submitted: true },
  { id: '9-B', grade: 'Class 9', section: 'B', students: 39, capacity: 45, attendance: 87, classTeacher: 'Mr. Rajiv Singh', teacherEmpId: 'TCH-2019-063', room: 'Room 108', submitted: true },
  { id: '9-C', grade: 'Class 9', section: 'C', students: 38, capacity: 45, attendance: 87, classTeacher: 'Ms. Kavita Jain', teacherEmpId: 'TCH-2017-042', room: 'Room 109', submitted: false },
  { id: '8-A', grade: 'Class 8', section: 'A', students: 38, capacity: 40, attendance: 92, classTeacher: 'Prof. S. K. Gupta', teacherEmpId: 'TCH-2018-056', room: 'Room 104', submitted: false },
  { id: '8-B', grade: 'Class 8', section: 'B', students: 39, capacity: 40, attendance: 92, classTeacher: 'Ms. Priya Sharma', teacherEmpId: 'TCH-2022-092', room: 'Room 105', submitted: true },
  { id: '7-A', grade: 'Class 7', section: 'A', students: 38, capacity: 40, attendance: 92, classTeacher: 'Mr. Arvind Saxena', teacherEmpId: 'TCH-2016-018', room: 'Room 003', submitted: true },
  { id: '7-B', grade: 'Class 7', section: 'B', students: 40, capacity: 40, attendance: 88, classTeacher: 'Mr. A. Kumar', teacherEmpId: 'TCH-2023-112', room: 'Room 004', submitted: true },
  { id: '6-A', grade: 'Class 6', section: 'A', students: 42, capacity: 42, attendance: 95, classTeacher: 'Ms. Poonam Iyer', teacherEmpId: 'TCH-2015-031', room: 'Room 001', submitted: true },
  { id: '6-B', grade: 'Class 6', section: 'B', students: 42, capacity: 42, attendance: 90, classTeacher: 'Ms. Anita Deshmukh', teacherEmpId: 'TCH-2021-099', room: 'Room 002', submitted: true },
];

const INIT_STUDENTS: StudentItem[] = [
  { id: '1', name: 'Aarav Patel', admNo: 'DPS-2022-4801', rollNo: 1, classSec: 'Class 10-A', gender: 'M', dob: '2011-04-12', bloodGroup: 'B+', parentName: 'Mr. Rajesh Patel', parentPhone: '+91 98112 34501', parentEmail: 'r.patel@gmail.com', address: 'B-14, Vasant Kunj, New Delhi', attendanceRate: 96, feeStatus: 'Paid' },
  { id: '2', name: 'Aditi Sharma', admNo: 'DPS-2022-4802', rollNo: 2, classSec: 'Class 10-A', gender: 'F', dob: '2011-08-23', bloodGroup: 'O+', parentName: 'Mrs. Sunita Sharma', parentPhone: '+91 98112 34502', parentEmail: 's.sharma@yahoo.com', address: 'C-202, Dwarka Sector 11, New Delhi', attendanceRate: 98, feeStatus: 'Paid' },
  { id: '3', name: 'Ananya Roy', admNo: 'DPS-2022-4803', rollNo: 3, classSec: 'Class 10-A', gender: 'F', dob: '2011-01-15', bloodGroup: 'A+', parentName: 'Dr. Debasish Roy', parentPhone: '+91 98112 34503', parentEmail: 'dr.roy@delhihospital.org', address: 'Plot 45, Saket, New Delhi', attendanceRate: 91, feeStatus: 'Paid' },
  { id: '4', name: 'Arjun Mehra', admNo: 'DPS-2022-4804', rollNo: 4, classSec: 'Class 10-A', gender: 'M', dob: '2010-11-05', bloodGroup: 'AB+', parentName: 'Mr. Vikram Mehra', parentPhone: '+91 98112 34504', parentEmail: 'vmehra@outlook.com', address: 'E-88, Greater Kailash 1, New Delhi', attendanceRate: 68, feeStatus: 'Pending' },
  { id: '5', name: 'Bhavna Joshi', admNo: 'DPS-2022-4805', rollNo: 5, classSec: 'Class 10-A', gender: 'F', dob: '2011-09-18', bloodGroup: 'O-', parentName: 'Mr. Rakesh Joshi', parentPhone: '+91 98112 34505', parentEmail: 'rakesh.j@tcs.com', address: 'Flat 12B, Lajpat Nagar III, New Delhi', attendanceRate: 94, feeStatus: 'Paid' },
  { id: '6', name: 'Chirag Sethi', admNo: 'DPS-2022-4806', rollNo: 6, classSec: 'Class 10-A', gender: 'M', dob: '2011-03-30', bloodGroup: 'A+', parentName: 'Mrs. Ritu Sethi', parentPhone: '+91 98112 34506', parentEmail: 'sethir@gmail.com', address: 'D-4, Model Town, New Delhi', attendanceRate: 90, feeStatus: 'Paid' },
  { id: '7', name: 'Devansh Nair', admNo: 'DPS-2022-4807', rollNo: 7, classSec: 'Class 10-A', gender: 'M', dob: '2011-06-22', bloodGroup: 'B+', parentName: 'Mr. Suresh Nair', parentPhone: '+91 98112 34507', parentEmail: 'nairsuresh@airtel.in', address: '78, Mayur Vihar Phase 1, New Delhi', attendanceRate: 86, feeStatus: 'Paid' },
  { id: '8', name: 'Yash Agarwal', admNo: 'DPS-2023-5021', rollNo: 32, classSec: 'Class 9-C', gender: 'M', dob: '2012-02-14', bloodGroup: 'O+', parentName: 'Mr. Mukesh Agarwal', parentPhone: '+91 98221 44551', parentEmail: 'mukesh@agarwalexports.com', address: 'Pocket 3, Mayur Vihar, New Delhi', attendanceRate: 71, feeStatus: 'Overdue' },
  { id: '9', name: 'Simran Kaur', admNo: 'DPS-2024-6134', rollNo: 18, classSec: 'Class 7-B', gender: 'F', dob: '2013-10-10', bloodGroup: 'B+', parentName: 'S. Gurdeep Singh', parentPhone: '+91 98332 55662', parentEmail: 'gurdeep.singh@gmail.com', address: 'C-4, Rajouri Garden, New Delhi', attendanceRate: 73, feeStatus: 'Paid' },
  { id: '10', name: 'Karan Mehta', admNo: 'DPS-2023-5088', rollNo: 22, classSec: 'Class 8-A', gender: 'M', dob: '2012-07-07', bloodGroup: 'A-', parentName: 'Mr. Naveen Mehta', parentPhone: '+91 98443 66773', parentEmail: 'nmehta@gmail.com', address: 'Sector 15, Rohini, New Delhi', attendanceRate: 74, feeStatus: 'Paid' },
];

const INIT_STAFF: StaffMember[] = [
  { id: '1', name: 'Dr. Neha Verma', empId: 'TCH-2021-084', dept: 'Mathematics', qualification: 'M.Sc., B.Ed., Ph.D.', subjects: 'MATH-041', assignedClasses: 'Class 10-A (CT), 9-B', isClassTeacher: true, classTeacherOf: 'Class 10-A', isActive: true, phone: '+91 98112 34567', email: 'nverma@dpsdelhi.edu.in', joiningDate: '2021-06-15' },
  { id: '2', name: 'Prof. S. K. Gupta', empId: 'TCH-2018-056', dept: 'Sciences', qualification: 'M.Sc. Physics, B.Ed.', subjects: 'SCI-086', assignedClasses: 'Class 8-A (CT), 10-A, 10-B', isClassTeacher: true, classTeacherOf: 'Class 8-A', isActive: true, phone: '+91 98223 45678', email: 'skgupta@dpsdelhi.edu.in', joiningDate: '2018-04-01' },
  { id: '3', name: 'Ms. Sunita Roy', empId: 'TCH-2020-071', dept: 'Languages', qualification: 'M.A. English, B.Ed.', subjects: 'ENG-184', assignedClasses: 'Class 10-C (CT), 10-A, 10-B', isClassTeacher: true, classTeacherOf: 'Class 10-C', isActive: true, phone: '+91 98334 56789', email: 'sroy@dpsdelhi.edu.in', joiningDate: '2020-07-10' },
  { id: '4', name: 'Ms. Priya Sharma', empId: 'TCH-2022-092', dept: 'Languages', qualification: 'M.A. Hindi, B.Ed.', subjects: 'HIN-002', assignedClasses: 'Class 9-A (CT), 8-B (CT)', isClassTeacher: true, classTeacherOf: 'Class 9-A', isActive: true, phone: '+91 98445 67890', email: 'psharma@dpsdelhi.edu.in', joiningDate: '2022-03-01' },
  { id: '5', name: 'Mr. Rajiv Singh', empId: 'TCH-2019-063', dept: 'Social Sciences', qualification: 'M.A. History, B.Ed.', subjects: 'SOC-087', assignedClasses: 'Class 9-B (CT), 10-A, 10-B', isClassTeacher: true, classTeacherOf: 'Class 9-B', isActive: true, phone: '+91 98556 78901', email: 'rsingh@dpsdelhi.edu.in', joiningDate: '2019-08-20' },
  { id: '6', name: 'Ms. Kavita Jain', empId: 'TCH-2017-042', dept: 'Mathematics', qualification: 'M.Sc. Maths, B.Ed.', subjects: 'MATH-041', assignedClasses: 'Class 9-C (CT), 8-A', isClassTeacher: true, classTeacherOf: 'Class 9-C', isActive: false, phone: '+91 98667 89012', email: 'kjain@dpsdelhi.edu.in', joiningDate: '2017-02-15' },
  { id: '7', name: 'Mr. Vikram Mehta', empId: 'TCH-2020-077', dept: 'Sciences', qualification: 'M.Sc. Chemistry, B.Ed.', subjects: 'CHM-088', assignedClasses: 'Class 10-B (CT)', isClassTeacher: true, classTeacherOf: 'Class 10-B', isActive: true, phone: '+91 98778 90123', email: 'vmehta@dpsdelhi.edu.in', joiningDate: '2020-09-01' },
  { id: '8', name: 'Ms. Poonam Iyer', empId: 'TCH-2015-031', dept: 'Primary', qualification: 'B.Ed., M.Ed.', subjects: 'GEN-001', assignedClasses: 'Class 6-A (CT)', isClassTeacher: true, classTeacherOf: 'Class 6-A', isActive: true, phone: '+91 98889 01234', email: 'piyer@dpsdelhi.edu.in', joiningDate: '2015-05-12' },
];

const INIT_NOTICES: NoticeItem[] = [
  { id: 1, title: 'CBSE Pre-Board Practical Schedule Released', audience: 'ALL', priority: 'IMPORTANT', date: '24 Sept 2026', expiresAt: '10 Oct 2026', author: 'Principal Office', channel: 'Portal + SMS + WhatsApp' },
  { id: 2, title: 'Parent-Teacher Meeting: Class 9 & 10 - 28 Sept', audience: 'PARENTS', priority: 'IMPORTANT', date: '22 Sept 2026', expiresAt: '28 Sept 2026', author: 'Academic Wing', channel: 'Portal + SMS + WhatsApp' },
  { id: 3, title: 'Staff Meeting: Academic Review & Syllabus Audit', audience: 'TEACHERS', priority: 'URGENT', date: '20 Sept 2026', expiresAt: '26 Sept 2026', author: 'Vice Principal', channel: 'Portal Only' },
  { id: 4, title: 'Unit Test 2 Timetable - All Classes (30 Sept - 4 Oct)', audience: 'ALL', priority: 'IMPORTANT', date: '18 Sept 2026', expiresAt: '4 Oct 2026', author: 'Exam Cell', channel: 'Portal + SMS + WhatsApp' },
  { id: 5, title: 'Library Book Return Deadline Extended to 10 Oct', audience: 'STUDENTS', priority: 'NORMAL', date: '15 Sept 2026', expiresAt: '10 Oct 2026', author: 'Chief Librarian', channel: 'Portal Only' },
];

const TAB_URL_SLUGS: Record<AdminWorkspaceTab, string> = {
  Staff: 'Faculty Directory',
  Students: 'Student Master Roster',
  ClassAllocation: 'Class Teacher Allocation',
  Sessions: 'Academic Sessions',
  Timetable: 'Master Timetable',
  Attendance: 'Daily Attendance Audit',
  Notices: 'Notice Broadcast Hub',
};

function mapAdminSlugToTab(slug?: string): AdminWorkspaceTab {
  if (!slug) return 'Staff';
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  if (decoded.includes('attend') || decoded.includes('audit')) return 'Attendance';
  if (decoded.includes('student') || decoded.includes('roster') || decoded.includes('admission')) return 'Students';
  if (decoded.includes('alloc') || decoded.includes('class teacher') || decoded.includes('mentor') || decoded.includes('section')) return 'ClassAllocation';
  if (decoded.includes('session') || decoded.includes('ay') || decoded.includes('year') || decoded.includes('term')) return 'Sessions';
  if (decoded.includes('timetable') || decoded.includes('schedule') || decoded.includes('proxy')) return 'Timetable';
  if (decoded.includes('notice') || decoded.includes('circular') || decoded.includes('broadcast')) return 'Notices';
  if (decoded.includes('staff') || decoded.includes('teacher') || decoded.includes('faculty')) return 'Staff';
  return 'Staff';
}

export default function AdminPortalPage({
  params,
  searchParams,
}: {
  params?: { slug?: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const initialSlug = params?.slug;
  // Theme & Active Workspace Tab
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tab, setTab] = useState<AdminWorkspaceTab>(() => mapAdminSlugToTab(initialSlug));
  const [classIdx, setClassIdx] = useState(0);
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (initialSlug) {
      setTab(mapAdminSlugToTab(initialSlug));
    } else if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 1 && pathParts[0] === 'admin') {
        const slugFromPath = pathParts[1];
        setTab(mapAdminSlugToTab(slugFromPath));
      }
    }
  }, [initialSlug]);

  // Load institutional database records
  useEffect(() => {
    getAcademicYears()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setSessions(
            res.data.map((y: any) => ({
              id: y.id,
              name: y.name,
              startDate: new Date(y.startDate).toISOString().split('T')[0],
              endDate: new Date(y.endDate).toISOString().split('T')[0],
              board: 'CBSE New Delhi',
              isCurrent: y.isCurrent,
              totalStudents: 1500,
              totalClasses: y._count?.classGrades || 12,
              status: y.isCurrent ? 'Active' : 'Upcoming',
            }))
          );
        }
      })
      .catch(() => {});

    getFacultyDirectory()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setStaff(res.data as any);
        }
      })
      .catch(() => {});

    getStudentsList()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setStudents(res.data as any);
        }
      })
      .catch(() => {});

    getBroadcastNotices()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setNotices(res.data as any);
        }
      })
      .catch(() => {});
  }, []);

  // Search & Global State
  const [search, setSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('All');

  // Core ERP Master States
  const [sessions, setSessions] = useState<AcademicSessionItem[]>(INIT_SESSIONS);
  const [classes, setClasses] = useState<ClassSectionItem[]>(INIT_CLASSES);
  const [staff, setStaff] = useState<StaffMember[]>(INIT_STAFF);
  const [students, setStudents] = useState<StudentItem[]>(INIT_STUDENTS);
  const [notices, setNotices] = useState<NoticeItem[]>(INIT_NOTICES);

  // Modals Visibility State & Selections
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAssignClassTeacherModal, setShowAssignClassTeacherModal] = useState(false);
  const [selectedStudentDossier, setSelectedStudentDossier] = useState<StudentItem | null>(null);
  const [targetClassForAssignment, setTargetClassForAssignment] = useState<ClassSectionItem | null>(null);

  // Credential & Password Management State
  interface TargetCredentialUser {
    id: string;
    name: string;
    identifier: string; // Email or Admission Number or Employee ID
    userType: 'TEACHER' | 'STUDENT' | 'STAFF' | 'PARENT';
    phone?: string;
    className?: string;
  }
  const [targetCredentialUser, setTargetCredentialUser] = useState<TargetCredentialUser | null>(null);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [genPassword, setGenPassword] = useState('');
  const [requirePwdChange, setRequirePwdChange] = useState(true);
  const [copiedCredential, setCopiedCredential] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Generate a friendly, secure temporary password
  const generateRandomPassword = (type: 'TEACHER' | 'STUDENT' | 'STAFF' | 'PARENT') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const prefix = type === 'TEACHER' ? 'DPS@Teach#' : type === 'STUDENT' ? 'DPS@Stud#' : 'DPS@Pass#';
    return `${prefix}${rand}`;
  };

  const openPasswordModal = (user: TargetCredentialUser) => {
    setTargetCredentialUser(user);
    setGenPassword(generateRandomPassword(user.userType));
    setRequirePwdChange(true);
    setShowCredentialModal(true);
    setCopiedCredential(false);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCredentialUser || !genPassword) return;
    setIsSavingPassword(true);
    try {
      const res = await adminResetUserPasswordAction({
        identifier: targetCredentialUser.identifier,
        userType: targetCredentialUser.userType,
        userName: targetCredentialUser.name,
        customPassword: genPassword,
        requirePasswordChangeOnLogin: requirePwdChange,
      });
      if (res.success) {
        showToast(`Password successfully generated & updated for ${targetCredentialUser.name}!`);
        setShowCredentialModal(false);
      } else {
        showToast(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const copyCredentialSlip = () => {
    if (!targetCredentialUser) return;
    const slip = `🏛️ DELHI PUBLIC SCHOOL - PORTAL LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${targetCredentialUser.name}
🏷️ Role: ${targetCredentialUser.userType}
🔑 Login ID: ${targetCredentialUser.identifier}
🔒 Temporary Password: ${genPassword}
🌐 Portal Link: ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Please change your password upon your first login.`;
    navigator.clipboard.writeText(slip);
    setCopiedCredential(true);
    showToast('Credential slip copied to clipboard!');
    setTimeout(() => setCopiedCredential(false), 3000);
  };

  // User-Friendly Filter Chips State
  const [attendanceFilter, setAttendanceFilter] = useState<'All' | 'Submitted' | 'Pending' | 'Senior' | 'Middle'>('All');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState<string>('All');
  const [noticeFilter, setNoticeFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger Friendly Toast Feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State: Add Teacher
  const [tName, setTName] = useState('');
  const [tEmpId, setTEmpId] = useState('');
  const [tDept, setTDept] = useState('Mathematics');
  const [tQual, setTQual] = useState('M.Sc., B.Ed.');
  const [tSubj, setTSubj] = useState('MATH-041');
  const [tClasses, setTClasses] = useState('Class 10-A, 9-B');
  const [tPhone, setTPhone] = useState('+91 98');
  const [tEmail, setTEmail] = useState('@dpsdelhi.edu.in');

  // Form State: Add Student
  const [sName, setSName] = useState('');
  const [sAdmNo, setSAdmNo] = useState(`DPS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [sRoll, setSRoll] = useState<number>(students.length + 1);
  const [sClassSec, setSClassSec] = useState('Class 10-A');
  const [sGender, setSGender] = useState<'M' | 'F'>('M');
  const [sDob, setSDob] = useState('2011-05-15');
  const [sBlood, setSBlood] = useState('B+');
  const [sParentName, setSParentName] = useState('');
  const [sParentPhone, setSParentPhone] = useState('+91 98');
  const [sParentEmail, setSParentEmail] = useState('');
  const [sAddress, setSAddress] = useState('New Delhi');

  // Form State: Add Academic Session
  const [sessName, setSessName] = useState('Academic Year 2027-28');
  const [sessStart, setSessStart] = useState('2027-04-01');
  const [sessEnd, setSessEnd] = useState('2028-03-31');
  const [sessBoard, setSessBoard] = useState('CBSE New Delhi');
  const [sessIsCurrent, setSessIsCurrent] = useState(false);

  // Form State: Add Class / Section
  const [cGrade, setCGrade] = useState('Class 11');
  const [cSection, setCSection] = useState('A');
  const [cRoom, setCRoom] = useState('Room 301');
  const [cCapacity, setCCapacity] = useState(45);
  const [cTeacher, setCTeacher] = useState(staff[0]?.name || '');

  // Form State: Assign Class Teacher
  const [assignedTeacherName, setAssignedTeacherName] = useState('');

  // Form State: Notice Broadcast
  const [nTitle, setNTitle] = useState('');
  const [nAud, setNAud] = useState<NoticeAudience>('ALL');
  const [nPri, setNPri] = useState<NoticePriority>('NORMAL');
  const [nChannel, setNChannel] = useState<'Portal + SMS + WhatsApp' | 'Portal Only'>('Portal + SMS + WhatsApp');
  const [nExp, setNExp] = useState('2026-10-15');
  const [nSaved, setNSaved] = useState(false);

  // Computed Metrics
  const subCount = classes.filter((c) => c.submitted).length;
  const totPresent = classes.reduce((a, c) => a + Math.round((c.attendance / 100) * c.students), 0);
  const totStudents = classes.reduce((a, c) => a + c.students, 0);
  const attRate = Math.round((totPresent / (totStudents || 1)) * 100);

  // Smart Search Auto-Suggestions
  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || q.length < 2) return null;

    const matchedStudents = students
      .filter((st) => st.name.toLowerCase().includes(q) || st.admNo.toLowerCase().includes(q) || st.classSec.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedStaff = staff
      .filter((s) => s.name.toLowerCase().includes(q) || s.dept.toLowerCase().includes(q) || s.empId.toLowerCase().includes(q) || s.subjects.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedClasses = classes
      .filter((c) => `${c.grade} ${c.section}`.toLowerCase().includes(q) || c.classTeacher.toLowerCase().includes(q))
      .slice(0, 3);

    return {
      students: matchedStudents,
      staff: matchedStaff,
      classes: matchedClasses,
      totalMatches: matchedStudents.length + matchedStaff.length + matchedClasses.length,
    };
  }, [search, students, staff, classes]);

  // Filtered Lists with Chip Filters & Search
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.dept.toLowerCase().includes(search.toLowerCase()) ||
        s.empId.toLowerCase().includes(search.toLowerCase()) ||
        s.subjects.toLowerCase().includes(search.toLowerCase());

      const matchDept =
        facultyDeptFilter === 'All'
          ? true
          : facultyDeptFilter === 'Mentors'
          ? s.isClassTeacher
          : s.dept.toLowerCase().includes(facultyDeptFilter.toLowerCase());

      return matchSearch && matchDept;
    });
  }, [staff, search, facultyDeptFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchSearch =
        st.name.toLowerCase().includes(search.toLowerCase()) ||
        st.admNo.toLowerCase().includes(search.toLowerCase()) ||
        st.parentPhone.includes(search);

      const matchClass =
        studentClassFilter === 'All'
          ? true
          : studentClassFilter === 'Senior'
          ? st.classSec.includes('10') || st.classSec.includes('9')
          : studentClassFilter === 'Middle'
          ? st.classSec.includes('8') || st.classSec.includes('7')
          : studentClassFilter === 'FeeDue'
          ? (st.feeStatus === 'Overdue' || st.feeStatus === 'Pending')
          : st.classSec === studentClassFilter;

      return matchSearch && matchClass;
    });
  }, [students, search, studentClassFilter]);

  const filteredAttendanceClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchSearch =
        `${c.grade} ${c.section}`.toLowerCase().includes(search.toLowerCase()) ||
        c.classTeacher.toLowerCase().includes(search.toLowerCase());

      if (attendanceFilter === 'Submitted') return matchSearch && c.submitted;
      if (attendanceFilter === 'Pending') return matchSearch && !c.submitted;
      if (attendanceFilter === 'Senior') return matchSearch && (c.grade.includes('10') || c.grade.includes('9'));
      if (attendanceFilter === 'Middle') return matchSearch && (c.grade.includes('8') || c.grade.includes('7'));
      return matchSearch;
    });
  }, [classes, search, attendanceFilter]);

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.audience.toLowerCase().includes(search.toLowerCase());
      if (noticeFilter === 'All') return matchSearch;
      return matchSearch && n.priority === noticeFilter;
    });
  }, [notices, search, noticeFilter]);

  // Handlers: Add Teacher (Connected to Server Action)
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return;
    const empId = tEmpId || `TCH-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newMember: StaffMember = {
      id: Date.now().toString(),
      name: tName,
      empId,
      dept: tDept,
      qualification: tQual,
      subjects: tSubj,
      assignedClasses: tClasses,
      isClassTeacher: false,
      isActive: true,
      phone: tPhone,
      email: tEmail,
      joiningDate: new Date().toISOString().split('T')[0],
    };
    setStaff([newMember, ...staff]);
    setShowAddTeacherModal(false);

    // Call server action for persistence
    const [firstName, ...rest] = tName.split(' ');
    createTeacherProfile({
      firstName: firstName || tName,
      lastName: rest.join(' ') || 'Faculty',
      email: tEmail.includes('@') ? tEmail : `${tEmail}@dpsdelhi.edu.in`,
      phone: tPhone,
      employeeId: empId,
      department: tDept,
      qualification: tQual,
      joiningDate: new Date().toISOString().split('T')[0],
    }).catch((err) => console.warn('Teacher creation sync error:', err));

    setTName('');
    setTEmpId('');
  };

  // Handlers: Toggle Teacher Active Status
  const handleToggleStaffStatus = async (staffId: string) => {
    const target = staff.find((s) => s.id === staffId);
    if (!target) return;
    const nextState = !target.isActive;
    setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, isActive: nextState } : s)));
    toggleTeacherActiveStatus(staffId, nextState).catch((err) => console.warn('Toggle status sync error:', err));
  };

  // Handlers: Add Student (Connected to Server Action)
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim()) return;
    const newStudent: StudentItem = {
      id: Date.now().toString(),
      name: sName,
      admNo: sAdmNo,
      rollNo: Number(sRoll),
      classSec: sClassSec,
      gender: sGender,
      dob: sDob,
      bloodGroup: sBlood,
      parentName: sParentName || 'Parent / Guardian',
      parentPhone: sParentPhone,
      parentEmail: sParentEmail,
      address: sAddress,
      attendanceRate: 100,
      feeStatus: 'Paid',
    };
    setStudents([newStudent, ...students]);
    setShowAddStudentModal(false);

    // Call server action for student admission
    const [firstName, ...rest] = sName.split(' ');
    // Default section or lookup
    const defaultSecId = '00000000-0000-0000-0000-000000000001';
    createStudentAdmission({
      firstName: firstName || sName,
      lastName: rest.join(' ') || 'Student',
      admissionNumber: sAdmNo,
      rollNumber: Number(sRoll),
      sectionId: defaultSecId,
      dateOfBirth: sDob,
      gender: sGender,
      bloodGroup: sBlood,
      address: sAddress,
      emergencyContact: sParentPhone,
      parentName: sParentName || 'Parent Guardian',
      parentPhone: sParentPhone,
      parentEmail: sParentEmail || undefined,
    }).catch((err) => console.warn('Student admission sync error:', err));

    setSName('');
    setSParentName('');
    setSAdmNo(`DPS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Handlers: Add Academic Session (Connected to Server Action)
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessName.trim()) return;
    let updatedSessions = [...sessions];
    if (sessIsCurrent) {
      updatedSessions = updatedSessions.map((s) => ({ ...s, isCurrent: false, status: 'Archived' as const }));
    }
    const newSess: AcademicSessionItem = {
      id: Date.now().toString(),
      name: sessName,
      startDate: sessStart,
      endDate: sessEnd,
      board: sessBoard,
      isCurrent: sessIsCurrent,
      totalStudents: 0,
      totalClasses: classes.length,
      status: sessIsCurrent ? 'Active' : 'Upcoming',
    };
    setSessions([newSess, ...updatedSessions]);
    setShowAddSessionModal(false);

    createAcademicYear({
      name: sessName,
      startDate: sessStart,
      endDate: sessEnd,
      isCurrent: sessIsCurrent,
    }).catch((err) => console.warn('Academic year sync error:', err));

    setSessName('');
  };

  // Handlers: Activate Academic Session
  const handleSetActiveSession = async (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        isCurrent: s.id === sessionId,
        status: s.id === sessionId ? 'Active' : 'Archived',
      }))
    );
    activateAcademicYear(sessionId).catch((err) => console.warn('Activate session sync error:', err));
  };

  // Handlers: Add Class / Section
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${cGrade.replace('Class ', '')}-${cSection}`;
    const newCls: ClassSectionItem = {
      id,
      grade: cGrade,
      section: cSection,
      students: 0,
      capacity: Number(cCapacity),
      attendance: 100,
      classTeacher: cTeacher,
      teacherEmpId: staff.find((s) => s.name === cTeacher)?.empId || 'TCH-000',
      room: cRoom,
      submitted: false,
    };
    setClasses([...classes, newCls]);
    setShowAddClassModal(false);
  };

  // Handlers: Assign / Change Class Teacher (Connected to Server Action)
  const handleAssignClassTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassForAssignment || !assignedTeacherName) return;

    const teacherObj = staff.find((s) => s.name === assignedTeacherName);

    // 1. Update Class record
    setClasses((prev) =>
      prev.map((c) =>
        c.id === targetClassForAssignment.id
          ? {
              ...c,
              classTeacher: assignedTeacherName,
              teacherEmpId: teacherObj?.empId || c.teacherEmpId,
            }
          : c
      )
    );

    // 2. Update Teacher Staff records
    setStaff((prev) =>
      prev.map((s) => {
        if (s.name === assignedTeacherName) {
          return {
            ...s,
            isClassTeacher: true,
            classTeacherOf: `${targetClassForAssignment.grade}-${targetClassForAssignment.section}`,
            assignedClasses: s.assignedClasses.includes(targetClassForAssignment.id)
              ? s.assignedClasses
              : `${targetClassForAssignment.grade}-${targetClassForAssignment.section} (CT), ${s.assignedClasses}`,
          };
        }
        return s;
      })
    );

    if (teacherObj?.id) {
      assignSectionClassTeacher(targetClassForAssignment.id, teacherObj.id).catch((err) =>
        console.warn('Class teacher allocation sync error:', err)
      );
    }

    setShowAssignClassTeacherModal(false);
    setTargetClassForAssignment(null);
  };

  // Handlers: Notice Broadcast (Connected to Server Action)
  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nTitle.trim()) return;
    const newNotice: NoticeItem = {
      id: Date.now(),
      title: nTitle,
      audience: nAud,
      priority: nPri,
      date: 'Today',
      expiresAt: nExp || 'No expiry',
      author: 'Principal Dr. Anandita Sen',
      channel: nChannel,
    };
    setNotices([newNotice, ...notices]);

    createBroadcastNotice({
      title: nTitle,
      content: nTitle,
      targetAudience: nAud as any,
      priority: nPri as any,
      channels: nChannel,
      expiresAt: nExp || undefined,
    }).catch((err) => console.warn('Broadcast notice sync error:', err));

    setNTitle('');
    setNSaved(true);
    setTimeout(() => setNSaved(false), 3000);
  };

  // Exporters
  const downloadStudentCSV = () => {
    const header = 'Adm No,Roll No,Name,Class & Sec,Gender,DOB,Blood Group,Parent Name,Parent Phone,Fee Status\n';
    const rows = students
      .map((s) => `${s.admNo},${s.rollNo},"${s.name}",${s.classSec},${s.gender},${s.dob},${s.bloodGroup},"${s.parentName}",${s.parentPhone},${s.feeStatus}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Master_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadStaffCSV = () => {
    const header = 'Emp ID,Name,Department,Qualification,Subjects,Assigned Classes,Class Teacher Of,Phone,Email\n';
    const rows = staff
      .map((s) => `${s.empId},"${s.name}",${s.dept},"${s.qualification}",${s.subjects},"${s.assignedClasses}","${s.classTeacherOf || 'None'}",${s.phone},${s.email}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Faculty_Staff_Master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const go = (t: AdminWorkspaceTab, customSlug?: string) => {
    setTab(t);
    const targetSlug = customSlug || TAB_URL_SLUGS[t];
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/admin/${encodeURIComponent(targetSlug)}`);
    }
    document.getElementById('admin-workspace')?.scrollIntoView({ behavior: 'smooth' });
  };

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
        {/* Tier 1: Main Institution Branding & Quick Access */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-[64px] flex items-center justify-between">
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
                  CBSE AFFILIATED • CENTRAL ADMIN COMMAND PORTAL
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Global Quick Search Pill with Autocomplete Popover */}
            <div className="relative">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs w-44 md:w-64 focus-within:border-[#FF7555] transition-all shadow-2xs ${
                  isDarkMode ? 'bg-[#1E293B] border-[#334155] text-slate-300' : 'bg-white border-[#D9E2EC] text-[#6F7D8D]'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#6F7D8D]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff, student, class..."
                  className={`bg-transparent border-none outline-none w-full text-xs placeholder:text-[#8FA0B2] ${
                    isDarkMode ? 'text-white' : 'text-[#132033]'
                  }`}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Instant Search Suggestions Popover */}
              {searchSuggestions && searchSuggestions.totalMatches > 0 && (
                <div
                  className={`absolute top-full right-0 mt-2 w-80 rounded-[20px] border p-3.5 shadow-2xl z-50 animate-fadeIn ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2 px-1 border-b pb-1">
                    <span>Results for &quot;{search}&quot;</span>
                    <button onClick={() => setSearch('')} className="hover:text-red-500">Clear</button>
                  </div>

                  {/* Students */}
                  {searchSuggestions.students.length > 0 && (
                    <div className="mb-2">
                      <span className="text-[10px] font-extrabold text-[#FF7555] block px-1 mb-1">Students</span>
                      {searchSuggestions.students.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setSelectedStudentDossier(st);
                            setSearch('');
                          }}
                          className="w-full text-left p-1.5 rounded-xl hover:bg-[#FFF2EE] dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-bold">{st.name} ({st.classSec})</span>
                          <span className="text-[10px] text-gray-400">{st.admNo}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Staff */}
                  {searchSuggestions.staff.length > 0 && (
                    <div className="mb-2">
                      <span className="text-[10px] font-extrabold text-blue-500 block px-1 mb-1">Faculty</span>
                      {searchSuggestions.staff.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            go('Staff');
                            setSearch(s.name);
                          }}
                          className="w-full text-left p-1.5 rounded-xl hover:bg-[#FFF2EE] dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-bold">{s.name}</span>
                          <span className="text-[10px] text-gray-400">{s.dept}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Classes */}
                  {searchSuggestions.classes.length > 0 && (
                    <div>
                      <span className="text-[10px] font-extrabold text-[#26C281] block px-1 mb-1">Classes</span>
                      {searchSuggestions.classes.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            go('Attendance');
                            setSearch(c.grade);
                          }}
                          className="w-full text-left p-1.5 rounded-xl hover:bg-[#FFF2EE] dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-bold">{c.grade} - {c.section}</span>
                          <span className="text-[10px] text-gray-400">Mentor: {c.classTeacher}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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

            {/* Notification Bell */}
            <button
              aria-label="Notifications"
              className={`relative p-2 rounded-full transition-colors ${
                isDarkMode ? 'text-slate-300 hover:bg-[#1E293B]' : 'text-[#6F7D8D] hover:text-[#132033] hover:bg-[#F4F8FA]'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF7555] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                5
              </span>
            </button>

            {/* Admin Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-[#FFF2EE] dark:bg-slate-800 border border-[#FFD5C8] dark:border-slate-700 shrink-0 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#FF7555]" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                  Dr. Anandita Sen
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  Principal & School Admin
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

        {/* Tier 2: Category Navigation with Hierarchical Dropdowns (Academics, Administrative, Important Links, Student Services, Quick Links) */}
        <div className={`border-t transition-colors duration-300 relative ${isDarkMode ? 'border-[#1E293B] bg-[#0E1726]' : 'border-[#F0F4F8] bg-white'}`}>
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-[46px] flex items-center justify-between text-xs font-medium">
            {/* Left: Dropdown Categories */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* 1. ACADEMICS DROPDOWN */}
              <div
                className="relative"
                onMouseEnter={() => setActiveNavDropdown('academics')}
                onMouseLeave={() => setActiveNavDropdown(null)}
              >
                <button
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'academics' ? null : 'academics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeNavDropdown === 'academics' || tab === 'Attendance' || tab === 'Timetable' || tab === 'Sessions'
                      ? 'text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-800'
                      : isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-[#132033] hover:text-[#FF7555] hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#FF7555]" />
                  <span>Academics</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeNavDropdown === 'academics' ? 'rotate-180 text-[#FF7555]' : 'text-gray-400'}`} />
                </button>

                {activeNavDropdown === 'academics' && (
                  <div className={`absolute top-full left-0 mt-1 w-72 rounded-[18px] border p-2 shadow-2xl z-50 animate-fadeIn ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
                  }`}>
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                      Academic Operations & Curricula
                    </div>
                    <button
                      onClick={() => { go('Attendance'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-[#26C281]" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Daily Attendance Audit</span>
                        <span className="text-[10px] text-gray-500">Live morning roll call submission tracker</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { go('Timetable'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Master Timetable Grid</span>
                        <span className="text-[10px] text-gray-500">Weekly schedule & period allocations</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { go('Sessions'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Academic Sessions & Terms</span>
                        <span className="text-[10px] text-gray-500">Term management & active session switch</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { go('Attendance', 'CBSE Rapid Marks'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-[#FF7555]" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">CBSE Examination Grading</span>
                        <span className="text-[10px] text-gray-500">10-point scale grading & marks publishing</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. ADMINISTRATIVE DROPDOWN */}
              <div
                className="relative"
                onMouseEnter={() => setActiveNavDropdown('admin')}
                onMouseLeave={() => setActiveNavDropdown(null)}
              >
                <button
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'admin' ? null : 'admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeNavDropdown === 'admin' || tab === 'Staff' || tab === 'ClassAllocation' || tab === 'Students'
                      ? 'text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-800'
                      : isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-[#132033] hover:text-[#FF7555] hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1F51FF]" />
                  <span>Administrative</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeNavDropdown === 'admin' ? 'rotate-180 text-[#FF7555]' : 'text-gray-400'}`} />
                </button>

                {activeNavDropdown === 'admin' && (
                  <div className={`absolute top-full left-0 mt-1 w-72 rounded-[18px] border p-2 shadow-2xl z-50 animate-fadeIn ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
                  }`}>
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                      Faculty, Mentors & Governance
                    </div>
                    <button
                      onClick={() => { go('Staff'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-[#1F51FF]" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Faculty & Staff Directory</span>
                        <span className="text-[10px] text-gray-500">Teacher onboarding & active status control</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { go('ClassAllocation'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Class Teacher Allocation</span>
                        <span className="text-[10px] text-gray-500">Assign section mentors & room capacities</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { go('Students'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-purple-500" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Student Master Roster</span>
                        <span className="text-[10px] text-gray-500">Admissions, roll numbers & contacts</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setShowAddTeacherModal(true); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-[#FF7555]" />
                      <div>
                        <span className="font-bold text-xs block text-[#FF7555]">+ Onboard New Teacher</span>
                        <span className="text-[10px] text-gray-500">Create employee ID & teacher login</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. IMPORTANT LINKS DROPDOWN */}
              <div
                className="relative"
                onMouseEnter={() => setActiveNavDropdown('links')}
                onMouseLeave={() => setActiveNavDropdown(null)}
              >
                <button
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'links' ? null : 'links')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeNavDropdown === 'links' || tab === 'Notices'
                      ? 'text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-800'
                      : isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-[#132033] hover:text-[#FF7555] hover:bg-slate-50'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                  <span>Important Links</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeNavDropdown === 'links' ? 'rotate-180 text-[#FF7555]' : 'text-gray-400'}`} />
                </button>

                {activeNavDropdown === 'links' && (
                  <div className={`absolute top-full left-0 mt-1 w-72 rounded-[18px] border p-2 shadow-2xl z-50 animate-fadeIn ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
                  }`}>
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                      Institutional Links & Portals
                    </div>
                    <button
                      onClick={() => { go('Notices'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Megaphone className="w-4 h-4 text-[#FF7555]" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Notice & Broadcast Hub</span>
                        <span className="text-[10px] text-gray-500">Omnichannel circulars (SMS + WhatsApp)</span>
                      </div>
                    </button>
                    <a
                      href="https://cbse.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">CBSE Affiliation Portal ↗</span>
                        <span className="text-[10px] text-gray-500">Affiliation No: 2130048 (Delhi Region)</span>
                      </div>
                    </a>
                    <button
                      onClick={() => { go('Sessions'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Annual Academic Calendar</span>
                        <span className="text-[10px] text-gray-500">Term 1 & Term 2 exam milestones</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. STUDENT SERVICES DROPDOWN */}
              <div
                className="relative"
                onMouseEnter={() => setActiveNavDropdown('services')}
                onMouseLeave={() => setActiveNavDropdown(null)}
              >
                <button
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'services' ? null : 'services')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeNavDropdown === 'services'
                      ? 'text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-800'
                      : isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-[#132033] hover:text-[#FF7555] hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Student Services</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeNavDropdown === 'services' ? 'rotate-180 text-[#FF7555]' : 'text-gray-400'}`} />
                </button>

                {activeNavDropdown === 'services' && (
                  <div className={`absolute top-full left-0 mt-1 w-72 rounded-[18px] border p-2 shadow-2xl z-50 animate-fadeIn ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
                  }`}>
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                      Student Admissions & Lifecycle
                    </div>
                    <button
                      onClick={() => { setShowAddStudentModal(true); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-[#FF7555]" />
                      <div>
                        <span className="font-bold text-xs block text-[#FF7555]">+ New Student Admission</span>
                        <span className="text-[10px] text-gray-500">Roll number, blood group & parent info</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { go('Students'); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">360° Student Dossier</span>
                        <span className="text-[10px] text-gray-500">Inspect attendance, grades & parent links</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { downloadStudentCSV(); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Export Student Roster (CSV)</span>
                        <span className="text-[10px] text-gray-500">Download complete CBSE batch CSV</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 5. QUICK LINKS DROPDOWN */}
              <div
                className="relative"
                onMouseEnter={() => setActiveNavDropdown('quick')}
                onMouseLeave={() => setActiveNavDropdown(null)}
              >
                <button
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'quick' ? null : 'quick')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeNavDropdown === 'quick'
                      ? 'text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-800'
                      : isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-[#132033] hover:text-[#FF7555] hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Quick Links</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeNavDropdown === 'quick' ? 'rotate-180 text-[#FF7555]' : 'text-gray-400'}`} />
                </button>

                {activeNavDropdown === 'quick' && (
                  <div className={`absolute top-full left-0 mt-1 w-72 rounded-[18px] border p-2 shadow-2xl z-50 animate-fadeIn ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
                  }`}>
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                      Quick Master Exports & Actions
                    </div>
                    <button
                      onClick={() => { downloadStaffCSV(); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="font-bold text-xs block group-hover:text-[#FF7555]">Download Staff Directory CSV</span>
                        <span className="text-[10px] text-gray-500">Employee IDs, subjects & contacts</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setShowAddClassModal(true); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#FF7555]" />
                      <div>
                        <span className="font-bold text-xs block text-[#FF7555]">+ Add New Section / Class</span>
                        <span className="text-[10px] text-gray-500">Configure classroom & intake capacity</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setShowAddSessionModal(true); setActiveNavDropdown(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#FFF2EE] dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="font-bold text-xs block text-emerald-600 dark:text-emerald-400">+ New Academic Session</span>
                        <span className="text-[10px] text-gray-500">Setup next school academic year</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick Cross-Portal Switcher Links */}
            <div className="flex items-center gap-3 shrink-0 pl-3">
              <Link
                href="/teacher"
                className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#6F7D8D] hover:text-[#FF7555] transition-colors"
              >
                <span>Teacher View</span>
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
      {/* MAIN CONTAINER                                                       */}
      {/* ==================================================================== */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 py-6 space-y-8">
        {/* ================================================================== */}
        {/* BREADCRUMB & CONTEXT BANNER                                         */}
        {/* ================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <button
              onClick={() => {
                setTab('Attendance');
                document.getElementById('admin-overview')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[#6F7D8D] hover:text-[#FF7555] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Admin Portal</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400">
              {tab === 'Attendance' || tab === 'Timetable' || tab === 'Sessions'
                ? 'Academics'
                : tab === 'Staff' || tab === 'ClassAllocation' || tab === 'Students'
                ? 'Administrative'
                : 'Operations'}
            </span>
            <span className="text-gray-400">/</span>
            <span className="font-extrabold text-[#FF7555]">
              {tab === 'Staff'
                ? 'Faculty & Staff Directory'
                : tab === 'Students'
                ? 'Student Master Roster'
                : tab === 'ClassAllocation'
                ? 'Class Teacher Allocation'
                : tab === 'Sessions'
                ? 'Academic Sessions & Terms'
                : tab === 'Attendance'
                ? 'Daily Attendance Audit'
                : 'Notice Broadcast Hub'}
            </span>
          </div>

          {/* Quick Tab Jump Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 mr-1 hidden sm:inline">Jump to:</span>
            {[
              { id: 'Attendance' as const, label: '📋 Attendance' },
              { id: 'Students' as const, label: '👥 Students' },
              { id: 'Staff' as const, label: '🎓 Faculty' },
              { id: 'ClassAllocation' as const, label: '🏫 Mentors' },
              { id: 'Notices' as const, label: '📢 Notices' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                  tab === item.id
                    ? 'bg-[#FF7555] text-white shadow-xs'
                    : isDarkMode
                    ? 'bg-[#1E293B] text-slate-300 hover:text-white'
                    : 'bg-white border border-[#D9E2EC] text-[#6F7D8D] hover:text-[#132033]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================================================================== */}
        {/* EXECUTIVE OVERVIEW & HIGHLIGHTS                                    */}
        {/* ================================================================== */}
        <section id="admin-overview" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Identity Card */}
            <div
              className={`lg:col-span-6 rounded-[22px] border p-6 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex items-center justify-between gap-5 min-h-[128px] ${
                isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
              }`}
            >
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-[68px] h-[68px] rounded-[16px] bg-[#FFF2EE] border border-[#FFD5C8] shrink-0 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[#FF7555]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold text-[#FF6F50] leading-tight truncate">
                      Dr. Anandita Sen
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] border border-blue-100">
                      Active AY 2026-27
                    </span>
                  </div>
                  <p className={`text-xs mt-1.5 font-medium truncate ${isDarkMode ? 'text-slate-300' : 'text-[#132033]'}`}>
                    Emp ID: <span className="font-bold">ADMIN-2019-001</span> | Role:{' '}
                    <span className="font-bold">School Principal</span> | Session:{' '}
                    <span className="font-bold text-[#FF7555]">2026-27</span>
                  </p>
                  <p className="text-xs text-[#6F7D8D] truncate mt-1">
                    Senior Wing Administration | CBSE Affiliation No: 2130048
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-3.5 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Student
                </button>
                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      : 'bg-[#FFF2EE] text-[#FF6F50] border-[#FFE3DB] hover:bg-[#FFE3DB]'
                  }`}
                >
                  Add Teacher
                </button>
              </div>
            </div>

            {/* Right 4 Stat Cards */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { Icon: Users, val: `${totStudents}`, lbl: 'Total Students', d: 'M50 0H20C20 18 32 30 50 30V0Z', c: '#FDCB6E', o: '0.45', action: () => go('Students') },
                { Icon: CheckCircle2, val: `${attRate}%`, lbl: 'Daily Attendance', d: 'M50 0H18C18 20 30 32 50 32V0Z', c: '#FFA07A', o: '0.4', action: () => go('Attendance') },
                { Icon: GraduationCap, val: `${staff.length}`, lbl: 'Teaching Faculty', d: 'M50 0H22C22 18 32 28 50 28V0Z', c: '#FF8A65', o: '0.5', action: () => go('Staff') },
                { Icon: Layers, val: `${classes.length}`, lbl: 'Class Sections', d: 'M50 0H15C15 22 28 35 50 35V0Z', c: '#35C1E8', o: '0.85', action: () => go('ClassAllocation') },
              ].map(({ Icon, val, lbl, d, c, o, action }, i) => (
                <button
                  key={i}
                  onClick={action}
                  className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px] text-left hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <svg className="absolute top-0 right-0 w-14 h-14 pointer-events-none" viewBox="0 0 50 50" fill="none">
                    <path d={d} fill={c} fillOpacity={o} />
                  </svg>
                  <Icon className="w-5 h-5 text-white/95" />
                  <div>
                    <span className="text-3xl font-black block leading-none tracking-tight">{val}</span>
                    <span className="text-xs font-semibold text-white/95 mt-1.5 block">{lbl}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Spotlight & Ops Donut Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div
              className={`lg:col-span-7 rounded-[22px] border p-6 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex flex-col justify-between relative overflow-hidden min-h-[280px] ${
                isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
              }`}
            >
              <div
                className={`w-full h-full rounded-[16px] p-6 flex flex-col justify-between border ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#17253B] via-[#1A2C46] to-[#1E3250] border-[#2A3E5C]'
                    : 'bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF9] to-[#FFF6ED] border-[#F6E7D2]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-[#FF7555] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    ACADEMIC YEAR 2026-27 • CENTRAL ADMIN DESK
                  </span>
                  <button
                    onClick={() => setShowAddSessionModal(true)}
                    className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 hover:bg-amber-100 cursor-pointer"
                  >
                    + New Session
                  </button>
                </div>

                <div className="my-3">
                  <div className="flex items-center gap-5">
                    <div className="flex items-baseline">
                      <span className="text-4xl md:text-5xl font-black text-[#D4AF37] leading-none">
                        {subCount}
                      </span>
                      <span className="text-2xl font-bold text-[#D4AF37]">/{classes.length}</span>
                    </div>
                    <div>
                      <h3 className={`text-base md:text-lg font-extrabold leading-tight ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        SECTIONS SUBMITTED MORNING ATTENDANCE
                      </h3>
                      <p className="text-xs text-[#6F7D8D] font-medium leading-relaxed mt-0.5">
                        {classes.length - subCount} section(s) pending register lock. Institutional attendance rate:{' '}
                        <strong className="text-[#26C281]">{attRate}%</strong> across all wings today.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F6E7D2]/80 dark:border-slate-700/80 text-xs text-[#6F7D8D] font-medium flex flex-wrap items-center justify-between gap-2">
                  <span>Term 1 Unit Test 2: 30 Sept - 4 Oct 2026. Fee Q2 due: 5 Oct 2026.</span>
                  <button
                    onClick={() => go('Notices')}
                    className="text-[#FF7555] font-bold hover:underline whitespace-nowrap cursor-pointer"
                  >
                    Publish School Broadcast →
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* Attendance Donut */}
                <div
                  className={`rounded-[22px] border p-5 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex flex-col justify-between ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-4 h-4 text-[#FF7555]" />
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>Attendance</span>
                    </div>
                    <span className="font-extrabold text-[#26C281] text-sm">{attRate}%</span>
                  </div>
                  <div className="flex items-center justify-center my-1">
                    <div className="relative w-[96px] h-[96px]">
                      <svg className="w-[96px] h-[96px] -rotate-90">
                        <circle cx="48" cy="48" r="38" stroke={isDarkMode ? '#1E293B' : '#F7EEEE'} strokeWidth="9" fill="transparent" />
                        <circle
                          cx="48"
                          cy="48"
                          r="38"
                          stroke="#26C281"
                          strokeWidth="9"
                          strokeDasharray="238.7"
                          strokeDashoffset={238.7 - (238.7 * attRate) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        {totPresent}/{totStudents}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-[#26C281] font-bold">{totStudents - totPresent} Absent Today</span>
                  </div>
                </div>

                {/* Staff Strength Donut */}
                <div
                  className={`rounded-[22px] border p-5 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex flex-col justify-between ${
                    isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>Faculty</span>
                    </div>
                    <span className="font-extrabold text-blue-600 text-sm">{staff.filter((s) => s.isActive).length}/{staff.length}</span>
                  </div>
                  <div className="flex items-center justify-center my-1">
                    <div className="relative w-[96px] h-[96px]">
                      <svg className="w-[96px] h-[96px] -rotate-90">
                        <circle cx="48" cy="48" r="38" stroke={isDarkMode ? '#1E293B' : '#FDF6ED'} strokeWidth="9" fill="transparent" />
                        <circle
                          cx="48"
                          cy="48"
                          r="38"
                          stroke="#35C1E8"
                          strokeWidth="9"
                          strokeDasharray="238.7"
                          strokeDashoffset={238.7 - (238.7 * (staff.filter((s) => s.isActive).length / staff.length)) * 100 / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        {staff.length} Staff
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-[#8FA0B2] font-medium">
                      {staff.filter((s) => s.isClassTeacher).length} Mentors Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Alert Strip */}
              <div
                className={`rounded-[22px] border px-5 py-3.5 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#132033] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-[#FF7555]" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>Pending Register:</span>
                    <span className="text-xs font-bold text-[#FF7555]">2 Classes Not Submitted</span>
                    <span className="text-[10px] font-semibold text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      8-A & 9-C
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => go('Attendance')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FF7555] text-white hover:bg-[#e5643d] transition-all cursor-pointer shrink-0"
                >
                  Audit Attendance
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* OPERATIONAL WORKSPACE (All Core Features with Filter Chips)         */}
        {/* ================================================================== */}
        <section id="admin-workspace" className="pt-2">
          <div
            className={`rounded-[24px] border p-6 sm:p-8 shadow-[0_2px_16px_rgba(19,32,51,0.03)] ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B]' : 'bg-white border-[#EBF0F5]'
            }`}
          >
            {/* Workspace Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                  Administrative Workspace & Control Center
                </h3>
                <p className="text-xs text-[#6F7D8D]">
                  Central operational data source for Teachers, Students, and Institutional Records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Student
                </button>
                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Add Teacher
                </button>
                <button
                  onClick={() => setShowAddSessionModal(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#26C281] hover:bg-[#20a76f] flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Session
                </button>
                <button
                  onClick={() => setShowAddClassModal(true)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC] text-[#132033]'
                  }`}
                >
                  + Add Section
                </button>
              </div>
            </div>

            {/* Modern Tab Switcher */}
            <div className="flex items-center gap-4 md:gap-6 border-b border-[#F0F4F8] dark:border-slate-800 overflow-x-auto text-xs pb-1 mb-6">
              {[
                { id: 'Attendance' as const, label: 'Daily Attendance Audit', count: classes.length },
                { id: 'Students' as const, label: 'Student Master Roster', count: students.length },
                { id: 'Staff' as const, label: 'Faculty Directory', count: staff.length },
                { id: 'ClassAllocation' as const, label: 'Class Teacher Allocation', count: classes.length },
                { id: 'Sessions' as const, label: 'Sessions & Terms', count: sessions.length },
                { id: 'Notices' as const, label: 'Broadcast Hub', count: notices.length },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`py-2.5 px-2 font-bold whitespace-nowrap transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-1.5 ${
                    tab === t.id
                      ? 'border-[#FF7555] text-[#FF7555]'
                      : isDarkMode
                      ? 'border-transparent text-slate-300 hover:text-[#FF7555]'
                      : 'border-transparent text-[#132033] hover:text-[#FF7555]'
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      tab === t.id
                        ? 'bg-[#FFF2EE] dark:bg-slate-800 text-[#FF7555]'
                        : 'bg-slate-100 dark:bg-slate-800 text-gray-400'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ========================================================== */}
            {/* TAB 1: DAILY ATTENDANCE AUDIT (With Filter Chips)          */}
            {/* ========================================================== */}
            {tab === 'Attendance' && (
              <div className="space-y-4">
                {/* Metric Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'}`}>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Registered</span>
                    <span className="text-xl font-black text-[#132033] dark:text-white">{totStudents}</span>
                  </div>
                  <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'}`}>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Present Today</span>
                    <span className="text-xl font-black text-[#26C281]">{totPresent}</span>
                  </div>
                  <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'}`}>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Absent Today</span>
                    <span className="text-xl font-black text-red-500">{totStudents - totPresent}</span>
                  </div>
                  <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'}`}>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Overall Rate</span>
                    <span className="text-xl font-black text-[#FF7555]">{attRate}%</span>
                  </div>
                </div>

                {/* Filter Chips Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-400 mr-1">Filter:</span>
                    {[
                      { id: 'All', label: `All Sections (${classes.length})` },
                      { id: 'Submitted', label: `✅ Submitted (${classes.filter((c) => c.submitted).length})` },
                      { id: 'Pending', label: `⏳ Pending (${classes.filter((c) => !c.submitted).length})` },
                      { id: 'Senior', label: 'Senior Wing (9-10)' },
                      { id: 'Middle', label: 'Middle Wing (6-8)' },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() => setAttendanceFilter(chip.id as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          attendanceFilter === chip.id
                            ? 'bg-[#FF7555] text-white shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:text-white'
                            : 'bg-slate-100 text-[#6F7D8D] hover:bg-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs text-[#6F7D8D] font-medium">
                    Showing {filteredAttendanceClasses.length} of {classes.length} classes
                  </div>
                </div>

                {/* Table */}
                <div className={`rounded-[20px] border overflow-hidden text-xs ${isDarkMode ? 'border-[#1E293B]' : 'border-[#EBF0F5]'}`}>
                  <div
                    className={`py-3 px-5 grid grid-cols-12 font-bold uppercase tracking-wider text-[11px] ${
                      isDarkMode ? 'bg-[#1E293B] text-slate-300' : 'bg-[#F8FAFC] text-[#6F7D8D]'
                    }`}
                  >
                    <div className="col-span-3">Class & Section</div>
                    <div className="col-span-3">Class Mentor</div>
                    <div className="col-span-2 text-center">Enrolled</div>
                    <div className="col-span-2 text-center">Attendance %</div>
                    <div className="col-span-2 text-right">Register Status</div>
                  </div>

                  {filteredAttendanceClasses.map((c) => (
                    <div
                      key={c.id}
                      className={`py-3.5 px-5 grid grid-cols-12 items-center border-t transition-colors ${
                        isDarkMode ? 'border-[#1E293B] hover:bg-slate-800/40' : 'border-[#F1F5F9] hover:bg-[#FAFCFE]'
                      }`}
                    >
                      <div className="col-span-3 font-bold text-[#FF7555]">{c.grade} - Section {c.section}</div>
                      <div className="col-span-3 font-semibold">{c.classTeacher}</div>
                      <div className="col-span-2 text-center font-bold">{c.students}</div>
                      <div className="col-span-2 text-center font-bold text-[#26C281]">{c.attendance}%</div>
                      <div className="col-span-2 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.submitted
                              ? 'bg-emerald-50 text-[#26C281] border border-emerald-100'
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}
                        >
                          {c.submitted ? 'Submitted' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 2: STUDENT MASTER ROSTER (With Filter Chips)           */}
            {/* ========================================================== */}
            {tab === 'Students' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Filter Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-400 mr-1">Class Filter:</span>
                    {[
                      { id: 'All', label: `All (${students.length})` },
                      { id: 'Senior', label: 'Class 9-10' },
                      { id: 'Middle', label: 'Class 7-8' },
                      { id: 'Class 10-A', label: '10-A' },
                      { id: 'FeeDue', label: '⚠️ Fee Due' },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() => setStudentClassFilter(chip.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          studentClassFilter === chip.id
                            ? 'bg-[#FF7555] text-white shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:text-white'
                            : 'bg-slate-100 text-[#6F7D8D] hover:bg-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadStudentCSV}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Student Master
                    </button>
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      + New Student Admission
                    </button>
                  </div>
                </div>

                <div className={`rounded-[20px] border overflow-hidden text-xs ${isDarkMode ? 'border-[#1E293B]' : 'border-[#EBF0F5]'}`}>
                  <div
                    className={`py-3 px-5 grid grid-cols-12 font-bold uppercase tracking-wider text-[11px] ${
                      isDarkMode ? 'bg-[#1E293B] text-slate-300' : 'bg-[#F8FAFC] text-[#6F7D8D]'
                    }`}
                  >
                    <div className="col-span-1">Roll</div>
                    <div className="col-span-3">Student Name & ID</div>
                    <div className="col-span-2">Class & Section</div>
                    <div className="col-span-3">Parent / Guardian & Phone</div>
                    <div className="col-span-1 text-center">Attendance</div>
                    <div className="col-span-2 text-right">Credentials & Dossier</div>
                  </div>

                  {filteredStudents.map((st) => (
                    <div
                      key={st.id}
                      className={`py-3 px-5 grid grid-cols-12 items-center border-t transition-colors ${
                        isDarkMode ? 'border-[#1E293B] hover:bg-slate-800/40' : 'border-[#F1F5F9] hover:bg-[#FAFCFE]'
                      }`}
                    >
                      <div className={`col-span-1 font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                        {st.rollNo}
                      </div>
                      <div className="col-span-3">
                        <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                          {st.name}
                        </span>
                        <span className="text-[11px] text-[#8FA0B2]">{st.admNo} • Blood: {st.bloodGroup}</span>
                      </div>
                      <div className="col-span-2 font-bold text-[#FF7555]">
                        {st.classSec}
                      </div>
                      <div className="col-span-3">
                        <span className="block font-medium">{st.parentName}</span>
                        <span className="text-[11px] text-gray-500">{st.parentPhone}</span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span
                          className={`font-bold ${
                            st.attendanceRate < 75 ? 'text-red-500' : 'text-[#26C281]'
                          }`}
                        >
                          {st.attendanceRate}%
                        </span>
                      </div>
                      <div className="col-span-2 text-right flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            openPasswordModal({
                              id: st.id,
                              name: st.name,
                              identifier: st.admNo,
                              userType: 'STUDENT',
                              phone: st.parentPhone,
                              className: st.classSec,
                            })
                          }
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Generate or Reset Student Password"
                        >
                          <Key className="w-3 h-3 text-amber-600" />
                          <span>Password</span>
                        </button>
                        <button
                          onClick={() => setSelectedStudentDossier(st)}
                          className="p-1.5 rounded-lg text-[#FF7555] hover:bg-[#FFF2EE] dark:hover:bg-slate-800 cursor-pointer"
                          title="View Full Student Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 3: FACULTY DIRECTORY (With Filter Chips)                */}
            {/* ========================================================== */}
            {tab === 'Staff' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Department Filter Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-400 mr-1">Department:</span>
                    {[
                      { id: 'All', label: `All (${staff.length})` },
                      { id: 'Mathematics', label: 'Mathematics' },
                      { id: 'Sciences', label: 'Sciences' },
                      { id: 'Languages', label: 'Languages' },
                      { id: 'Social Sciences', label: 'Social Sciences' },
                      { id: 'Mentors', label: 'Class Mentors' },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() => setFacultyDeptFilter(chip.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          facultyDeptFilter === chip.id
                            ? 'bg-[#FF7555] text-white shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:text-white'
                            : 'bg-slate-100 text-[#6F7D8D] hover:bg-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadStaffCSV}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Faculty CSV
                    </button>
                    <button
                      onClick={() => setShowAddTeacherModal(true)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      + Add Faculty Member
                    </button>
                  </div>
                </div>

                <div className={`rounded-[20px] border overflow-hidden text-xs ${isDarkMode ? 'border-[#1E293B]' : 'border-[#EBF0F5]'}`}>
                  <div
                    className={`py-3 px-5 grid grid-cols-12 font-bold uppercase tracking-wider text-[11px] ${
                      isDarkMode ? 'bg-[#1E293B] text-slate-300' : 'bg-[#F8FAFC] text-[#6F7D8D]'
                    }`}
                  >
                    <div className="col-span-3">Faculty Name & ID</div>
                    <div className="col-span-2">Department</div>
                    <div className="col-span-2">Subjects & Qualification</div>
                    <div className="col-span-2">Class Mentorship & Classes</div>
                    <div className="col-span-3 text-right">Credentials & Actions</div>
                  </div>

                  {filteredStaff.map((member) => (
                    <div
                      key={member.id}
                      className={`py-3.5 px-5 grid grid-cols-12 items-center border-t transition-colors ${
                        isDarkMode ? 'border-[#1E293B] hover:bg-slate-800/40' : 'border-[#F1F5F9] hover:bg-[#FAFCFE]'
                      }`}
                    >
                      <div className="col-span-3">
                        <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                          {member.name}
                        </span>
                        <span className="text-[11px] text-[#8FA0B2]">{member.empId} • {member.phone}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">{member.dept}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-bold text-[#FF7555] block">{member.subjects}</span>
                        <span className="text-[11px] text-gray-500">{member.qualification}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-xs block truncate">{member.assignedClasses}</span>
                        {member.isClassTeacher && (
                          <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-[#FFF2EE] dark:bg-slate-700 text-[#FF7555] font-bold text-[10px]">
                            Mentor: {member.classTeacherOf || 'Assigned'}
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            openPasswordModal({
                              id: member.id,
                              name: member.name,
                              identifier: member.email || `${member.empId.toLowerCase()}@dpsdelhi.edu.in`,
                              userType: 'TEACHER',
                              phone: member.phone,
                            })
                          }
                          className="px-2.5 py-1 rounded-full text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Generate or Reset Teacher Password"
                        >
                          <Key className="w-3 h-3 text-amber-600" />
                          <span>Password</span>
                        </button>
                        <button
                          onClick={() => {
                            setTargetClassForAssignment(classes[0]);
                            setAssignedTeacherName(member.name);
                            setShowAssignClassTeacherModal(true);
                          }}
                          className="text-[#FF7555] font-bold text-[11px] hover:underline cursor-pointer"
                        >
                          Assign Class
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 4: CLASS & SECTION ALLOCATION                          */}
            {/* ========================================================== */}
            {tab === 'ClassAllocation' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold">Class & Section Master Configuration</h4>
                    <p className="text-xs text-[#6F7D8D]">
                      Assign Class Mentors (Class Teachers), set classroom rooms, and intake capacities.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddClassModal(true)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add New Class / Section
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((c) => (
                    <div
                      key={c.id}
                      className={`p-5 rounded-[20px] border shadow-xs flex flex-col justify-between space-y-3 ${
                        isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-[#FF7555]">{c.grade} - Sec {c.section}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                            {c.room}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#26C281]">{c.students}/{c.capacity} enrolled</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                          Assigned Class Teacher (Mentor)
                        </span>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`font-bold text-xs block ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                              {c.classTeacher}
                            </span>
                            <span className="text-[10px] text-[#8FA0B2]">Emp ID: {c.teacherEmpId}</span>
                          </div>
                          <button
                            onClick={() => {
                              setTargetClassForAssignment(c);
                              setAssignedTeacherName(c.classTeacher);
                              setShowAssignClassTeacherModal(true);
                            }}
                            className="px-3 py-1 rounded-full text-xs font-bold text-[#FF7555] bg-[#FFF2EE] dark:bg-slate-700 hover:bg-[#FF7555] hover:text-white transition-all cursor-pointer"
                          >
                            Reassign
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#6F7D8D] pt-1">
                        <span>Today&apos;s Attendance: <strong>{c.attendance}%</strong></span>
                        <span>{c.submitted ? '✅ Locked' : '⏳ Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 5: ACADEMIC SESSIONS & TERMS                           */}
            {/* ========================================================== */}
            {tab === 'Sessions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold">Academic Sessions & Board Terms</h4>
                    <p className="text-xs text-[#6F7D8D]">
                      Configure multi-year academic sessions, term durations, and board affiliation guidelines.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddSessionModal(true)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#26C281] hover:bg-[#20a76f] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Academic Session
                  </button>
                </div>

                <div className="space-y-3">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className={`p-5 rounded-[20px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        sess.isCurrent
                          ? 'border-[#26C281] bg-emerald-50/20 dark:bg-emerald-950/20'
                          : isDarkMode
                          ? 'bg-[#0E1726] border-[#1E293B]'
                          : 'bg-[#FAFCFE] border-[#EEF2F6]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                            {sess.name}
                          </h4>
                          {sess.isCurrent && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#26C281] text-white">
                              Current Active Session
                            </span>
                          )}
                          <span className="text-xs text-[#6F7D8D]">• {sess.board}</span>
                        </div>
                        <p className="text-xs text-[#6F7D8D] mt-1">
                          Timeline: <strong>{sess.startDate}</strong> to <strong>{sess.endDate}</strong> | Enrolled:{' '}
                          <strong>{sess.totalStudents} Students</strong> across <strong>{sess.totalClasses} Classes</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {!sess.isCurrent && (
                          <button
                            onClick={() => {
                              setSessions(
                                sessions.map((s) => ({
                                  ...s,
                                  isCurrent: s.id === sess.id,
                                  status: s.id === sess.id ? 'Active' : 'Archived',
                                }))
                              );
                              showToast(`Switched active session to ${sess.name}`);
                            }}
                            className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF7555] text-white hover:bg-[#ff6541] cursor-pointer"
                          >
                            Set As Current
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 6: NOTICES & BROADCAST HUB (With Filter Chips)         */}
            {/* ========================================================== */}
            {tab === 'Notices' && (
              <div className="space-y-6">
                {/* Broadcast Form */}
                <form
                  onSubmit={handlePublishNotice}
                  className={`p-5 rounded-[18px] border space-y-3.5 ${
                    isDarkMode ? 'bg-[#0E1726] border-[#1E293B]' : 'bg-[#FAFCFE] border-[#EEF2F6]'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FF7555]">
                    <Megaphone className="w-4 h-4" />
                    <span>Compose Official Administrative Circular & Broadcast</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#6F7D8D] block mb-1">Audience</label>
                      <select
                        value={nAud}
                        onChange={(e) => setNAud(e.target.value as any)}
                        className={`w-full border rounded-xl px-3 py-1.5 text-xs outline-none ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                        }`}
                      >
                        <option value="ALL">All School (Teachers, Parents, Students)</option>
                        <option value="PARENTS">Parents Only (via Parent App & SMS)</option>
                        <option value="TEACHERS">Faculty & Staff Only</option>
                        <option value="STUDENTS">Students Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#6F7D8D] block mb-1">Priority</label>
                      <select
                        value={nPri}
                        onChange={(e) => setNPri(e.target.value as any)}
                        className={`w-full border rounded-xl px-3 py-1.5 text-xs outline-none ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                        }`}
                      >
                        <option value="NORMAL">Normal Notice</option>
                        <option value="IMPORTANT">Important Academic</option>
                        <option value="URGENT">Urgent / Emergency Alert</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#6F7D8D] block mb-1">Dispatch Channels</label>
                      <select
                        value={nChannel}
                        onChange={(e) => setNChannel(e.target.value as any)}
                        className={`w-full border rounded-xl px-3 py-1.5 text-xs outline-none ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                        }`}
                      >
                        <option value="Portal + SMS + WhatsApp">Portal + SMS Gateway + WhatsApp API</option>
                        <option value="Portal Only">Portal Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#6F7D8D] block mb-1">
                      Notice Headline & Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CBSE Term 1 Practical Examination dates announced for Class 10 & 12."
                      value={nTitle}
                      onChange={(e) => setNTitle(e.target.value)}
                      className={`w-full border rounded-xl px-3.5 py-2 text-xs outline-none ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                      }`}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Dispatch Broadcast
                    </button>
                  </div>
                </form>

                {/* Filter Chips for Broadcasts */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-xs font-bold text-gray-400 mr-1">Filter Priority:</span>
                  {[
                    { id: 'All', label: `All Broadcasts (${notices.length})` },
                    { id: 'URGENT', label: '🚨 Urgent Alerts' },
                    { id: 'IMPORTANT', label: '📢 Important' },
                    { id: 'NORMAL', label: 'General' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setNoticeFilter(chip.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        noticeFilter === chip.id
                          ? 'bg-[#FF7555] text-white shadow-xs'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-300 hover:text-white'
                          : 'bg-slate-100 text-[#6F7D8D] hover:bg-slate-200'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Notices List */}
                <div className={`rounded-[20px] border overflow-hidden text-xs ${isDarkMode ? 'border-[#1E293B]' : 'border-[#EBF0F5]'}`}>
                  {filteredNotices.map((n) => (
                    <div
                      key={n.id}
                      className={`py-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b last:border-b-0 ${
                        isDarkMode ? 'border-[#1E293B] hover:bg-slate-800/40' : 'border-[#F1F5F9] hover:bg-[#FAFCFE]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2EE] text-[#FF7555]">
                            {n.audience}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              n.priority === 'URGENT'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : n.priority === 'IMPORTANT'
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {n.priority}
                          </span>
                          <span className="text-[10px] text-gray-400">{n.channel}</span>
                        </div>
                        <p className={`text-xs mt-1.5 font-bold ${isDarkMode ? 'text-white' : 'text-[#132033]'}`}>
                          {n.title}
                        </p>
                      </div>
                      <div className="text-[11px] text-[#6F7D8D] shrink-0">
                        <span>Dispatched: {n.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Status Summary */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6F7D8D] border-t border-slate-100 dark:border-slate-800 mt-6 gap-2">
              <span>Delhi Public School Central ERP • Session 2026-27</span>
              <span className="text-[#FF7555] font-bold cursor-pointer hover:underline" onClick={downloadStaffCSV}>
                Export System Audit Logs (CSV) →
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================================== */}
      {/* TOAST NOTIFICATION POPUP                                             */}
      {/* ==================================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className="px-4 py-3 rounded-2xl bg-[#132033] text-white shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#26C281]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: ADD TEACHER                                                 */}
      {/* ==================================================================== */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-xl rounded-[24px] border p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setShowAddTeacherModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1 text-[#FF7555]">
              <GraduationCap className="w-5 h-5" />
              <h3 className="text-lg font-extrabold">Add New Faculty / Teacher</h3>
            </div>
            <p className="text-xs text-[#6F7D8D] mb-4">Enroll teaching staff into DPS ERP Central Directory.</p>

            <form onSubmit={handleAddTeacher} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Teacher Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Mehra"
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. TCH-2026-105"
                    value={tEmpId}
                    onChange={(e) => setTEmpId(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Department</label>
                  <select
                    value={tDept}
                    onChange={(e) => setTDept(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  >
                    <option>Mathematics</option>
                    <option>Sciences</option>
                    <option>Languages (English/Hindi)</option>
                    <option>Social Sciences</option>
                    <option>Computer Science / AI</option>
                    <option>Commerce & Economics</option>
                    <option>Physical Education</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc. Mathematics, B.Ed."
                    value={tQual}
                    onChange={(e) => setTQual(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Primary Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MATH-041"
                    value={tSubj}
                    onChange={(e) => setTSubj(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Assigned Classes</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 10-A, 9-B"
                    value={tClasses}
                    onChange={(e) => setTClasses(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="rmehta@dpsdelhi.edu.in"
                    value={tEmail}
                    onChange={(e) => setTEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98112 00000"
                    value={tPhone}
                    onChange={(e) => setTPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541]"
                >
                  Save & Add Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: ADD STUDENT                                                 */}
      {/* ==================================================================== */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-xl rounded-[24px] border p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1 text-[#FF7555]">
              <UserPlus className="w-5 h-5" />
              <h3 className="text-lg font-extrabold">New Student Admission Entry</h3>
            </div>
            <p className="text-xs text-[#6F7D8D] mb-4">Register student in CBSE Board roster & class master.</p>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Sharma"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Admission Number</label>
                  <input
                    type="text"
                    value={sAdmNo}
                    onChange={(e) => setSAdmNo(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Assign Class</label>
                  <select
                    value={sClassSec}
                    onChange={(e) => setSClassSec(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={`${c.grade}-${c.section}`}>
                        {c.grade}-{c.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Roll No</label>
                  <input
                    type="number"
                    value={sRoll}
                    onChange={(e) => setSRoll(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Gender</label>
                  <select
                    value={sGender}
                    onChange={(e) => setSGender(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={sDob}
                    onChange={(e) => setSDob(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={sBlood}
                    onChange={(e) => setSBlood(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Manoj Sharma"
                    value={sParentName}
                    onChange={(e) => setSParentName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Parent Phone (for SMS/WhatsApp)</label>
                  <input
                    type="text"
                    value={sParentPhone}
                    onChange={(e) => setSParentPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-500 block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={sAddress}
                  onChange={(e) => setSAddress(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                  }`}
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541]"
                >
                  Complete Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: ADD ACADEMIC SESSION                                        */}
      {/* ==================================================================== */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setShowAddSessionModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold mb-1">Add New Academic Session (AY)</h3>
            <p className="text-xs text-[#6F7D8D] mb-4">Create operational school calendar year.</p>

            <form onSubmit={handleAddSession} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-500 block mb-1">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Academic Year 2027-28"
                  value={sessName}
                  onChange={(e) => setSessName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Session Start Date</label>
                  <input
                    type="date"
                    value={sessStart}
                    onChange={(e) => setSessStart(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Session End Date</label>
                  <input
                    type="date"
                    value={sessEnd}
                    onChange={(e) => setSessEnd(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-500 block mb-1">Affiliation Board</label>
                <input
                  type="text"
                  value={sessBoard}
                  onChange={(e) => setSessBoard(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="setCurrent"
                  checked={sessIsCurrent}
                  onChange={(e) => setSessIsCurrent(e.target.checked)}
                  className="w-4 h-4 accent-[#FF7555]"
                />
                <label htmlFor="setCurrent" className="font-bold cursor-pointer">
                  Set this as Current Active Academic Year
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSessionModal(false)}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#26C281] hover:bg-[#20a76f]"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: ASSIGN / REASSIGN CLASS TEACHER                             */}
      {/* ==================================================================== */}
      {showAssignClassTeacherModal && targetClassForAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setShowAssignClassTeacherModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold mb-1">
              Appoint Class Teacher (Mentor)
            </h3>
            <p className="text-xs text-[#6F7D8D] mb-4">
              Target Section: <strong className="text-[#FF7555]">{targetClassForAssignment.grade} - Section {targetClassForAssignment.section}</strong> ({targetClassForAssignment.room})
            </p>

            <form onSubmit={handleAssignClassTeacher} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-500 block mb-1">Select Faculty Member</label>
                <select
                  value={assignedTeacherName}
                  onChange={(e) => setAssignedTeacherName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                  }`}
                  required
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.dept} • {s.empId})
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-[#6F7D8D] bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                Designating a faculty member grants them full morning attendance registration and gradebook locking authority for this section in their Teacher Portal.
              </p>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignClassTeacherModal(false)}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541]"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: ADD CLASS / SECTION                                         */}
      {/* ==================================================================== */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setShowAddClassModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold mb-1">Add New Class & Section</h3>
            <p className="text-xs text-[#6F7D8D] mb-4">Expand school academic sections and rooms.</p>

            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Grade</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 11"
                    value={cGrade}
                    onChange={(e) => setCGrade(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Section</label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    value={cSection}
                    onChange={(e) => setCSection(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 301"
                    value={cRoom}
                    onChange={(e) => setCRoom(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-500 block mb-1">Intake Capacity</label>
                  <input
                    type="number"
                    value={cCapacity}
                    onChange={(e) => setCCapacity(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-500 block mb-1">Initial Class Teacher</label>
                <select
                  value={cTeacher}
                  onChange={(e) => setCTeacher(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#D9E2EC]'
                  }`}
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.dept})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541]"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: STUDENT 360 DOSSIER                                         */}
      {/* ==================================================================== */}
      {selectedStudentDossier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setSelectedStudentDossier(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b pb-4 border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 rounded-full bg-[#FFF2EE] text-[#FF7555] font-black text-xl flex items-center justify-center border-2 border-[#FF7555]">
                {selectedStudentDossier.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-extrabold">{selectedStudentDossier.name}</h3>
                <p className="text-xs text-[#6F7D8D]">
                  Adm No: <strong>{selectedStudentDossier.admNo}</strong> • Roll: <strong>{selectedStudentDossier.rollNo}</strong> • {selectedStudentDossier.classSec}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Attendance</span>
                <span className="text-base font-black text-[#26C281]">{selectedStudentDossier.attendanceRate}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Blood Group</span>
                <span className="text-base font-black text-blue-600">{selectedStudentDossier.bloodGroup}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Fee Status</span>
                <span className={`text-base font-black ${selectedStudentDossier.feeStatus === 'Paid' ? 'text-[#26C281]' : 'text-red-500'}`}>
                  {selectedStudentDossier.feeStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-bold text-gray-400 block text-[10px]">PARENT CONTACT</span>
                <p>Parent: <strong>{selectedStudentDossier.parentName}</strong></p>
                <p>Phone: <strong>{selectedStudentDossier.parentPhone}</strong></p>
                <p>Address: <strong>{selectedStudentDossier.address}</strong></p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  openPasswordModal({
                    id: selectedStudentDossier.id,
                    name: selectedStudentDossier.name,
                    identifier: selectedStudentDossier.admNo,
                    userType: 'STUDENT',
                    phone: selectedStudentDossier.parentPhone,
                    className: selectedStudentDossier.classSec,
                  });
                }}
                className="px-4 py-2 rounded-full text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Generate / Reset Password</span>
              </button>

              <button
                onClick={() => setSelectedStudentDossier(null)}
                className="px-6 py-2 rounded-full text-xs font-bold bg-[#FF7555] text-white cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 7: CREDENTIAL & PASSWORD GENERATOR                             */}
      {/* ==================================================================== */}
      {showCredentialModal && targetCredentialUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-[24px] border p-6 sm:p-8 shadow-2xl relative ${
              isDarkMode ? 'bg-[#111C2D] border-[#1E293B] text-white' : 'bg-white border-[#EBF0F5] text-[#132033]'
            }`}
          >
            <button
              onClick={() => setShowCredentialModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 flex items-center justify-center text-amber-500">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold">Generate Account Password</h3>
                <p className="text-xs text-[#6F7D8D]">
                  Manage portal login credentials for {targetCredentialUser.userType === 'TEACHER' ? 'Faculty Member' : 'Student'}
                </p>
              </div>
            </div>

            {/* Target Account Summary Pill */}
            <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm">{targetCredentialUser.name}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-[10px]">
                  {targetCredentialUser.userType}
                </span>
              </div>
              <div className="text-gray-500">
                <span>Login Identifier: </span>
                <strong className="text-[#FF7555]">{targetCredentialUser.identifier}</strong>
              </div>
              {targetCredentialUser.phone && (
                <div className="text-gray-500">
                  <span>Registered Phone: </span>
                  <strong className="text-slate-700 dark:text-slate-300">{targetCredentialUser.phone}</strong>
                </div>
              )}
            </div>

            {/* Password Generation Form */}
            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-gray-500">Temporary Password</label>
                  <button
                    type="button"
                    onClick={() => setGenPassword(generateRandomPassword(targetCredentialUser.userType))}
                    className="text-[#FF7555] font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate Random Password
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={genPassword}
                    onChange={(e) => setGenPassword(e.target.value)}
                    className={`w-full p-3 rounded-xl border font-mono text-sm font-bold tracking-wider outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-[#D9E2EC] text-[#132033]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(genPassword);
                      showToast('Password copied to clipboard!');
                    }}
                    className="absolute right-2.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Requirement Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requirePwdChange}
                  onChange={(e) => setRequirePwdChange(e.target.checked)}
                  className="mt-0.5 rounded text-[#FF7555] focus:ring-[#FF7555]"
                />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Require user to change password upon their first login to the portal.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={copyCredentialSlip}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#FF7555]" />
                  <span>{copiedCredential ? '✓ Copied Slip' : 'Copy Full Login Slip'}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCredentialModal(false)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#FF7555] hover:bg-[#ff6541] flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isSavingPassword ? 'Saving...' : 'Save & Activate Password'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
