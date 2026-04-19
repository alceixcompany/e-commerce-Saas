import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type JwtPayload = {
  id?: string;
  role?: string;
  exp?: number;
};

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJwtSegment<T>(segment: string): T | null {
  try {
    const decoded = new TextDecoder().decode(decodeBase64Url(segment));
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

function getJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  return decodeJwtSegment<JwtPayload>(parts[1]);
}

function isPayloadUsable(payload: JwtPayload | null) {
  if (!payload?.id || payload.role !== 'admin' || typeof payload.exp !== 'number') {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

async function verifyHs256Jwt(token: string, secret: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const header = decodeJwtSegment<{ alg?: string; typ?: string }>(parts[0]);
  if (header?.alg !== 'HS256') return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  return crypto.subtle.verify(
    'HMAC',
    key,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
}

function getBackendApiUrl(request: NextRequest) {
  const rawBackendUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    new URL('/api', request.url).toString();

  return rawBackendUrl.endsWith('/api') ? rawBackendUrl : `${rawBackendUrl.replace(/\/$/, '')}/api`;
}

async function verifyAdminSessionWithBackend(request: NextRequest) {
  try {
    const response = await fetch(`${getBackendApiUrl(request)}/profile`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
        'X-Requested-With': 'XMLHttpRequest',
      },
      cache: 'no-store',
    });

    if (!response.ok) return false;

    const payload = (await response.json()) as {
      success?: boolean;
      data?: { role?: string };
    };

    return payload.success === true && payload.data?.role === 'admin';
  } catch (error) {
    console.error('[proxy] Backend admin verification failed', error);
    return false;
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (!accessToken) {
    return redirectToLogin(request);
  }

  const payload = getJwtPayload(accessToken);
  if (!isPayloadUsable(payload)) {
    return redirectToLogin(request);
  }

  const jwtSecret = process.env.JWT_ACCESS_SECRET;
  if (jwtSecret) {
    const isVerified = await verifyHs256Jwt(accessToken, jwtSecret);
    return isVerified ? NextResponse.next() : redirectToLogin(request);
  }

  const hasVerifiedBackendRole = await verifyAdminSessionWithBackend(request);
  return hasVerifiedBackendRole ? NextResponse.next() : redirectToLogin(request);
}

export const config = {
  matcher: ['/admin/:path*'],
};
