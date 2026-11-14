import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '../../../../src/lib/auth-server.ts';

export const dynamic = 'force-dynamic';

export async function POST() {
  const isProd = process.env.NODE_ENV === 'production';
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    path: '/',
    maxAge: 0,
  });
  return res;
}
