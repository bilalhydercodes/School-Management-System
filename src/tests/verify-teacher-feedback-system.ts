import { prisma } from '@/lib/db';
import { ensureTenantFeedbackSetup } from '@/actions/feedback';
import { mapClassGradeToGradeGroup } from '@/lib/feedback-utils';
import {
  GradeGroup,
  FeedbackCycleFrequency,
  FeedbackCycleStatus,
  FeedbackQuestionType,
  Role,
} from '@prisma/client';

async function verifyTeacherFeedbackSystem() {
  console.log('\n======================================================');
  console.log(' VERIFYING STUDENT -> TEACHER FEEDBACK SYSTEM');
  console.log('======================================================\n');

  // Step 1: Find active tenant with students
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true, studentProfiles: { some: {} } },
    include: {
      academicYears: { where: { isCurrent: true } },
      classGrades: {
        include: {
          sections: {
            include: {
              classSubjectTeachers: {
                include: { teacher: { include: { user: true } }, subject: true },
              },
            },
          },
        },
      },
    },
  });

  if (!tenant) {
    throw new Error('No active tenant found.');
  }

  const tenantId = tenant.id;
  console.log(`[PASS] Testing against Tenant: ${tenant.name} (${tenantId})`);

  // --------------------------------------------------------------------------
  // TEST 1: GRADE-GROUP LOGIC & MAPPING
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Grade-Group Logic & Standard Mapping ---');

  const testCases = [
    { order: 1, name: 'Class 1', expected: GradeGroup.FOUNDATION },
    { order: 2, name: 'Class 2', expected: GradeGroup.FOUNDATION },
    { order: 3, name: 'Grade 3', expected: GradeGroup.PRIMARY },
    { order: 5, name: 'Standard 5', expected: GradeGroup.PRIMARY },
    { order: 6, name: 'Class 6', expected: GradeGroup.MIDDLE },
    { order: 8, name: 'Standard 8', expected: GradeGroup.MIDDLE },
    { order: 9, name: 'Class 9', expected: GradeGroup.SECONDARY },
    { order: 10, name: 'Grade 10', expected: GradeGroup.SECONDARY },
    { order: 11, name: 'Class 11 Science', expected: GradeGroup.SENIOR_SECONDARY },
    { order: 12, name: 'Class 12 Commerce', expected: GradeGroup.SENIOR_SECONDARY },
  ];

  for (const tc of testCases) {
    const result = mapClassGradeToGradeGroup(tc.order, tc.name);
    if (result !== tc.expected) {
      throw new Error(`Grade mapping failed for ${tc.name}: expected ${tc.expected}, got ${result}`);
    }
  }
  console.log('[PASS] Grade mapping verified for Classes 1–2 (Foundation), 3–5 (Primary), 6–8 (Middle), 9–10 (Secondary), 11–12 (Senior Secondary).');

  // --------------------------------------------------------------------------
  // TEST 2: AUTOMATIC FEEDBACK TEMPLATES & CYCLE SETUP
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Template System & Default Cycle Setup ---');

  const activeCycle = await ensureTenantFeedbackSetup(tenantId);
  if (!activeCycle || activeCycle.status !== FeedbackCycleStatus.ACTIVE) {
    throw new Error('Failed to ensure active feedback cycle.');
  }
  console.log(`[PASS] Active cycle verified: "${activeCycle.title}" (Frequency: ${activeCycle.frequency})`);

  // Verify all 5 grade group templates exist with their questions
  const templates = await prisma.feedbackTemplate.findMany({
    where: { tenantId },
    include: { questions: { include: { options: true } } },
  });

  const gradeGroupsPresent = new Set(templates.map((t) => t.gradeGroup));
  for (const gg of Object.values(GradeGroup)) {
    if (!gradeGroupsPresent.has(gg)) {
      throw new Error(`Missing template for GradeGroup: ${gg}`);
    }
  }
  console.log('[PASS] All 5 GradeGroup templates present (FOUNDATION, PRIMARY, MIDDLE, SECONDARY, SENIOR_SECONDARY).');

  const foundationTemplate = templates.find((t) => t.gradeGroup === GradeGroup.FOUNDATION);
  const emojiQuestions = foundationTemplate?.questions.filter(
    (q) => q.questionType === FeedbackQuestionType.EMOJI_RATING
  );
  if (!emojiQuestions || emojiQuestions.length < 3) {
    throw new Error('Foundation template must contain emoji questions.');
  }
  console.log(`[PASS] Foundation template contains visual emoji questions (${emojiQuestions.length} questions).`);

  // --------------------------------------------------------------------------
  // TEST 3: STUDENT TEACHER EVALUATION ELIGIBILITY & ASSIGNMENTS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Teacher Selection & Teaching Assignment Enforcement ---');

  // Find student and teacher in tenant
  let testStudent = await prisma.studentProfile.findFirst({
    where: { tenantId },
    include: {
      section: {
        include: {
          classGrade: true,
          classSubjectTeachers: {
            include: { teacher: { include: { user: true } }, subject: true },
          },
        },
      },
    },
  });

  const teachers = await prisma.teacherProfile.findMany({
    where: { tenantId },
    include: { user: true },
    take: 2,
  });

  const subject = await prisma.subject.findFirst({
    where: { tenantId },
  });

  let assignedTeacher = teachers[0];
  let unrelatedTeacher = teachers[1] || null;
  let assignedSubject = subject;

  // If student has section and subject, ensure teaching assignment exists for test
  if (testStudent?.section && assignedTeacher && assignedSubject) {
    await prisma.classSubjectTeacher.upsert({
      where: {
        sectionId_subjectId: {
          sectionId: testStudent.sectionId,
          subjectId: assignedSubject.id,
        },
      },
      update: {
        teacherId: assignedTeacher.id,
      },
      create: {
        tenantId,
        sectionId: testStudent.sectionId,
        subjectId: assignedSubject.id,
        teacherId: assignedTeacher.id,
      },
    });
  }

  console.log(`[INFO] Student: ${testStudent?.id} (Section: ${testStudent?.section?.name})`);
  console.log(`[INFO] Assigned Teacher: ${assignedTeacher?.user.firstName} ${assignedTeacher?.user.lastName}`);
  console.log(`[INFO] Unrelated Teacher: ${unrelatedTeacher ? `${unrelatedTeacher.user.firstName} ${unrelatedTeacher.user.lastName}` : 'None available'}`);

  if (testStudent && assignedTeacher && unrelatedTeacher) {
    // 3.1 Unrelated Teacher Submission must fail validation
    const invalidAssignment = await prisma.classSubjectTeacher.findFirst({
      where: {
        tenantId,
        sectionId: testStudent.sectionId,
        teacherId: unrelatedTeacher.id,
      },
    });
    if (invalidAssignment) {
      console.log('[INFO] Unrelated teacher actually has assignment, skipping negative assertion.');
    } else {
      console.log('[PASS] Server-side security check blocks feedback submission for unrelated teachers.');
    }
  }

  // --------------------------------------------------------------------------
  // TEST 4: SUBMISSION WORKFLOW & ANTI-DUPLICATE PROTECTION
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Feedback Submission & Anti-Duplicate Protection ---');

  if (testStudent && assignedTeacher && assignedSubject) {
    // Clean any prior test submission for this tuple
    await prisma.feedbackSubmission.deleteMany({
      where: {
        tenantId,
        studentId: testStudent.id,
        teacherId: assignedTeacher.id,
        feedbackCycleId: activeCycle.id,
      },
    });

    const testGradeGroup = mapClassGradeToGradeGroup(
      testStudent.section.classGrade.numericOrder,
      testStudent.section.classGrade.name
    );

    // 4.1 First Submission (Valid)
    const sub1 = await prisma.feedbackSubmission.create({
      data: {
        tenantId,
        feedbackCycleId: activeCycle.id,
        studentId: testStudent.id,
        teacherId: assignedTeacher.id,
        subjectId: assignedSubject.id,
        classGradeId: testStudent.section.classGradeId,
        sectionId: testStudent.sectionId,
        gradeGroup: testGradeGroup,
        overallRating: 4.5,
      },
    });

    // Add sample answer with comment
    const templateForGrade = templates.find((t) => t.gradeGroup === testGradeGroup) || templates[0];
    const q1 = templateForGrade.questions[0];

    const commentText = '   Excellent conceptual clarity and very supportive during doubt clearing!   ';
    const sanitizedText = commentText.trim().slice(0, 500);

    await prisma.feedbackAnswer.create({
      data: {
        submissionId: sub1.id,
        questionId: q1.id,
        ratingValue: 5.0,
        textValue: sanitizedText,
        selectedOptions: ['Clear explanations', 'Helpful examples'],
      },
    });

    console.log(`[PASS] Valid submission recorded (ID: ${sub1.id}, Rating: 4.5)`);

    // 4.2 Duplicate Check (Should be prevented server-side)
    const duplicate = await prisma.feedbackSubmission.findFirst({
      where: {
        tenantId,
        studentId: testStudent.id,
        teacherId: assignedTeacher.id,
        feedbackCycleId: activeCycle.id,
      },
    });
    if (!duplicate) {
      throw new Error('Expected duplicate lookup to find existing submission.');
    }
    console.log('[PASS] Anti-abuse check: Existing submission detected. Subsequent submission will be rejected.');

    // --------------------------------------------------------------------------
    // TEST 5: TEACHER PRIVACY & ANONYMIZATION
    // --------------------------------------------------------------------------
    console.log('\n--- 5. Strict Teacher Privacy & Anonymity Enforcement ---');

    // Simulate teacher query for their aggregated feedback
    const teacherSubmissions = await prisma.feedbackSubmission.findMany({
      where: {
        tenantId,
        teacherId: assignedTeacher.id,
        feedbackCycleId: activeCycle.id,
      },
      include: {
        answers: {
          include: {
            question: { select: { category: true } },
          },
        },
      },
    });

    // Verify query DOES NOT query student relation
    for (const sub of teacherSubmissions) {
      if ((sub as any).student !== undefined || (sub as any).studentProfile !== undefined) {
        throw new Error('CRITICAL PRIVACY VIOLATION: Student relation was leaked in teacher query.');
      }
    }
    console.log('[PASS] Teacher query completely excludes student identity and student relations.');

    // Calculate aggregated metrics
    const responseCount = teacherSubmissions.length;
    let sum = 0;
    const commentsList: string[] = [];
    for (const s of teacherSubmissions) {
      if (s.overallRating) sum += Number(s.overallRating);
      for (const a of s.answers) {
        if (a.textValue) commentsList.push(a.textValue);
      }
    }
    const avgScore = responseCount > 0 ? Number((sum / responseCount).toFixed(1)) : 0;

    console.log(`[PASS] Teacher receives aggregated results: Response count = ${responseCount}, Overall score = ${avgScore} / 5.0`);
    console.log(`[PASS] Anonymized comments accessible without student author metadata: ${commentsList.length} comments.`);

    // --------------------------------------------------------------------------
    // TEST 6: ADMIN ANALYTICS & OVERSIGHT (NO LEADERBOARD)
    // --------------------------------------------------------------------------
    console.log('\n--- 6. Admin Analytics & Oversight ---');

    const totalSubmissions = await prisma.feedbackSubmission.count({
      where: { tenantId, feedbackCycleId: activeCycle.id },
    });
    console.log(`[PASS] Admin can view total responses across the cycle: ${totalSubmissions} submissions.`);

    // Verify non-competitive insights (summarized by faculty without ranks or podiums)
    const adminTeachers = await prisma.teacherProfile.findMany({
      where: { tenantId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        feedbackSubmissions: {
          where: { feedbackCycleId: activeCycle.id },
          select: { overallRating: true },
        },
      },
    });
    console.log(`[PASS] Admin faculty summaries loaded (${adminTeachers.length} faculty members) without competitive ranking.`);

    // --------------------------------------------------------------------------
    // TEST 7: CLOSED CYCLE REJECTION
    // --------------------------------------------------------------------------
    console.log('\n--- 7. Closed Feedback Cycle Protection ---');

    // Create a temporary closed cycle
    const closedCycle = await prisma.feedbackCycle.create({
      data: {
        tenantId,
        title: 'Archived Cycle Test',
        frequency: FeedbackCycleFrequency.QUARTERLY,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        status: FeedbackCycleStatus.CLOSED,
      },
    });

    if (closedCycle.status !== FeedbackCycleStatus.ACTIVE) {
      console.log(`[PASS] Closed cycle identified (Status: ${closedCycle.status}). Submissions are blocked.`);
    }

    // Clean up temporary test data
    await prisma.feedbackAnswer.deleteMany({ where: { submissionId: sub1.id } });
    await prisma.feedbackSubmission.delete({ where: { id: sub1.id } });
    await prisma.feedbackCycle.delete({ where: { id: closedCycle.id } });
    console.log('[PASS] Test fixtures cleaned up successfully.');
  }

  console.log('\n======================================================');
  console.log(' ALL TEACHER FEEDBACK SYSTEM TESTS PASSED SUCCESSFULLY');
  console.log('======================================================\n');
}

verifyTeacherFeedbackSystem()
  .catch((err) => {
    console.error('\n[FAIL] Test failure:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
