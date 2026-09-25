import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const SESSION_COOKIE_NAME = 'session_token';
const JWT_SECRET = process.env.JWT_SECRET || 'school-erp-super-secure-jwt-secret-min-32-chars-long';

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

const ROLE_REDIRECT_MAP: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/',
  PARENT: '/',
  SUPER_ADMIN: '/superadmin',
  ACCOUNTANT: '/admin',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawRole = (body.role || 'ADMIN').toString().toUpperCase();
    const email = body.email || (rawRole === 'TEACHER' ? 'teacher@dps.edu.in' : rawRole === 'STUDENT' ? 'student@dps.edu.in' : 'admin@dps.edu.in');
    
    let role = rawRole;
    if (!ROLE_REDIRECT_MAP[role]) {
      if (email.includes('teacher')) role = 'TEACHER';
      else if (email.includes('student')) role = 'STUDENT';
      else if (email.includes('super')) role = 'SUPER_ADMIN';
      else role = 'ADMIN';
    }

    const redirectUrl = ROLE_REDIRECT_MAP[role] || '/admin';

    // Sign a fresh 7-day session JWT
    const key = getSecretKey();
    const token = await new SignJWT({
      sub: `demo-user-${role.toLowerCase()}`,
      tenantId: '00000000-0000-0000-0000-000000000001',
      role,
      email,
      firstName: role === 'ADMIN' ? 'School' : role === 'TEACHER' ? 'Senior' : 'Active',
      lastName: role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Faculty' : 'Student',
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(key);

    const response = NextResponse.json({
      success: true,
      role,
      email,
      redirectUrl,
      message: `Logged in as ${role}`,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Demo login API error:', error);
    // Fallback response with redirect URL even on internal error
    return NextResponse.json({
      success: true,
      redirectUrl: '/admin',
      error: error?.message,
    });
  }
}
