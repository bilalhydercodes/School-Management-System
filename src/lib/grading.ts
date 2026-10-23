/**
 * CBSE Scholastic Grading and Assessment Calculation Utilities
 * Handles defensive evaluation for full, partial, and pending practical/theory assessments.
 */

export interface GradeScaleItem {
  grade: string;
  minPercent: number;
  maxPercent: number;
  gradePoint: number;
  description: string;
}

export const DEFAULT_CBSE_GRADE_SCALES: GradeScaleItem[] = [
  { grade: 'A1', minPercent: 91, maxPercent: 100, gradePoint: 10.0, description: 'Outstanding / Top 1/8th' },
  { grade: 'A2', minPercent: 81, maxPercent: 90, gradePoint: 9.0, description: 'Excellent / Next 1/8th' },
  { grade: 'B1', minPercent: 71, maxPercent: 80, gradePoint: 8.0, description: 'Very Good' },
  { grade: 'B2', minPercent: 61, maxPercent: 70, gradePoint: 7.0, description: 'Good' },
  { grade: 'C1', minPercent: 51, maxPercent: 60, gradePoint: 6.0, description: 'Above Average' },
  { grade: 'C2', minPercent: 41, maxPercent: 50, gradePoint: 5.0, description: 'Average' },
  { grade: 'D', minPercent: 33, maxPercent: 40, gradePoint: 4.0, description: 'Marginal Pass' },
  { grade: 'E', minPercent: 0, maxPercent: 32, gradePoint: 0.0, description: 'Needs Essential Repeat' },
];

export interface SubjectMarksAssessment {
  subject: string;
  code: string;
  max: number;
  obtained: number | null | undefined;
  theoryMax?: number;
  theoryObtained?: number | null | undefined;
  practicalMax?: number;
  practicalObtained?: number | null | undefined;
  grade?: string;
  gradePoint?: number | null;
  status?: 'Pass' | 'Fail' | 'Pending Practical' | 'Pending Theory' | 'Pending All';
}

export interface EvaluatedSubjectMarks extends SubjectMarksAssessment {
  grade: string;
  gradePoint: number | null;
  isPending: boolean;
  percentage: number | null;
}

export interface ReportCardSummary {
  totalMax: number;
  totalObtained: number | null;
  percentage: number | null;
  overallGrade: string;
  cgpa: number | null;
  hasPendingAssessments: boolean;
  remarks: string;
}

/**
 * Defensively calculates grade and grade-point for an individual subject.
 * Accurately surfaces pending states if practical or theory marks are missing,
 * avoiding unhandled null/undefined reference exceptions.
 */
