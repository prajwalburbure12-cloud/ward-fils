import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { users } from '../../../../src/db/schema.ts';
import { authenticateRequest } from '../../../../src/lib/auth-server.ts';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (staff.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only Administrators can view staff access list.' },
        { status: 403 }
      );
    }

    const list = await db.select().from(users).orderBy(asc(users.createdAt));
    return NextResponse.json({ users: list });
  } catch (error) {
    console.error('GET /api/admin/users failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff list.' },
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
        { error: 'Forbidden: Only Administrators can manage user permissions.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const userId = Number(body.userId);
    const role = body.role === 'admin' ? 'admin' : 'staff';
    const isActive = Boolean(body.isActive);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    if (userId === staff.id && (!isActive || role !== 'admin')) {
      return NextResponse.json(
        { error: 'Administrators cannot revoke their own admin access.' },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({ role, isActive })
      .where(eq(users.id, userId));

    const list = await db.select().from(users).orderBy(asc(users.createdAt));
    return NextResponse.json({ users: list });
  } catch (error) {
    console.error('PATCH /api/admin/users failed:', error);
    return NextResponse.json(
      { error: 'Failed to update staff permissions.' },
      { status: 500 }
    );
  }
}
