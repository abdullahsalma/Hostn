import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/host', '/dashboard'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('hostn_token')?.value;

  // Check if the route is a protected host route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes to login
  // Note: Client-side auth guard in layout.tsx handles the primary check
  // This middleware provides server-side protection for direct URL access
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/host', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected and auth routes
    '/host/:path*',
    '/dashboard/:path*',
    '/auth/:path*',
  ],
};