export function evaluateSubjectAssessment(
  assessment: SubjectMarksAssessment,
  gradeScales: GradeScaleItem[] = DEFAULT_CBSE_GRADE_SCALES,
  passingPercentage: number = 33
): EvaluatedSubjectMarks {
  const scales = Array.isArray(gradeScales) && gradeScales.length > 0 ? gradeScales : DEFAULT_CBSE_GRADE_SCALES;

  // 1. Check for missing practical assessment when practical component is declared
  if (assessment.practicalMax != null && assessment.practicalMax > 0 && assessment.practicalObtained == null) {
    return {
      ...assessment,
      grade: 'PENDING',
      gradePoint: null,
      isPending: true,
      status: 'Pending Practical',
      percentage: null,
    };
  }

  // 2. Check for missing theory assessment when theory component is declared
  if (assessment.theoryMax != null && assessment.theoryMax > 0 && assessment.theoryObtained == null) {
    return {
      ...assessment,
      grade: 'PENDING',
      gradePoint: null,
      isPending: true,
      status: 'Pending Theory',
      percentage: null,
    };
  }

  // 3. Compute total obtained if composite
  let finalObtained = assessment.obtained;
  if (finalObtained == null) {
    if (assessment.theoryObtained != null || assessment.practicalObtained != null) {
      finalObtained = (assessment.theoryObtained ?? 0) + (assessment.practicalObtained ?? 0);
    }
  }

  // 4. Missing marks overall
  if (finalObtained == null || isNaN(finalObtained)) {
    return {
      ...assessment,
      grade: 'PENDING',
      gradePoint: null,
      isPending: true,
      status: 'Pending All',
      percentage: null,
    };
  }

  const max = assessment.max > 0 ? assessment.max : 100;
  const percentage = Math.round((finalObtained / max) * 100);

  // 5. Look up grade scale safely
  const matchedScale = scales.find((gs) => {
    if (!gs || typeof gs.minPercent !== 'number' || typeof gs.maxPercent !== 'number') return false;
    return percentage >= gs.minPercent && percentage <= gs.maxPercent;
  });

  if (!matchedScale) {
    // Out of standard range fallback
    const passed = percentage >= passingPercentage;
    return {
      ...assessment,
      obtained: finalObtained,
      grade: passed ? 'PASS' : 'E',
      gradePoint: passed ? 4.0 : 0.0,
      isPending: false,
      status: passed ? 'Pass' : 'Fail',
      percentage,
    };
  }

  const gp = matchedScale.gradePoint != null ? Number(matchedScale.gradePoint) : 0;
  const passed = percentage >= passingPercentage;

  return {
    ...assessment,
    obtained: finalObtained,
    grade: matchedScale.grade || 'N/A',
    gradePoint: gp,
    isPending: false,
    status: passed ? 'Pass' : 'Fail',
    percentage,
  };
}

/**
 * Computes report card cumulative totals, CGPA, and remarks defensively.
 */
export function computeReportCardSummary(
  subjects: EvaluatedSubjectMarks[],
  gradeScales: GradeScaleItem[] = DEFAULT_CBSE_GRADE_SCALES
): ReportCardSummary {
  const scales = Array.isArray(gradeScales) && gradeScales.length > 0 ? gradeScales : DEFAULT_CBSE_GRADE_SCALES;

  let totalMax = 0;
  let totalObtained = 0;
  let hasPending = false;
  const validGPs: number[] = [];

  for (const s of subjects) {
    totalMax += s.max || 100;
    if (s.isPending || s.obtained == null) {
      hasPending = true;
    } else {
      totalObtained += s.obtained;
      if (s.gradePoint != null) {
        validGPs.push(s.gradePoint);
      }
    }
  }

  if (hasPending && validGPs.length === 0) {
    return {
      totalMax,
      totalObtained: null,
      percentage: null,
      overallGrade: 'PENDING',
      cgpa: null,
      hasPendingAssessments: true,
      remarks: 'Scholastic assessment in progress. Practical or internal marks pending.',
    };
  }

  const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  const cgpa = validGPs.length > 0 ? Math.round((validGPs.reduce((a, b) => a + b, 0) / validGPs.length) * 10) / 10 : null;

  let overallGrade = 'PENDING';
  if (!hasPending) {
    const scale = scales.find((gs) => percentage >= gs.minPercent && percentage <= gs.maxPercent);
    overallGrade = scale?.grade || (percentage >= 33 ? 'PASS' : 'E');
  } else {
    overallGrade = 'INCOMPLETE';
  }

  let remarks = '';
  if (hasPending) {
    remarks = 'Results published partially. Some assessment components are awaiting teacher submission.';
  } else if (percentage >= 85) {
    remarks = 'Exceptional academic consistency and disciplined classroom contribution.';
  } else if (percentage >= 60) {
    remarks = 'Satisfactory overall progress. Recommended to continue regular practice.';
  } else {
    remarks = 'Needs strengthening in foundational concepts and numerical problem-solving.';
  }

  return {
    totalMax,
    totalObtained: hasPending ? totalObtained : totalObtained,
    percentage: hasPending ? null : percentage,
    overallGrade,
    cgpa,
    hasPendingAssessments: hasPending,
    remarks,
  };
}
