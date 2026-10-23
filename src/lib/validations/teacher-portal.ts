import { z } from 'zod';

export const TeacherLeaveTypeEnum = z.enum([
  'CASUAL',
  'SICK',
  'EARNED',
  'MATERNITY',
  'DUTY',
  'OTHER',
]);

export type TeacherLeaveType = z.infer<typeof TeacherLeaveTypeEnum>;

export const TeacherLeaveApplicationSchema = z
  .object({
    leaveType: TeacherLeaveTypeEnum,
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
    reason: z
      .string()
      .trim()
      .min(3, 'Reason must be at least 3 characters')
      .max(1000, 'Reason cannot exceed 1000 characters'),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
      message: 'End date cannot be earlier than start date',
      path: ['endDate'],
    }
  );

export type TeacherLeaveApplicationInput = z.infer<typeof TeacherLeaveApplicationSchema>;

export const ExamMarkItemSchema = z.object({
  studentId: z.string().min(1, 'Student identifier is required'),
  studentName: z.string().optional(),
  rollNo: z.string().optional(),
  marksObtained: z
    .number({ invalid_type_error: 'Marks must be a valid number' })
    .min(0, 'Marks cannot be negative')
    .max(100, 'Marks cannot exceed 100'),
  maxMarks: z
    .number()
    .min(1, 'Maximum marks must be at least 1')
    .max(100, 'Maximum marks cannot exceed 100')
    .default(100),
  remarks: z.string().max(255).optional(),
});

export const SaveExamMarksSchema = z.object({
  examType: z.string().min(1, 'Exam type is required'),
  section: z.string().min(1, 'Section is required'),
  subject: z.string().min(1, 'Subject is required'),
  isDraft: z.boolean().default(false),
  marks: z.array(ExamMarkItemSchema).min(1, 'At least one student mark record is required'),
});

export type SaveExamMarksInput = z.infer<typeof SaveExamMarksSchema>;

export const SaveStudentRemarkSchema = z.object({
  studentId: z.string().min(1, 'Student identifier is required'),
  academicRemark: z.string().trim().max(500, 'Academic remark cannot exceed 500 characters'),
  behavioralRemark: z.string().trim().max(500, 'Behavioral remark cannot exceed 500 characters'),
  generalNote: z.string().trim().max(500, 'General note cannot exceed 500 characters').optional(),
});

export type SaveStudentRemarkInput = z.infer<typeof SaveStudentRemarkSchema>;
