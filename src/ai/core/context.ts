import { prisma } from '@/lib/db';
import type { DayOfWeek } from '@prisma/client';
import type {
  AIUserContext,
  AIDashboardContext,
  StudentDashboardContext,
  TeacherDashboardContext,
  ParentDashboardContext,
  AdminDashboardContext,
  SuperAdminDashboardContext,
} from './types';

/**
 * Maps standard JavaScript getDay() (0 = Sunday, 1 = Monday, ...) to Prisma DayOfWeek enum
 */
function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  return days[new Date().getDay()] || 'MONDAY';
}

/**
 * Builds real, lightweight, strictly tenant-isolated dashboard context for Alpha AI Copilot.
 * Ensures zero cross-tenant data leakage and zero database dumping.
 */
export async function buildAIDashboardContext(
  userContext: AIUserContext
): Promise<AIDashboardContext> {
  const { userId, tenantId, role, currentPath } = userContext;

  const baseContext: AIDashboardContext = {
    role,
    user: {
      id: userId,
      name: userContext.name || 'User',
      email: userContext.email || '',
      role,
    },
    tenant: null,
    academicYear: null,
    currentPath: currentPath || '/',
  };

  try {
    // 1. Fetch tenant & academic year if tenantId is available
    if (tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, board: true, slug: true },
      });
      const academicYear = await prisma.academicYear.findFirst({
        where: { tenantId, isCurrent: true },
        select: { name: true },
      });

      if (tenant) {
        baseContext.tenant = {
          id: tenant.id,
          name: tenant.name,
          board: tenant.board || 'CBSE',
          slug: tenant.slug,
        };
      }
      baseContext.academicYear = academicYear?.name || null;
    }

    // 2. Build role-specific lightweight context
    switch (role) {
      case 'STUDENT': {
        if (!tenantId) break;
        baseContext.student = await buildStudentContext(userId, tenantId);
        break;
      }

      case 'TEACHER': {
        if (!tenantId) break;
        baseContext.teacher = await buildTeacherContext(userId, tenantId);
        break;
      }

      case 'PARENT': {
        if (!tenantId) break;
        baseContext.parent = await buildParentContext(userId, tenantId);
        break;
      }

      case 'ADMIN':
      case 'ACCOUNTANT': {
        if (!tenantId) break;
        baseContext.admin = await buildAdminContext(tenantId, baseContext.tenant?.name || 'School');
        break;
      }

      case 'SUPER_ADMIN': {
        baseContext.superAdmin = await buildSuperAdminContext();
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error('[AI CONTEXT BUILDER ERROR]: Failed to assemble full dashboard context', error);
  }

  return baseContext;
}

/**
 * Builds Student Context
 */
