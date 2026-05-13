import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Edge middleware — runs on every request.
 *
 * We can't import lib/auth here because it pulls in mongoose (Node-only).
 * So we reimplement the session check inline using `jose` directly.
 */

const SESSION_COOKIE = 'qrs_session';
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '');

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !process.env.JWT_SECRET) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Routes that require an authenticated user
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/payments/') ||
    pathname.match(/^\/t\/[^/]+\/activate$/);

  if (isProtected) {
    const authed = await isAuthed(req);
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname + search);
      return NextResponse.redirect(url);
    }
  }

  // If logged in, /login and /verify should bounce to dashboard
  if (pathname === '/login' || pathname === '/verify') {
    if (await isAuthed(req)) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/checkout/:path*',
    '/payments/:path*',
    '/t/:uid/activate',
    '/login',
    '/verify',
  ],
};
