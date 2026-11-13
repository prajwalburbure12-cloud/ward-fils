import { NextRequest } from 'next/server';
import { adminAuth } from './firebase-admin.ts';
import { getOrCreateStaffUser } from '../db/queries.ts';

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
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email ?? '';
    if (!email) return null;

    const user = await getOrCreateStaffUser(
      decoded.uid,
      email,
      decoded.name ?? null
    );
    return user;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}
