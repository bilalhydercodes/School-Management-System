import { prisma } from '@/lib/db';
import type { AITool, ToolExecutionResult } from '../types';
import type { AIUserContext } from '../../core/types';

export const sharedTools: AITool[] = [
  // 1. getSchoolCalendarEvents
  {
    name: 'getSchoolCalendarEvents',
    description: 'Retrieves active academic calendar events, holidays, and school celebrations.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        if (!context.tenantId) {
          return { success: true, data: [] };
        }

        const events = await prisma.calendarEvent.findMany({
          where: {
            tenantId: context.tenantId,
            status: 'ACTIVE',
            startDate: { gte: new Date() },
          },
          orderBy: { startDate: 'asc' },
          take: 5,
          select: {
            title: true,
            eventType: true,
            startDate: true,
            endDate: true,
            isHoliday: true,
          },
        });

        return {
          success: true,
          data: events.map((e) => ({
            title: e.title,
            type: e.eventType,
            date: e.startDate.toISOString().split('T')[0],
            isHoliday: e.isHoliday,
          })),
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },

  // 2. getEmergencyContacts
  {
    name: 'getEmergencyContacts',
    description: 'Retrieves important school administration contact numbers, medical infirmary, and security hotlines.',
    parameters: { type: 'object', properties: {} },
    allowedRoles: ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'SUPER_ADMIN'],
    execute: async (_args, context): Promise<ToolExecutionResult> => {
      try {
        if (!context.tenantId) {
          return { success: true, data: [] };
        }

        const contacts = await prisma.emergencyContact.findMany({
          where: { tenantId: context.tenantId },
          orderBy: { displayOrder: 'asc' },
          select: {
            name: true,
            designation: true,
            phone: true,
            email: true,
            category: true,
          },
        });

        return {
          success: true,
          data: contacts,
          uiCard: contacts.length > 0 ? {
            type: 'generic',
            title: 'Emergency Directory',
            metrics: contacts.slice(0, 3).map((c) => ({
              label: `${c.designation} (${c.name})`,
              value: c.phone,
            })),
          } : undefined,
        };
      } catch (err: any) {
        return { success: false, data: null, error: err.message };
      }
    },
  },
];
