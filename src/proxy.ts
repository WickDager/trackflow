import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/app', '/account', '/team', '/admin', '/billing'];

const authRoutes = ['/auth/login', '/auth/register'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ??
    request.cookies.get('__Secure-authjs.session-token')?.value;

  const isAuthenticated = !!sessionToken;

  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/app/:path*',
    '/account/:path*',
    '/team/:path*',
    '/admin/:path*',
    '/billing/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
