import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/jwt';
import type { JWTPayload } from '@/types';

const SESSION_COOKIE_NAME = 'session_token';

/**
 * Lightweight, zero-dependency route matcher for Edge runtime.
 */
function createRouteMatcher(patterns: string[]) {
  return (requestOrPath: NextRequest | string): boolean => {
    const pathname = typeof requestOrPath === 'string'
      ? requestOrPath
      : (requestOrPath?.nextUrl?.pathname || '');

    return patterns.some((pattern) => {
      const basePattern = pattern.replace(/\(\.\*\)$/, '').replace(/\*$/, '');
      if (pattern.includes('(.*)') || pattern.includes('*')) {
        return pathname === basePattern || pathname.startsWith(basePattern.endsWith('/') ? basePattern : basePattern + '/');
      }
      return pathname === pattern;
    });
  };
}

// Protected Route Matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/unauthorized',
  '/api/health(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);
const isTeacherRoute = createRouteMatcher(['/teacher(.*)', '/api/teacher(.*)']);
const isSuperAdminRoute = createRouteMatcher(['/superadmin(.*)', '/api/superadmin(.*)']);
const isPortalRoute = createRouteMatcher(['/portal(.*)', '/api/portal(.*)', '/student(.*)']);

export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = request.nextUrl;
    const rawHost = request.headers.get('host') || 'localhost:3000';
    const cleanHost = rawHost.split(':')[0].trim().toLowerCase();
    const rawAppDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'schoolerp.in';
    const appDomain = rawAppDomain.split(':')[0].toLowerCase();

    // Guard against malformed Host headers or header injection
    const isValidHost = /^[a-z0-9.-]+$/.test(cleanHost);
    if (!isValidHost) {
      return new NextResponse('Bad Request: Invalid Host header format', { status: 400 });
    }

    const requestHeaders = new Headers(request.headers);

    // Security: Strip internal headers to prevent client-side spoofing
    requestHeaders.delete('x-user-id');
    requestHeaders.delete('x-user-role');
    requestHeaders.delete('x-user-email');
    requestHeaders.delete('x-user-tenant-id');
    requestHeaders.delete('x-tenant-id');
    requestHeaders.delete('x-tenant-slug');
    requestHeaders.delete('x-tenant-name');
    requestHeaders.delete('x-tenant-domain');
    requestHeaders.delete('x-is-superadmin-domain');

    // 1. Domain & Tenant derivation
    const isSuperAdminDomain =
      cleanHost === `app.${appDomain}` ||
      cleanHost === `admin.${appDomain}` ||
      cleanHost === 'localhost' ||
      cleanHost === '127.0.0.1';

    if (isSuperAdminDomain) {
      requestHeaders.set('x-is-superadmin-domain', 'true');
    }

    let slug: string | null = null;
    if (cleanHost.endsWith(`.${appDomain}`)) {
      const candidate = cleanHost.replace(`.${appDomain}`, '');
      if (/^[a-z0-9-]+$/.test(candidate) && candidate !== 'app' && candidate !== 'admin') {
        slug = candidate;
      }
    } else if (!isSuperAdminDomain) {
      requestHeaders.set('x-tenant-domain', cleanHost);
    }

    if (slug) {
      requestHeaders.set('x-tenant-slug', slug);
    }

    // 2. Auth Session Resolution (Direct Session Token)
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    let session: JWTPayload | null = null;

    if (sessionCookie) {
      session = await verifySessionToken(sessionCookie);
      if (session) {
        requestHeaders.set('x-user-id', session.sub);
        requestHeaders.set('x-user-role', session.role);
        requestHeaders.set('x-user-email', session.email);
        if (session.tenantId) {
          requestHeaders.set('x-user-tenant-id', session.tenantId);
          requestHeaders.set('x-tenant-id', session.tenantId);
        }
      }
    }

    const isApiRoute = pathname.startsWith('/api/');
    const isAuthenticated = Boolean(session);

    // 3. Route Access Guards
    const isProtected = isAdminRoute(request) || isTeacherRoute(request) || isSuperAdminRoute(request) || isPortalRoute(request);

    if (isProtected && !isAuthenticated) {
      if (isApiRoute) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Authentication required.' }, { status: 401 });
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role verification if session payload is available
    if (session) {
      if (isSuperAdminRoute(request) && session.role !== 'SUPER_ADMIN') {
        if (isApiRoute) return NextResponse.json({ success: false, error: 'Forbidden: Super Admin privileges required.' }, { status: 403 });
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (isAdminRoute(request)) {
        const isFeeRoute = pathname.startsWith('/admin/fees') || pathname.startsWith('/api/admin/fees');
        const isAllowed = session.role === 'ADMIN' || session.role === 'SUPER_ADMIN' || (session.role === 'ACCOUNTANT' && isFeeRoute);
        if (!isAllowed) {
          if (isApiRoute) return NextResponse.json({ success: false, error: 'Forbidden: Admin privileges required.' }, { status: 403 });
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      if (isTeacherRoute(request) && !['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
        if (isApiRoute) return NextResponse.json({ success: false, error: 'Forbidden: Teacher privileges required.' }, { status: 403 });
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (isPortalRoute(request) && !['STUDENT', 'PARENT', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
        if (isApiRoute) return NextResponse.json({ success: false, error: 'Forbidden: Portal privileges required.' }, { status: 403 });
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    console.error('[MIDDLEWARE EXECUTION ERROR]:', err);
    return NextResponse.next();
  }
}

export default middleware;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
