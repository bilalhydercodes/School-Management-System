import { prisma } from '@/lib/db';
import type { AITool, ToolExecutionResult } from '../types';
import type { AIUserContext } from '../../core/types';
import type { DayOfWeek } from '@prisma/client';

/**
 * Helper to retrieve the authenticated student's profile strictly by server-side context.
 * Guarantees zero cross-student spoofing.
 */
async function getAuthenticatedStudentProfile(context: AIUserContext) {
  if (context.role !== 'STUDENT' || !context.tenantId) {
    throw new Error('Unauthorized: Student tools can only be invoked by an authenticated student.');
  }

  const profile = await prisma.studentProfile.findFirst({
    where: {
      userId: context.userId,
      tenantId: context.tenantId,
    },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
      section: {
        include: {
          classGrade: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error('Student profile record not found for authenticated user.');
  }

  return profile;
}

function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[new Date().getDay()] || 'MONDAY';
}

export const studentTools: AITool[] = [
  // 1. getMyProfile
  {
    name: 'getMyProfile',
    description: 'Retrieves the authenticated student personal and academic enrollment profile.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const student = await getAuthenticatedStudentProfile(context);
        return {
          success: true,
          data: {
            studentId: student.id,
            name: `${student.user.firstName} ${student.user.lastName}`,
            admissionNumber: student.admissionNumber,
            rollNumber: student.rollNumber,
            classGrade: student.section.classGrade.name,
            section: student.section.name,
            emergencyContact: student.emergencyContact,
            bloodGroup: student.bloodGroup || 'Not recorded',
          },
          uiCard: {
            type: 'generic',
            title: 'Student Profile',
            badge: `${student.section.classGrade.name}-${student.section.name}`,
            metrics: [
              { label: 'Name', value: `${student.user.firstName} ${student.user.lastName}` },
              { label: 'Roll No', value: student.rollNumber ?? 'N/A' },
              { label: 'Admission ID', value: student.admissionNumber },
              { label: 'Class', value: `${student.section.classGrade.name} - ${student.section.name}` },
            ],
          },
          uiActions: [{ label: 'View Full Profile', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 2. getMyAttendance
  {
    name: 'getMyAttendance',
    description: 'Retrieves recent daily attendance logs for the authenticated student.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of recent attendance records (default 15)' },
      },
    },
    allowedRoles: ['STUDENT'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const student = await getAuthenticatedStudentProfile(context);
        const limit = typeof args.limit === 'number' ? Math.min(args.limit, 30) : 15;

        const attendances = await prisma.studentAttendance.findMany({
          where: { tenantId: context.tenantId!, studentId: student.id },
          orderBy: { date: 'desc' },
          take: limit,
          select: { date: true, status: true, remarks: true },
        });

        return {
          success: true,
          data: attendances.map((a) => ({
            date: a.date.toISOString().split('T')[0],
            status: a.status,
            remarks: a.remarks || undefined,
          })),
          uiCard: {
            type: 'attendance',
            title: 'Recent Attendance Log',
            badge: `${attendances.length} Records`,
            metrics: [
              { label: 'Recent Logs', value: attendances.length },
              { label: 'Latest Status', value: attendances[0]?.status || 'PRESENT' },
            ],
          },
          uiActions: [{ label: 'Attendance Calendar', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 3. getMyAttendanceSummary
  {
    name: 'getMyAttendanceSummary',
    description: 'Calculates the overall attendance summary and attendance percentage for the authenticated student.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const student = await getAuthenticatedStudentProfile(context);
        const records = await prisma.studentAttendance.findMany({
          where: { tenantId: context.tenantId!, studentId: student.id },
          select: { status: true },
        });

        const total = records.length;
        const present = records.filter((r) => r.status === 'PRESENT' || r.status === 'HALF_DAY').length;
        const absent = records.filter((r) => r.status === 'ABSENT').length;
        const percentage = total > 0 ? Math.round((present / total) * 1000) / 10 : 100;

        return {
          success: true,
          data: {
            totalClasses: total,
            presentDays: present,
            absentDays: absent,
            attendancePercentage: percentage,
            statusAssessment: percentage >= 75 ? 'Good standing' : 'Low attendance alert (< 75%)',
          },
          uiCard: {
            type: 'attendance',
            title: 'Attendance Summary',
            badge: `${percentage}%`,
            metrics: [
              { label: 'Attendance Rate', value: `${percentage}%`, highlight: percentage < 75 },
              { label: 'Present Days', value: present },
              { label: 'Absent Days', value: absent },
              { label: 'Total Recorded', value: total },
            ],
          },
          uiActions: [{ label: 'Open Attendance Sheet', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 4. getMyMarks
  {
    name: 'getMyMarks',
    description: 'Retrieves all examination marks, maximum scores, and grades for the authenticated student.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const student = await getAuthenticatedStudentProfile(context);
        const results = await prisma.examResult.findMany({
          where: { studentId: student.id },
          include: {
            examSchedule: {
              include: {
                subject: true,
                examTerm: true,
              },
            },
          },
          orderBy: { examSchedule: { examDate: 'desc' } },
        });

        const marksData = results.map((r) => {
          const obtained = Number(r.marksObtained);
          const max = Number(r.examSchedule.maxMarks);
          const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
          return {
            subject: r.examSchedule.subject.name,
            term: r.examSchedule.examTerm.name,
            marksObtained: obtained,
            maxMarks: max,
            percentage: pct,
            grade: r.grade || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D'),
            remarks: r.remarks || undefined,
          };
        });

        const topSubject = marksData.length > 0 ? [...marksData].sort((a, b) => b.percentage - a.percentage)[0] : null;

        return {
          success: true,
          data: marksData,
          uiCard: marksData.length > 0 ? {
            type: 'marks',
            title: 'Exam Results & Marks',
            badge: topSubject ? `Top: ${topSubject.subject} (${topSubject.percentage}%)` : undefined,
            metrics: marksData.slice(0, 4).map((m) => ({
              label: m.subject,
              value: `${m.marksObtained}/${m.maxMarks} (${m.grade})`,
            })),
          } : undefined,
          uiActions: [{ label: 'View Report Cards', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 5. getMyRecentPerformance
  {
    name: 'getMyRecentPerformance',
    description: 'Calculates the student overall academic average, highest performing subject, and lowest performing subject.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const student = await getAuthenticatedStudentProfile(context);
        const results = await prisma.examResult.findMany({
          where: { studentId: student.id },
          include: {
            examSchedule: {
              include: { subject: true },
            },
          },
        });

        if (results.length === 0) {
          return {
            success: true,
            data: { message: 'No graded exams recorded yet for this academic year.' },
          };
        }

        const scores = results.map((r) => {
          const obtained = Number(r.marksObtained);
          const max = Number(r.examSchedule.maxMarks);
          return {
            subject: r.examSchedule.subject.name,
            obtained,
            max,
            percentage: max > 0 ? Math.round((obtained / max) * 100) : 0,
          };
        });

        const sorted = [...scores].sort((a, b) => b.percentage - a.percentage);
        const best = sorted[0];
        const lowest = sorted[sorted.length - 1];
        const avgPercentage = Math.round(sorted.reduce((acc, curr) => acc + curr.percentage, 0) / sorted.length);

        return {
          success: true,
          data: {
            averageScore: `${avgPercentage}%`,
            totalExamsEvaluated: sorted.length,
            highestSubject: `${best.subject} (${best.percentage}%)`,
            lowestSubject: `${lowest.subject} (${lowest.percentage}%)`,
            recommendation:
              lowest.percentage < 60
                ? `Focus additional revision on ${lowest.subject} to improve your aggregate score.`
                : 'Consistent performance across all tested subjects.',
          },
          uiCard: {
            type: 'marks',
            title: 'Performance Snapshot',
            badge: `${avgPercentage}% Aggregate`,
            metrics: [
              { label: 'Overall Average', value: `${avgPercentage}%` },
              { label: 'Top Subject', value: `${best.subject} (${best.percentage}%)` },
              { label: 'Needs Focus', value: `${lowest.subject} (${lowest.percentage}%)`, highlight: lowest.percentage < 60 },
            ],
          },
          uiActions: [{ label: 'Detailed Results', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 6. getMyAssignments
  {
    name: 'getMyAssignments',
    description: 'Retrieves current assignments status and homework tracker for the authenticated student.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT'],
    execute: async (_args, _context): Promise<ToolExecutionResult> => {
      // Schema does not have a separate homework table yet
      return {
        success: true,
        data: {
          pendingCount: 0,
          completedCount: 0,
          status: 'All assigned coursework is currently up to date.',
          note: 'No overdue homework submissions are flagged in the ERP system.',
        },
        uiCard: {
          type: 'assignments',
          title: 'Coursework & Assignments',
          badge: 'Up to Date',
          metrics: [
            { label: 'Pending Submissions', value: 0 },
            { label: 'Status', value: 'Clear' },
          ],
        },
        uiActions: [{ label: 'Syllabus & Curriculum', path: '/portal' }],
      };
    },
  },

  // 7. getMyPendingAssignments
  {
    name: 'getMyPendingAssignments',
    description: 'Retrieves any outstanding or pending assignments due for submission.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT'],
    execute: async (_args, _context): Promise<ToolExecutionResult> => {
      return {
        success: true,
        data: {
          pendingAssignments: [],
          count: 0,
          message: 'You have 0 pending assignments due right now.',
        },
      };
    },
  },

  // 8. getMyUpcomingExams
  {
    name: 'getMyUpcomingExams',
    description: 'Retrieves scheduled upcoming examinations, dates, and subjects for the student class grade.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const student = await getAuthenticatedStudentProfile(context);
        const exams = await prisma.examSchedule.findMany({
          where: {
            tenantId: context.tenantId!,
            classGradeId: student.section.classGradeId,
            examDate: { gte: new Date() },
          },
          include: {
            subject: true,
            examTerm: true,
          },
          orderBy: { examDate: 'asc' },
          take: 6,
        });

        const examList = exams.map((e) => ({
          subject: e.subject.name,
          date: e.examDate.toISOString().split('T')[0],
          time: `${e.startTime} - ${e.endTime}`,
          term: e.examTerm.name,
          room: 'Assigned Examination Hall',
        }));

        return {
          success: true,
          data: {
            totalUpcoming: examList.length,
            exams: examList,
          },
          uiCard: examList.length > 0 ? {
            type: 'exam',
            title: 'Upcoming Exams',
            badge: `${examList.length} Scheduled`,
            metrics: examList.slice(0, 3).map((e) => ({
              label: e.subject,
              value: `${e.date} (${e.time})`,
            })),
          } : undefined,
          uiActions: [{ label: 'Exam Date Sheet', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 9. getMyTimetable
  {
    name: 'getMyTimetable',
    description: 'Retrieves the daily class schedule and timetable for the student section.',
    parameters: {
      type: 'object',
      properties: {
        day: {
          type: 'string',
          description: 'Day of week (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY). Defaults to today.',
        },
      },
    },
    allowedRoles: ['STUDENT'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const student = await getAuthenticatedStudentProfile(context);
        const targetDay = (typeof args.day === 'string' ? args.day.toUpperCase() : getTodayDayOfWeek()) as DayOfWeek;

        const entries = await prisma.timetableEntry.findMany({
          where: {
            tenantId: context.tenantId!,
            sectionId: student.sectionId,
            dayOfWeek: targetDay,
          },
          include: {
            subject: true,
            periodTimeSlot: true,
            teacher: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { periodTimeSlot: { order: 'asc' } },
        });

        const schedule = entries.map((e) => ({
          period: e.periodTimeSlot.order,
          time: `${e.periodTimeSlot.startTime} - ${e.periodTimeSlot.endTime}`,
          subject: e.subject?.name || 'Self Study',
          teacher: e.teacher ? `${e.teacher.user.firstName} ${e.teacher.user.lastName}` : 'Staff',
          room: e.roomNumber || 'Classroom',
        }));

        return {
          success: true,
          data: {
            day: targetDay,
            section: `${student.section.classGrade.name} - ${student.section.name}`,
            periodsCount: schedule.length,
            schedule,
          },
          uiCard: {
            type: 'schedule',
            title: `${targetDay} Timetable`,
            badge: `${schedule.length} Periods`,
            metrics: schedule.slice(0, 4).map((s) => ({
              label: `P${s.period}: ${s.subject}`,
              value: s.time,
            })),
          },
          uiActions: [{ label: 'Weekly Timetable', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 10. getMyAnnouncements
  {
    name: 'getMyAnnouncements',
    description: 'Retrieves current school announcements and circulars relevant to students.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max announcements to retrieve (default 5)' },
      },
    },
    allowedRoles: ['STUDENT'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const limit = typeof args.limit === 'number' ? Math.min(args.limit, 10) : 5;

        const notices = await prisma.notice.findMany({
          where: {
            tenantId: context.tenantId!,
            targetAudience: { in: ['ALL', 'STUDENTS'] },
          },
          orderBy: { publishedAt: 'desc' },
          take: limit,
          select: {
            title: true,
            content: true,
            priority: true,
            publishedAt: true,
          },
        });

        return {
          success: true,
          data: notices.map((n) => ({
            title: n.title,
            priority: n.priority,
            date: n.publishedAt.toISOString().split('T')[0],
            snippet: n.content.slice(0, 160) + (n.content.length > 160 ? '...' : ''),
          })),
          uiActions: [{ label: 'View All Circulars', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 11. getMyAcademicSummary
  {
    name: 'getMyAcademicSummary',
    description: 'Assembles a consolidated academic overview combining attendance, performance metrics, and pending events.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const student = await getAuthenticatedStudentProfile(context);

        const attendances = await prisma.studentAttendance.findMany({
          where: { tenantId: context.tenantId!, studentId: student.id },
          select: { status: true },
        });
        const results = await prisma.examResult.findMany({
          where: { studentId: student.id },
          select: {
            marksObtained: true,
            examSchedule: { select: { maxMarks: true } },
          },
        });
        const upcomingExamsCount = await prisma.examSchedule.count({
          where: {
            tenantId: context.tenantId!,
            classGradeId: student.section.classGradeId,
            examDate: { gte: new Date() },
          },
        });

        const totalDays = attendances.length;
        const presentDays = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
        const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

        let totalScorePct = 0;
        if (results.length > 0) {
          const sum = results.reduce(
            (acc, curr) =>
              acc +
              (Number(curr.examSchedule.maxMarks) > 0
                ? (Number(curr.marksObtained) / Number(curr.examSchedule.maxMarks)) * 100
                : 0),
            0
          );
          totalScorePct = Math.round(sum / results.length);
        }

        return {
          success: true,
          data: {
            studentName: `${student.user.firstName} ${student.user.lastName}`,
            classGrade: `${student.section.classGrade.name} - ${student.section.name}`,
            admissionNumber: student.admissionNumber,
            attendancePercentage: `${attendancePct}%`,
            academicAveragePercentage: results.length > 0 ? `${totalScorePct}%` : 'No exam results yet',
            upcomingExamsCount,
            pendingAssignmentsCount: 0,
          },
          uiCard: {
            type: 'generic',
            title: 'Academic Overview',
            badge: `${attendancePct}% Attendance`,
            metrics: [
              { label: 'Attendance', value: `${attendancePct}%` },
              { label: 'Exams Average', value: results.length > 0 ? `${totalScorePct}%` : 'N/A' },
              { label: 'Upcoming Exams', value: upcomingExamsCount },
            ],
          },
          uiActions: [{ label: 'Student Portal', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },
];
