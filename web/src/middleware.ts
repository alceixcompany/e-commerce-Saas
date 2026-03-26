import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isPathAdmin = request.nextUrl.pathname.startsWith('/admin');

  // If trying to access admin panel without an auth token
  if (isPathAdmin && !token) {
    const loginUrl = new URL('/login', request.url);
    // Optional: Return to original page after login
    // loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
};
