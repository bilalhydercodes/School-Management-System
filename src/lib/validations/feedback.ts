import { z } from 'zod';

export const GradeGroupEnum = z.enum([
  'FOUNDATION',
  'PRIMARY',
  'MIDDLE',
  'SECONDARY',
  'SENIOR_SECONDARY',
]);

export const FeedbackCycleFrequencyEnum = z.enum([
  'MONTHLY',
  'QUARTERLY',
  'HALF_YEARLY',
  'ANNUAL',
  'CUSTOM',
]);

export const FeedbackCycleStatusEnum = z.enum([
  'UPCOMING',
  'ACTIVE',
  'CLOSED',
  'ARCHIVED',
]);

export const FeedbackQuestionTypeEnum = z.enum([
  'RATING',
  'EMOJI_RATING',
  'SINGLE_SELECT',
  'MULTI_SELECT',
  'TEXT',
]);

// Single answer input in submission
export const FeedbackAnswerInputSchema = z.object({
  questionId: z.string().uuid(),
  ratingValue: z.number().min(1).max(5).optional(),
  textValue: z
    .string()
    .max(500, 'Comment must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  selectedOptions: z.array(z.string()).optional(),
});

// Student Feedback Submission input
export const SubmitFeedbackInputSchema = z.object({
  teacherId: z.string().uuid('Valid teacher ID is required'),
  feedbackCycleId: z.string().uuid('Valid feedback cycle ID is required'),
  subjectId: z.string().uuid().optional(),
  answers: z.array(FeedbackAnswerInputSchema).min(1, 'At least one answer is required'),
});

// Admin Feedback Cycle input
export const CreateFeedbackCycleInputSchema = z.object({
  title: z.string().min(2, 'Cycle title is required').max(150),
  description: z.string().optional().or(z.literal('')),
  frequency: FeedbackCycleFrequencyEnum.default('QUARTERLY'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  academicYearId: z.string().uuid().optional().or(z.literal('')),
  isPublished: z.boolean().default(true),
});

export const UpdateFeedbackCycleInputSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2).optional(),
  status: FeedbackCycleStatusEnum.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isPublished: z.boolean().optional(),
});

export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackInputSchema>;
export type FeedbackAnswerInput = z.infer<typeof FeedbackAnswerInputSchema>;
export type CreateFeedbackCycleInput = z.infer<typeof CreateFeedbackCycleInputSchema>;
export type UpdateFeedbackCycleInput = z.infer<typeof UpdateFeedbackCycleInputSchema>;
