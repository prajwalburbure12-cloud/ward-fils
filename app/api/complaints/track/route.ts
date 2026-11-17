import { NextRequest, NextResponse } from 'next/server';
import {
  getComplaintsWithTimelineByMobile,
  getComplaintWithTimelineByCodeAndMobile,
} from '../../../../src/db/queries.ts';
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
    const mobileNumber = String(body.mobileNumber ?? '')
      .replace(/\D/g, '')
      .slice(-10);

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      return NextResponse.json(
        {
          error:
            'Please enter your valid 10-digit registered mobile number.',
        },
        { status: 400 }
      );
    }

    const history = await getComplaintsWithTimelineByMobile(mobileNumber);

    if (complaintCode) {
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

      return NextResponse.json({
        complaint: result,
        history: history.length > 0 ? history : [result],
      });
    }

    if (history.length === 0) {
      return NextResponse.json(
        { error: 'No complaints found registered with this mobile number.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      complaint: history[0],
      history,
    });
  } catch (error) {
    console.error('POST /api/complaints/track failed:', error);
    return NextResponse.json(
      { error: 'Unable to track complaint right now.' },
      { status: 500 }
    );
  }
}
