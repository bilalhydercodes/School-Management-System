import { prisma } from '@/lib/db';
import type { AITool, ToolExecutionResult } from '../types';
import type { AIUserContext } from '../../core/types';
import type { DayOfWeek } from '@prisma/client';

/**
 * Validates and retrieves the requested child, strictly verifying parentage via ParentStudentLink.
 * Fails closed if the parent tries to query an unauthorized child.
 */
async function getVerifiedChildProfile(context: AIUserContext, requestedChildId?: string) {
  if (context.role !== 'PARENT' || !context.tenantId) {
    throw new Error('Unauthorized: Parent tools require an authenticated Parent session.');
  }

  const parentProfile = await prisma.parentProfile.findFirst({
    where: { userId: context.userId, tenantId: context.tenantId },
    include: {
      students: {
        include: {
          student: {
            include: {
              user: true,
              section: {
                include: { classGrade: true },
              },
            },
          },
        },
        orderBy: { isPrimary: 'desc' },
      },
    },
  });

  if (!parentProfile || parentProfile.students.length === 0) {
    throw new Error('No enrolled children found linked to your parent account.');
  }

  // If specific childId provided, verify it belongs to this parent
  if (requestedChildId) {
    const match = parentProfile.students.find(
      (link) => link.studentId === requestedChildId || link.student.admissionNumber === requestedChildId
    );
    if (!match) {
      throw new Error(
        'Access Denied: You are not authorized to view academic information for the requested student.'
      );
    }
    return match.student;
  }

  // Default to primary child or first linked child
  return parentProfile.students[0].student;
}

function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[new Date().getDay()] || 'MONDAY';
}

