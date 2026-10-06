'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import {
  SubmitFeedbackInputSchema,
  CreateFeedbackCycleInputSchema,
  UpdateFeedbackCycleInputSchema,
  type SubmitFeedbackInput,
  type CreateFeedbackCycleInput,
  type UpdateFeedbackCycleInput,
} from '@/lib/validations/feedback';
import {
  GradeGroup,
  FeedbackCycleStatus,
  FeedbackCycleFrequency,
  FeedbackQuestionType,
  Prisma,
} from '@prisma/client';
import { NotificationService } from '@/services/notification.service';
import { mapClassGradeToGradeGroup } from '@/lib/feedback-utils';

/**
 * Ensures baseline active cycle and templates exist for tenant.
 */
export async function ensureTenantFeedbackSetup(tenantId: string) {
  // 1. Check or create active cycle
  let activeCycle = await prisma.feedbackCycle.findFirst({
    where: { tenantId, status: FeedbackCycleStatus.ACTIVE },
  });

  if (!activeCycle) {
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 90);

    const currentYear = await prisma.academicYear.findFirst({
      where: { tenantId, isCurrent: true },
    });

    activeCycle = await prisma.feedbackCycle.create({
      data: {
        tenantId,
        academicYearId: currentYear?.id || null,
        title: 'Q2 2026–27 Academic Feedback',
        description: 'Quarterly student evaluation of subject teaching clarity and classroom engagement.',
        frequency: FeedbackCycleFrequency.QUARTERLY,
        status: FeedbackCycleStatus.ACTIVE,
        startDate: today,
        endDate: end,
        isPublished: true,
      },
    });
  }

  // 2. Ensure templates exist for all 5 GradeGroups
  const existingTemplates = await prisma.feedbackTemplate.findMany({
    where: { tenantId },
    select: { gradeGroup: true },
  });
  const existingGroups = new Set(existingTemplates.map((t) => t.gradeGroup));

  // Foundation (Classes 1–2)
  if (!existingGroups.has(GradeGroup.FOUNDATION)) {
    const t = await prisma.feedbackTemplate.create({
      data: {
        tenantId,
        gradeGroup: GradeGroup.FOUNDATION,
        title: 'Foundation Stage (Classes 1–2) Feedback',
        description: 'Visual emoji-driven evaluation for early childhood learners.',
      },
    });

    await prisma.feedbackQuestion.createMany({
      data: [
        {
          templateId: t.id,
          category: 'Classroom Experience',
          questionText: 'How do you feel in this class?',
          questionType: FeedbackQuestionType.EMOJI_RATING,
          displayOrder: 1,
        },
        {
          templateId: t.id,
          category: 'Teaching Clarity',
          questionText: 'Does your teacher explain things clearly?',
          questionType: FeedbackQuestionType.EMOJI_RATING,
          displayOrder: 2,
        },
        {
          templateId: t.id,
          category: 'Doubt Resolution',
          questionText: 'Does your teacher help you when you have questions?',
          questionType: FeedbackQuestionType.EMOJI_RATING,
          displayOrder: 3,
        },
        {
          templateId: t.id,
          category: 'Learning Support',
          questionText: 'Do you enjoy fun activities and stories in class?',
          questionType: FeedbackQuestionType.EMOJI_RATING,
          displayOrder: 4,
        },
      ],
    });

    const questions = await prisma.feedbackQuestion.findMany({ where: { templateId: t.id } });
    for (const q of questions) {
      await prisma.feedbackOption.createMany({
        data: [
          { questionId: q.id, label: 'Great', value: '5', emoji: '😀', displayOrder: 1 },
          { questionId: q.id, label: 'Good', value: '4', emoji: '🙂', displayOrder: 2 },
          { questionId: q.id, label: 'Okay', value: '3', emoji: '😐', displayOrder: 3 },
          { questionId: q.id, label: 'Need help', value: '2', emoji: '😟', displayOrder: 4 },
        ],
      });
    }
  }

  // Primary (Classes 3–5)
  if (!existingGroups.has(GradeGroup.PRIMARY)) {
    const t = await prisma.feedbackTemplate.create({
      data: {
        tenantId,
        gradeGroup: GradeGroup.PRIMARY,
        title: 'Primary Stage (Classes 3–5) Feedback',
        description: 'Simple 5-dimension visual scale with predefined improvement suggestions.',
      },
    });

    const dimQuestions = [
      { text: 'Teacher gives clear explanations', cat: 'Teaching Clarity', order: 1 },
      { text: 'Helps with questions and doubts patiently', cat: 'Doubt Resolution', order: 2 },
      { text: 'Makes classroom lessons interesting', cat: 'Class Engagement', order: 3 },
      { text: 'Listens to students and treats everyone fairly', cat: 'Respect & Fairness', order: 4 },
      { text: 'Gives useful practice and class exercises', cat: 'Learning Support', order: 5 },
    ];

    for (const dq of dimQuestions) {
      await prisma.feedbackQuestion.create({
        data: {
          templateId: t.id,
          category: dq.cat,
          questionText: dq.text,
          questionType: FeedbackQuestionType.RATING,
          displayOrder: dq.order,
        },
      });
    }

    // Improvement suggestions question
    const qMulti = await prisma.feedbackQuestion.create({
      data: {
        templateId: t.id,
        category: 'Suggestions',
        questionText: 'What would help you learn even better?',
        questionType: FeedbackQuestionType.MULTI_SELECT,
        displayOrder: 6,
        isRequired: false,
      },
    });

    await prisma.feedbackOption.createMany({
      data: [
        { questionId: qMulti.id, label: 'More examples', value: 'More examples', displayOrder: 1 },
        { questionId: qMulti.id, label: 'More activities', value: 'More activities', displayOrder: 2 },
        { questionId: qMulti.id, label: 'More practice', value: 'More practice', displayOrder: 3 },
        { questionId: qMulti.id, label: 'More time for questions', value: 'More time for questions', displayOrder: 4 },
        { questionId: qMulti.id, label: 'More group activities', value: 'More group activities', displayOrder: 5 },
      ],
    });
  }

  // Middle (Classes 6–8)
  if (!existingGroups.has(GradeGroup.MIDDLE)) {
    const t = await prisma.feedbackTemplate.create({
      data: {
        tenantId,
        gradeGroup: GradeGroup.MIDDLE,
        title: 'Middle Stage (Classes 6–8) Feedback',
        description: '7 rating dimensions with structured strengths, improvement areas, and optional comments.',
      },
    });

    const middleDims = [
      { text: 'Teaching clarity & explanation of complex ideas', cat: 'Teaching Clarity', order: 1 },
      { text: 'Class engagement and student participation', cat: 'Class Engagement', order: 2 },
      { text: 'Patient and timely doubt resolution', cat: 'Doubt Resolution', order: 3 },
      { text: 'Fairness, respect, and equal encouragement', cat: 'Respect & Fairness', order: 4 },
      { text: 'Classroom organization and discipline', cat: 'Classroom Management', order: 5 },
      { text: 'Learning support and feedback on assignments', cat: 'Learning Support', order: 6 },
      { text: 'Teaching pace suitable for all students', cat: 'Teaching Pace', order: 7 },
    ];

    for (const md of middleDims) {
      await prisma.feedbackQuestion.create({
        data: {
          templateId: t.id,
          category: md.cat,
          questionText: md.text,
          questionType: FeedbackQuestionType.RATING,
          displayOrder: md.order,
        },
      });
    }

    const qStrengths = await prisma.feedbackQuestion.create({
      data: {
        templateId: t.id,
        category: 'Strengths',
        questionText: 'Key strengths of this teacher:',
        questionType: FeedbackQuestionType.MULTI_SELECT,
        displayOrder: 8,
        isRequired: false,
      },
    });
    await prisma.feedbackOption.createMany({
      data: [
        { questionId: qStrengths.id, label: 'Clear explanations', value: 'Clear explanations', displayOrder: 1 },
        { questionId: qStrengths.id, label: 'Helpful examples', value: 'Helpful examples', displayOrder: 2 },
        { questionId: qStrengths.id, label: 'Patient doubt solving', value: 'Patient doubt solving', displayOrder: 3 },
        { questionId: qStrengths.id, label: 'Encouraging & motivating', value: 'Encouraging & motivating', displayOrder: 4 },
      ],
    });

    const qAreas = await prisma.feedbackQuestion.create({
      data: {
        templateId: t.id,
        category: 'Improvements',
        questionText: 'Suggested areas for improvement:',
        questionType: FeedbackQuestionType.MULTI_SELECT,
        displayOrder: 9,
        isRequired: false,
      },
    });
    await prisma.feedbackOption.createMany({
      data: [
        { questionId: qAreas.id, label: 'More revision', value: 'More revision', displayOrder: 1 },
        { questionId: qAreas.id, label: 'More examples', value: 'More examples', displayOrder: 2 },
        { questionId: qAreas.id, label: 'More doubt time', value: 'More doubt time', displayOrder: 3 },
        { questionId: qAreas.id, label: 'Slower pace on tough topics', value: 'Slower pace on tough topics', displayOrder: 4 },
      ],
    });

    await prisma.feedbackQuestion.create({
      data: {
        templateId: t.id,
        category: 'Comments',
        questionText: 'Any additional thoughts or encouragement? (Optional, max 500 characters)',
        questionType: FeedbackQuestionType.TEXT,
        displayOrder: 10,
        isRequired: false,
      },
    });
  }

  // Secondary (Classes 9–10)
  if (!existingGroups.has(GradeGroup.SECONDARY)) {
    const t = await prisma.feedbackTemplate.create({
      data: {
        tenantId,
        gradeGroup: GradeGroup.SECONDARY,
        title: 'Secondary Stage (Classes 9–10) Feedback',
        description: 'Comprehensive academic evaluation for board preparation and concept mastery.',
      },
    });

    const secondaryDims = [
      { text: 'Teaching Clarity & Pedagogical Approach', cat: 'Teaching Clarity', order: 1 },
      { text: 'Deep Subject Knowledge & Conceptual Depth', cat: 'Subject Understanding', order: 2 },
      { text: 'Doubt Resolution & Accessibility', cat: 'Doubt Resolution', order: 3 },
      { text: 'Class Engagement & Intellectual Stimulation', cat: 'Class Engagement', order: 4 },
      { text: 'Teaching Pace & Curriculum Coverage', cat: 'Teaching Pace', order: 5 },
      { text: 'Fairness, Impartiality & Mutual Respect', cat: 'Respect & Fairness', order: 6 },
      { text: 'Exam Preparation & Board Assessment Guidance', cat: 'Exam Preparation', order: 7 },
    ];

    for (const sd of secondaryDims) {
      await prisma.feedbackQuestion.create({
        data: {
          templateId: t.id,
          category: sd.cat,
          questionText: sd.text,
          questionType: FeedbackQuestionType.RATING,
          displayOrder: sd.order,
        },
      });
    }

    await prisma.feedbackQuestion.create({
      data: {
        templateId: t.id,
        category: 'Strengths',
        questionText: 'What does this teacher do particularly well? (Optional)',
        questionType: FeedbackQuestionType.TEXT,
        displayOrder: 8,
        isRequired: false,
      },
    });

    await prisma.feedbackQuestion.create({
      data: {
        templateId: t.id,
        category: 'Improvements',
        questionText: 'What could be improved? (Optional)',
        questionType: FeedbackQuestionType.TEXT,
        displayOrder: 9,
        isRequired: false,
      },
    });
  }

  // Senior Secondary (Classes 11–12)
  if (!existingGroups.has(GradeGroup.SENIOR_SECONDARY)) {
    const t = await prisma.feedbackTemplate.create({
      data: {
        tenantId,
        gradeGroup: GradeGroup.SENIOR_SECONDARY,
        title: 'Senior Secondary (Classes 11–12) Feedback',
        description: 'Advanced collegiate feedback focusing on conceptual rigor, competitive prep, and mentoring.',
      },
    });

    const seniorDims = [
      { text: 'Subject Knowledge & Advanced Insights', cat: 'Subject Knowledge', order: 1 },
      { text: 'Conceptual Clarity & First-Principles Explanations', cat: 'Conceptual Clarity', order: 2 },
      { text: 'Teaching Pace & Syllabus Management', cat: 'Teaching Pace', order: 3 },
      { text: 'Doubt Resolution & Problem-Solving Guidance', cat: 'Doubt Resolution', order: 4 },
      { text: 'Competitive & Board Exam Preparation Strategy', cat: 'Exam Preparation', order: 5 },
      { text: 'Critical Thinking & Analytical Problem Discussion', cat: 'Critical Thinking', order: 6 },
      { text: 'Class Engagement & Academic Inclusivity', cat: 'Class Engagement', order: 7 },
      { text: 'Fairness, Professionalism & Respect', cat: 'Respect & Fairness', order: 8 },
      { text: 'Individual Academic Support & Mentorship', cat: 'Individual Support', order: 9 },
    ];

    for (const ssd of seniorDims) {
      await prisma.feedbackQuestion.create({
        data: {
          templateId: t.id,
          category: ssd.cat,
          questionText: ssd.text,
          questionType: FeedbackQuestionType.RATING,
          displayOrder: ssd.order,
        },
      });
    }

    await prisma.feedbackQuestion.create({
      data: {
        templateId: t.id,
        category: 'Comments',
        questionText: 'Detailed Feedback or Suggestions for Improvement (Optional, max 500 characters):',
        questionType: FeedbackQuestionType.TEXT,
        displayOrder: 10,
        isRequired: false,
      },
    });
  }

  return activeCycle;
}

