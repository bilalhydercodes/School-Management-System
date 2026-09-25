import { z } from 'zod';

// Academic Year Validation
export const AcademicYearSchema = z.object({
  name: z.string().min(1, 'Academic year name is required').max(50, 'Name too long'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
  isCurrent: z.boolean().optional().default(false),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export type AcademicYearInput = z.infer<typeof AcademicYearSchema>;

// Class Grade Validation
export const ClassGradeSchema = z.object({
  academicYearId: z.string().uuid('Invalid academic year'),
  name: z.string().min(1, 'Class name is required').max(50, 'Name too long'),
  numericOrder: z.number().int().min(1).max(12),
});

export type ClassGradeInput = z.infer<typeof ClassGradeSchema>;

// Section Validation
export const SectionSchema = z.object({
  classGradeId: z.string().uuid('Invalid class grade'),
  name: z.string().min(1, 'Section name is required').max(10, 'Name too long'),
  classTeacherId: z.string().uuid('Invalid teacher ID').nullable().optional(),
});

export type SectionInput = z.infer<typeof SectionSchema>;

// Subject Validation
export const SubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100, 'Name too long'),
  code: z.string().min(1, 'Subject code is required').max(20, 'Code too long').regex(/^[A-Z0-9-]+$/, 'Code must be uppercase alphanumeric with hyphens'),
  subjectType: z.enum(['THEORY', 'PRACTICAL', 'LANGUAGE']).default('THEORY'),
  isElective: z.boolean().default(false),
});

export type SubjectInput = z.infer<typeof SubjectSchema>;

// Class-Subject-Teacher Assignment Validation
export const ClassSubjectTeacherSchema = z.object({
  sectionId: z.string().uuid('Invalid section'),
  subjectId: z.string().uuid('Invalid subject'),
  teacherId: z.string().uuid('Invalid teacher'),
});

export type ClassSubjectTeacherInput = z.infer<typeof ClassSubjectTeacherSchema>;
