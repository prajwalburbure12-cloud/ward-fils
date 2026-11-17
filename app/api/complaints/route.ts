import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, gte, ilike, lte, or } from 'drizzle-orm';
import { db } from '../../../src/db/index.ts';
import {
  complaints,
  complaintTimeline,
  type ComplaintMediaItem,
} from '../../../src/db/schema.ts';
import { generateNextComplaintCode } from '../../../src/db/queries.ts';
import { authenticateRequest } from '../../../src/lib/auth-server.ts';
import { checkRateLimit } from '../../../src/lib/rate-limit.ts';
import { sendComplaintRegistrationSms } from '../../../src/lib/sms.ts';
import { COMPLAINT_CATEGORIES } from '../../../src/lib/constants.ts';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const staff = await authenticateRequest(req);
    if (!staff) {
      return NextResponse.json(
        { error: 'Unauthorized: Sign in required.' },
        { status: 401 }
      );
    }
    if (!staff.isActive) {
      return NextResponse.json(
        {
          error:
            'Forbidden: Your account is awaiting Administrator activation.',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const area = searchParams.get('area')?.trim() ?? '';
    const category = searchParams.get('category')?.trim() ?? '';
    const status = searchParams.get('status')?.trim() ?? '';
    const from = searchParams.get('from')?.trim() ?? '';
    const to = searchParams.get('to')?.trim() ?? '';

    const conditions = [];
    if (q) {
      conditions.push(
        or(
          ilike(complaints.complaintCode, `%${q}%`),
          ilike(complaints.citizenName, `%${q}%`),
          ilike(complaints.areaStreet, `%${q}%`),
          ilike(complaints.description, `%${q}%`),
          ilike(complaints.mobileNumber, `%${q}%`)
        )
      );
    }
    if (area) {
      conditions.push(ilike(complaints.areaStreet, `%${area}%`));
    }
    if (category) {
      conditions.push(eq(complaints.category, category));
    }
    if (status) {
      conditions.push(eq(complaints.status, status));
    }
    if (from) {
      const fromDate = new Date(`${from}T00:00:00.000Z`);
      if (!Number.isNaN(fromDate.getTime())) {
        conditions.push(gte(complaints.createdAt, fromDate));
      }
    }
    if (to) {
      const toDate = new Date(`${to}T23:59:59.999Z`);
      if (!Number.isNaN(toDate.getTime())) {
        conditions.push(lte(complaints.createdAt, toDate));
      }
    }

    const rows =
      conditions.length > 0
        ? await db
            .select()
            .from(complaints)
            .where(and(...conditions))
            .orderBy(desc(complaints.createdAt))
        : await db
            .select()
            .from(complaints)
            .orderBy(desc(complaints.createdAt));

    return NextResponse.json({ complaints: rows });
  } catch (error) {
    console.error('GET /api/complaints failed:', error);
    return NextResponse.json(
      { error: 'Failed to load complaints.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot check for automated spam bots
    if (body.website && String(body.website).trim() !== '') {
      return NextResponse.json(
        { error: 'Submission rejected by spam protection.' },
        { status: 400 }
      );
    }

    const citizenName = String(body.citizenName ?? '').trim();
    const rawMobile = String(body.mobileNumber ?? '').replace(/\D/g, '');
    const areaStreet = String(body.areaStreet ?? '').trim();
    const wardNumber = String(body.wardNumber ?? '65').trim() || '65';
    const category = String(body.category ?? '').trim();
    const description = String(body.description ?? '').trim();
    const landmark = String(body.landmark ?? '').trim();

    if (citizenName.length < 2 || citizenName.length > 120) {
      return NextResponse.json(
        { error: 'Please enter a valid full name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(rawMobile)) {
      return NextResponse.json(
        {
          error:
            'Please enter a valid 10-digit Indian mobile number starting with 6–9.',
        },
        { status: 400 }
      );
    }

    if (areaStreet.length < 2 || areaStreet.length > 160) {
      return NextResponse.json(
        { error: 'Please enter your Area or Street name.' },
        { status: 400 }
      );
    }

    if (
      !COMPLAINT_CATEGORIES.includes(
        category as (typeof COMPLAINT_CATEGORIES)[number]
      )
    ) {
      return NextResponse.json(
        { error: 'Please select a valid complaint category.' },
        { status: 400 }
      );
    }

    if (description.length > 2500) {
      return NextResponse.json(
        {
          error: 'Description cannot exceed 2500 characters.',
        },
        { status: 400 }
      );
    }

    // Rate limiting by IP and Mobile Number (max 5 submissions per 15 mins)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const ipLimit = checkRateLimit(`ip:${ip}`, 8, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests from this network. Please retry after ${ipLimit.retryAfterSec} seconds.`,
        },
        { status: 429 }
      );
    }

    const mobileLimit = checkRateLimit(`mob:${rawMobile}`, 5, 15 * 60 * 1000);
    if (!mobileLimit.allowed) {
      return NextResponse.json(
        {
          error: `Submission limit reached for this mobile number. Please wait ${mobileLimit.retryAfterSec} seconds.`,
        },
        { status: 429 }
      );
    }

    // Validate uploaded media items (up to 4 items, dataUrl size check)
    const rawMedia = Array.isArray(body.mediaFiles) ? body.mediaFiles : [];
    const mediaFiles: ComplaintMediaItem[] = [];
    for (const item of rawMedia.slice(0, 4)) {
      if (
        item &&
        typeof item.dataUrl === 'string' &&
        (item.type === 'image' || item.type === 'video') &&
        item.dataUrl.startsWith('data:') &&
        item.dataUrl.length <= 7_000_000
      ) {
        mediaFiles.push({
          name: String(item.name ?? 'attachment').slice(0, 100),
          type: item.type,
          dataUrl: item.dataUrl,
        });
      }
    }

    const complaintCode = await generateNextComplaintCode();

    const [created] = await db
      .insert(complaints)
      .values({
        complaintCode,
        citizenName,
        mobileNumber: rawMobile,
        areaStreet,
        wardNumber: wardNumber === '65' ? '65' : '65',
        category,
        description,
        landmark: landmark || null,
        mediaFiles,
        status: 'Submitted',
        assignedDepartment: 'Ward 65 Civic Office',
        latestUpdate:
          'Complaint registered online and queued for Ward 65 inspection.',
      })
      .returning();

    await db.insert(complaintTimeline).values({
      complaintId: created.id,
      status: 'Submitted',
      note: 'Complaint received via Ward No. 65 Public Service Portal.',
      updatedBy: 'Citizen Portal',
    });

    const smsResult = await sendComplaintRegistrationSms({
      mobileNumber: rawMobile,
      complaintCode: created.complaintCode,
      citizenName: created.citizenName,
      areaStreet: created.areaStreet,
      category: created.category,
    });

    return NextResponse.json(
      {
        complaint: {
          complaintCode: created.complaintCode,
          citizenName: created.citizenName,
          areaStreet: created.areaStreet,
          wardNumber: created.wardNumber,
          category: created.category,
          status: created.status,
          createdAt: created.createdAt,
        },
        smsSent: smsResult.sent,
        maskedMobile: `+91 ******${rawMobile.slice(-4)}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/complaints failed:', error);
    return NextResponse.json(
      { error: 'Unable to submit complaint right now. Please try again.' },
      { status: 500 }
    );
  }
}
