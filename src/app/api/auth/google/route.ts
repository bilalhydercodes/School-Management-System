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
    const email = (body.email || 'student@dps.edu.in').toLowerCase().trim();
    const name = body.name || email.split('@')[0] || 'User';
    const avatarUrl = body.avatarUrl || null;

    let role: RoleType = Role.STUDENT;
    if (body.role && Object.values(Role).includes(body.role)) {
      role = body.role;
    } else if (email.includes('admin') || email.includes('principal') || email.includes('head')) {
      role = Role.ADMIN;
    } else if (email.includes('teacher') || email.includes('faculty') || email.includes('prof')) {
      role = Role.TEACHER;
    } else if (email.includes('superadmin')) {
      role = Role.SUPER_ADMIN;
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

    const userId = dbUser?.id || `usr-google-${Date.now()}`;
    const tenantId = dbUser?.tenantId || '3c9a7747-cffd-40e1-be07-374b47817e5f'; // Default DPS Delhi Tenant
    const userRole = (dbUser?.role as RoleType) || role;

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

