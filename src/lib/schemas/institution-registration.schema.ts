import { z } from 'zod';

/**
 * Zod validation schema for institution registration.
 * Kept in a separate file so it can be imported by both
 * the server action ('use server') and client components
 * without violating Next.js 'use server' export constraints.
 */
export const InstitutionRegistrationSchema = z.object({
  // Step 1: Type
  institutionType: z.enum(['School', 'College', 'Other Educational Institution'], {
    errorMap: () => ({ message: 'Please select an institution type' }),
  }),
  // Step 2: Information
  institutionName: z.string().min(3, 'Institution name must be at least 3 characters').max(150),
  officialEmail: z.string().email('Please enter a valid official email address'),
  officialPhone: z.string().min(8, 'Phone number must be at least 8 digits').max(20),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  // Step 3: Location
  address: z.string().min(3, 'Address is required').max(255),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  country: z.string().min(2).default('India'),
  postalCode: z.string().min(4, 'Valid postal / PIN code is required').max(15),
  // Step 4: Details
  studentCount: z.coerce.number().int().positive().optional().nullable(),
  teacherCount: z.coerce.number().int().positive().optional().nullable(),
  staffCount: z.coerce.number().int().positive().optional().nullable(),
  campusCount: z.coerce.number().int().positive().default(1),
  academicLevels: z.array(z.string()).default([]),
  // Step 5: Administrator Information
  administratorName: z.string().min(2, 'Administrator full name is required').max(100),
  administratorDesignation: z.enum(['Principal', 'Administrator', 'Director', 'Management', 'Other'], {
    errorMap: () => ({ message: 'Please select a valid designation' }),
  }),
  administratorEmail: z.string().email('Valid administrator email address is required'),
  administratorPhone: z.string().min(8, 'Phone number must be at least 8 digits').max(20),
  // Confirmation
  authorizedConfirmation: z.boolean().refine((val) => val === true, {
    message: 'You must confirm that you are authorized to register this institution.',
  }),
});

export type InstitutionRegistrationInput = z.infer<typeof InstitutionRegistrationSchema>;

export interface RegistrationActionResult {
  success: boolean;
  applicationId?: string;
  applicationNumber?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}
