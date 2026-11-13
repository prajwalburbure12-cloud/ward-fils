import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { developmentWorks } from '../../../../src/db/schema.ts';
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
    const area = String(body.area ?? '').trim();
    const category = String(body.category ?? '').trim();
    const status = String(body.status ?? 'Completed').trim();
    const descriptionEn = String(body.descriptionEn ?? '').trim();

    if (!titleEn || !area || !category || !descriptionEn) {
      return NextResponse.json(
        { error: 'Title, area, category, and description are required.' },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(developmentWorks)
      .values({
        titleEn,
        titleKn: String(body.titleKn ?? '').trim() || titleEn,
        area,
        category,
        status,
        descriptionEn,
        descriptionKn: String(body.descriptionKn ?? '').trim() || descriptionEn,
        beforePhotoUrl: body.beforePhotoUrl || null,
        afterPhotoUrl: body.afterPhotoUrl || null,
        completionDate: String(body.completionDate ?? '').trim() || null,
      })
      .returning();

    const works = await db
      .select()
      .from(developmentWorks)
      .orderBy(desc(developmentWorks.createdAt));

    return NextResponse.json({ work: created, developmentWorks: works }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/gallery failed:', error);
    return NextResponse.json(
      { error: 'Failed to add development work.' },
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

    await db.delete(developmentWorks).where(eq(developmentWorks.id, id));
    const works = await db
      .select()
      .from(developmentWorks)
      .orderBy(desc(developmentWorks.createdAt));

    return NextResponse.json({ developmentWorks: works });
  } catch (error) {
    console.error('DELETE /api/admin/gallery failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete development work.' },
      { status: 500 }
    );
  }
}
