import { NextResponse, type NextRequest } from 'next/server';

import { proxy } from './src/proxy';

// Short-circuit common scanner paths before they reach the app layer.
// This reduces function invocations and origin traffic from automated probes.
const SCANNER_PATHS_EXACT = new Set([
  '/.env',
  '/.git',
  '/wp-login.php',
  '/xmlrpc.php',
]);

const SCANNER_PATH_PREFIXES = [
  '/.git/',
  '/wp-admin',
  '/phpmyadmin',
  '/cgi-bin',
];

export function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    if (SCANNER_PATHS_EXACT.has(pathname) || SCANNER_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return proxy(request);
  } catch (err) {
    // Never let middleware throw: a thrown error becomes a 500 at the edge.
    console.error('[middleware] Unexpected error', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/.env',
    '/.git',
    '/.git/:path*',
    '/wp-admin',
    '/wp-admin/:path*',
    '/wp-login.php',
    '/phpmyadmin',
    '/phpmyadmin/:path*',
    '/cgi-bin/:path*',
    '/xmlrpc.php',
  ],
};
