import { NextResponse } from 'next/server';
import { clearSessionCookie, getSessionFromCookies } from '@/lib/session';
import { revokeAllUserSessions } from '@/lib/session-revocation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Fire background revocation if session exists
  getSessionFromCookies()
    .then((session) => {
      if (session?.sub) {
        revokeAllUserSessions(session.sub).catch(() => {});
      }
    })
    .catch(() => {});

  await clearSessionCookie();
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set('aeh_session', '', { maxAge: 0, path: '/' });
  return response;
}

export async function POST() {
  getSessionFromCookies()
    .then((session) => {
      if (session?.sub) {
        revokeAllUserSessions(session.sub).catch(() => {});
      }
    })
    .catch(() => {});

  await clearSessionCookie();
  const response = NextResponse.json({ success: true });
  response.cookies.set('aeh_session', '', { maxAge: 0, path: '/' });
  return response;
}
