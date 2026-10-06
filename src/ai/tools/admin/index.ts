import { prisma } from '@/lib/db';
import type { AITool, ToolExecutionResult } from '../types';
import type { AIUserContext } from '../../core/types';

function verifyAdminSession(context: AIUserContext) {
  if (context.role !== 'ADMIN' && context.role !== 'SUPER_ADMIN' && context.role !== 'ACCOUNTANT') {
    throw new Error('Unauthorized: Admin tools require administrative privileges.');
  }
  if (!context.tenantId) {
    throw new Error('Tenant context missing: Administrative queries require an active school tenant.');
  }
}

export const adminTools: AITool[] = [
  // 1. getSchoolOverview
  {
    name: 'getSchoolOverview',
    description: 'Retrieves an executive summary of the school, current enrollment, teaching staff, and active academic year.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifyAdminSession(context);
        const tenantId = context.tenantId!;

        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { name: true, board: true, email: true, phone: true },
        });
        const academicYear = await prisma.academicYear.findFirst({
          where: { tenantId, isCurrent: true },
          select: { name: true, startDate: true, endDate: true },
        });
        const studentCount = await prisma.studentProfile.count({ where: { tenantId } });
        const teacherCount = await prisma.teacherProfile.count({ where: { tenantId } });

        return {
          success: true,
          data: {
            schoolName: tenant?.name || 'School',
            board: tenant?.board || 'CBSE',
            academicYear: academicYear?.name || 'Current Year',
            totalStudents: studentCount,
            totalTeachers: teacherCount,
            activeStudents: studentCount,
            activeTeachers: teacherCount,
          },
          uiCard: {
            type: 'generic',
            title: tenant?.name || 'Institution Overview',
            badge: `${tenant?.board || 'CBSE'} Board`,
            metrics: [
              { label: 'Students', value: studentCount },
              { label: 'Teachers', value: teacherCount },
              { label: 'Academic Year', value: academicYear?.name || '2026-27' },
            ],
          },
          uiActions: [
            { label: 'Students Directory', path: '/admin/students' },
            { label: 'Teachers Directory', path: '/admin/teachers' },
          ],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 2. getStudentStatistics
  {
    name: 'getStudentStatistics',
    description: 'Retrieves enrollment statistics broken down by class grades and sections.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifyAdminSession(context);
        const tenantId = context.tenantId!;

        const classGrades = await prisma.classGrade.findMany({
          where: { tenantId },
          include: {
            sections: {
              include: {
                _count: { select: { students: true } },
              },
            },
          },
          orderBy: { numericOrder: 'asc' },
        });

        const breakdown = classGrades.map((cg) => {
          const totalInGrade = cg.sections.reduce((acc, s) => acc + s._count.students, 0);
          return {
            grade: cg.name,
            totalStudents: totalInGrade,
            sections: cg.sections.map((s) => ({ section: s.name, count: s._count.students })),
          };
        });

        const grandTotal = breakdown.reduce((acc, g) => acc + g.totalStudents, 0);

        return {
          success: true,
          data: {
            totalStudents: grandTotal,
            classesCount: breakdown.length,
            gradeBreakdown: breakdown,
          },
          uiActions: [{ label: 'Student Directory', path: '/admin/students' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 3. getTeacherStatistics
  {
    name: 'getTeacherStatistics',
    description: 'Retrieves faculty statistics, department distributions, and designations.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifyAdminSession(context);
        const tenantId = context.tenantId!;

        const teachers = await prisma.teacherProfile.findMany({
          where: { tenantId },
          select: { department: true, designation: true, status: true },
        });

        const departmentCounts: Record<string, number> = {};
        for (const t of teachers) {
          const dept = t.department || 'General';
          departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        }

        return {
          success: true,
          data: {
            totalFaculty: teachers.length,
            activeCount: teachers.filter((t) => t.status === 'ACTIVE').length,
            departments: departmentCounts,
          },
          uiActions: [{ label: 'Staff Directory', path: '/admin/teachers' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 4. getAttendanceOverview
  {
    name: 'getAttendanceOverview',
    description: 'Retrieves institution-wide student and staff attendance rates for today or a specific date.',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format (defaults to today)' },
      },
    },
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    execute: async (args, context): Promise<ToolExecutionResult> => {
      try {
        verifyAdminSession(context);
        const tenantId = context.tenantId!;

        const targetDate = args.date ? new Date(args.date as string) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const studentRecords = await prisma.studentAttendance.findMany({
          where: { tenantId, date: targetDate },
          select: { status: true },
        });
        const staffRecords = await prisma.staffAttendance.findMany({
          where: { tenantId, date: targetDate },
          select: { status: true },
        });
        const totalStudents = await prisma.studentProfile.count({ where: { tenantId } });
        const totalStaff = await prisma.teacherProfile.count({ where: { tenantId } });

        const studentPresent = studentRecords.filter((r) => r.status === 'PRESENT' || r.status === 'HALF_DAY').length;
        const studentRate = studentRecords.length > 0 ? Math.round((studentPresent / studentRecords.length) * 100) : 0;

        const staffPresent = staffRecords.filter((r) => r.status === 'PRESENT' || r.status === 'HALF_DAY').length;
        const staffRate = staffRecords.length > 0 ? Math.round((staffPresent / staffRecords.length) * 100) : 0;

        return {
          success: true,
          data: {
            date: targetDate.toISOString().split('T')[0],
            totalRecordsToday: studentRecords.length,
            studentAttendance: {
              totalEnrolled: totalStudents,
              totalMarkedToday: studentRecords.length,
              present: studentPresent,
              absent: studentRecords.length - studentPresent,
              attendanceRate: `${studentRate}%`,
              completed: studentRecords.length >= totalStudents && totalStudents > 0,
            },
            staffAttendance: {
              totalStaff,
              present: staffPresent,
              rate: `${staffRate}%`,
            },
          },
          uiCard: {
            type: 'attendance',
            title: "Today's School Attendance",
            badge: `${studentRate}% Rate`,
            metrics: [
              { label: 'Students Present', value: `${studentPresent}/${studentRecords.length}` },
              { label: 'Student Rate', value: `${studentRate}%` },
              { label: 'Staff Present', value: `${staffPresent}/${totalStaff}` },
            ],
          },
          uiActions: [{ label: 'Attendance Dashboard', path: '/admin/attendance' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 5. getFeeOverview
  {
    name: 'getFeeOverview',
    description: 'Retrieves financial fee collections, pending invoices, and overdue amounts across the school.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifyAdminSession(context);
        const tenantId = context.tenantId!;

        const invoices = await prisma.feeInvoice.findMany({
          where: { tenantId },
          select: { totalAmount: true, paidAmount: true, balanceAmount: true, status: true },
        });
        const payments = await prisma.feePayment.findMany({
          where: { tenantId },
          select: { amount: true },
        });

        const totalInvoiced = invoices.reduce((acc, i) => acc + Number(i.totalAmount), 0);
        const totalCollected = invoices.reduce((acc, i) => acc + Number(i.paidAmount), 0);
        const totalPending = invoices.reduce((acc, i) => acc + Number(i.balanceAmount), 0);

        const pendingCount = invoices.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE').length;
        const paidCount = invoices.filter((i) => i.status === 'PAID').length;

        return {
          success: true,
          data: {
            totalInvoiced: `₹${totalInvoiced}`,
            totalCollected: `₹${totalCollected}`,
            totalOutstanding: `₹${totalPending}`,
            invoicesBreakdown: {
              total: invoices.length,
              pendingOrOverdue: pendingCount,
              paid: paidCount,
            },
            collectionEfficiencyPercentage: totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100,
          },
          uiCard: {
            type: 'fee',
            title: 'Fee Collection Summary',
            badge: `₹${totalCollected} Collected`,
            metrics: [
              { label: 'Total Invoiced', value: `₹${totalInvoiced}` },
              { label: 'Collected', value: `₹${totalCollected}` },
              { label: 'Outstanding Due', value: `₹${totalPending}`, highlight: totalPending > 0 },
            ],
          },
          uiActions: [{ label: 'Fee Management', path: '/admin/fees' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 6. getAcademicOverview
  {
    name: 'getAcademicOverview',
    description: 'Retrieves current academic year configuration, class grades, and active examination terms.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifyAdminSession(context);
        const tenantId = context.tenantId!;

        const academicYear = await prisma.academicYear.findFirst({
          where: { tenantId, isCurrent: true },
          select: { name: true },
        });
        const classGradesCount = await prisma.classGrade.count({ where: { tenantId } });
        const examTerms = await prisma.examTerm.findMany({
          where: { tenantId },
          select: { name: true },
        });

        return {
          success: true,
          data: {
            academicYear: academicYear?.name || 'Current',
            classGradesCount,
            examTerms: examTerms.map((t) => t.name),
          },
          uiActions: [{ label: 'Academics & Exams', path: '/admin/academics' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 7. getRecentAnnouncements
  {
    name: 'getRecentAnnouncements',
    description: 'Retrieves recently published school circulars, notices, and target audiences.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifyAdminSession(context);
        const notices = await prisma.notice.findMany({
          where: { tenantId: context.tenantId! },
          orderBy: { publishedAt: 'desc' },
          take: 5,
          select: { title: true, priority: true, targetAudience: true, publishedAt: true },
        });

        return {
          success: true,
          data: notices.map((n) => ({
            title: n.title,
            priority: n.priority,
            audience: n.targetAudience,
            date: n.publishedAt.toISOString().split('T')[0],
          })),
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 8. getOperationalAlerts
  {
    name: 'getOperationalAlerts',
    description: 'Scans ERP records for action items requiring administrative attention (e.g. pending fees, unrecorded attendance).',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifyAdminSession(context);
        const tenantId = context.tenantId!;
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const unmarkedCount = await prisma.studentAttendance.count({ where: { tenantId, date: todayDate } });
        const overdueInvoicesCount = await prisma.feeInvoice.count({ where: { tenantId, status: 'OVERDUE' } });
        const pendingSubs = await prisma.teacherSubstitution.count({ where: { tenantId, status: 'ASSIGNED', date: todayDate } });

        const alerts: Array<{ message: string; severity: string }> = [];
        if (unmarkedCount === 0) {
          alerts.push({ message: "Today's student attendance has not been completed yet.", severity: 'HIGH' });
        }
        if (overdueInvoicesCount > 0) {
          alerts.push({ message: `${overdueInvoicesCount} student fee invoices are currently overdue.`, severity: 'MEDIUM' });
        }
        if (pendingSubs > 0) {
          alerts.push({ message: `${pendingSubs} teacher substitutions are active for today.`, severity: 'INFO' });
        }

        return {
          success: true,
          data: {
            totalAlerts: alerts.length,
            alerts: alerts.length > 0 ? alerts : [{ message: 'All daily ERP operations normal.', severity: 'NONE' }],
          },
          uiCard: {
            type: 'generic',
            title: 'Operational Status',
            badge: alerts.length === 0 ? 'Normal' : `${alerts.length} Action Items`,
            metrics: alerts.map((a) => ({
              label: a.severity,
              value: a.message,
              highlight: a.severity === 'HIGH',
            })),
          },
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 9. getSchoolCalendar
  {
    name: 'getSchoolCalendar',
    description: 'Retrieves upcoming institutional events, holidays, and academic milestones from the calendar.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        verifyAdminSession(context);
        const events = await prisma.calendarEvent.findMany({
          where: {
            tenantId: context.tenantId!,
            startDate: { gte: new Date() },
            status: 'ACTIVE',
          },
          orderBy: { startDate: 'asc' },
          take: 6,
          select: {
            title: true,
            eventType: true,
            startDate: true,
            endDate: true,
            isHoliday: true,
          },
        });

        return {
          success: true,
          data: events.map((e) => ({
            title: e.title,
            type: e.eventType,
            startDate: e.startDate.toISOString().split('T')[0],
            isHoliday: e.isHoliday,
          })),
          uiActions: [{ label: 'Academic Calendar', path: '/admin/calendar' }],
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },
];
