'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

export interface StaffProfile {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  role: 'admin' | 'staff' | string;
  isActive: boolean;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  staffProfile: StaffProfile | null;
  loading: boolean;
  signingIn: boolean;
  authError: string | null;
  isAuthorizedPersonnel: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  staffProfile: null,
  loading: true,
  signingIn: false,
  authError: null,
  isAuthorizedPersonnel: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  getIdToken: async () => null,
  refreshProfile: async () => {},
});

function formatAuthError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: unknown }).code);
    if (code === 'auth/popup-blocked') {
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google Sign-In window was closed before completing sign-in.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network error while contacting Google Authentication. Please check your connection.';
    }
  }
  return err instanceof Error ? err.message : 'Google Sign-In failed.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncBackendProfile = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const token = await fbUser.getIdToken();
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to verify staff account.');
      }
      const data = await res.json();
      setStaffProfile(data.user ?? null);
      setAuthError(null);
    } catch (err) {
      setStaffProfile(null);
      setAuthError(
        err instanceof Error ? err.message : 'Authentication check failed.'
      );
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncBackendProfile(fbUser);
      } else {
        setStaffProfile(null);
        setAuthError(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [syncBackendProfile]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      if (cred.user) {
        await syncBackendProfile(cred.user);
      }
    } catch (err) {
      setAuthError(formatAuthError(err));
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setStaffProfile(null);
    setAuthError(null);
  };

  const getIdToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        await syncBackendProfile(auth.currentUser);
      } finally {
        setLoading(false);
      }
    }
  };

  const isAuthorizedPersonnel = Boolean(
    firebaseUser &&
      staffProfile &&
      staffProfile.isActive &&
      (staffProfile.role === 'admin' || staffProfile.role === 'staff')
  );

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        staffProfile,
        loading,
        signingIn,
        authError,
        isAuthorizedPersonnel,
        signInWithGoogle,
        signOut,
        getIdToken,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
