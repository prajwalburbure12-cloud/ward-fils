import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminLoginAccounts } from '../../../../src/db/queries.ts';
import { authenticateRequest } from '../../../../src/lib/auth-server.ts';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureAdminLoginAccounts();
    const user = await authenticateRequest(req);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('GET /api/auth/me failed:', error);
    return NextResponse.json(
      { error: 'Authentication verification failed.' },
      { status: 500 }
    );
  }
}
