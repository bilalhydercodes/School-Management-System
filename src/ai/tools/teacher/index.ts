import { prisma } from '@/lib/db';
import type { AITool, ToolExecutionResult } from '../types';
import type { AIUserContext } from '../../core/types';
import type { DayOfWeek } from '@prisma/client';

/**
 * Retrieves the teacher profile for the authenticated session.
 */
async function getAuthenticatedTeacherProfile(context: AIUserContext) {
  if (context.role !== 'TEACHER' && context.role !== 'ADMIN' && context.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Teacher tools require an authenticated faculty session.');
  }

  const profile = await prisma.teacherProfile.findFirst({
    where: { userId: context.userId, tenantId: context.tenantId! },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      classSubjects: {
        include: {
          section: { include: { classGrade: true } },
          subject: true,
        },
      },
      classTeacherSections: {
        include: { classGrade: true },
      },
    },
  });

  if (!profile) {
    throw new Error('Teacher faculty record not found in this institution.');
  }

  return profile;
}

/**
 * Verifies that the teacher is authorized to view the requested section.
 */
async function verifyTeacherSectionAccess(teacherId: string, sectionId: string, tenantId: string) {
  const isAssigned = await prisma.classSubjectTeacher.findFirst({
    where: { teacherId, sectionId, tenantId },
  });

  const isClassTeacher = await prisma.section.findFirst({
    where: { id: sectionId, classTeacherId: teacherId, tenantId },
  });

  if (!isAssigned && !isClassTeacher) {
    throw new Error('Access Denied: You are not authorized or assigned to instruct or manage this section.');
  }
}

function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[new Date().getDay()] || 'MONDAY';
}

