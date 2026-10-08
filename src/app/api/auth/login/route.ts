import { NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validations/auth';
import { getRoleDefaultPath, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/session';
import { AuthService } from '@/services/auth.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || 'Invalid credentials input.' },
        { status: 400 }
      );
    }

    const { email, password, tenantId } = validation.data;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    const result = await AuthService.login({ email, password }, tenantId || null, { ipAddress, userAgent });

    if (!result.success || !result.token || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const redirectUrl = result.mustChangePassword ? '/change-password' : getRoleDefaultPath(result.user.role);
    const cookieOptions = getSessionCookieOptions(result.maxAgeSeconds);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      redirectUrl,
    });

    response.cookies.set(SESSION_COOKIE_NAME, result.token, cookieOptions);

    return response;
  } catch (err: unknown) {
    const errMsg = (err as any)?.message || String(err) || 'An unexpected authentication error occurred.';
    console.error('[LOGIN API ERROR]', errMsg, err);
    return NextResponse.json(
      {
        success: false,
        error: errMsg,
      },
      { status: 500 }
    );
  }
}
