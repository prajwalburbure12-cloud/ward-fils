import { NextRequest, NextResponse } from 'next/server';
import { asc, eq, ilike } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { users } from '../../../../src/db/schema.ts';
import { authenticateRequest } from '../../../../src/lib/auth-server.ts';
import { PRIMARY_ADMIN_EMAIL } from '../../../../src/lib/constants.ts';

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

export async function POST(req: NextRequest) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (staff.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only Administrators can pre-authorise staff.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const name = String(body.name ?? '').trim() || null;
    const role = body.role === 'admin' ? 'admin' : 'staff';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid Google email address.' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(users)
      .where(ilike(users.email, email));

    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          role:
            email === PRIMARY_ADMIN_EMAIL.toLowerCase() ? 'admin' : role,
          isActive: true,
          name: name ?? existing[0].name,
        })
        .where(eq(users.id, existing[0].id));
    } else {
      await db.insert(users).values({
        uid: `pending:${email}`,
        email,
        name,
        role: email === PRIMARY_ADMIN_EMAIL.toLowerCase() ? 'admin' : role,
        isActive: true,
      });
    }

    const list = await db.select().from(users).orderBy(asc(users.createdAt));
    return NextResponse.json({ users: list }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/users failed:', error);
    return NextResponse.json(
      { error: 'Failed to pre-authorise staff email.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (staff.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only Administrators can remove staff records.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    if (id === staff.id) {
      return NextResponse.json(
        { error: 'You cannot remove your own account.' },
        { status: 400 }
      );
    }

    const [target] = await db.select().from(users).where(eq(users.id, id));
    if (!target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (target.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Primary Ward Administrator cannot be removed.' },
        { status: 400 }
      );
    }

    await db.delete(users).where(eq(users.id, id));
    const list = await db.select().from(users).orderBy(asc(users.createdAt));
    return NextResponse.json({ users: list });
  } catch (error) {
    console.error('DELETE /api/admin/users failed:', error);
    return NextResponse.json(
      { error: 'Failed to remove staff account.' },
      { status: 500 }
    );
  }
}
