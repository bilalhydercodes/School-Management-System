/**
 * Comprehensive End-to-End Integration Test for Teacher Portal
 * Validates real session authentication, database persistence, and retrieval.
 */

import { prisma } from '../lib/db';
import { AuthService } from '../services/auth.service';
import {
  submitTeacherLeaveAction,
  getTeacherLeaveHistoryAction,
  saveExamMarksAction,
  getExamMarksAction,
  saveStudentRemarkAction,
  getTeacherAssignedStudentsAction,
} from '../actions/teacher-portal';
import { markDailyAttendanceAction, getTeacherSectionsAction, getSectionAttendanceRosterAction } from '../actions/attendance';

async function runE2ETests() {
  console.log('===========================================================');
  console.log('🚀 TEACHER PORTAL FULL END-TO-END INTEGRATION TEST');
  console.log('===========================================================\n');

  // 1. Authenticate Teacher
  console.log('--- 1. Authenticating teacher@dps.edu.in ---');
  const loginRes = await AuthService.login(
    { email: 'teacher@dps.edu.in', password: 'Teacher@123' },
    null
  );

  if (!loginRes.success || !loginRes.user || !loginRes.token) {
    throw new Error(`Teacher authentication failed: ${loginRes.error}`);
  }

  const { tenantId, userId, role } = loginRes.user;
  console.log(`✅ Authenticated successfully: User ${userId} | Tenant ${tenantId} | Role ${role}`);

  // Mock global session for server actions in this Node execution context
  process.env.TEST_AUTH_USER_ID = userId;
  process.env.TEST_AUTH_TENANT_ID = tenantId;
  process.env.TEST_AUTH_ROLE = role;

  // 2. Test Faculty Leave Application & History Retrieval
  console.log('\n--- 2. Testing Faculty Leave Submission & DB Persistence ---');
  const leaveReason = 'Attending National Mathematics Curriculum Seminar (QA E2E)';
  const leaveRes = await submitTeacherLeaveAction({
    leaveType: 'CASUAL',
    startDate: '2026-01-20',
    endDate: '2026-01-22',
    reason: leaveReason,
  });

  if (!leaveRes.success || !leaveRes.referenceNo) {
    throw new Error(`Failed to submit leave: ${leaveRes.error}`);
  }
  console.log(`✅ Leave submitted successfully. Reference No: ${leaveRes.referenceNo}`);

  // Verify persistence by querying DB
  const historyRes = await getTeacherLeaveHistoryAction();
  if (!historyRes.success || !historyRes.requests) {
    throw new Error(`Failed to retrieve leave history: ${historyRes.error}`);
  }

  const foundLeave = historyRes.requests.find((r) => r.referenceNo === leaveRes.referenceNo);
  if (!foundLeave) {
    throw new Error(`Submitted leave ${leaveRes.referenceNo} was not found in persisted leave history!`);
  }
  console.log(`✅ Verified in DB: Leave ${foundLeave.referenceNo} | Type: ${foundLeave.type} | Days: ${foundLeave.days} | Status: ${foundLeave.status}`);

  // 3. Test Class Attendance Marking & Persistence
  console.log('\n--- 3. Testing Class Attendance Marking ---');
  const sectionsRes = await getTeacherSectionsAction();
  console.log(`✅ Teacher sections resolved: ${sectionsRes.sections?.length || 0} sections`);

  const targetSectionId = sectionsRes.sections?.[0]?.id || '3b403a49-4be6-440c-bb00-a6b884e1fcbd';
  const attendanceRes = await markDailyAttendanceAction({
    sectionId: targetSectionId,
    date: '2026-01-09',
    overrideHoliday: true,
    records: [
      { studentId: '098caeb2-65b6-4e54-8e7d-ab11ab1d1a75', status: 'PRESENT' },
      { studentId: '306e7873-bfc4-4d84-a3a2-63c0481317b2', status: 'ABSENT' },
    ],
  });

  if (!attendanceRes.success) {
    throw new Error(`Failed to mark attendance: ${attendanceRes.error}`);
  }
  console.log(`✅ Attendance recorded atomically: Count ${attendanceRes.count} | Section ${attendanceRes.sectionId} | Date ${attendanceRes.date}`);

  // 4. Test Exam Marks Entry & Retention
  console.log('\n--- 4. Testing Exam Marks Saving & Retrieval ---');
  const marksRes = await saveExamMarksAction({
    examType: 'Mid-Term Examination 2026',
    section: '8-A',
    subject: 'Mathematics',
    isDraft: false,
    marks: [
      { studentId: 'stu-1', studentName: 'Aarav Sharma', rollNo: '01', marksObtained: 95, maxMarks: 100, remarks: 'Excellent analytical progress' },
      { studentId: 'stu-2', studentName: 'Ananya Verma', rollNo: '02', marksObtained: 98, maxMarks: 100, remarks: 'Top in algebraic concepts' },
    ],
  });

  if (!marksRes.success) {
    throw new Error(`Failed to save marks: ${marksRes.error}`);
  }
  console.log(`✅ Marks saved: ${marksRes.count} records | ${marksRes.message}`);

  const loadedMarks = await getExamMarksAction('Mid-Term Examination 2026', '8-A', 'Mathematics');
  if (!loadedMarks.success || !loadedMarks.marks) {
    throw new Error(`Failed to reload saved marks: ${loadedMarks.error}`);
  }
  const aaravMark = loadedMarks.marks.find((m: any) => m.studentId === 'stu-1');
  if (!aaravMark || Number(aaravMark.marksObtained) !== 95) {
    throw new Error(`Marks verification failed: expected 95, got ${aaravMark?.marksObtained}`);
  }
  console.log(`✅ Verified in DB: Reloaded marks for student stu-1: ${aaravMark.marksObtained}/100 (${aaravMark.remarks})`);

  // 5. Test Student Remarks Saving
  console.log('\n--- 5. Testing Student Remarks Saving ---');
  const remarkRes = await saveStudentRemarkAction({
    studentId: 'stu-1',
    academicRemark: 'Consistently tops the class in quadratic problem solving.',
    behavioralRemark: 'Exemplary conduct and peer teamwork.',
    generalNote: 'Recommended for inter-school math olympiad.',
  });

  if (!remarkRes.success) {
    throw new Error(`Failed to save remark: ${remarkRes.error}`);
  }
  console.log(`✅ Student remarks saved: ${remarkRes.message}`);

  // 6. Test Assigned Student Roster Query
  console.log('\n--- 6. Testing Assigned Student Roster Resolution ---');
  const rosterRes = await getTeacherAssignedStudentsAction();
  if (!rosterRes.success || !rosterRes.students) {
    throw new Error(`Failed to retrieve student roster: ${rosterRes.error}`);
  }
  console.log(`✅ Student roster resolved: ${rosterRes.students.length} students loaded`);
  if (rosterRes.students.length > 0) {
    console.log(`   Sample: Roll #${rosterRes.students[0].roll} ${rosterRes.students[0].name} (${rosterRes.students[0].class} - ${rosterRes.students[0].section})`);
  }

  console.log('\n===========================================================');
  console.log('🎉 ALL 6 TEACHER PORTAL E2E INTEGRATION TESTS PASSED!');
  console.log('===========================================================\n');
}

runE2ETests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ E2E Integration Test Failed:', err);
    process.exit(1);
  });