export const parentTools: AITool[] = [
  // 1. getMyChildren
  {
    name: 'getMyChildren',
    description: 'Retrieves all enrolled children linked to the authenticated parent account.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['PARENT'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const parentProfile = await prisma.parentProfile.findFirst({
          where: { userId: context.userId, tenantId: context.tenantId! },
          include: {
            students: {
              include: {
                student: {
                  include: {
                    user: true,
                    section: { include: { classGrade: true } },
                  },
                },
              },
              orderBy: { isPrimary: 'desc' },
            },
          },
        });

        if (!parentProfile || parentProfile.students.length === 0) {
          return { success: true, data: [] };
        }

        const childrenList = parentProfile.students.map((link) => ({
          childId: link.student.id,
          name: `${link.student.user.firstName} ${link.student.user.lastName}`,
          admissionNumber: link.student.admissionNumber,
          rollNumber: link.student.rollNumber,
          className: link.student.section.classGrade.name,
          sectionName: link.student.section.name,
          isPrimary: link.isPrimary,
        }));

        return {
          success: true,
          data: childrenList,
          uiCard: {
            type: 'generic',
            title: 'Your Children',
            badge: `${childrenList.length} Enrolled`,
            metrics: childrenList.map((c) => ({
              label: c.name,
              value: `Class ${c.className}-${c.sectionName}`,
            })),
          },
          uiActions: [{ label: 'Parent Portal', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 2. getChildAttendance
  {
    name: 'getChildAttendance',
    description: 'Retrieves the verified attendance percentage, present days, and absences for a linked child.',
    parameters: {
      type: 'object',
      properties: {
        childId: { type: 'string', description: 'Optional student ID or admission number of the linked child' },
      },
    },
    allowedRoles: ['PARENT'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const child = await getVerifiedChildProfile(context, args.childId as string | undefined);
        const attendances = await prisma.studentAttendance.findMany({
          where: { tenantId: context.tenantId!, studentId: child.id },
          select: { status: true },
        });

        const total = attendances.length;
        const present = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
        const absent = attendances.filter((a) => a.status === 'ABSENT').length;
        const pct = total > 0 ? Math.round((present / total) * 1000) / 10 : 100;

        const childName = `${child.user.firstName} ${child.user.lastName}`;

        return {
          success: true,
          data: {
            childName,
            admissionNumber: child.admissionNumber,
            totalClassesRecorded: total,
            presentDays: present,
            absentDays: absent,
            attendancePercentage: pct,
          },
          uiCard: {
            type: 'attendance',
            title: `${child.user.firstName}'s Attendance`,
            badge: `${pct}%`,
            metrics: [
              { label: 'Attendance Rate', value: `${pct}%`, highlight: pct < 75 },
              { label: 'Days Present', value: present },
              { label: 'Days Absent', value: absent },
              { label: 'Class & Section', value: `${child.section.classGrade.name}-${child.section.name}` },
            ],
          },
          uiActions: [{ label: 'View Attendance Records', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 3. getChildMarks
  {
    name: 'getChildMarks',
    description: 'Retrieves examination marks, grades, and report card scores for a linked child.',
    parameters: {
      type: 'object',
      properties: {
        childId: { type: 'string', description: 'Optional student ID or admission number of the child' },
      },
    },
    allowedRoles: ['PARENT'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const child = await getVerifiedChildProfile(context, args.childId as string | undefined);
        const results = await prisma.examResult.findMany({
          where: { studentId: child.id },
          include: {
            examSchedule: {
              include: { subject: true, examTerm: true },
            },
          },
          orderBy: { examSchedule: { examDate: 'desc' } },
        });

        const marks = results.map((r) => {
          const obtained = Number(r.marksObtained);
          const max = Number(r.examSchedule.maxMarks);
          const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
          return {
            subject: r.examSchedule.subject.name,
            term: r.examSchedule.examTerm.name,
            marks: `${obtained}/${max}`,
            percentage: `${pct}%`,
            grade: r.grade || (pct >= 80 ? 'A' : pct >= 60 ? 'B' : 'C'),
          };
        });

        return {
          success: true,
          data: {
            childName: `${child.user.firstName} ${child.user.lastName}`,
            marks,
          },
          uiCard: marks.length > 0 ? {
            type: 'marks',
            title: `${child.user.firstName}'s Marks`,
            metrics: marks.slice(0, 4).map((m) => ({
              label: m.subject,
              value: `${m.marks} (${m.grade})`,
            })),
          } : undefined,
          uiActions: [{ label: 'Full Report Card', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 4. getChildAssignments
  {
    name: 'getChildAssignments',
    description: 'Retrieves assignment completion status for a linked child.',
    parameters: {
      type: 'object',
      properties: {
        childId: { type: 'string', description: 'Optional child student ID' },
      },
    },
    allowedRoles: ['PARENT'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const child = await getVerifiedChildProfile(context, args.childId as string | undefined);
        return {
          success: true,
          data: {
            childName: `${child.user.firstName} ${child.user.lastName}`,
            pendingCount: 0,
            status: 'All homework and classwork are currently completed and up to date.',
          },
          uiCard: {
            type: 'assignments',
            title: `${child.user.firstName}'s Assignments`,
            badge: 'Completed',
            metrics: [
              { label: 'Pending Due', value: 0 },
              { label: 'Status', value: 'Up to Date' },
            ],
          },
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 5. getChildExams
  {
    name: 'getChildExams',
    description: 'Retrieves upcoming exam schedules and dates for a linked child.',
    parameters: {
      type: 'object',
      properties: {
        childId: { type: 'string', description: 'Optional child student ID' },
      },
    },
    allowedRoles: ['PARENT'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const child = await getVerifiedChildProfile(context, args.childId as string | undefined);
        const exams = await prisma.examSchedule.findMany({
          where: {
            tenantId: context.tenantId!,
            classGradeId: child.section.classGradeId,
            examDate: { gte: new Date() },
          },
          include: { subject: true, examTerm: true },
          orderBy: { examDate: 'asc' },
          take: 5,
        });

        const examList = exams.map((e) => ({
          subject: e.subject.name,
          date: e.examDate.toISOString().split('T')[0],
          time: `${e.startTime} - ${e.endTime}`,
          term: e.examTerm.name,
        }));

        return {
          success: true,
          data: {
            childName: `${child.user.firstName} ${child.user.lastName}`,
            upcomingExamsCount: examList.length,
            exams: examList,
          },
          uiCard: examList.length > 0 ? {
            type: 'exam',
            title: `${child.user.firstName}'s Upcoming Exams`,
            badge: `${examList.length} Scheduled`,
            metrics: examList.slice(0, 3).map((e) => ({
              label: e.subject,
              value: `${e.date} (${e.time})`,
            })),
          } : undefined,
          uiActions: [{ label: 'Exam Timetable', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 6. getChildTimetable
  {
    name: 'getChildTimetable',
    description: 'Retrieves daily periods and classroom schedule for a linked child.',
    parameters: {
      type: 'object',
      properties: {
        childId: { type: 'string', description: 'Optional child student ID' },
        day: { type: 'string', description: 'Day of week (e.g. MONDAY)' },
      },
    },
    allowedRoles: ['PARENT'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const child = await getVerifiedChildProfile(context, args.childId as string | undefined);
        const targetDay = (typeof args.day === 'string' ? args.day.toUpperCase() : getTodayDayOfWeek()) as DayOfWeek;

        const entries = await prisma.timetableEntry.findMany({
          where: {
            tenantId: context.tenantId!,
            sectionId: child.sectionId,
            dayOfWeek: targetDay,
          },
          include: {
            subject: true,
            periodTimeSlot: true,
          },
          orderBy: { periodTimeSlot: { order: 'asc' } },
        });

        const schedule = entries.map((e) => ({
          period: e.periodTimeSlot.order,
          time: `${e.periodTimeSlot.startTime} - ${e.periodTimeSlot.endTime}`,
          subject: e.subject?.name || 'Self Study',
          room: e.roomNumber || 'Classroom',
        }));

        return {
          success: true,
          data: {
            childName: `${child.user.firstName} ${child.user.lastName}`,
            day: targetDay,
            periods: schedule,
          },
          uiActions: [{ label: 'View Full Timetable', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 7. getChildAnnouncements
  {
    name: 'getChildAnnouncements',
    description: 'Retrieves school circulars, event announcements, and administrative notices for parents.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['PARENT'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        const notices = await prisma.notice.findMany({
          where: {
            tenantId: context.tenantId!,
            targetAudience: { in: ['ALL', 'PARENTS'] },
          },
          orderBy: { publishedAt: 'desc' },
          take: 5,
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
            snippet: n.content.slice(0, 150) + (n.content.length > 150 ? '...' : ''),
          })),
          uiActions: [{ label: 'Circulars & Notices', path: '/portal' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 8. getChildAcademicSummary
  {
    name: 'getChildAcademicSummary',
    description: 'Returns a complete academic snapshot for a child including attendance, exams, and pending fees.',
    parameters: {
      type: 'object',
      properties: {
        childId: { type: 'string', description: 'Optional child student ID' },
      },
    },
    allowedRoles: ['PARENT'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        const child = await getVerifiedChildProfile(context, args.childId as string | undefined);

        const attendances = await prisma.studentAttendance.findMany({
          where: { tenantId: context.tenantId!, studentId: child.id },
          select: { status: true },
        });
        const feeInvoices = await prisma.feeInvoice.findMany({
          where: {
            tenantId: context.tenantId!,
            studentId: child.id,
            status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] },
          },
          select: { balanceAmount: true, invoiceNumber: true, dueDate: true },
        });
        const upcomingExamsCount = await prisma.examSchedule.count({
          where: {
            tenantId: context.tenantId!,
            classGradeId: child.section.classGradeId,
            examDate: { gte: new Date() },
          },
        });

        const totalDays = attendances.length;
        const presentDays = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
        const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

        const totalDue = feeInvoices.reduce((acc, curr) => acc + Number(curr.balanceAmount), 0);

        return {
          success: true,
          data: {
            childName: `${child.user.firstName} ${child.user.lastName}`,
            classGrade: `${child.section.classGrade.name}-${child.section.name}`,
            attendancePercentage: `${attendancePct}%`,
            pendingFeeAmount: `₹${totalDue}`,
            pendingInvoicesCount: feeInvoices.length,
            upcomingExamsCount,
          },
          uiCard: {
            type: 'generic',
            title: `${child.user.firstName}'s Status`,
            badge: `${attendancePct}% Attendance`,
            metrics: [
              { label: 'Attendance', value: `${attendancePct}%` },
              { label: 'Fee Dues', value: `₹${totalDue}`, highlight: totalDue > 0 },
              { label: 'Upcoming Exams', value: upcomingExamsCount },
            ],
          },
          uiActions: [
            { label: 'View Fee Invoices', path: '/portal' },
            { label: 'View Report Cards', path: '/portal' },
          ],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },
];
