import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { announcements } from '../../../../src/db/schema.ts';
import { authenticateRequest } from '../../../../src/lib/auth-server.ts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const titleEn = String(body.titleEn ?? '').trim();
    const type = String(body.type ?? '').trim();
    const location = String(body.location ?? '').trim();
    const eventDate = String(body.eventDate ?? '').trim();
    const descriptionEn = String(body.descriptionEn ?? '').trim();

    if (!titleEn || !type || !location || !eventDate || !descriptionEn) {
      return NextResponse.json(
        { error: 'Title, type, location, date, and description are required.' },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(announcements)
      .values({
        titleEn,
        titleKn: String(body.titleKn ?? '').trim() || titleEn,
        type,
        location,
        eventDate,
        descriptionEn,
        descriptionKn: String(body.descriptionKn ?? '').trim() || descriptionEn,
        photoUrl: body.photoUrl || null,
      })
      .returning();

    const list = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));

    return NextResponse.json(
      { announcement: created, announcements: list },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/announcements failed:', error);
    return NextResponse.json(
      { error: 'Failed to publish announcement.' },
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

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await db.delete(announcements).where(eq(announcements.id, id));
    const list = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));

    return NextResponse.json({ announcements: list });
  } catch (error) {
    console.error('DELETE /api/admin/announcements failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement.' },
      { status: 500 }
    );
  }
}
