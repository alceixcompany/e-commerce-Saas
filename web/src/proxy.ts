import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const hasAuthCookie = !!(accessToken || refreshToken);
  const isPathAdmin = request.nextUrl.pathname.startsWith('/admin');

  // If trying to access admin panel without an auth token
  if (isPathAdmin && !hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    // Optional: Return to original page after login
    // loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent non-admin sessions from hitting admin routes (reduces bot/user misuse and avoids UI crashes).
  if (isPathAdmin) {
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(accessToken);
    if (payload?.role !== 'admin') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
};
