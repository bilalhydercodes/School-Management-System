import { studentTools } from './student';
import { parentTools } from './parent';
import { teacherTools } from './teacher';
import { adminTools } from './admin';
import { superAdminTools } from './super-admin';
import { sharedTools } from './shared';
import { actionProposalTools } from './actions';
import type { AITool, GroqFunctionTool, ToolExecutionResult } from './types';
import type { AIUserContext } from '../core/types';

export * from './types';

// Master list of all registered tools
const ALL_TOOLS: AITool[] = [
  ...studentTools,
  ...parentTools,
  ...teacherTools,
  ...adminTools,
  ...superAdminTools,
  ...sharedTools,
  ...actionProposalTools,
];

// O(1) Tool lookup map
const toolsByName = new Map<string, AITool>();
for (const tool of ALL_TOOLS) {
  toolsByName.set(tool.name, tool);
}

/**
 * Returns the list of executable tools authorized for the user's role.
 * Enforces role isolation: Students cannot see or invoke Teacher/Admin tools.
 */
export function getToolsForRole(role: string): AITool[] {
  const normalizedRole = role.toUpperCase();
  return ALL_TOOLS.filter((t) => t.allowedRoles.includes(normalizedRole));
}

/**
 * Converts authorized role tools into Groq / OpenAI compatible function calling specifications.
 */
export function getGroqToolsForRole(role: string): GroqFunctionTool[] {
  const tools = getToolsForRole(role);
  return tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

/**
 * Safely executes a registered tool on the server with full authorization and tenant verification.
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context: AIUserContext
): Promise<ToolExecutionResult> {
  const tool = toolsByName.get(toolName);

  if (!tool) {
    return {
      success: false,
      data: null,
      error: `Requested tool '${toolName}' is not registered in the system.`,
    };
  }

  // Enforce server-side role authorization before execution
  const normalizedRole = context.role.toUpperCase();
  if (!tool.allowedRoles.includes(normalizedRole)) {
    return {
      success: false,
      data: null,
      error: `Security Error: Role '${context.role}' is not authorized to execute '${toolName}'.`,
    };
  }

  try {
    return await tool.execute(args, context);
  } catch (err: any) {
    console.error(`[AI TOOL EXECUTION ERROR] (${toolName}):`, err);
    return {
      success: false,
      data: null,
      error: err.message || `An error occurred while executing ${toolName}.`,
    };
  }
}
