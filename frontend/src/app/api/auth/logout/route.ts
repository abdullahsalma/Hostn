import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clears the HttpOnly auth cookie.
 */
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });

  response.cookies.set('hostn_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  });

  return response;
}
