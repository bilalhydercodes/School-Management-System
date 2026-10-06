import { prisma } from '@/lib/db';
import type { AIUserContext } from '../core/types';
import type { ActionProposal, ActionExecutionResult, ActionType } from './types';

/**
 * Action Registry
 * Independent authorization & execution layer for AI proposed actions.
 * Rule: The action layer must independently enforce authorization.
 * Never rely on AI or client claims about tenantId or role.
 */

export async function executeAIAction(
  context: AIUserContext,
  actionType: ActionType,
  payload: Record<string, any>
): Promise<ActionExecutionResult> {
  switch (actionType) {
    case 'createAnnouncement':
      return await executeCreateAnnouncement(context, payload);
    case 'createStudyPlan':
      return await executeCreateStudyPlan(context, payload);
    case 'generateAttendanceReport':
      return await executeGenerateAttendanceReport(context, payload);
    default:
      return {
        success: false,
        message: `Unknown action type: ${actionType}`,
        error: 'INVALID_ACTION_TYPE',
      };
  }
}

/**
 * ACTION: createAnnouncement
 * Allowed: TEACHER, ADMIN, SUPERADMIN
 */
async function executeCreateAnnouncement(
  context: AIUserContext,
  payload: Record<string, any>
): Promise<ActionExecutionResult> {
  const allowedRoles = ['TEACHER', 'ADMIN', 'SUPERADMIN'];
  if (!allowedRoles.includes(context.role.toUpperCase())) {
    return {
      success: false,
      message: 'Unauthorized: Only teachers and administrators can publish announcements.',
      error: 'ROLE_UNAUTHORIZED',
    };
  }

  if (!context.tenantId) {
    return {
      success: false,
      message: 'Tenant context is missing.',
      error: 'TENANT_REQUIRED',
    };
  }

  const title = (payload.title || '').trim();
  const content = (payload.content || '').trim();

  if (!title || !content) {
    return {
      success: false,
      message: 'Announcement title and content cannot be empty.',
      error: 'VALIDATION_FAILED',
    };
  }

  try {
    const notice = await prisma.notice.create({
      data: {
        tenantId: context.tenantId,
        authorId: context.userId,
        title,
        content,
        priority: payload.priority === 'URGENT' ? 'URGENT' : payload.priority === 'IMPORTANT' ? 'IMPORTANT' : 'NORMAL',
        targetAudience: payload.targetAudience === 'STUDENTS' ? 'STUDENTS' : 'ALL',
      },
    });

    return {
      success: true,
      message: `Announcement "${notice.title}" has been successfully created and published.`,
      data: {
        noticeId: notice.id,
        title: notice.title,
        publishedAt: notice.publishedAt,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to create announcement: ${error?.message || 'Database error'}`,
      error: 'EXECUTION_FAILED',
    };
  }
}

/**
 * ACTION: createStudyPlan
 * Allowed: STUDENT
 */
async function executeCreateStudyPlan(
  context: AIUserContext,
  payload: Record<string, any>
): Promise<ActionExecutionResult> {
  if (context.role.toUpperCase() !== 'STUDENT') {
    return {
      success: false,
      message: 'Unauthorized: Study plan generation is specifically tailored for enrolled students.',
      error: 'ROLE_UNAUTHORIZED',
    };
  }

  if (!context.tenantId) {
    return {
      success: false,
      message: 'Tenant context missing.',
      error: 'TENANT_REQUIRED',
    };
  }

  try {
    const student = await prisma.studentProfile.findFirst({
      where: {
        userId: context.userId,
        tenantId: context.tenantId,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        section: {
          include: {
            classGrade: true,
          },
        },
      },
    });

    if (!student) {
      return {
        success: false,
        message: 'Student profile not found for this user.',
        error: 'STUDENT_NOT_FOUND',
      };
    }

    // Query recent exam results to identify subjects needing attention
    const examResults = await prisma.examResult.findMany({
      where: {
        studentId: student.id,
      },
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: {
        examSchedule: {
          include: {
            subject: true,
          },
        },
      },
    });

    const subjectStats: Record<string, { totalScore: number; count: number; name: string }> = {};
    for (const r of examResults) {
      const subName = r.examSchedule?.subject?.name || 'Subject';
      if (!subjectStats[subName]) {
        subjectStats[subName] = { totalScore: 0, count: 0, name: subName };
      }
      const score = Number(r.marksObtained);
      const maxScore = Number(r.examSchedule?.maxMarks) || 100;
      const pct = (score / maxScore) * 100;
      subjectStats[subName].totalScore += pct;
      subjectStats[subName].count += 1;
    }

    const prioritySubjects: string[] = [];
    const regularSubjects: string[] = [];

    for (const sub of Object.values(subjectStats)) {
      const avg = sub.totalScore / sub.count;
      if (avg < 60) {
        prioritySubjects.push(`${sub.name} (Avg: ${Math.round(avg)}% - Needs Attention)`);
      } else {
        regularSubjects.push(`${sub.name} (Avg: ${Math.round(avg)}%)`);
      }
    }

    // Query upcoming exams
    const upcomingExams = await prisma.examSchedule.findMany({
      where: {
        tenantId: context.tenantId,
        classGradeId: student.section?.classGradeId,
        examDate: { gte: new Date() },
      },
      include: { subject: true },
      take: 3,
      orderBy: { examDate: 'asc' },
    });

    const upcomingList = upcomingExams.map(
      (e) => `${e.subject.name} - Exam on ${e.examDate.toLocaleDateString()}`
    );

    const studySchedule = [
      {
        slot: 'Slot 1 (45 mins) - Focus Area',
        subject: prioritySubjects.length > 0 ? prioritySubjects[0] : (regularSubjects[0] || 'Mathematics'),
        goal: 'Concept revision, notes review, and practice problems',
        type: 'High Priority',
      },
      {
        slot: 'Slot 2 (30 mins) - Exam Prep',
        subject: upcomingList.length > 0 ? upcomingList[0] : (regularSubjects[1] || 'Science'),
        goal: 'Previous year question papers and practice exercises',
        type: 'Active Recall',
      },
      {
        slot: 'Slot 3 (20 mins) - Quick Consolidation',
        subject: prioritySubjects.length > 1 ? prioritySubjects[1] : (regularSubjects[0] || 'Language/General'),
        goal: 'Formula review, flashcards, and summary notes',
        type: 'Review',
      },
    ];

    return {
      success: true,
      message: 'Personalized study recommendation generated based on current academic performance.',
      data: {
        disclaimer: 'AI RECOMMENDATION: This is a personalized study guide suggestion based on your recent examination records, not an official school timetable.',
        studentName: `${student.user.firstName} ${student.user.lastName}`,
        class: student.section?.classGrade?.name || 'Class',
        section: student.section?.name || 'Section',
        focusAreas: prioritySubjects.length > 0 ? prioritySubjects : ['Maintain current steady progress across all subjects.'],
        schedule: studySchedule,
        upcomingAssessments: upcomingList,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to generate study plan: ${error?.message || 'Unexpected error'}`,
      error: 'EXECUTION_FAILED',
    };
  }
}

/**
 * ACTION: generateAttendanceReport
 * Allowed: ADMIN, TEACHER, SUPERADMIN
 */
async function executeGenerateAttendanceReport(
  context: AIUserContext,
  payload: Record<string, any>
): Promise<ActionExecutionResult> {
  const allowedRoles = ['ADMIN', 'SUPERADMIN', 'TEACHER'];
  if (!allowedRoles.includes(context.role.toUpperCase())) {
    return {
      success: false,
      message: 'Unauthorized: Only faculty and administration can generate attendance audit reports.',
      error: 'ROLE_UNAUTHORIZED',
    };
  }

  if (!context.tenantId) {
    return {
      success: false,
      message: 'Tenant context missing.',
      error: 'TENANT_REQUIRED',
    };
  }

  try {
    const totalStudents = await prisma.studentProfile.count({
      where: { tenantId: context.tenantId },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendances = await prisma.studentAttendance.findMany({
      where: {
        tenantId: context.tenantId,
        date: { gte: thirtyDaysAgo },
      },
      select: {
        status: true,
      },
    });

    const presentCount = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
    const absentCount = attendances.filter((a) => a.status === 'ABSENT').length;
    const totalRecords = attendances.length;
    const overallRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100;

    return {
      success: true,
      message: 'School attendance report generated successfully for the past 30 days.',
      data: {
        generatedAt: new Date().toISOString(),
        tenantId: context.tenantId,
        period: 'Last 30 Days',
        totalEnrolledStudents: totalStudents,
        totalSessionsLogged: totalRecords,
        overallAttendanceRate: `${overallRate}%`,
        metrics: {
          presentSessions: presentCount,
          absentSessions: absentCount,
        },
        auditStatus: overallRate >= 85 ? 'Healthy (>85%)' : 'Attention Required (<85%)',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to compile attendance report: ${error?.message || 'Database error'}`,
      error: 'EXECUTION_FAILED',
    };
  }
}