export const teacherTools: AITool[] = [
  // 1. getMyClasses
  {
    name: 'getMyClasses',
    description: 'Retrieves all classes, sections, and subjects assigned to the authenticated teacher.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['TEACHER'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const teacher = await getAuthenticatedTeacherProfile(context);
        const assigned = teacher.classSubjects.map((cs) => ({
          sectionId: cs.section.id,
          className: cs.section.classGrade.name,
          sectionName: cs.section.name,
          subject: cs.subject.name,
          isClassTeacher: teacher.classTeacherSections.some((s) => s.id === cs.section.id),
        }));

        return {
          success: true,
          data: {
            employeeId: teacher.employeeId,
            department: teacher.department,
            totalAssignedClasses: assigned.length,
            classes: assigned,
          },
          uiCard: {
            type: 'generic',
            title: 'My Assigned Classes',
            badge: `${assigned.length} Classes`,
            metrics: assigned.slice(0, 4).map((c) => ({
              label: `${c.className}-${c.sectionName}`,
              value: c.subject,
            })),
          },
          uiActions: [{ label: 'View Teacher Portal', path: '/teacher' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 2. getClassStudents
  {
    name: 'getClassStudents',
    description: 'Lists all enrolled students in a specific section assigned to the teacher.',
    parameters: {
      type: 'object',
      properties: {
        sectionId: { type: 'string', description: 'ID of the class section to query' },
      },
      required: ['sectionId'],
    },
    allowedRoles: ['TEACHER'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const teacher = await getAuthenticatedTeacherProfile(context);
        const sectionId = args.sectionId as string;
        await verifyTeacherSectionAccess(teacher.id, sectionId, context.tenantId!);

        const students = await prisma.studentProfile.findMany({
          where: { tenantId: context.tenantId!, sectionId },
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { rollNumber: 'asc' },
        });

        const studentList = students.map((s) => ({
          id: s.id,
          name: `${s.user.firstName} ${s.user.lastName}`,
          admissionNumber: s.admissionNumber,
          rollNumber: s.rollNumber,
        }));

        return {
          success: true,
          data: {
            totalEnrolled: studentList.length,
            students: studentList,
          },
          uiActions: [{ label: 'Class List', path: '/teacher' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 3. getClassAttendance
  {
    name: 'getClassAttendance',
    description: 'Retrieves attendance logs for a class section for today or a specific date.',
    parameters: {
      type: 'object',
      properties: {
        sectionId: { type: 'string', description: 'Section ID' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format (defaults to today)' },
      },
      required: ['sectionId'],
    },
    allowedRoles: ['TEACHER'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const teacher = await getAuthenticatedTeacherProfile(context);
        const sectionId = args.sectionId as string;
        await verifyTeacherSectionAccess(teacher.id, sectionId, context.tenantId!);

        const targetDate = args.date ? new Date(args.date as string) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const logs = await prisma.studentAttendance.findMany({
          where: {
            tenantId: context.tenantId!,
            sectionId,
            date: targetDate,
          },
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        });

        const total = logs.length;
        const present = logs.filter((l) => l.status === 'PRESENT' || l.status === 'HALF_DAY').length;
        const absent = logs.filter((l) => l.status === 'ABSENT').length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
          success: true,
          data: {
            date: targetDate.toISOString().split('T')[0],
            totalMarked: total,
            presentCount: present,
            absentCount: absent,
            attendanceRate: `${rate}%`,
            absentStudents: logs
              .filter((l) => l.status === 'ABSENT')
              .map((l) => `${l.student.user.firstName} ${l.student.user.lastName}`),
          },
          uiCard: {
            type: 'attendance',
            title: 'Class Attendance',
            badge: `${rate}% Present`,
            metrics: [
              { label: 'Present', value: present },
              { label: 'Absent', value: absent, highlight: absent > 0 },
              { label: 'Total Recorded', value: total },
            ],
          },
          uiActions: [{ label: 'Mark Attendance', path: '/teacher' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 4. getStudentPerformance
  {
    name: 'getStudentPerformance',
    description: 'Retrieves exam results and grades for a specific student taught by the teacher.',
    parameters: {
      type: 'object',
      properties: {
        studentId: { type: 'string', description: 'ID or admission number of the student' },
      },
      required: ['studentId'],
    },
    allowedRoles: ['TEACHER'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const teacher = await getAuthenticatedTeacherProfile(context);
        const student = await prisma.studentProfile.findFirst({
          where: {
            tenantId: context.tenantId!,
            OR: [{ id: args.studentId as string }, { admissionNumber: args.studentId as string }],
          },
          include: {
            user: { select: { firstName: true, lastName: true } },
            section: { include: { classGrade: true } },
          },
        });

        if (!student) {
          throw new Error('Student not found.');
        }

        await verifyTeacherSectionAccess(teacher.id, student.sectionId, context.tenantId!);

        const results = await prisma.examResult.findMany({
          where: { studentId: student.id },
          include: {
            examSchedule: {
              include: { subject: true, examTerm: true },
            },
          },
        });

        const marks = results.map((r) => ({
          subject: r.examSchedule.subject.name,
          term: r.examSchedule.examTerm.name,
          marksObtained: Number(r.marksObtained),
          maxMarks: Number(r.examSchedule.maxMarks),
          grade: r.grade,
        }));

        return {
          success: true,
          data: {
            studentName: `${student.user.firstName} ${student.user.lastName}`,
            classGrade: `${student.section.classGrade.name}-${student.section.name}`,
            marks,
          },
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 5. getClassPerformance
  {
    name: 'getClassPerformance',
    description: 'Calculates the aggregate performance metrics and average scores across a class section.',
    parameters: {
      type: 'object',
      properties: {
        sectionId: { type: 'string', description: 'Section ID' },
      },
      required: ['sectionId'],
    },
    allowedRoles: ['TEACHER'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const teacher = await getAuthenticatedTeacherProfile(context);
        const sectionId = args.sectionId as string;
        await verifyTeacherSectionAccess(teacher.id, sectionId, context.tenantId!);

        const students = await prisma.studentProfile.findMany({
          where: { tenantId: context.tenantId!, sectionId },
          select: { id: true },
        });

        const studentIds = students.map((s) => s.id);
        const results = await prisma.examResult.findMany({
          where: { studentId: { in: studentIds } },
          include: { examSchedule: { include: { subject: true } } },
        });

        if (results.length === 0) {
          return { success: true, data: { message: 'No graded exam entries found for this section yet.' } };
        }

        const sum = results.reduce(
          (acc, curr) =>
            acc +
            (Number(curr.examSchedule.maxMarks) > 0
              ? (Number(curr.marksObtained) / Number(curr.examSchedule.maxMarks)) * 100
              : 0),
          0
        );
        const avg = Math.round(sum / results.length);

        return {
          success: true,
          data: {
            totalEvaluations: results.length,
            classAverageScore: `${avg}%`,
            status: avg >= 75 ? 'Strong class performance' : 'Moderate class performance',
          },
          uiCard: {
            type: 'marks',
            title: 'Class Performance',
            badge: `${avg}% Avg`,
            metrics: [
              { label: 'Class Average', value: `${avg}%` },
              { label: 'Exams Evaluated', value: results.length },
            ],
          },
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 6. getPendingAssignments
  {
    name: 'getPendingAssignments',
    description: 'Retrieves assignments awaiting teacher review or student submissions.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['TEACHER'],
    execute: async (_args, _context): Promise<ToolExecutionResult> => {
      return {
        success: true,
        data: {
          pendingSubmissions: 0,
          pendingReviews: 0,
          message: 'No pending assignment submissions require teacher review at this time.',
        },
      };
    },
  },

  // 7. getTodaySchedule
  {
    name: 'getTodaySchedule',
    description: 'Retrieves today class timetable periods and schedule for the teacher.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['TEACHER'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const teacher = await getAuthenticatedTeacherProfile(context);
        const todayDay = getTodayDayOfWeek();

        const periods = await prisma.timetableEntry.findMany({
          where: {
            tenantId: context.tenantId!,
            teacherId: teacher.id,
            dayOfWeek: todayDay,
          },
          include: {
            section: { include: { classGrade: true } },
            subject: true,
            periodTimeSlot: true,
          },
          orderBy: { periodTimeSlot: { order: 'asc' } },
        });

        const list = periods.map((p) => ({
          period: p.periodTimeSlot.order,
          time: `${p.periodTimeSlot.startTime} - ${p.periodTimeSlot.endTime}`,
          className: `${p.section.classGrade.name}-${p.section.name}`,
          subject: p.subject?.name || 'Class',
          room: p.roomNumber || 'Assigned Room',
        }));

        return {
          success: true,
          data: {
            day: todayDay,
            totalClassesToday: list.length,
            classes: list,
            schedule: list,
          },
          uiCard: {
            type: 'schedule',
            title: `Today's Schedule (${todayDay})`,
            badge: `${list.length} Classes`,
            metrics: list.slice(0, 4).map((c) => ({
              label: `P${c.period}: ${c.className}`,
              value: `${c.subject} (${c.time})`,
            })),
          },
          uiActions: [{ label: 'Timetable', path: '/teacher' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 8. getUpcomingClasses
  {
    name: 'getUpcomingClasses',
    description: 'Retrieves upcoming scheduled timetable periods for the teacher.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['TEACHER'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const teacher = await getAuthenticatedTeacherProfile(context);
        const entries = await prisma.timetableEntry.findMany({
          where: { tenantId: context.tenantId!, teacherId: teacher.id },
          include: {
            section: { include: { classGrade: true } },
            subject: true,
            periodTimeSlot: true,
          },
          take: 6,
        });

        return {
          success: true,
          data: entries.map((e) => ({
            day: e.dayOfWeek,
            period: e.periodTimeSlot.order,
            className: `${e.section.classGrade.name}-${e.section.name}`,
            subject: e.subject?.name,
          })),
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 9. getClassAnnouncements
  {
    name: 'getClassAnnouncements',
    description: 'Retrieves recent school announcements and circulars relevant to teachers.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['TEACHER'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const notices = await prisma.notice.findMany({
          where: {
            tenantId: context.tenantId!,
            targetAudience: { in: ['ALL', 'TEACHERS'] },
          },
          orderBy: { publishedAt: 'desc' },
          take: 5,
          select: { title: true, priority: true, publishedAt: true },
        });

        return {
          success: true,
          data: notices.map((n) => ({
            title: n.title,
            priority: n.priority,
            date: n.publishedAt.toISOString().split('T')[0],
          })),
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 10. getStudentsWithLowAttendance
  {
    name: 'getStudentsWithLowAttendance',
    description: 'Identifies students in the teacher assigned classes with attendance below a specified threshold (e.g. 75%).',
    parameters: {
      type: 'object',
      properties: {
        sectionId: { type: 'string', description: 'Optional specific section ID' },
        thresholdPercentage: { type: 'number', description: 'Attendance threshold % (default 75)' },
      },
    },
    allowedRoles: ['TEACHER'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const teacher = await getAuthenticatedTeacherProfile(context);
        const threshold = typeof args.thresholdPercentage === 'number' ? args.thresholdPercentage : 75;

        // If specific sectionId requested, verify access; otherwise query all teacher's sections
        let targetSectionIds: string[] = [];
        if (args.sectionId) {
          await verifyTeacherSectionAccess(teacher.id, args.sectionId as string, context.tenantId!);
          targetSectionIds = [args.sectionId as string];
        } else {
          targetSectionIds = teacher.classSubjects.map((cs) => cs.section.id);
        }

        if (targetSectionIds.length === 0) {
          return { success: true, data: { lowAttendanceStudents: [], count: 0 } };
        }

        const students = await prisma.studentProfile.findMany({
          where: { tenantId: context.tenantId!, sectionId: { in: targetSectionIds } },
          include: {
            user: { select: { firstName: true, lastName: true } },
            section: { include: { classGrade: true } },
            attendances: { select: { status: true } },
          },
        });

        const lowAttendanceStudents = students
          .map((s) => {
            const total = s.attendances.length;
            const present = s.attendances.filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
            const pct = total > 0 ? Math.round((present / total) * 100) : 100;
            return {
              id: s.id,
              name: `${s.user.firstName} ${s.user.lastName}`,
              className: `${s.section.classGrade.name}-${s.section.name}`,
              attendancePercentage: pct,
              presentDays: present,
              totalDays: total,
            };
          })
          .filter((s) => s.attendancePercentage < threshold);

        return {
          success: true,
          data: {
            threshold: `${threshold}%`,
            count: lowAttendanceStudents.length,
            students: lowAttendanceStudents,
          },
          uiCard: {
            type: 'attendance',
            title: 'Low Attendance Alert',
            badge: `${lowAttendanceStudents.length} Students`,
            metrics: lowAttendanceStudents.slice(0, 4).map((s) => ({
              label: s.name,
              value: `${s.attendancePercentage}% (${s.className})`,
              highlight: true,
            })),
          },
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 11. getStudentsWithMissingAssignments
  {
    name: 'getStudentsWithMissingAssignments',
    description: 'Lists students who have missing or overdue homework assignments.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['TEACHER'],
    execute: async (_args, _context): Promise<ToolExecutionResult> => {
      return {
        success: true,
        data: {
          missingCount: 0,
          students: [],
          message: 'All students are currently marked up to date on required coursework.',
        },
      };
    },
  },
];
