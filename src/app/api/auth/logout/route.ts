import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'session_token';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, redirectUrl: '/login' });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
