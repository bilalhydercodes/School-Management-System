import { GradeGroup } from '@prisma/client';

/**
 * Maps standard/class to GradeGroup:
 * FOUNDATION: Classes 1-2
 * PRIMARY: Classes 3-5
 * MIDDLE: Classes 6-8
 * SECONDARY: Classes 9-10
 * SENIOR_SECONDARY: Classes 11-12
 */
export function mapClassGradeToGradeGroup(numericOrder?: number | null, className?: string | null): GradeGroup {
  if (numericOrder !== undefined && numericOrder !== null) {
    if (numericOrder <= 2) return GradeGroup.FOUNDATION;
    if (numericOrder <= 5) return GradeGroup.PRIMARY;
    if (numericOrder <= 8) return GradeGroup.MIDDLE;
    if (numericOrder <= 10) return GradeGroup.SECONDARY;
    return GradeGroup.SENIOR_SECONDARY;
  }

  if (className) {
    const match = className.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num <= 2) return GradeGroup.FOUNDATION;
      if (num <= 5) return GradeGroup.PRIMARY;
      if (num <= 8) return GradeGroup.MIDDLE;
      if (num <= 10) return GradeGroup.SECONDARY;
      return GradeGroup.SENIOR_SECONDARY;
    }
  }

  return GradeGroup.MIDDLE;
}
