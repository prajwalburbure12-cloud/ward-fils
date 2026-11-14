import { NextRequest, NextResponse } from 'next/server';
import { ilike } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { users } from '../../../../src/db/schema.ts';
import { ensureAdminLoginAccounts } from '../../../../src/db/queries.ts';
import {
  createSessionToken,
  verifyPassword,
} from '../../../../src/lib/auth-crypto.ts';
import { SESSION_COOKIE_NAME } from '../../../../src/lib/auth-server.ts';
import { checkRateLimit } from '../../../../src/lib/rate-limit.ts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureAdminLoginAccounts();

    const body = await req.json();
    const loginId = String(body.loginId ?? body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(body.password ?? '');

    if (!loginId || !password) {
      return NextResponse.json(
        { error: 'Login ID and password are required.' },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const ipLimit = checkRateLimit(`admin-login-ip:${ip}`, 15, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please retry in ${ipLimit.retryAfterSec} seconds.`,
        },
        { status: 429 }
      );
    }

    const idLimit = checkRateLimit(
      `admin-login-id:${loginId}`,
      10,
      15 * 60 * 1000
    );
    if (!idLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts for this Login ID. Please wait ${idLimit.retryAfterSec} seconds.`,
        },
        { status: 429 }
      );
    }

    const rows = await db
      .select()
      .from(users)
      .where(ilike(users.email, loginId));

    const user = rows[0];
    if (
      !user ||
      !user.passwordHash ||
      !verifyPassword(password, user.passwordHash)
    ) {
      return NextResponse.json(
        { error: 'Invalid Login ID or password.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          error: 'This Login ID is currently disabled.',
        },
        { status: 403 }
      );
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const sanitizedUser = {
      id: user.id,
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };

    const isProd = process.env.NODE_ENV === 'production';
    const res = NextResponse.json({ token, user: sanitizedUser });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (error) {
    console.error('POST /api/auth/login failed:', error);

    const err = error as {
      code?: string;
      message?: string;
      cause?: { code?: string; message?: string };
    };
    const rootCode = err?.cause?.code || err?.code || '';
    const rootMessage = (
      err?.cause?.message ||
      err?.message ||
      ''
    ).toLowerCase();

    if (
      !process.env.SQL_HOST ||
      !process.env.SQL_USER ||
      !process.env.SQL_DB_NAME
    ) {
      return NextResponse.json(
        {
          error:
            'Database connection is not configured on this live deployment.',
        },
        { status: 503 }
      );
    }

    if (rootCode === '42703' || rootCode === '42P01') {
      return NextResponse.json(
        {
          error:
            'Database schema is out of sync. Please update the database schema.',
        },
        { status: 500 }
      );
    }

    if (
      rootCode === 'ETIMEDOUT' ||
      rootMessage.includes('timeout') ||
      rootMessage.includes('timed out')
    ) {
      return NextResponse.json(
        {
          error:
            'Database is waking up from idle. Please wait a few seconds and click Sign In again.',
        },
        { status: 503 }
      );
    }

    if (
      rootCode === 'ECONNREFUSED' ||
      rootCode === 'ENOENT' ||
      rootCode === '28P01' ||
      rootCode === '28000'
    ) {
      return NextResponse.json(
        {
          error: `Unable to reach the ward database (${rootCode}). Please try again shortly.`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: `Sign-in failed (${rootCode || 'INTERNAL_ERROR'}). Please try again.`,
      },
      { status: 500 }
    );
  }
}
