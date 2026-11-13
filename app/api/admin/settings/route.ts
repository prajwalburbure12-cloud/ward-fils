import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { portalSettings } from '../../../../src/db/schema.ts';
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
        { error: 'Forbidden: Only Administrators can update portal settings.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    const [updated] = await db
      .update(portalSettings)
      .set({
        bannerImageUrl:
          body.bannerImageUrl === undefined ? undefined : body.bannerImageUrl,
        bannerAlt:
          body.bannerAlt !== undefined
            ? String(body.bannerAlt).trim()
            : undefined,
        officeAddressEn: String(body.officeAddressEn ?? '').trim(),
        officeAddressKn:
          String(body.officeAddressKn ?? '').trim() ||
          String(body.officeAddressEn ?? '').trim(),
        officePhone: String(body.officePhone ?? '').trim(),
        officeEmail: String(body.officeEmail ?? '').trim(),
        whatsappNumber: String(body.whatsappNumber ?? '').trim(),
        googleMapsUrl: String(body.googleMapsUrl ?? '').trim(),
        emergencyWaterPhone: String(body.emergencyWaterPhone ?? '').trim(),
        emergencyPowerPhone: String(body.emergencyPowerPhone ?? '').trim(),
        emergencySanitationPhone: String(
          body.emergencySanitationPhone ?? ''
        ).trim(),
        updatedAt: new Date(),
      })
      .where(eq(portalSettings.id, 1))
      .returning();

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error('PATCH /api/admin/settings failed:', error);
    return NextResponse.json(
      { error: 'Failed to update portal settings.' },
      { status: 500 }
    );
  }
}
