import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { representatives } from '../../../../src/db/schema.ts';
import { authenticateRequest } from '../../../../src/lib/auth-server.ts';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (staff.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only Administrators can edit representative profiles.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const slotOrder = Number(body.slotOrder);
    if (![1, 2, 3].includes(slotOrder)) {
      return NextResponse.json(
        { error: 'Invalid representative slot.' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(representatives)
      .set({
        nameEn: String(body.nameEn ?? '').trim(),
        nameKn: String(body.nameKn ?? '').trim() || String(body.nameEn ?? '').trim(),
        designationEn: String(body.designationEn ?? '').trim(),
        designationKn:
          String(body.designationKn ?? '').trim() ||
          String(body.designationEn ?? '').trim(),
        introEn: String(body.introEn ?? '').trim(),
        introKn: String(body.introKn ?? '').trim() || String(body.introEn ?? '').trim(),
        workEn: String(body.workEn ?? '').trim(),
        workKn: String(body.workKn ?? '').trim() || String(body.workEn ?? '').trim(),
        phone: String(body.phone ?? '').trim(),
        email: String(body.email ?? '').trim(),
        officeHours: String(body.officeHours ?? '').trim(),
        photoUrl: body.photoUrl === undefined ? undefined : body.photoUrl,
        updatedAt: new Date(),
      })
      .where(eq(representatives.slotOrder, slotOrder))
      .returning();

    const allReps = await db
      .select()
      .from(representatives)
      .orderBy(asc(representatives.slotOrder));

    return NextResponse.json({ representative: updated, representatives: allReps });
  } catch (error) {
    console.error('PATCH /api/admin/representatives failed:', error);
    return NextResponse.json(
      { error: 'Failed to update representative profile.' },
      { status: 500 }
    );
  }
}
