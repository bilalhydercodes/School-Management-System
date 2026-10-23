/**
 * Automated Verification Suite for Student Portal QA Bugfixes
 * Tests:
 * 1. Password change validation & mismatch prevention
 * 2. Grievance ticket server-side validation & reference generation
 * 3. Leave application date range constraints & required fields
 */

import { ChangePasswordSchema } from '../lib/validations/auth';
import {
  SubmitGrievanceSchema,
  SubmitLeaveRequestSchema,
} from '../lib/validations/portal-requests';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} - ${detail || 'Condition not met'}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING STUDENT PORTAL BUGFIX VERIFICATION SUITE');
  console.log('======================================================\n');

  // ─────────────────────────────────────────────────────────────
  // 1. Password Bugfix Verifications (BUG-01 & BUG-04)
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Testing Password Change Validation & Mismatch Checks ---');

  // Case 1A: Mismatched passwords must be rejected
  const mismatchResult = ChangePasswordSchema.safeParse({
    currentPassword: 'CurrentPass@123',
    newPassword: 'SecureNewPassword@2026',
    confirmPassword: 'DifferentPassword@2026',
  });
  assert(
    !mismatchResult.success,
    'BUG-04 Fix: Rejects mismatched new and confirm passwords'
  );
  if (!mismatchResult.success) {
    const errorMsg = mismatchResult.error.errors[0]?.message;
    assert(
      errorMsg === 'Passwords do not match',
      `Correct error message on mismatch (received: "${errorMsg}")`
    );
  }

  // Case 1B: Short password (< 8 chars) must be rejected
  const shortResult = ChangePasswordSchema.safeParse({
    currentPassword: 'CurrentPass@123',
    newPassword: 'Short@1',
    confirmPassword: 'Short@1',
  });
  assert(
    !shortResult.success,
    'Rejects new password shorter than 8 characters'
  );

  // Case 1C: Missing current password must be rejected
  const missingCurrentResult = ChangePasswordSchema.safeParse({
    currentPassword: '',
    newPassword: 'SecureNewPassword@2026',
    confirmPassword: 'SecureNewPassword@2026',
  });
  assert(
    !missingCurrentResult.success,
    'Rejects empty current password'
  );

  // Case 1D: Valid matched complex password must pass
  const validPasswordResult = ChangePasswordSchema.safeParse({
    currentPassword: 'Student@123',
    newPassword: 'AlphaStudent#2026',
    confirmPassword: 'AlphaStudent#2026',
  });
  assert(
    validPasswordResult.success,
    'Accepts valid, matched, policy-compliant password update'
  );

  // ─────────────────────────────────────────────────────────────
  // 2. Grievance Ticket Verifications (BUG-02)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. Testing Grievance & Feedback Ticket Validation ---');

  // Case 2A: Short subject (< 3 chars) rejected
  const shortSubjectResult = SubmitGrievanceSchema.safeParse({
    category: 'Academic',
    subject: 'No',
    description: 'This is a valid long description for student inquiry.',
    urgency: 'NORMAL',
  });
  assert(
    !shortSubjectResult.success,
    'Rejects subject line under 3 characters'
  );

  // Case 2B: Short description (< 10 chars) rejected
  const shortDescResult = SubmitGrievanceSchema.safeParse({
    category: 'Academic',
    subject: 'Physics Lab issue',
    description: 'Too short',
    urgency: 'NORMAL',
  });
  assert(
    !shortDescResult.success,
    'Rejects description under 10 characters'
  );

  // Case 2C: Valid grievance payload passes
  const validGrievance = SubmitGrievanceSchema.safeParse({
    category: 'Infrastructure & Classroom',
    subject: 'Physics Lab 2 AC Unit Malfunction',
    description: 'The air conditioning unit in Lab 2 has been non-functional during afternoon practicals.',
    urgency: 'URGENT',
  });
  assert(
    validGrievance.success,
    'Accepts complete valid grievance ticket submission'
  );

  // ─────────────────────────────────────────────────────────────
  // 3. Student Leave Request Verifications (BUG-03 & BUG-05)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Testing Student Leave Request Validation ---');

  // Case 3A: End date earlier than start date rejected
  const invalidDateRange = SubmitLeaveRequestSchema.safeParse({
    leaveType: 'Medical / Sick Leave',
    startDate: '2026-11-10',
    endDate: '2026-11-05', // Earlier!
    reason: 'Medical recovery after dental surgery',
    guardianPhone: '+91 98112 34567',
  });
  assert(
    !invalidDateRange.success,
    'Date Range Guard: Rejects end date earlier than start date'
  );
  if (!invalidDateRange.success) {
    const errorMsg = invalidDateRange.error.errors[0]?.message;
    assert(
      errorMsg === 'End date must be on or after start date',
      `Correct date range error message (received: "${errorMsg}")`
    );
  }

  // Case 3B: Short reason (< 5 chars) rejected
  const shortReason = SubmitLeaveRequestSchema.safeParse({
    leaveType: 'Medical / Sick Leave',
    startDate: '2026-11-10',
    endDate: '2026-11-12',
    reason: 'Sick', // Only 4 chars
    guardianPhone: '+91 98112 34567',
  });
  assert(
    !shortReason.success,
    'Rejects reason shorter than 5 characters'
  );

  // Case 3C: Valid leave request passes
  const validLeave = SubmitLeaveRequestSchema.safeParse({
    leaveType: 'Medical / Sick Leave',
    startDate: '2026-11-10',
    endDate: '2026-11-12',
    reason: 'Recovering from viral fever under medical observation',
    guardianPhone: '+91 98112 34567',
  });
  assert(
    validLeave.success,
    'Accepts valid leave application with correct date boundary and guardian phone'
  );

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
