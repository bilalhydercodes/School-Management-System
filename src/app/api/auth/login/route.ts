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

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (result.requiresOtp && result.challengeId) {
      return NextResponse.json({
        success: true,
        requiresOtp: true,
        challengeId: result.challengeId,
        emailHint: result.emailHint,
        role: result.role,
      });
    }

    if (!result.token || !result.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed to issue session.' },
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
    const rawMsg = (err as any)?.message || String(err) || '';
    console.error('[LOGIN API ERROR]', rawMsg, err);

    let userFacingError = 'An unexpected authentication error occurred. Please try again.';
    if (
      rawMsg.includes("Can't reach database") ||
      rawMsg.includes('Prisma') ||
      rawMsg.includes('ECONNREFUSED')
    ) {
      userFacingError =
        'Database connection is unavailable. Please click one of the 1-Click Demo Logins below to explore the portal.';
    } else if (rawMsg) {
      userFacingError = rawMsg;
    }

    return NextResponse.json(
      {
        success: false,
        error: userFacingError,
      },
      { status: 500 }
    );
  }
}
