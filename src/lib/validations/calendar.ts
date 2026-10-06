import { z } from 'zod';

export const CalendarEventTypeEnum = z.enum([
  'HOLIDAY',
  'VACATION',
  'ACADEMIC',
  'EXAM',
  'SCHOOL_EVENT',
  'SPORTS',
  'CULTURAL',
  'PARENT_TEACHER_MEETING',
  'ADMISSION',
  'RESULT',
  'DEADLINE',
  'STAFF_EVENT',
  'MEETING',
  'OTHER',
]);

export const EventAudienceEnum = z.enum([
  'EVERYONE',
  'STUDENTS',
  'PARENTS',
  'TEACHERS',
  'STAFF',
  'STUDENTS_AND_PARENTS',
  'TEACHERS_AND_STAFF',
  'ADMIN_ONLY',
]);

export const EventRecurrenceEnum = z.enum([
  'NONE',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
  'CUSTOM',
]);

export const CalendarEventStatusEnum = z.enum([
  'ACTIVE',
  'CANCELLED',
  'ARCHIVED',
]);

export const CreateCalendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional().or(z.literal('')),
  eventType: CalendarEventTypeEnum.default('ACADEMIC'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  startTime: z.string().optional().or(z.literal('')),
  endTime: z.string().optional().or(z.literal('')),
  isAllDay: z.boolean().default(true),
  location: z.string().optional().or(z.literal('')),
  organizer: z.string().optional().or(z.literal('')),
  contactInfo: z.string().optional().or(z.literal('')),
  isImportant: z.boolean().default(false),
  audience: EventAudienceEnum.default('EVERYONE'),
  recurrence: EventRecurrenceEnum.default('NONE'),
  sendNotification: z.boolean().default(false),
  academicYearId: z.string().uuid().optional().or(z.literal('')),
  isSpecialWorkingDay: z.boolean().default(false),
  isHoliday: z.boolean().default(false),
});

export const UpdateCalendarEventSchema = CreateCalendarEventSchema.partial().extend({
  id: z.string().uuid(),
  status: CalendarEventStatusEnum.optional(),
});

export type CreateCalendarEventInput = z.infer<typeof CreateCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof UpdateCalendarEventSchema>;
