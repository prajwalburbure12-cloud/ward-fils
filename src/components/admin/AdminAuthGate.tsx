'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../AuthProvider.tsx';

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const {
    firebaseUser,
    staffProfile,
    loading,
    signingIn,
    authError,
    isAuthorizedPersonnel,
    signInWithGoogle,
    signOut,
    refreshProfile,
  } = useAuth();

  if (loading) {
    return (
      <div className="bg-slate-50/60 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[#0B2545] animate-spin" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#0B2545]">
                Verifying Administrative Session
              </h1>
              <p className="text-xs text-slate-500">
                Checking HDMC Ward No. 65 credentials and role permissions...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 1. Not signed in with Google yet
  if (!firebaseUser) {
    return (
      <div className="bg-slate-50/60 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-[#0B2545]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#15803D]">
                HDMC Ward No. 65 · Restricted Access
              </div>
              <h1 className="text-2xl font-bold text-[#0B2545] mt-0.5">
                Admin & Staff Authentication Gate
              </h1>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Only authorised Ward No. 65 Administrators and approved HDMC civic
            staff may sign in to manage citizen complaints, development gallery
            records, public announcements, and ward settings.
          </p>

          {authError && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={signingIn}
              onClick={signInWithGoogle}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {signingIn ? 'Opening Google Sign-In...' : 'Sign in with Google'}
              </span>
            </button>

            <p className="text-xs text-slate-500 text-center">
              If your browser blocks the Google Sign-In popup, allow popups for
              this site and click again.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-semibold text-[#0B2545] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portal</span>
            </Link>
            <span className="text-slate-400">Role-verified via Google Auth</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Signed in with Google, but backend profile check failed
  if (!staffProfile) {
    return (
      <div className="bg-slate-50/60 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-8 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B2545]">
                Unable to Verify Staff Permissions
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {firebaseUser.email}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {authError ||
              'Your Google account session could not be verified against the Ward No. 65 staff directory.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={refreshProfile}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Verification</span>
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

  // 3. Signed in, but account is pending approval or has been deactivated
  if (!staffProfile.isActive) {
    return (
      <div className="bg-slate-50/60 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-8 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#D97706]">
                Approval Required
              </div>
              <h1 className="text-xl font-bold text-[#0B2545] mt-0.5">
                Account Pending Administrator Approval
              </h1>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Signed in as{' '}
            <span className="font-mono font-semibold text-slate-900">
              {staffProfile.email}
            </span>
            . For citizen data protection, an active Ward No. 65 Administrator
            must approve your account under Staff Access Control before you can
            manage ward content.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={refreshProfile}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Access Status</span>
            </button>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account / Sign Out</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2545] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Defensive role check
  if (!isAuthorizedPersonnel) {
    return (
      <div className="bg-slate-50/60 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-8 space-y-4">
          <h1 className="text-xl font-bold text-[#0B2545]">Access Denied</h1>
          <p className="text-sm text-slate-600">
            Your account ({staffProfile.email}) does not hold an authorised Ward
            No. 65 staff or administrator role.
          </p>
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
    );
  }

  return <>{children}</>;
}
