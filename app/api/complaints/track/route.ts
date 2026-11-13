import { NextRequest, NextResponse } from 'next/server';
import { getComplaintWithTimelineByCodeAndMobile } from '../../../../src/db/queries.ts';
import { checkRateLimit } from '../../../../src/lib/rate-limit.ts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const limit = checkRateLimit(`track:${ip}`, 30, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Too many lookup attempts. Please wait ${limit.retryAfterSec} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const complaintCode = String(body.complaintCode ?? '').trim();
    const mobileNumber = String(body.mobileNumber ?? '').replace(/\D/g, '');

    if (!complaintCode || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      return NextResponse.json(
        {
          error:
            'Please enter both a valid Complaint ID and your 10-digit registered mobile number.',
        },
        { status: 400 }
      );
    }

    const result = await getComplaintWithTimelineByCodeAndMobile(
      complaintCode,
      mobileNumber
    );

    if (!result) {
      return NextResponse.json(
        { error: 'No complaint found matching that Complaint ID.' },
        { status: 404 }
      );
    }

    if (result === 'MISMATCH') {
      return NextResponse.json(
        {
          error:
            'The mobile number provided does not match the registered complaint record.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ complaint: result });
  } catch (error) {
    console.error('POST /api/complaints/track failed:', error);
    return NextResponse.json(
      { error: 'Unable to track complaint right now.' },
      { status: 500 }
    );
  }
}
