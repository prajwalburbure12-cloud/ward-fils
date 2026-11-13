import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '../../../../src/lib/auth-server.ts';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid Google Sign-In session required.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('GET /api/auth/me failed:', error);
    return NextResponse.json(
      { error: 'Authentication verification failed.' },
      { status: 500 }
    );
  }
}
