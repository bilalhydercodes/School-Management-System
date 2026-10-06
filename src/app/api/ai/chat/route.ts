import { NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { ChatService } from '@/ai/services/chat.service';
import { getPermissionsForRole, validateChatMessage } from '@/ai/security/authorization';
import type { AIUserContext, AIChatRequest } from '@/ai/core/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/ai/chat
 * Provides authenticated session metadata, role-aware greeting, and dynamic contextual suggestions.
 */
export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedContext();

    if (!auth || !auth.userId || !auth.role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You must be signed in to access Alpha AI Copilot.' },
        { status: 401 }
      );
    }

    const { role, user, tenant } = auth;
    const name = user.firstName || 'there';
    const url = new URL(request.url);
    const currentPath = (url.searchParams.get('currentPath') || '').toLowerCase();

    // Role-specific greeting
    let greeting = `Hi ${name} 👋\nHow can I help you today?`;
    let suggestions: string[] = [];

    // Contextual Dynamic Suggestions based on Active Screen Path
    if (currentPath.includes('attendance')) {
      if (role === 'STUDENT') {
        greeting = `Hi ${name} 👋\nReviewing your attendance? I can help break down your records.`;
        suggestions = [
          'Explain my attendance',
          'Which subjects are below 75%?',
          'What is the school attendance policy?',
          'How many classes can I afford to miss?',
        ];
      } else if (role === 'TEACHER') {
        greeting = `Hi ${name} 👋\nTracking attendance records? Let's check student presence.`;
        suggestions = [
          'Who has low attendance (<75%)?',
          'Summarize today’s class attendance',
          'Propose attendance report',
        ];
      } else {
        greeting = `Hi ${name} 👋\nViewing institutional attendance analytics.`;
        suggestions = [
          'Give me today’s school overview',
          'Show overall attendance',
          'Generate attendance audit report',
        ];
      }
    } else if (currentPath.includes('marks') || currentPath.includes('grades') || currentPath.includes('exam')) {
      if (role === 'STUDENT') {
        greeting = `Hi ${name} 👋\nReviewing academic results? Let's analyze where you can excel.`;
        suggestions = [
          'Analyze my performance',
          'What should I improve?',
          'Create a study plan for me',
          'What are the passing mark rules?',
        ];
      } else if (role === 'TEACHER') {
        greeting = `Hi ${name} 👋\nAnalyzing student evaluations and exam performance.`;
        suggestions = [
          'Summarize my class performance',
          'Who needs academic attention?',
          'Upcoming examination schedule',
        ];
      } else {
        suggestions = [
          'School-wide academic performance',
          'Top performing classes',
          'Examination bye-laws policy',
        ];
      }
    } else if (currentPath.includes('assignment')) {
      if (role === 'STUDENT') {
        suggestions = [
          'What should I complete first?',
          'Show pending assignments',
          'Late assignment submission policy',
        ];
      } else {
        suggestions = [
          'Who has missing assignments?',
          'Review pending homework submissions',
        ];
      }
    } else if (currentPath.includes('fee')) {
      suggestions = [
        'Are there any pending fees?',
        'What is the fee payment deadline?',
        'School fee refund policy',
      ];
    } else {
      // Default dashboard suggestions
      switch (role) {
        case 'STUDENT':
          greeting = `Hi ${name} 👋\nHow can I help with your academics today?`;
          suggestions = [
            'How is my attendance?',
            'What assignments are pending?',
            'Create a study plan for me',
            'What exams are coming up?',
          ];
          break;

        case 'TEACHER':
          greeting = `Hi ${name} 👋\nI can help you with your classes, attendance and student performance.`;
          suggestions = [
            'Show today’s classes',
            'Which students have low attendance?',
            'Create an announcement',
            'Who has pending assignments?',
          ];
          break;

        case 'PARENT':
          greeting = `Hi ${name} 👋\nI can help you understand your child’s academic activity.`;
          suggestions = [
            'How is my child doing?',
            'Show attendance summary',
            'Are there any pending fees?',
            'What is coming up this week?',
          ];
          break;

        case 'ADMIN':
        case 'ACCOUNTANT':
          greeting = `Hi ${name} 👋\nI can help you understand what’s happening across your school.`;
          suggestions = [
            'Give me today’s school overview',
            'Show overall attendance',
            'Generate attendance report',
            'What needs attention?',
          ];
          break;

        case 'SUPER_ADMIN':
          greeting = `Hi ${name} 👋\nI can help you monitor schools, tenants, and platform health.`;
          suggestions = [
            'Summarize registered institutions',
            'Show pending school applications',
            'How many schools are active?',
          ];
          break;

        default:
          suggestions = ['How can Alpha AI Copilot help me?'];
          break;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: auth.userId,
        name: user.fullName,
        role: auth.role,
        schoolName: tenant?.name || 'Alpha Edu Hub',
      },
      greeting,
      suggestions,
    });
  } catch (error) {
    console.error('[AI CHAT GET ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve AI copilot state.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/chat
 * Handles incoming chat messages, derives server-side auth/tenant context, and returns AI responses.
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate Request from Server-Side Session
    const auth = await getAuthenticatedContext();

    if (!auth || !auth.userId || !auth.role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You must be signed in to communicate with Alpha AI Copilot.' },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Payload
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload received.' },
        { status: 400 }
      );
    }

    const { message, conversationId, currentPath, history } = body || {};

    const validation = validateChatMessage(message);
    if (!validation.valid || !validation.cleanMessage) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Empty or invalid message.' },
        { status: 400 }
      );
    }

    // 3. Construct Verified Server-Side User Context
    // NEVER TRUST client-provided role, tenantId, or userId
    const userContext: AIUserContext = {
      userId: auth.userId,
      tenantId: auth.tenantId,
      role: auth.role,
      name: auth.user.fullName || auth.user.firstName || 'User',
      email: auth.user.email,
      currentPath: typeof currentPath === 'string' ? currentPath : '/',
      permissions: getPermissionsForRole(auth.role),
    };

    const chatRequest: AIChatRequest = {
      message: validation.cleanMessage,
      conversationId: typeof conversationId === 'string' ? conversationId : undefined,
      currentPath: typeof currentPath === 'string' ? currentPath : '/',
      history: Array.isArray(history) ? history : [],
    };

    // 4. Delegate to AI Chat Service
    const result = await ChatService.processMessage(userContext, chatRequest);

    const httpStatus = result.success ? 200 : 400;
    return NextResponse.json(result, { status: httpStatus });
  } catch (err) {
    console.error('[AI CHAT ROUTE UNHANDLED ERROR]:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal server error occurred while processing your request.',
      },
      { status: 500 }
    );
  }
}
