import assert from 'assert';
import {
  evaluateSubjectAssessment,
  computeReportCardSummary,
  DEFAULT_CBSE_GRADE_SCALES,
  GradeScaleItem,
} from '../lib/grading';

async function runGradingRegressionTests() {
  console.log('=== Running Exam Grading Regression Tests (BUG-ADM-002) ===\n');

  // Test 1: Complete results calculate accurately
  console.log('Test 1: Complete results calculation');
  const completeMath = evaluateSubjectAssessment(
    { subject: 'Mathematics', code: 'MATH-10', max: 100, obtained: 95 },
    DEFAULT_CBSE_GRADE_SCALES
  );
  assert.strictEqual(completeMath.grade, 'A1');
  assert.strictEqual(completeMath.gradePoint, 10.0);
  assert.strictEqual(completeMath.isPending, false);
  assert.strictEqual(completeMath.status, 'Pass');
  console.log('  [PASS] Complete Mathematics evaluated to A1 / 10.0 GP');

  // Test 2: Missing practical marks reproduces previous crash condition
  console.log('\nTest 2: Defensive handling of missing practical assessment');
  const sciencePendingPractical = evaluateSubjectAssessment(
    {
      subject: 'Science (Physics, Chem, Bio)',
      code: 'SCI-10',
      max: 100,
      theoryMax: 80,
      theoryObtained: 72,
      practicalMax: 20,
      practicalObtained: null, // PRACTICAL NOT SUBMITTED YET
    },
    DEFAULT_CBSE_GRADE_SCALES
  );
  assert.strictEqual(sciencePendingPractical.grade, 'PENDING');
  assert.strictEqual(sciencePendingPractical.gradePoint, null);
  assert.strictEqual(sciencePendingPractical.isPending, true);
  assert.strictEqual(sciencePendingPractical.status, 'Pending Practical');
  console.log('  [PASS] Missing practical mark gracefully surfaced as Pending Practical without exception');

  // Test 3: Missing theory marks
  console.log('\nTest 3: Missing theory marks');
  const sciencePendingTheory = evaluateSubjectAssessment(
    {
      subject: 'Science (Theory & Lab)',
      code: 'SCI-10',
      max: 100,
      theoryMax: 80,
      theoryObtained: null,
      practicalMax: 20,
      practicalObtained: 18,
    },
    DEFAULT_CBSE_GRADE_SCALES
  );
  assert.strictEqual(sciencePendingTheory.isPending, true);
  assert.strictEqual(sciencePendingTheory.status, 'Pending Theory');
  console.log('  [PASS] Missing theory mark correctly marked as Pending Theory');

  // Test 4: Defensive grade scale lookup when gradeScales array has null gradePoints
  console.log('\nTest 4: Faulty grade scale with null gradePoint does not throw');
  const faultyGradeScales: GradeScaleItem[] = [
    { grade: 'A1', minPercent: 90, maxPercent: 100, gradePoint: (undefined as unknown as number), description: 'Faulty' },
    { grade: 'B', minPercent: 0, maxPercent: 89, gradePoint: 7.0, description: 'Pass' },
  ];
  const evaluatedWithFaultyScale = evaluateSubjectAssessment(
    { subject: 'English', code: 'ENG-10', max: 100, obtained: 94 },
    faultyGradeScales
  );
  assert.strictEqual(evaluatedWithFaultyScale.grade, 'A1');
  assert.strictEqual(typeof evaluatedWithFaultyScale.gradePoint, 'number');
  console.log('  [PASS] Faulty grade scale handled safely, gradePoint fallback provided');

  // Test 5: Report Card summary composite with a pending practical
  console.log('\nTest 5: Composite Report Card computation with mixed complete & pending subjects');
  const subjects = [
    completeMath,
    sciencePendingPractical,
    evaluateSubjectAssessment({ subject: 'English', code: 'ENG-10', max: 100, obtained: 88 }, DEFAULT_CBSE_GRADE_SCALES),
  ];
  const summary = computeReportCardSummary(subjects, DEFAULT_CBSE_GRADE_SCALES);
  assert.strictEqual(summary.hasPendingAssessments, true);
  assert.strictEqual(summary.overallGrade, 'INCOMPLETE');
  assert.strictEqual(summary.percentage, null);
  console.log('  [PASS] Report card composite displays INCOMPLETE state and preserves pending auditability');

  console.log('\n=== ALL EXAM GRADING REGRESSION TESTS PASSED ===');
}

runGradingRegressionTests().catch((err) => {
  console.error('Regression test failed:', err);
  process.exit(1);
});
