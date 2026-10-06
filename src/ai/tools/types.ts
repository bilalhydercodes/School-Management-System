import type { AIUserContext } from '../core/types';
import type { RoleType } from '@/types';

export interface UICardMetric {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface UICard {
  type: 'attendance' | 'marks' | 'assignments' | 'exam' | 'fee' | 'schedule' | 'generic';
  title: string;
  badge?: string;
  metrics: UICardMetric[];
}

export interface UIAction {
  label: string;
  path: string;
  icon?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  data: Record<string, unknown> | Array<unknown> | string | number | null;
  error?: string;
  uiCard?: UICard;
  uiActions?: UIAction[];
  actionProposal?: {
    actionType: 'createAnnouncement' | 'createStudyPlan' | 'generateAttendanceReport';
    title: string;
    description: string;
    payload: Record<string, any>;
    requiresConfirmation: true;
  };
}

export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  allowedRoles: Array<RoleType | string>;
  execute: (args: Record<string, unknown>, userContext: AIUserContext) => Promise<ToolExecutionResult>;
}

export interface GroqFunctionTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}
