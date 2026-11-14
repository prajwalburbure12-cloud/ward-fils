'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const TOKEN_STORAGE_KEY = 'w65_admin_token';

export interface StaffProfile {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  role: 'admin' | 'staff' | string;
  isActive: boolean;
}

interface AuthContextValue {
  staffProfile: StaffProfile | null;
  loading: boolean;
  submitting: boolean;
  authError: string | null;
  isAuthorizedPersonnel: boolean;
  signInWithCredentials: (loginId: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  staffProfile: null,
  loading: true,
  submitting: false,
  authError: null,
  isAuthorizedPersonnel: false,
  signInWithCredentials: async () => false,
  signOut: async () => {},
  getIdToken: async () => null,
  refreshProfile: async () => {},
  clearAuthError: () => {},
});

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage access errors
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    try {
      const token = readStoredToken();
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const res = await fetch('/api/auth/me', {
        headers,
        cache: 'no-store',
      });
      if (!res.ok) {
        setStaffProfile(null);
        return;
      }
      const data = await res.json();
      if (data.user) {
        setStaffProfile(data.user);
      } else {
        setStaffProfile(null);
        writeStoredToken(null);
      }
    } catch {
      setStaffProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadSession();
      }
    });
    return () => {
      active = false;
    };
  }, [loadSession]);

  const signInWithCredentials = async (
    loginId: string,
    password: string
  ): Promise<boolean> => {
    setAuthError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.error || 'Invalid Login ID or password.');
        return false;
      }
      if (data.token) {
        writeStoredToken(data.token);
      }
      setStaffProfile(data.user ?? null);
      return true;
    } catch {
      setAuthError('Unable to sign in right now. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on sign out
    }
    writeStoredToken(null);
    setStaffProfile(null);
    setAuthError(null);
  };

  const getIdToken = async () => {
    return readStoredToken();
  };

  const refreshProfile = async () => {
    setLoading(true);
    await loadSession();
  };

  const clearAuthError = () => setAuthError(null);

  const isAuthorizedPersonnel = Boolean(
    staffProfile &&
      staffProfile.isActive &&
      (staffProfile.role === 'admin' || staffProfile.role === 'staff')
  );

  return (
    <AuthContext.Provider
      value={{
        staffProfile,
        loading,
        submitting,
        authError,
        isAuthorizedPersonnel,
        signInWithCredentials,
        signOut,
        getIdToken,
        refreshProfile,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
