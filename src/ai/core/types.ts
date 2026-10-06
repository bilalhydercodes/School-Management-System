import type { RoleType } from '@/types';

export interface AIUserContext {
  userId: string;
  tenantId: string | null;
  role: RoleType | string;
  name?: string;
  email?: string;
  currentPath?: string;
  permissions: string[];
}

export interface StudentDashboardContext {
  admissionNumber: string;
  rollNumber?: number | null;
  classGrade: string;
  section: string;
  attendanceSummary: {
    totalWorkingDays: number;
    presentDays: number;
    attendancePercentage: number;
  };
  pendingAssignmentsCount: number;
  upcomingExamsCount: number;
  recentAnnouncements: Array<{
    title: string;
    date: string;
    priority: string;
  }>;
}

export interface TeacherDashboardContext {
  employeeId: string;
  department: string;
  designation?: string | null;
  assignedClasses: Array<{
    className: string;
    sectionName: string;
    subject: string;
  }>;
  todaysClassesCount: number;
  attendanceStatus: string;
  pendingAssignmentsCount: number;
  recentAnnouncements: Array<{
    title: string;
    date: string;
  }>;
}

export interface ParentDashboardContext {
  children: Array<{
    id: string;
    name: string;
    className: string;
    sectionName: string;
    attendancePercentage: number;
    pendingFeeInvoicesCount: number;
  }>;
  recentNotices: Array<{
    title: string;
    date: string;
  }>;
}

export interface AdminDashboardContext {
  schoolName: string;
  studentCount: number;
  teacherCount: number;
  attendanceSummary: {
    todayTotalMarked: number;
    todayPresent: number;
    studentAttendanceRate: number;
  };
  operationalAlerts: Array<{
    message: string;
    severity: 'info' | 'warning' | 'urgent';
  }>;
}

export interface SuperAdminDashboardContext {
  totalTenants: number;
  activeTenants: number;
  pendingApplications: number;
}

export interface AIDashboardContext {
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tenant?: {
    id: string;
    name: string;
    board?: string;
    slug?: string;
  } | null;
  academicYear?: string | null;
  currentPath?: string;
  student?: StudentDashboardContext;
  teacher?: TeacherDashboardContext;
  parent?: ParentDashboardContext;
  admin?: AdminDashboardContext;
  superAdmin?: SuperAdminDashboardContext;
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatRequest {
  message: string;
  conversationId?: string;
  currentPath?: string;
  history?: AIChatMessage[];
}

export interface AIChatResponse {
  success: boolean;
  message?: string;
  error?: string;
  conversationId?: string;
  role?: string;
  timestamp?: string;
  sources?: Array<{
    documentName: string;
    category?: string;
    sourceCitation: string;
  }>;
  actionProposal?: {
    actionType: 'createAnnouncement' | 'createStudyPlan' | 'generateAttendanceReport';
    title: string;
    description: string;
    payload: Record<string, any>;
    requiresConfirmation: true;
  };
  uiCards?: Array<{
    type: 'attendance' | 'marks' | 'assignments' | 'exam' | 'fee' | 'schedule' | 'generic';
    title: string;
    badge?: string;
    metrics: Array<{ label: string; value: string | number; highlight?: boolean }>;
  }>;
  uiActions?: Array<{
    label: string;
    path: string;
    icon?: string;
  }>;
  toolCallsCount?: number;
}
