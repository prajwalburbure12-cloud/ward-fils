'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { useAuth } from '../AuthProvider.tsx';

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const {
    staffProfile,
    loading,
    submitting,
    authError,
    isAuthorizedPersonnel,
    signInWithCredentials,
    signOut,
    refreshProfile,
    clearAuthError,
  } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <div className="bg-slate-50/60 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[#0B2545] animate-spin" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#0B2545]">
                Verifying Administrative Session
              </h1>
              <p className="text-xs text-slate-500">
                Checking Ward No. 65 credentials...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Strictly Login ID + Password Sign-In Gate (no Gmail, no Name, no Create options)
  if (!staffProfile) {
    const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      clearAuthError();
      await signInWithCredentials(loginId.trim(), password);
    };

    return (
      <div className="bg-slate-50/60 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-[#0B2545]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#15803D]">
                HDMC Ward No. 65 · Admin Portal
              </div>
              <h1 className="text-2xl font-bold text-[#0B2545] mt-0.5">
                Admin & Team Sign In
              </h1>
            </div>
          </div>

          {authError && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="ward65-login-id"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Login ID
              </label>
              <input
                id="ward65-login-id"
                type="text"
                required
                autoComplete="username"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter Login ID"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="ward65-login-password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="ward65-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-semibold text-[#0B2545] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!staffProfile.isActive || !isAuthorizedPersonnel) {
    return (
      <div className="bg-slate-50/60 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 space-y-5">
          <h1 className="text-xl font-bold text-[#0B2545]">
            Login ID Disabled
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Login ID{' '}
            <span className="font-mono font-semibold text-slate-900">
              {staffProfile.email}
            </span>{' '}
            is currently disabled.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={refreshProfile}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Status</span>
            </button>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
