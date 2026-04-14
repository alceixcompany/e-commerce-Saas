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

const GOOD_BOTS_RE = /(googlebot|bingbot|duckduckbot|applebot|yandexbot)/i;
const AGGRESSIVE_BOTS_RE = /(ahrefs|semrush|mj12bot|blexbot|dotbot|petalbot|bytespider|dataforseo|seznam|censys|zgrab|masscan|sqlmap|nmap|nikto|acunetix|burp|scrapy|python-requests|curl|wget|go-http-client|node-fetch)/i;

function notFoundCached() {
  const res = new NextResponse('Not Found', { status: 404 });
  // Cache per-path at the edge/CDN when possible to reduce repeat probes.
  res.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  return res;
}

function looksLikeProbe(pathname: string) {
  if (pathname.length > 140) return true;
  if (pathname.includes('..') || pathname.includes('%2e') || pathname.includes('%2E')) return true;
  if (pathname.includes('%00') || pathname.includes('\\0')) return true;
  if (/[<>{}]/.test(pathname)) return true;
  if (pathname.includes('//')) return true;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 6) return true;
  if (segments.some((s) => s.length > 64)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    if (SCANNER_PATHS_EXACT.has(pathname) || SCANNER_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
      return notFoundCached();
    }

    // Only apply admin auth gate for admin routes.
    if (pathname.startsWith('/admin')) {
      return proxy(request);
    }

    const ua = request.headers.get('user-agent') || '';
    const isGoodBot = GOOD_BOTS_RE.test(ua);
    const isAggressiveBot = AGGRESSIVE_BOTS_RE.test(ua) || ua.length === 0;

    // For non-admin pages, aggressively drop obvious probes to avoid expensive SSR/layout work.
    if (!isGoodBot && isAggressiveBot && looksLikeProbe(pathname)) {
      return notFoundCached();
    }

    return NextResponse.next();
  } catch (err) {
    // Never let middleware throw: a thrown error becomes a 500 at the edge.
    console.error('[middleware] Unexpected error', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Run for all "page-like" routes (exclude API, Next internals, and files with extensions).
    '/((?!api/|_next/|.*\\..*).*)',
  ],
};