// ----------------------------------------------------------------------------
// 1. STUDENT APIS
// ----------------------------------------------------------------------------

/**
 * Loads current student profile, grade-group, active cycle, and assigned teachers.
 */
export async function getStudentFeedbackDataAction() {
  const guard = await requireAuthGuard([Role.STUDENT]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const student = await prisma.studentProfile.findFirst({
      where: { tenantId, userId },
      include: {
        section: {
          include: {
            classGrade: true,
            classSubjectTeachers: {
              include: {
                subject: { select: { id: true, name: true, code: true } },
                teacher: {
                  include: {
                    user: { select: { firstName: true, lastName: true, avatarUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student || !student.section) {
      return { success: false, error: 'Student profile or class section not found.' };
    }

    const gradeGroup = mapClassGradeToGradeGroup(
      student.section.classGrade.numericOrder,
      student.section.classGrade.name
    );

    const activeCycle = await ensureTenantFeedbackSetup(tenantId);

    // Find teachers already submitted by this student in active cycle
    const submissions = await prisma.feedbackSubmission.findMany({
      where: {
        tenantId,
        studentId: student.id,
        feedbackCycleId: activeCycle.id,
      },
      select: { teacherId: true, overallRating: true, submittedAt: true },
    });
    const submittedTeacherMap = new Map(
      submissions.map((s) => [s.teacherId, { submittedAt: s.submittedAt, rating: Number(s.overallRating) }])
    );

    // De-duplicate teachers (a teacher might teach multiple subjects)
    const teacherMap = new Map<
      string,
      {
        teacherId: string;
        teacherName: string;
        avatarUrl: string | null;
        subjects: Array<{ id: string; name: string; code: string }>;
        hasSubmitted: boolean;
        submittedAt?: Date;
        rating?: number;
      }
    >();

    for (const cst of student.section.classSubjectTeachers) {
      const tId = cst.teacherId;
      const tUser = cst.teacher.user;
      const subInfo = submittedTeacherMap.get(tId);

      if (!teacherMap.has(tId)) {
        teacherMap.set(tId, {
          teacherId: tId,
          teacherName: `${tUser.firstName} ${tUser.lastName}`,
          avatarUrl: tUser.avatarUrl,
          subjects: [{ id: cst.subject.id, name: cst.subject.name, code: cst.subject.code }],
          hasSubmitted: Boolean(subInfo),
          submittedAt: subInfo?.submittedAt,
          rating: subInfo?.rating,
        });
      } else {
        teacherMap.get(tId)!.subjects.push({
          id: cst.subject.id,
          name: cst.subject.name,
          code: cst.subject.code,
        });
      }
    }

    const assignedTeachers = Array.from(teacherMap.values());

    // Load template for this student's GradeGroup
    const template = await prisma.feedbackTemplate.findUnique({
      where: {
        tenantId_gradeGroup: {
          tenantId,
          gradeGroup,
        },
      },
      include: {
        questions: {
          orderBy: { displayOrder: 'asc' },
          include: {
            options: { orderBy: { displayOrder: 'asc' } },
          },
        },
      },
    });

    return {
      success: true,
      student: {
        id: student.id,
        className: student.section.classGrade.name,
        sectionName: student.section.name,
        gradeGroup,
      },
      activeCycle: {
        id: activeCycle.id,
        title: activeCycle.title,
        startDate: activeCycle.startDate.toISOString().split('T')[0],
        endDate: activeCycle.endDate.toISOString().split('T')[0],
      },
      assignedTeachers,
      template,
    };
  } catch (err: any) {
    console.error('Error fetching student feedback context:', err);
    return { success: false, error: err?.message || 'Failed to load feedback context.' };
  }
}

/**
 * Submits structured feedback for a teacher.
 */
export async function submitFeedbackAction(rawInput: SubmitFeedbackInput) {
  const guard = await requireAuthGuard([Role.STUDENT]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  const validation = SubmitFeedbackInputSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;

  try {
    // 1. Resolve student profile from DB
    const student = await prisma.studentProfile.findFirst({
      where: { tenantId, userId },
      include: { section: { include: { classGrade: true } } },
    });
    if (!student || !student.section) {
      return { success: false, error: 'Student profile not found.' };
    }

    // 2. Verify feedback cycle is active
    const cycle = await prisma.feedbackCycle.findFirst({
      where: { id: input.feedbackCycleId, tenantId, status: FeedbackCycleStatus.ACTIVE },
    });
    if (!cycle) {
      return { success: false, error: 'The feedback cycle is closed or invalid.' };
    }

    // 3. Verify teacher actually teaches this student in section
    const assignment = await prisma.classSubjectTeacher.findFirst({
      where: {
        tenantId,
        sectionId: student.sectionId,
        teacherId: input.teacherId,
      },
    });
    if (!assignment) {
      return { success: false, error: 'You can only evaluate teachers who instruct your class section.' };
    }

    // 4. Enforce anti-abuse: 1 submission per student/teacher/cycle
    const existing = await prisma.feedbackSubmission.findFirst({
      where: {
        tenantId,
        studentId: student.id,
        teacherId: input.teacherId,
        feedbackCycleId: cycle.id,
      },
    });
    if (existing) {
      return { success: false, error: 'You have already submitted feedback for this teacher in this cycle.' };
    }

    // 5. Calculate overall rating average
    const ratingValues: number[] = [];
    for (const a of input.answers) {
      if (a.ratingValue !== undefined && a.ratingValue !== null) {
        ratingValues.push(a.ratingValue);
      }
    }
    const overallRating =
      ratingValues.length > 0
        ? ratingValues.reduce((sum, v) => sum + v, 0) / ratingValues.length
        : null;

    const gradeGroup = mapClassGradeToGradeGroup(
      student.section.classGrade.numericOrder,
      student.section.classGrade.name
    );

    // 6. Create submission and answers in transaction
    await prisma.$transaction(
      async (tx) => {
        const submission = await tx.feedbackSubmission.create({
          data: {
            tenantId,
            feedbackCycleId: cycle.id,
            studentId: student.id,
            teacherId: input.teacherId,
            subjectId: input.subjectId || assignment.subjectId,
            classGradeId: student.section.classGradeId,
            sectionId: student.sectionId,
            gradeGroup,
            overallRating: overallRating !== null ? new Prisma.Decimal(overallRating.toFixed(2)) : null,
          },
        });

        // Insert answers
        for (const ans of input.answers) {
          // Sanitize optional text comment: max 500 characters, avoid whitespace only
          const textClean = ans.textValue ? ans.textValue.trim().slice(0, 500) : null;

          await tx.feedbackAnswer.create({
            data: {
              submissionId: submission.id,
              questionId: ans.questionId,
              ratingValue:
                ans.ratingValue !== undefined && ans.ratingValue !== null
                  ? new Prisma.Decimal(ans.ratingValue.toFixed(2))
                  : null,
              textValue: textClean && textClean.length > 0 ? textClean : null,
              selectedOptions: ans.selectedOptions || Prisma.JsonNull,
            },
          });
        }

        // Audit Log (Does NOT expose feedback text or compromise privacy)
        await tx.auditLog.create({
          data: {
            tenantId,
            userId,
            action: 'FEEDBACK_SUBMISSION_CREATED',
            entityType: 'FeedbackSubmission',
            entityId: submission.id,
            newValues: {
              feedbackCycleId: cycle.id,
              teacherId: input.teacherId,
              gradeGroup,
              overallRating: overallRating !== null ? overallRating.toFixed(2) : null,
            },
          },
        });
      },
      { maxWait: 10000, timeout: 25000 }
    );

    revalidatePath('/portal');
    return { success: true, message: 'Thank you! Your feedback has been safely recorded and anonymized.' };
  } catch (err: any) {
    console.error('Error submitting feedback:', err);
    return { success: false, error: err?.message || 'Failed to submit feedback.' };
  }
}

// ----------------------------------------------------------------------------
// 2. TEACHER APIS (STRICT PRIVACY — NO STUDENT IDENTITY EXPOSURE)
// ----------------------------------------------------------------------------

export interface TeacherFeedbackSummary {
  cycleId: string;
  cycleTitle: string;
  responseCount: number;
  overallRating: number;
  categoryScores: Record<string, number>;
  topStrengths: Array<{ label: string; count: number }>;
  topSuggestions: Array<{ label: string; count: number }>;
  anonymizedComments: string[];
  historicalTrends: Array<{ cycleTitle: string; rating: number; count: number }>;
}

/**
 * Returns aggregated and anonymized feedback for the authenticated teacher.
 */
export async function getTeacherAggregatedFeedbackAction(cycleId?: string) {
  const guard = await requireAuthGuard([Role.TEACHER]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: { tenantId, userId },
    });
    if (!teacherProfile) {
      return { success: false, error: 'Teacher profile not found.' };
    }

    // Determine target cycle
    let targetCycle = null;
    if (cycleId) {
      targetCycle = await prisma.feedbackCycle.findFirst({
        where: { id: cycleId, tenantId },
      });
    }
    if (!targetCycle) {
      targetCycle = await prisma.feedbackCycle.findFirst({
        where: { tenantId, status: FeedbackCycleStatus.ACTIVE },
        orderBy: { startDate: 'desc' },
      });
    }

    if (!targetCycle) {
      return {
        success: true,
        feedback: null,
        cycles: [],
      };
    }

    // Fetch submissions for this teacher in target cycle
    // STRICT PRIVACY: Note student relation is NOT included!
    const submissions = await prisma.feedbackSubmission.findMany({
      where: {
        tenantId,
        teacherId: teacherProfile.id,
        feedbackCycleId: targetCycle.id,
      },
      include: {
        answers: {
          include: {
            question: { select: { category: true, questionType: true, questionText: true } },
          },
        },
      },
    });

    const responseCount = submissions.length;

    // Calculate overall average
    let overallSum = 0;
    let overallValidCount = 0;
    for (const sub of submissions) {
      if (sub.overallRating !== null) {
        overallSum += Number(sub.overallRating);
        overallValidCount++;
      }
    }
    const overallRating =
      overallValidCount > 0 ? Number((overallSum / overallValidCount).toFixed(1)) : 0;

    // Category scores breakdown
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    const strengthsCount: Record<string, number> = {};
    const suggestionsCount: Record<string, number> = {};
    const comments: string[] = [];

    for (const sub of submissions) {
      for (const ans of sub.answers) {
        const cat = ans.question.category;

        // Ratings
        if (ans.ratingValue !== null) {
          const num = Number(ans.ratingValue);
          if (!categoryTotals[cat]) categoryTotals[cat] = { sum: 0, count: 0 };
          categoryTotals[cat].sum += num;
          categoryTotals[cat].count += 1;
        }

        // Suggestions / Strengths
        if (ans.selectedOptions && Array.isArray(ans.selectedOptions)) {
          for (const opt of ans.selectedOptions as string[]) {
            if (cat.toLowerCase().includes('strength') || cat.toLowerCase().includes('appreciate')) {
              strengthsCount[opt] = (strengthsCount[opt] || 0) + 1;
            } else {
              suggestionsCount[opt] = (suggestionsCount[opt] || 0) + 1;
            }
          }
        }

        // Comments (Strictly decoupled from student identity)
        if (ans.textValue && ans.textValue.trim().length > 0) {
          comments.push(ans.textValue.trim());
        }
      }
    }

    const categoryScores: Record<string, number> = {};
    for (const [cat, data] of Object.entries(categoryTotals)) {
      categoryScores[cat] = Number((data.sum / data.count).toFixed(1));
    }

    const topStrengths = Object.entries(strengthsCount)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topSuggestions = Object.entries(suggestionsCount)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Historical trends across all cycles for this teacher
    const allCycles = await prisma.feedbackCycle.findMany({
      where: { tenantId },
      orderBy: { startDate: 'asc' },
      select: { id: true, title: true },
    });

    const historicalTrends: Array<{ cycleTitle: string; rating: number; count: number }> = [];
    for (const c of allCycles) {
      const cSubs = await prisma.feedbackSubmission.findMany({
        where: { tenantId, teacherId: teacherProfile.id, feedbackCycleId: c.id },
        select: { overallRating: true },
      });
      if (cSubs.length > 0) {
        const sum = cSubs.reduce((acc, curr) => acc + (curr.overallRating ? Number(curr.overallRating) : 0), 0);
        historicalTrends.push({
          cycleTitle: c.title,
          rating: Number((sum / cSubs.length).toFixed(1)),
          count: cSubs.length,
        });
      }
    }

    return {
      success: true,
      feedback: {
        cycleId: targetCycle.id,
        cycleTitle: targetCycle.title,
        responseCount,
        overallRating,
        categoryScores,
        topStrengths,
        topSuggestions,
        anonymizedComments: comments,
        historicalTrends,
      },
      cycles: allCycles,
    };
  } catch (err: any) {
    console.error('Error fetching teacher feedback:', err);
    return { success: false, error: err?.message || 'Failed to load feedback summary.' };
  }
}

// ----------------------------------------------------------------------------
// 3. ADMIN APIS (FULL OVERSIGHT & ANALYTICS)
// ----------------------------------------------------------------------------

export interface AdminFeedbackOverview {
  totalSubmissions: number;
  averageRating: number;
  totalTeachersEvaluated: number;
  activeCycle: { id: string; title: string; status: string } | null;
  categoryAverages: Record<string, number>;
  gradeGroupBreakdown: Record<string, number>;
  teachersSummary: Array<{
    teacherId: string;
    teacherName: string;
    department: string;
    responseCount: number;
    averageRating: number;
    topCategory: string;
  }>;
}

/**
 * Returns school-wide feedback analytics and teacher insights for Admin.
 */
export async function getAdminFeedbackAnalyticsAction(filters?: {
  cycleId?: string;
  department?: string;
  gradeGroup?: string;
}) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const tenantId = guard.context.tenantId;

  try {
    const cycles = await prisma.feedbackCycle.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
      select: { id: true, title: true, status: true, startDate: true, endDate: true },
    });

    const activeCycle = cycles.find((c) => c.status === FeedbackCycleStatus.ACTIVE) || cycles[0] || null;
    const targetCycleId = filters?.cycleId || activeCycle?.id;

    if (!targetCycleId) {
      return {
        success: true,
        analytics: {
          totalSubmissions: 0,
          averageRating: 0,
          totalTeachersEvaluated: 0,
          activeCycle: null,
          categoryAverages: {},
          gradeGroupBreakdown: {},
          teachersSummary: [],
        },
        cycles: [],
      };
    }

    const where: Prisma.FeedbackSubmissionWhereInput = {
      tenantId,
      feedbackCycleId: targetCycleId,
    };

    if (filters?.gradeGroup && filters.gradeGroup !== 'ALL') {
      where.gradeGroup = filters.gradeGroup as GradeGroup;
    }

    const submissions = await prisma.feedbackSubmission.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        answers: {
          include: {
            question: { select: { category: true } },
          },
        },
      },
    });

    const totalSubmissions = submissions.length;
    let overallSum = 0;
    const teacherMap: Record<
      string,
      {
        name: string;
        department: string;
        count: number;
        ratingSum: number;
        categorySums: Record<string, { sum: number; count: number }>;
      }
    > = {};

    const categorySums: Record<string, { sum: number; count: number }> = {};
    const gradeGroupCounts: Record<string, number> = {};

    for (const sub of submissions) {
      if (sub.overallRating !== null) {
        overallSum += Number(sub.overallRating);
      }

      // Grade group counts
      gradeGroupCounts[sub.gradeGroup] = (gradeGroupCounts[sub.gradeGroup] || 0) + 1;

      // Teacher aggregation
      const tId = sub.teacherId;
      const tName = `${sub.teacher.user.firstName} ${sub.teacher.user.lastName}`;
      const tDept = sub.teacher.department || 'General';

      if (!teacherMap[tId]) {
        teacherMap[tId] = {
          name: tName,
          department: tDept,
          count: 0,
          ratingSum: 0,
          categorySums: {},
        };
      }
      teacherMap[tId].count += 1;
      if (sub.overallRating !== null) {
        teacherMap[tId].ratingSum += Number(sub.overallRating);
      }

      // Categories
      for (const ans of sub.answers) {
        if (ans.ratingValue !== null) {
          const val = Number(ans.ratingValue);
          const cat = ans.question.category;

          if (!categorySums[cat]) categorySums[cat] = { sum: 0, count: 0 };
          categorySums[cat].sum += val;
          categorySums[cat].count += 1;

          if (!teacherMap[tId].categorySums[cat]) teacherMap[tId].categorySums[cat] = { sum: 0, count: 0 };
          teacherMap[tId].categorySums[cat].sum += val;
          teacherMap[tId].categorySums[cat].count += 1;
        }
      }
    }

    const averageRating =
      totalSubmissions > 0 ? Number((overallSum / totalSubmissions).toFixed(1)) : 0;

    const categoryAverages: Record<string, number> = {};
    for (const [cat, data] of Object.entries(categorySums)) {
      categoryAverages[cat] = Number((data.sum / data.count).toFixed(1));
    }

    let teachersSummary = Object.entries(teacherMap).map(([teacherId, data]) => {
      let topCategory = 'Teaching Clarity';
      let maxScore = 0;
      for (const [c, cData] of Object.entries(data.categorySums)) {
        const avg = cData.sum / cData.count;
        if (avg > maxScore) {
          maxScore = avg;
          topCategory = c;
        }
      }

      return {
        teacherId,
        teacherName: data.name,
        department: data.department,
        responseCount: data.count,
        averageRating: data.count > 0 ? Number((data.ratingSum / data.count).toFixed(1)) : 0,
        topCategory,
      };
    });

    if (filters?.department && filters.department !== 'ALL') {
      teachersSummary = teachersSummary.filter((t) => t.department === filters.department);
    }

    return {
      success: true,
      analytics: {
        totalSubmissions,
        averageRating,
        totalTeachersEvaluated: Object.keys(teacherMap).length,
        activeCycle,
        categoryAverages,
        gradeGroupBreakdown: gradeGroupCounts,
        teachersSummary,
      },
      cycles,
    };
  } catch (err: any) {
    console.error('Error fetching admin feedback analytics:', err);
    return { success: false, error: err?.message || 'Failed to load analytics.' };
  }
}

/**
 * Returns detailed analytics for a single teacher (Admin view).
 */
export async function getAdminTeacherFeedbackDetailAction(teacherId: string, cycleId?: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const tenantId = guard.context.tenantId;

  try {
    const teacher = await prisma.teacherProfile.findFirst({
      where: { id: teacherId, tenantId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!teacher) {
      return { success: false, error: 'Teacher not found.' };
    }

    const where: Prisma.FeedbackSubmissionWhereInput = {
      tenantId,
      teacherId,
    };
    if (cycleId && cycleId !== 'ALL') {
      where.feedbackCycleId = cycleId;
    }

    const submissions = await prisma.feedbackSubmission.findMany({
      where,
      include: {
        answers: {
          include: {
            question: { select: { category: true, questionType: true, questionText: true } },
          },
        },
      },
    });

    const responseCount = submissions.length;
    let sum = 0;
    const catSums: Record<string, { sum: number; count: number }> = {};
    const strengthsCount: Record<string, number> = {};
    const suggestionsCount: Record<string, number> = {};
    const comments: string[] = [];

    for (const sub of submissions) {
      if (sub.overallRating) sum += Number(sub.overallRating);
      for (const a of sub.answers) {
        const cat = a.question.category;
        if (a.ratingValue) {
          if (!catSums[cat]) catSums[cat] = { sum: 0, count: 0 };
          catSums[cat].sum += Number(a.ratingValue);
          catSums[cat].count += 1;
        }

        if (a.selectedOptions && Array.isArray(a.selectedOptions)) {
          for (const opt of a.selectedOptions as string[]) {
            if (cat.toLowerCase().includes('strength') || cat.toLowerCase().includes('appreciate')) {
              strengthsCount[opt] = (strengthsCount[opt] || 0) + 1;
            } else {
              suggestionsCount[opt] = (suggestionsCount[opt] || 0) + 1;
            }
          }
        }

        if (a.textValue && a.textValue.trim().length > 0) {
          comments.push(a.textValue.trim());
        }
      }
    }

    const overallRating = responseCount > 0 ? Number((sum / responseCount).toFixed(1)) : 0;
    const categoryScores: Record<string, number> = {};
    for (const [cat, data] of Object.entries(catSums)) {
      categoryScores[cat] = Number((data.sum / data.count).toFixed(1));
    }

    return {
      success: true,
      teacher: {
        id: teacher.id,
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        email: teacher.user.email,
        employeeId: teacher.employeeId,
        department: teacher.department,
        designation: teacher.designation,
      },
      analytics: {
        responseCount,
        overallRating,
        categoryScores,
        topStrengths: Object.entries(strengthsCount).map(([label, count]) => ({ label, count })),
        topSuggestions: Object.entries(suggestionsCount).map(([label, count]) => ({ label, count })),
        comments,
      },
    };
  } catch (err: any) {
    console.error('Error fetching admin teacher feedback detail:', err);
    return { success: false, error: err?.message || 'Failed to load details.' };
  }
}

/**
 * Creates a new feedback cycle (Admin only).
 */
export async function createFeedbackCycleAction(rawInput: CreateFeedbackCycleInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;
  const validation = CreateFeedbackCycleInputSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  const input = validation.data;

  try {
    const cycle = await prisma.feedbackCycle.create({
      data: {
        tenantId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        frequency: input.frequency,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        academicYearId: input.academicYearId || null,
        status: FeedbackCycleStatus.ACTIVE,
        isPublished: input.isPublished,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'FEEDBACK_CYCLE_CREATED',
        entityType: 'FeedbackCycle',
        entityId: cycle.id,
        newValues: { title: cycle.title, frequency: cycle.frequency },
      },
    });

    revalidatePath('/admin/feedback');
    return { success: true, cycle };
  } catch (err: any) {
    console.error('Error creating feedback cycle:', err);
    return { success: false, error: err?.message || 'Failed to create feedback cycle.' };
  }
}

/**
 * Updates feedback cycle status (e.g. close cycle).
 */
export async function updateFeedbackCycleAction(rawInput: UpdateFeedbackCycleInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;
  const validation = UpdateFeedbackCycleInputSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  const input = validation.data;

  try {
    const updated = await prisma.feedbackCycle.update({
      where: { id: input.id },
      data: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'FEEDBACK_CYCLE_UPDATED',
        entityType: 'FeedbackCycle',
        entityId: updated.id,
        newValues: { status: updated.status, title: updated.title },
      },
    });

    // Optionally broadcast notification to teachers when cycle is closed
    if (input.status === FeedbackCycleStatus.CLOSED) {
      await NotificationService.sendToAudience({
        tenantId,
        audience: 'TEACHERS',
        title: `Feedback Cycle Closed: ${updated.title}`,
        body: 'The student evaluation cycle has closed. Your anonymized feedback summary is now ready in the Teacher Portal.',
        actionUrl: '/teacher/feedback',
      }).catch((e) => console.error('Non-blocking notification warning:', e));
    }

    revalidatePath('/admin/feedback');
    revalidatePath('/teacher/feedback');
    return { success: true, cycle: updated };
  } catch (err: any) {
    console.error('Error updating feedback cycle:', err);
    return { success: false, error: err?.message || 'Failed to update feedback cycle.' };
  }
}
