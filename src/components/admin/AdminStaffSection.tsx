'use client';

import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import type { StaffUserRow } from './types.ts';

interface AdminStaffSectionProps {
  staffUsers: StaffUserRow[];
  currentUserId: number;
  onToggleUser: (
    userId: number,
    role: string,
    isActive: boolean
  ) => Promise<void>;
  onResetUserPassword: (
    userId: number,
    role: string,
    isActive: boolean,
    newPassword: string
  ) => Promise<boolean>;
}

export function AdminStaffSection({
  staffUsers,
  currentUserId,
  onToggleUser,
  onResetUserPassword,
}: AdminStaffSectionProps) {
  const [resetTargetId, setResetTargetId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleResetSubmit = async (u: StaffUserRow) => {
    if (resetPassword.length < 8) return;
    setResetting(true);
    try {
      const ok = await onResetUserPassword(
        u.id,
        u.role,
        u.isActive,
        resetPassword
      );
      if (ok) {
        setResetTargetId(null);
        setResetPassword('');
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-base font-bold text-[#0B2545]">
          Admin & Team Login Credentials
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Manage passwords and access status for your Administrator and Team
          Member Login IDs.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Login ID</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {staffUsers.map((u) => {
              const isSelf = u.id === currentUserId;
              const isResettingThis = resetTargetId === u.id;
              return (
                <React.Fragment key={u.id}>
                  <tr>
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-[#0B2545]">
                      {u.email}
                      {isSelf ? (
                        <span className="ml-2 text-xs font-sans font-normal text-slate-500">
                          (Current)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">
                      {u.role === 'admin' ? 'Administrator' : 'Team Member'}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                      {u.isActive ? (
                        <span className="text-[#15803D]">Active</span>
                      ) : (
                        <span className="text-[#D97706]">Disabled</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setResetTargetId(isResettingThis ? null : u.id);
                            setResetPassword('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>

                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() =>
                              onToggleUser(u.id, u.role, !u.isActive)
                            }
                            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap"
                          >
                            {u.isActive ? 'Disable' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isResettingThis && (
                    <tr className="bg-slate-50">
                      <td colSpan={4} className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="password"
                            minLength={8}
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            placeholder="Enter new password (min 8 chars)"
                            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white w-64"
                          />
                          <button
                            type="button"
                            disabled={resetting || resetPassword.length < 8}
                            onClick={() => handleResetSubmit(u)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B2545] hover:bg-[#133868] rounded-md disabled:opacity-50"
                          >
                            {resetting ? 'Saving...' : 'Save New Password'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResetTargetId(null);
                              setResetPassword('');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-300 rounded-md bg-white hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
