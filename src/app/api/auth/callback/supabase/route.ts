import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Role, type RoleType } from '@/types';
import {
  createSessionToken,
  getRoleDefaultPath,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=oauth_code_missing', request.url));
  }

  try {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      return NextResponse.redirect(new URL('/login?error=supabase_not_configured', request.url));
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      console.error('[SUPABASE CALLBACK ERROR]', error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message || 'oauth_exchange_failed')}`, request.url));
    }

    const email = data.user.email || '';
    const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || '';
    const [firstName, ...lastNames] = fullName.split(' ');

    let dbUser: any = null;
    try {
      dbUser = await prisma.user.findFirst({
        where: { email: { equals: email.toLowerCase().trim(), mode: 'insensitive' } },
      });
    } catch {
      dbUser = null;
    }

    let role: RoleType = (dbUser?.role as RoleType) || Role.STUDENT;
    if (!dbUser && email.includes('admin')) {
      role = Role.ADMIN;
    } else if (!dbUser && email.includes('teacher')) {
      role = Role.TEACHER;
    }

    const userId = dbUser?.id || data.user.id;
    const tenantId = dbUser?.tenantId || '3c9a7747-cffd-40e1-be07-374b47817e5f';

    const token = await createSessionToken(
      {
        sub: userId,
        tenantId,
        role,
        email,
        firstName: dbUser?.firstName || firstName || 'User',
        lastName: dbUser?.lastName || lastNames.join(' ') || '',
        mustChangePassword: false,
      },
      '7d'
    );

    const destination = next !== '/' ? next : getRoleDefaultPath(role);
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(7 * 24 * 60 * 60));

    return response;
  } catch (err: unknown) {
    console.error('[SUPABASE AUTH CALLBACK UNCAUGHT ERROR]', err);
    return NextResponse.redirect(new URL('/login?error=auth_internal_error', request.url));
  }
}

