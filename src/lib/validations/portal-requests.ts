import { z } from 'zod';

export const SubmitGrievanceSchema = z
  .object({
    category: z.string().min(2, 'Category is required'),
    subject: z
      .string()
      .min(3, 'Subject must be at least 3 characters long')
      .max(150, 'Subject must not exceed 150 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters long')
      .max(2000, 'Description must not exceed 2000 characters'),
    urgency: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']).default('NORMAL'),
  })
  .strict();

export type SubmitGrievanceInput = z.infer<typeof SubmitGrievanceSchema>;

export const SubmitLeaveRequestSchema = z
  .object({
    leaveType: z.string().min(2, 'Leave category is required'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid start date (YYYY-MM-DD) is required'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid end date (YYYY-MM-DD) is required'),
    reason: z
      .string()
      .min(5, 'Reason must be at least 5 characters long')
      .max(1000, 'Reason must not exceed 1000 characters'),
    guardianPhone: z.string().min(6, 'Valid guardian phone number is required'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export type SubmitLeaveRequestInput = z.infer<typeof SubmitLeaveRequestSchema>;
