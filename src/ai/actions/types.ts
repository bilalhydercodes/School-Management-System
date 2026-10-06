export type ActionType = 'createAnnouncement' | 'createStudyPlan' | 'generateAttendanceReport';

export interface ActionProposal {
  actionType: ActionType;
  title: string;
  description: string;
  payload: Record<string, any>;
  requiresConfirmation: true;
}

export interface ActionExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
