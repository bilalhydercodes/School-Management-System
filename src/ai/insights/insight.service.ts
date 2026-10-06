import { prisma } from '@/lib/db';
import type { AIUserContext } from '../core/types';

export interface ProactiveInsight {
  id: string;
  category: 'ATTENDANCE' | 'ACADEMIC' | 'EXAM' | 'ASSIGNMENT' | 'OPERATIONS' | 'FEES';
  title: string;
  summary: string;
  severity: 'positive' | 'info' | 'warning' | 'urgent';
  metrics?: Array<{ label: string; value: string | number }>;
  action?: { label: string; path: string };
}

export class InsightService {
  /**
   * Generates live, proactive insights based strictly on verified ERP database records.
   */
  static async getProactiveInsights(context: AIUserContext): Promise<ProactiveInsight[]> {
    const { role, userId, tenantId } = context;
    if (!tenantId) return [];

    switch (role) {
      case 'STUDENT':
        return this.getStudentInsights(userId, tenantId);
      case 'PARENT':
        return this.getParentInsights(userId, tenantId);
      case 'TEACHER':
        return this.getTeacherInsights(userId, tenantId);
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return this.getAdminInsights(tenantId);
      default:
        return [];
    }
  }

  // 1. STUDENT INSIGHTS
  private static async getStudentInsights(userId: string, tenantId: string): Promise<ProactiveInsight[]> {
    const student = await prisma.studentProfile.findFirst({
      where: { userId, tenantId },
      include: {
        section: { include: { classGrade: true } },
      },
    });

    if (!student) return [];

    const insights: ProactiveInsight[] = [];

    // Attendance Insight
    const attendances = await prisma.studentAttendance.findMany({
      where: { tenantId, studentId: student.id },
      select: { status: true },
    });
    const totalDays = attendances.length;
    const presentDays = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
    const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    if (rate < 75) {
      insights.push({
        id: 'student-att-risk',
        category: 'ATTENDANCE',
        title: 'Attendance Shortage Risk',
        summary: `Your attendance is currently ${rate}%, which is below the mandatory 75% institutional threshold. Regular attendance is required for exam eligibility.`,
        severity: 'urgent',
        metrics: [
          { label: 'Current Rate', value: `${rate}%` },
          { label: 'Required', value: '75%' },
          { label: 'Days Attended', value: `${presentDays}/${totalDays}` },
        ],
        action: { label: 'View Attendance', path: '/portal' },
      });
    } else {
      insights.push({
        id: 'student-att-good',
        category: 'ATTENDANCE',
        title: 'Strong Attendance Record',
        summary: `Great commitment! Your overall attendance is in good standing at ${rate}%.`,
        severity: 'positive',
        metrics: [
          { label: 'Attendance', value: `${rate}%` },
          { label: 'Status', value: 'Eligible' },
        ],
        action: { label: 'Attendance Sheet', path: '/portal' },
      });
    }

    // Upcoming Exam Insight
    const upcomingExams = await prisma.examSchedule.findMany({
      where: {
        tenantId,
        classGradeId: student.section.classGradeId,
        examDate: { gte: new Date() },
      },
      include: { subject: true, examTerm: true },
      orderBy: { examDate: 'asc' },
      take: 3,
    });

    if (upcomingExams.length > 0) {
      const nearest = upcomingExams[0];
      const examDateStr = nearest.examDate.toISOString().split('T')[0];
      insights.push({
        id: 'student-exam-prep',
        category: 'EXAM',
        title: 'Upcoming Assessment Scheduled',
        summary: `Your next examination (${nearest.subject.name} - ${nearest.examTerm.name}) is scheduled on ${examDateStr}.`,
        severity: 'info',
        metrics: [
          { label: 'Subject', value: nearest.subject.name },
          { label: 'Date', value: examDateStr },
          { label: 'Timing', value: `${nearest.startTime} - ${nearest.endTime}` },
        ],
        action: { label: 'View Exam Timetable', path: '/portal' },
      });
    }

    // Academic Performance Insight
    const examResults = await prisma.examResult.findMany({
      where: { studentId: student.id },
      include: {
        examSchedule: { include: { subject: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (examResults.length > 0) {
      const scored = examResults.map((r) => ({
        subject: r.examSchedule.subject.name,
        pct: Number(r.examSchedule.maxMarks) > 0 ? (Number(r.marksObtained) / Number(r.examSchedule.maxMarks)) * 100 : 0,
      }));
      const lowest = [...scored].sort((a, b) => a.pct - b.pct)[0];

      if (lowest && lowest.pct < 65) {
        insights.push({
          id: 'student-acad-focus',
          category: 'ACADEMIC',
          title: `Focus Recommended in ${lowest.subject}`,
          summary: `Your score in ${lowest.subject} is currently ${Math.round(lowest.pct)}%. Consider revising fundamental concepts or requesting teacher feedback.`,
          severity: 'warning',
          metrics: [
            { label: 'Subject', value: lowest.subject },
            { label: 'Score', value: `${Math.round(lowest.pct)}%` },
          ],
          action: { label: 'Ask AI Study Plan', path: '/portal' },
        });
      }
    }

    return insights;
  }

  // 2. PARENT INSIGHTS
  private static async getParentInsights(userId: string, tenantId: string): Promise<ProactiveInsight[]> {
    const parent = await prisma.parentProfile.findFirst({
      where: { userId, tenantId },
      include: {
        students: {
          include: {
            student: {
              include: {
                user: true,
                section: { include: { classGrade: true } },
                attendances: { select: { status: true } },
                feeInvoices: {
                  where: { status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
                  select: { balanceAmount: true, dueDate: true, invoiceNumber: true },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) return [];

    const insights: ProactiveInsight[] = [];

    for (const link of parent.students) {
      const s = link.student;
      const childName = `${s.user.firstName} ${s.user.lastName}`;

      // Attendance
      const total = s.attendances.length;
      const present = s.attendances.filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;

      if (rate < 75) {
        insights.push({
          id: `parent-att-${s.id}`,
          category: 'ATTENDANCE',
          title: `Attendance Alert: ${childName}`,
          summary: `${childName}'s attendance is currently ${rate}%, which is below the required 75% mark. Please review attendance records.`,
          severity: 'warning',
          metrics: [
            { label: 'Child', value: childName },
            { label: 'Attendance', value: `${rate}%` },
            { label: 'Classes Attended', value: `${present}/${total}` },
          ],
          action: { label: "Review Child's Attendance", path: '/portal' },
        });
      }

      // Outstanding Fees
      if (s.feeInvoices.length > 0) {
        const totalDue = s.feeInvoices.reduce((acc, inv) => acc + Number(inv.balanceAmount), 0);
        insights.push({
          id: `parent-fee-${s.id}`,
          category: 'FEES',
          title: `Pending Fee Due for ${childName}`,
          summary: `There is an outstanding fee balance of ₹${totalDue} across ${s.feeInvoices.length} invoice(s).`,
          severity: 'urgent',
          metrics: [
            { label: 'Child', value: childName },
            { label: 'Outstanding Balance', value: `₹${totalDue}` },
          ],
          action: { label: 'Pay Fees Online', path: '/portal' },
        });
      }
    }

    return insights;
  }

  // 3. TEACHER INSIGHTS
  private static async getTeacherInsights(userId: string, tenantId: string): Promise<ProactiveInsight[]> {
    const teacher = await prisma.teacherProfile.findFirst({
      where: { userId, tenantId },
      include: {
        classSubjects: {
          include: {
            section: { include: { classGrade: true } },
            subject: true,
          },
        },
      },
    });

    if (!teacher) return [];

    const insights: ProactiveInsight[] = [];
    const assignedCount = teacher.classSubjects.length;

    insights.push({
      id: 'teacher-classes-overview',
      category: 'ACADEMIC',
      title: 'Active Faculty Assignments',
      summary: `You are actively assigned to instruct ${assignedCount} class sections across ${teacher.department} department.`,
      severity: 'info',
      metrics: [
        { label: 'Assigned Classes', value: assignedCount },
        { label: 'Department', value: teacher.department },
      ],
      action: { label: 'View Classes', path: '/teacher' },
    });

    // Check students with low attendance in assigned classes
    if (teacher.classSubjects.length > 0) {
      const sectionIds = Array.from(new Set(teacher.classSubjects.map((cs) => cs.sectionId)));
      const studentsInSections = await prisma.studentProfile.findMany({
        where: { tenantId, sectionId: { in: sectionIds } },
        include: {
          attendances: { select: { status: true } },
          user: { select: { firstName: true, lastName: true } },
        },
        take: 30,
      });

      const lowAttStudents = studentsInSections.filter((st) => {
        const total = st.attendances.length;
        if (total === 0) return false;
        const pres = st.attendances.filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
        return (pres / total) * 100 < 75;
      });

      if (lowAttStudents.length > 0) {
        insights.push({
          id: 'teacher-att-alert',
          category: 'ATTENDANCE',
          title: `${lowAttStudents.length} Students with Attendance < 75%`,
          summary: `${lowAttStudents.length} students across your assigned sections have attendance below the required 75% mark.`,
          severity: 'warning',
          metrics: [
            { label: 'At-Risk Students', value: lowAttStudents.length },
            { label: 'Action', value: 'Review Rosters' },
          ],
          action: { label: 'Class Students', path: '/teacher' },
        });
      }
    }

    return insights;
  }

  // 4. ADMIN INSIGHTS
  private static async getAdminInsights(tenantId: string): Promise<ProactiveInsight[]> {
    const insights: ProactiveInsight[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today Attendance Completion
    const [totalStudents, todayMarked] = await Promise.all([
      prisma.studentProfile.count({ where: { tenantId } }),
      prisma.studentAttendance.count({ where: { tenantId, date: today } }),
    ]);

    if (totalStudents > 0 && todayMarked < totalStudents) {
      insights.push({
        id: 'admin-att-incomplete',
        category: 'ATTENDANCE',
        title: "Today's Attendance Incomplete",
        summary: `Only ${todayMarked} of ${totalStudents} student attendance records have been marked today.`,
        severity: 'warning',
        metrics: [
          { label: 'Marked Today', value: `${todayMarked}/${totalStudents}` },
          { label: 'Pending', value: totalStudents - todayMarked },
        ],
        action: { label: 'Attendance Management', path: '/admin' },
      });
    }

    // Overdue Fees
    const overdueInvoices = await prisma.feeInvoice.findMany({
      where: { tenantId, status: 'OVERDUE' },
      select: { balanceAmount: true },
    });

    if (overdueInvoices.length > 0) {
      const totalOverdue = overdueInvoices.reduce((acc, i) => acc + Number(i.balanceAmount), 0);
      insights.push({
        id: 'admin-fee-overdue',
        category: 'FEES',
        title: 'Overdue Fee Collections',
        summary: `${overdueInvoices.length} invoices are currently overdue, totaling ₹${totalOverdue}.`,
        severity: 'urgent',
        metrics: [
          { label: 'Overdue Invoices', value: overdueInvoices.length },
          { label: 'Outstanding Amount', value: `₹${totalOverdue}` },
        ],
        action: { label: 'Fee Management', path: '/admin/fees' },
      });
    }

    return insights;
  }
}
