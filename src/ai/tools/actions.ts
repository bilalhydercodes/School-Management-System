import type { AITool, ToolExecutionResult } from './types';
import type { AIUserContext } from '../core/types';

export const actionProposalTools: AITool[] = [
  {
    name: 'propose_announcement',
    description:
      'Proposes a new school announcement or circular for review and confirmation. Does NOT publish automatically.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The headline or title of the announcement.',
        },
        content: {
          type: 'string',
          description: 'The body text or circular details.',
        },
        priority: {
          type: 'string',
          enum: ['NORMAL', 'HIGH'],
          description: 'Priority level for this announcement.',
        },
        targetAudience: {
          type: 'string',
          enum: ['ALL', 'STUDENTS'],
          description: 'Who should receive this announcement.',
        },
      },
      required: ['title', 'content'],
    },
    allowedRoles: ['TEACHER', 'ADMIN', 'SUPERADMIN'],
    execute: async (args: Record<string, any>, context: AIUserContext): Promise<ToolExecutionResult> => {
      const title = String(args.title || 'Announcement').trim();
      const content = String(args.content || '').trim();
      const priority = args.priority === 'HIGH' ? 'HIGH' : 'NORMAL';
      const targetAudience = args.targetAudience === 'STUDENTS' ? 'STUDENTS' : 'ALL';

      return {
        success: true,
        data: {
          proposalStatus: 'AWAITING_USER_CONFIRMATION',
          actionType: 'createAnnouncement',
          title,
          content,
          priority,
          targetAudience,
        },
        actionProposal: {
          actionType: 'createAnnouncement',
          title: `Publish Announcement: "${title}"`,
          description: `You are about to publish an announcement for ${targetAudience.toLowerCase()} audience with ${priority} priority.`,
          payload: {
            title,
            content,
            priority,
            targetAudience,
          },
          requiresConfirmation: true,
        },
        uiCard: {
          type: 'generic',
          title: `Action Proposed: ${title}`,
          badge: 'Needs Confirmation',
          metrics: [
            { label: 'Audience', value: targetAudience },
            { label: 'Priority', value: priority, highlight: priority === 'HIGH' },
            { label: 'Status', value: 'Ready for Review' },
          ],
        },
      };
    },
  },
  {
    name: 'propose_study_plan',
    description:
      'Proposes generating a personalized, data-backed study plan based on student marks, upcoming exams, and pending assignments.',
    parameters: {
      type: 'object',
      properties: {
        focusArea: {
          type: 'string',
          description: 'Optional focus subject or exam prep area.',
        },
      },
    },
    allowedRoles: ['STUDENT'],
    execute: async (args: Record<string, any>, context: AIUserContext): Promise<ToolExecutionResult> => {
      return {
        success: true,
        data: {
          proposalStatus: 'AWAITING_USER_CONFIRMATION',
          actionType: 'createStudyPlan',
          focusArea: args.focusArea || 'General Academic Improvement',
        },
        actionProposal: {
          actionType: 'createStudyPlan',
          title: 'Generate Personalized Study Plan',
          description: 'Compile a customized study routine focusing on your lowest score subjects and upcoming assignment deadlines.',
          payload: {
            focusArea: args.focusArea || 'All Subjects',
          },
          requiresConfirmation: true,
        },
        uiCard: {
          type: 'schedule',
          title: 'Study Plan Ready to Generate',
          badge: 'AI Plan',
          metrics: [
            { label: 'Focus', value: args.focusArea || 'Weak Subjects & Exams' },
            { label: 'Action', value: 'Click Confirm below to generate' },
          ],
        },
      };
    },
  },
  {
    name: 'propose_attendance_report',
    description:
      'Proposes generating a verified school attendance audit report for the past 30 days.',
    parameters: {
      type: 'object',
      properties: {
        periodDays: {
          type: 'number',
          description: 'Number of past days to aggregate (default 30).',
        },
      },
    },
    allowedRoles: ['ADMIN', 'SUPERADMIN', 'TEACHER'],
    execute: async (args: Record<string, any>, context: AIUserContext): Promise<ToolExecutionResult> => {
      const days = Number(args.periodDays) || 30;
      return {
        success: true,
        data: {
          proposalStatus: 'AWAITING_USER_CONFIRMATION',
          actionType: 'generateAttendanceReport',
          periodDays: days,
        },
        actionProposal: {
          actionType: 'generateAttendanceReport',
          title: `Generate Attendance Audit (${days} Days)`,
          description: `Compile a consolidated attendance breakdown across all enrolled classes for the past ${days} days.`,
          payload: {
            periodDays: days,
          },
          requiresConfirmation: true,
        },
        uiCard: {
          type: 'attendance',
          title: 'Audit Report Proposed',
          badge: `${days} Days`,
          metrics: [
            { label: 'Report Scope', value: 'School-Wide' },
            { label: 'Status', value: 'Requires Confirmation' },
          ],
        },
      };
    },
  },
];
