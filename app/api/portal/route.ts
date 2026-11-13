import { NextResponse } from 'next/server';
import { getPublicPortalData } from '../../../src/db/queries.ts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPublicPortalData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/portal failed:', error);
    return NextResponse.json(
      { error: 'Unable to load portal data at this moment.' },
      { status: 500 }
    );
  }
}
