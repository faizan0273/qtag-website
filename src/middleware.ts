import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import {
  SHOPIFY_EMBED_MODE,
  defaultActivatePath,
  isEmbedAllowedPath,
} from '@/lib/shopify-embed';

/**
 * Edge middleware — Shopify embed: block shop/dashboard; auth-gate activate only.
 * Public scan /t/{uid} and /scan/{uid} stay open (router decides activate vs contact).
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

  if (
    SHOPIFY_EMBED_MODE &&
    !pathname.startsWith('/api') &&
    !isEmbedAllowedPath(pathname)
  ) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const isActivate = Boolean(pathname.match(/^\/t\/[^/]+\/activate$/));

  if (isActivate) {
    const authed = await isAuthed(req);
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname + search);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/login' || pathname === '/verify') {
    if (await isAuthed(req)) {
      const next = req.nextUrl.searchParams.get('next');
      if (
        next &&
        next.startsWith('/') &&
        !next.startsWith('//') &&
        isEmbedAllowedPath(next.split('?')[0] ?? next)
      ) {
        const url = req.nextUrl.clone();
        url.pathname = next.split('?')[0]!;
        url.search = next.includes('?') ? next.slice(next.indexOf('?')) : '';
        return NextResponse.redirect(url);
      }
      if (SHOPIFY_EMBED_MODE && process.env.NODE_ENV === 'development') {
        const url = req.nextUrl.clone();
        url.pathname = '/dev/qr';
        url.search = '';
        return NextResponse.redirect(url);
      }
      if (SHOPIFY_EMBED_MODE) {
        const activate = defaultActivatePath();
        if (activate) {
          const url = req.nextUrl.clone();
          url.pathname = activate;
          url.search = '';
          return NextResponse.redirect(url);
        }
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
