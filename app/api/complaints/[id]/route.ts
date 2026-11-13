import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { complaints, complaintTimeline } from '../../../../src/db/schema.ts';
import { authenticateRequest } from '../../../../src/lib/auth-server.ts';
import { COMPLAINT_STATUSES } from '../../../../src/lib/constants.ts';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, numId));

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    const timeline = await db
      .select()
      .from(complaintTimeline)
      .where(eq(complaintTimeline.complaintId, numId))
      .orderBy(asc(complaintTimeline.createdAt));

    return NextResponse.json({ complaint, timeline });
  } catch (error) {
    console.error('GET /api/complaints/[id] failed:', error);
    return NextResponse.json(
      { error: 'Failed to load complaint details.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!staff.isActive) {
      return NextResponse.json(
        { error: 'Forbidden: Account pending activation.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();
    const status = String(body.status ?? '').trim();
    const assignedDepartment = String(body.assignedDepartment ?? '').trim();
    const progressNote = String(body.progressNote ?? '').trim();
    const resolutionDetails = String(body.resolutionDetails ?? '').trim();

    if (
      !COMPLAINT_STATUSES.includes(
        status as (typeof COMPLAINT_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid complaint status.' },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, numId));

    if (!existing) {
      return NextResponse.json(
        { error: 'Complaint not found.' },
        { status: 404 }
      );
    }

    const nextLatestUpdate =
      progressNote ||
      (status === 'Resolved'
        ? 'Complaint marked as resolved by Ward 65 office.'
        : `Status updated to ${status}.`);

    const [updated] = await db
      .update(complaints)
      .set({
        status,
        assignedDepartment: assignedDepartment || existing.assignedDepartment,
        latestUpdate: nextLatestUpdate,
        resolutionDetails:
          resolutionDetails || existing.resolutionDetails,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, numId))
      .returning();

    await db.insert(complaintTimeline).values({
      complaintId: numId,
      status,
      note: nextLatestUpdate,
      updatedBy: staff.name || staff.email,
    });

    const timeline = await db
      .select()
      .from(complaintTimeline)
      .where(eq(complaintTimeline.complaintId, numId))
      .orderBy(asc(complaintTimeline.createdAt));

    return NextResponse.json({ complaint: updated, timeline });
  } catch (error) {
    console.error('PATCH /api/complaints/[id] failed:', error);
    return NextResponse.json(
      { error: 'Failed to update complaint.' },
      { status: 500 }
    );
  }
}