async function buildStudentContext(
  userId: string,
  tenantId: string
): Promise<StudentDashboardContext> {
  const profile = await prisma.studentProfile.findFirst({
    where: { userId, tenantId },
    include: {
      section: {
        include: {
          classGrade: true,
        },
      },
    },
  });

  if (!profile) {
    return {
      admissionNumber: 'N/A',
      classGrade: 'N/A',
      section: 'N/A',
      attendanceSummary: { totalWorkingDays: 0, presentDays: 0, attendancePercentage: 0 },
      pendingAssignmentsCount: 0,
      upcomingExamsCount: 0,
      recentAnnouncements: [],
    };
  }

  const attendances = await prisma.studentAttendance.findMany({
    where: { tenantId, studentId: profile.id },
    select: { status: true },
  });
  const upcomingExamsCount = await prisma.examSchedule.count({
    where: {
      tenantId,
      classGradeId: profile.section.classGradeId,
      examDate: { gte: new Date() },
    },
  });
  const recentNotices = await prisma.notice.findMany({
    where: {
      tenantId,
      targetAudience: { in: ['ALL', 'STUDENTS'] },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { title: true, publishedAt: true, priority: true },
  });

  const totalWorkingDays = attendances.length;
  const presentDays = attendances.filter(
    (a) => a.status === 'PRESENT' || a.status === 'HALF_DAY'
  ).length;
  const attendancePercentage =
    totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 100;

  return {
    admissionNumber: profile.admissionNumber,
    rollNumber: profile.rollNumber,
    classGrade: profile.section.classGrade.name,
    section: profile.section.name,
    attendanceSummary: {
      totalWorkingDays,
      presentDays,
      attendancePercentage,
    },
    pendingAssignmentsCount: 0, // Placeholder for future assignments module
    upcomingExamsCount,
    recentAnnouncements: recentNotices.map((n) => ({
      title: n.title,
      date: n.publishedAt.toISOString().split('T')[0],
      priority: n.priority,
    })),
  };
}

/**
 * Builds Teacher Context
 */
async function buildTeacherContext(
  userId: string,
  tenantId: string
): Promise<TeacherDashboardContext> {
  const profile = await prisma.teacherProfile.findFirst({
    where: { userId, tenantId },
    include: {
      classSubjects: {
        include: {
          section: {
            include: {
              classGrade: true,
            },
          },
          subject: true,
        },
      },
    },
  });

  if (!profile) {
    return {
      employeeId: 'N/A',
      department: 'General',
      designation: 'Teacher',
      assignedClasses: [],
      todaysClassesCount: 0,
      attendanceStatus: 'Not Marked',
      pendingAssignmentsCount: 0,
      recentAnnouncements: [],
    };
  }

  const todayDay = getTodayDayOfWeek();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const todayClasses = await prisma.timetableEntry.findMany({
    where: {
      tenantId,
      teacherId: profile.id,
      dayOfWeek: todayDay,
    },
    select: { id: true },
  });
  const todayStaffAttendance = await prisma.staffAttendance.findFirst({
    where: {
      tenantId,
      userId,
      date: todayDate,
    },
    select: { status: true },
  });
  const recentNotices = await prisma.notice.findMany({
    where: {
      tenantId,
      targetAudience: { in: ['ALL', 'TEACHERS'] },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { title: true, publishedAt: true },
  });

  const assignedClasses = profile.classSubjects.map((cs) => ({
    className: cs.section.classGrade.name,
    sectionName: cs.section.name,
    subject: cs.subject.name,
  }));

  return {
    employeeId: profile.employeeId,
    department: profile.department,
    designation: profile.designation || 'Teacher',
    assignedClasses,
    todaysClassesCount: todayClasses.length,
    attendanceStatus: todayStaffAttendance?.status || 'Not Marked Yet Today',
    pendingAssignmentsCount: 0,
    recentAnnouncements: recentNotices.map((n) => ({
      title: n.title,
      date: n.publishedAt.toISOString().split('T')[0],
    })),
  };
}

/**
 * Builds Parent Context
 */
async function buildParentContext(
  userId: string,
  tenantId: string
): Promise<ParentDashboardContext> {
  const parentProfile = await prisma.parentProfile.findFirst({
    where: { userId, tenantId },
    include: {
      students: {
        include: {
          student: {
            include: {
              user: true,
              section: {
                include: {
                  classGrade: true,
                },
              },
              attendances: {
                select: { status: true },
              },
              feeInvoices: {
                where: { status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  const recentNotices = await prisma.notice.findMany({
    where: {
      tenantId,
      targetAudience: { in: ['ALL', 'PARENTS'] },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { title: true, publishedAt: true },
  });

  if (!parentProfile) {
    return {
      children: [],
      recentNotices: recentNotices.map((n) => ({
        title: n.title,
        date: n.publishedAt.toISOString().split('T')[0],
      })),
    };
  }

  const children = parentProfile.students.map((link) => {
    const s = link.student;
    const totalDays = s.attendances.length;
    const presentDays = s.attendances.filter(
      (a) => a.status === 'PRESENT' || a.status === 'HALF_DAY'
    ).length;
    const attendancePercentage =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    return {
      id: s.id,
      name: `${s.user.firstName} ${s.user.lastName}`.trim(),
      className: s.section.classGrade.name,
      sectionName: s.section.name,
      attendancePercentage,
      pendingFeeInvoicesCount: s.feeInvoices.length,
    };
  });

  return {
    children,
    recentNotices: recentNotices.map((n) => ({
      title: n.title,
      date: n.publishedAt.toISOString().split('T')[0],
    })),
  };
}

/**
 * Builds Admin / School Context
 */
async function buildAdminContext(
  tenantId: string,
  schoolName: string
): Promise<AdminDashboardContext> {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const studentCount = await prisma.studentProfile.count({ where: { tenantId } });
  const teacherCount = await prisma.teacherProfile.count({ where: { tenantId } });
  const todayStudentAttendances = await prisma.studentAttendance.findMany({
    where: { tenantId, date: todayDate },
    select: { status: true },
  });
  const pendingInvoicesCount = await prisma.feeInvoice.count({
    where: { tenantId, status: { in: ['PENDING', 'OVERDUE'] } },
  });

  const totalMarked = todayStudentAttendances.length;
  const presentCount = todayStudentAttendances.filter(
    (a) => a.status === 'PRESENT' || a.status === 'HALF_DAY'
  ).length;
  const studentAttendanceRate =
    totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

  const operationalAlerts: AdminDashboardContext['operationalAlerts'] = [];
  if (pendingInvoicesCount > 0) {
    operationalAlerts.push({
      message: `${pendingInvoicesCount} fee invoices are pending or overdue.`,
      severity: 'warning',
    });
  }
  if (totalMarked === 0 && studentCount > 0) {
    operationalAlerts.push({
      message: `Today's student attendance has not been completed yet.`,
      severity: 'info',
    });
  }

  return {
    schoolName,
    studentCount,
    teacherCount,
    attendanceSummary: {
      todayTotalMarked: totalMarked,
      todayPresent: presentCount,
      studentAttendanceRate,
    },
    operationalAlerts,
  };
}

/**
 * Builds Super Admin Platform Context
 */
async function buildSuperAdminContext(): Promise<SuperAdminDashboardContext> {
  const totalTenants = await prisma.tenant.count();
  const activeTenants = await prisma.tenant.count({ where: { isActive: true } });
  const pendingApplications = await prisma.institutionApplication.count({ where: { status: 'PENDING' } });

  return {
    totalTenants,
    activeTenants,
    pendingApplications,
  };
}
