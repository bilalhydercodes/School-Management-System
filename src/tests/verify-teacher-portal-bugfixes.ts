/**
 * Automated Verification & Regression Suite for Teacher Portal Bug Fixes
 */

import {
  TeacherLeaveApplicationSchema,
  SaveExamMarksSchema,
  SaveStudentRemarkSchema,
} from '../lib/validations/teacher-portal';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
    failCount++;
  }
}

async function runTests() {
  console.log('======================================================');
  console.log('ALPHA EDU HUB — TEACHER PORTAL AUTOMATED REGRESSION');
  console.log('======================================================\n');

  // Test 1: Teacher Leave Validation - Valid Input
  const validLeave = TeacherLeaveApplicationSchema.safeParse({
    leaveType: 'CASUAL',
    startDate: '2026-01-15',
    endDate: '2026-01-16',
    reason: 'Family wedding ceremony',
  });
  assert(validLeave.success, 'TCH-TEST-01: Valid leave application passes schema validation');

  // Test 2: Teacher Leave Validation - End Date Before Start Date
  const invalidDateLeave = TeacherLeaveApplicationSchema.safeParse({
    leaveType: 'SICK',
    startDate: '2026-01-20',
    endDate: '2026-01-18',
    reason: 'Medical appointment',
  });
  assert(!invalidDateLeave.success, 'TCH-TEST-02: Leave application rejects end date prior to start date');

  // Test 3: Teacher Leave Validation - Empty Reason
  const emptyReasonLeave = TeacherLeaveApplicationSchema.safeParse({
    leaveType: 'EARNED',
    startDate: '2026-02-01',
    endDate: '2026-02-05',
    reason: '',
  });
  assert(!emptyReasonLeave.success, 'TCH-TEST-03: Leave application rejects empty reason string');

  // Test 4: Exam Marks Validation - Valid Record
  const validMarks = SaveExamMarksSchema.safeParse({
    examType: 'Mid-Term Examination 2026',
    section: '8-A',
    subject: 'Mathematics',
    isDraft: false,
    marks: [
      { studentId: 'stu-1', studentName: 'Aarav Sharma', marksObtained: 92, maxMarks: 100 },
      { studentId: 'stu-2', studentName: 'Ananya Verma', marksObtained: 96, maxMarks: 100 },
    ],
  });
  assert(validMarks.success, 'TCH-TEST-04: Valid exam marks payload passes schema validation');

  // Test 5: Exam Marks Validation - Negative Marks
  const negativeMarks = SaveExamMarksSchema.safeParse({
    examType: 'Mid-Term Examination 2026',
    section: '8-A',
    subject: 'Mathematics',
    isDraft: false,
    marks: [
      { studentId: 'stu-1', marksObtained: -5, maxMarks: 100 },
    ],
  });
  assert(!negativeMarks.success, 'TCH-TEST-05: Exam marks schema rejects negative marks');

  // Test 6: Exam Marks Validation - Marks Exceeding Max
  const excessiveMarks = SaveExamMarksSchema.safeParse({
    examType: 'Mid-Term Examination 2026',
    section: '8-A',
    subject: 'Mathematics',
    isDraft: false,
    marks: [
      { studentId: 'stu-1', marksObtained: 105, maxMarks: 100 },
    ],
  });
  assert(!excessiveMarks.success, 'TCH-TEST-06: Exam marks schema rejects marks exceeding maximum');

  // Test 7: Student Remarks Validation - Valid Input
  const validRemark = SaveStudentRemarkSchema.safeParse({
    studentId: 'stu-881',
    academicRemark: 'Shows excellent comprehension of mathematical formulas.',
    behavioralRemark: 'Courteous and participates actively in classroom discussions.',
    generalNote: 'Nominated for math club captaincy.',
  });
  assert(validRemark.success, 'TCH-TEST-07: Valid student remark passes validation');

  // Test 8: Student Remarks Validation - Excessive Character Count
  const longText = 'A'.repeat(501);
  const excessiveRemark = SaveStudentRemarkSchema.safeParse({
    studentId: 'stu-881',
    academicRemark: longText,
    behavioralRemark: 'Good',
  });
  assert(!excessiveRemark.success, 'TCH-TEST-08: Student remark rejects text exceeding 500 characters');

  console.log('\n------------------------------------------------------');
  console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('------------------------------------------------------\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner encountered error:', err);
  process.exit(1);
});
