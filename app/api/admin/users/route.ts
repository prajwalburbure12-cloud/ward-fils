import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { users } from '../../../../src/db/schema.ts';
import { authenticateRequest } from '../../../../src/lib/auth-server.ts';
import { hashPassword } from '../../../../src/lib/auth-crypto.ts';

export const dynamic = 'force-dynamic';

async function getSanitizedUsers() {
  const list = await db
    .select({
      id: users.id,
      uid: users.uid,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));

  return list;
}

export async function GET(req: NextRequest) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (staff.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only Administrators can view login access list.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ users: await getSanitizedUsers() });
  } catch (error) {
    console.error('GET /api/admin/users failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch login accounts.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (staff.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only Administrators can manage login access.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const userId = Number(body.userId);
    const role = body.role === 'admin' ? 'admin' : 'staff';
    const isActive = Boolean(body.isActive);
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    if (userId === staff.id && (!isActive || role !== 'admin')) {
      return NextResponse.json(
        { error: 'Administrators cannot revoke their own admin access.' },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const updateFields: {
      role: string;
      isActive: boolean;
      passwordHash?: string;
    } = {
      role,
      isActive,
    };

    if (newPassword) {
      updateFields.passwordHash = hashPassword(newPassword);
    }

    await db.update(users).set(updateFields).where(eq(users.id, userId));

    return NextResponse.json({ users: await getSanitizedUsers() });
  } catch (error) {
    console.error('PATCH /api/admin/users failed:', error);
    return NextResponse.json(
      { error: 'Failed to update login permissions.' },
      { status: 500 }
    );
  }
}
