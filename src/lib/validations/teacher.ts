import { z } from 'zod';

export const QualificationRecordSchema = z.object({
  qualification: z.string().min(1, 'Qualification is required'),
  specialization: z.string().optional(),
  institution: z.string().min(1, 'Institution is required'),
  graduationYear: z.string().min(4, 'Valid graduation year is required'),
  experience: z.string().optional(),
});

export const TeachingAssignmentSchema = z.object({
  sectionId: z.string().uuid('Valid section is required'),
  subjectId: z.string().uuid('Valid subject is required'),
});

export const CreateTeacherSchema = z.object({
  // STEP 1 — PERSONAL INFORMATION
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),

  // STEP 2 — CONTACT
  email: z.string().email('Valid contact email is required'),
  phone: z.string().min(7, 'Valid contact phone number is required'),
  alternatePhone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pinCode: z.string().optional().or(z.literal('')),

  // STEP 3 — EMPLOYMENT
  employeeId: z.string().min(1, 'Employee ID is required').max(30),
  joiningDate: z.string().min(1, 'Joining date is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING_FACULTY']).default('FULL_TIME'),

  // STEP 4 — QUALIFICATIONS
  qualifications: z.array(QualificationRecordSchema).default([]),

  // STEP 5 — TEACHING ASSIGNMENTS
  assignments: z.array(TeachingAssignmentSchema).default([]),

  // STEP 6 — ACCOUNT ACCESS
  loginEmail: z.string().email('Valid login email is required'),
  temporaryPassword: z.string().min(8, 'Temporary password must be at least 8 characters'),
  sendInvitation: z.boolean().default(true),
});

export type CreateTeacherInput = z.infer<typeof CreateTeacherSchema>;
export type QualificationRecord = z.infer<typeof QualificationRecordSchema>;
export type TeachingAssignment = z.infer<typeof TeachingAssignmentSchema>;
