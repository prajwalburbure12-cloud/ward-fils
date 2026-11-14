import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { verifySessionToken } from './auth-crypto.ts';

export const SESSION_COOKIE_NAME = 'w65_admin_session';

export interface AuthenticatedStaff {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
}

export async function authenticateRequest(
  req: NextRequest
): Promise<AuthenticatedStaff | null> {
  let token = '';
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }
  if (!token) {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value?.trim() ?? '';
  }
  if (!token) return null;

  const decoded = verifySessionToken(token);
  if (!decoded) return null;

  try {
    const rows = await db
      .select({
        id: users.id,
        uid: users.uid,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, decoded.userId));

    const user = rows[0];
    if (!user) return null;
    return user;
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return null;
  }
}
