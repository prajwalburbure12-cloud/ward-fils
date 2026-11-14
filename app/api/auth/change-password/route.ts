import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { users } from '../../../../src/db/schema.ts';
import { authenticateRequest } from '../../../../src/lib/auth-server.ts';
import {
  hashPassword,
  verifyPassword,
} from '../../../../src/lib/auth-crypto.ts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const currentPassword = String(body.currentPassword ?? '');
    const newPassword = String(body.newPassword ?? '');

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, staff.id));
    const record = rows[0];
    if (!record || !record.passwordHash) {
      return NextResponse.json(
        { error: 'Account record not found.' },
        { status: 404 }
      );
    }

    if (!verifyPassword(currentPassword, record.passwordHash)) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({ passwordHash: hashPassword(newPassword) })
      .where(eq(users.id, staff.id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/auth/change-password failed:', error);
    return NextResponse.json(
      { error: 'Failed to update password.' },
      { status: 500 }
    );
  }
}
