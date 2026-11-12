import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Role, type RoleType, type UserSession } from '@/types';
import {
  createSessionToken,
  getRoleDefaultPath,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let email = (body.email || '').toLowerCase().trim();
    let name = body.name || 'User';
    let avatarUrl = body.avatarUrl || null;
    const idToken = body.id_token || body.credential;

    // 1. If a Google ID token is provided, verify it with Google's public token verification service
    if (idToken && typeof idToken === 'string') {
      try {
        const tokenRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
        );
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          email = (tokenData.email || '').toLowerCase().trim();
          name = tokenData.name || name;
          avatarUrl = tokenData.picture || avatarUrl;
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid Google credential token.' },
            { status: 401 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Failed to verify Google credential token.' },
          { status: 401 }
        );
      }
    } else {
      // 2. Mock fallback without verified ID token:
      // In production, unauthenticated mock sign-ins are strictly forbidden
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Direct mock authentication is disabled in production. Please use Google OAuth or institutional credentials.' },
          { status: 401 }
        );
      }

      // In development/test mode, only allow the pre-configured student demo account
      if (!email || email !== 'student@dps.edu.in') {
        return NextResponse.json(
          {
            success: false,
            error: 'Unverified Google sign-in is only permitted for the demo student account (student@dps.edu.in).',
          },
          { status: 403 }
        );
      }
      name = 'Rohan Sharma';
    }

    let dbUser: any = null;
    try {
      dbUser = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          isActive: true,
          deletedAt: null,
        },
      });
    } catch {
      // Database offline/unreachable fallback
      dbUser = null;
    }

    // 3. Role determination:
    // PRIVILEGED ROLES (ADMIN, TEACHER, SUPER_ADMIN) MUST BE EXPLICITLY STORED IN DATABASE.
    // Callers cannot elevate their role via unauthenticated JSON payload.
    let userRole: RoleType = Role.STUDENT;
    if (dbUser?.role && Object.values(Role).includes(dbUser.role)) {
      userRole = dbUser.role as RoleType;
    } else if (process.env.NODE_ENV === 'production' && !dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active institutional account found for this Google email. Please contact your school administrator.',
        },
        { status: 403 }
      );
    }

    const userId = dbUser?.id || `usr-google-${Date.now()}`;
    const tenantId = dbUser?.tenantId || '3c9a7747-cffd-40e1-be07-374b47817e5f'; // Default DPS Delhi Tenant

    const [firstName, ...lastNames] = name.split(' ');
    const userFirstName = dbUser?.firstName || firstName || 'Google';
    const userLastName = dbUser?.lastName || lastNames.join(' ') || 'User';

    const token = await createSessionToken(
      {
        sub: userId,
        tenantId,
        role: userRole,
        email,
        firstName: userFirstName,
        lastName: userLastName,
        mustChangePassword: false,
      },
      '7d'
    );

    const redirectUrl = getRoleDefaultPath(userRole);
    const cookieOptions = getSessionCookieOptions(7 * 24 * 60 * 60);

    const sessionUser: UserSession = {
      userId,
      tenantId,
      role: userRole,
      email,
      firstName: userFirstName,
      lastName: userLastName,
      avatarUrl: dbUser?.avatarUrl || avatarUrl,
      mustChangePassword: false,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      redirectUrl,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (err: unknown) {
    const errMsg = (err as any)?.message || String(err) || 'Google authentication failed.';
    console.error('[GOOGLE AUTH API ERROR]', errMsg, err);
    return NextResponse.json(
      {
        success: false,
        error: errMsg,
      },
      { status: 500 }
    );
  }
}

