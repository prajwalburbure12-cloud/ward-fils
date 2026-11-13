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
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  staffProfile: null,
  loading: true,
  authError: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  getIdToken: async () => null,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncBackendProfile = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const token = await fbUser.getIdToken();
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
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
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      if (cred.user) {
        await syncBackendProfile(cred.user);
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Google Sign-In was cancelled.'
      );
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
      await syncBackendProfile(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        staffProfile,
        loading,
        authError,
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
