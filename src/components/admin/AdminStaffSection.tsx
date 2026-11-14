'use client';

import React, { useMemo, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { PRIMARY_ADMIN_EMAIL } from '../../lib/constants.ts';
import type { StaffUserRow } from './types.ts';

interface AdminStaffSectionProps {
  staffUsers: StaffUserRow[];
  currentUserId: number;
  onToggleUser: (
    userId: number,
    role: string,
    isActive: boolean
  ) => Promise<void>;
  onInviteUser: (
    email: string,
    name: string,
    role: 'staff' | 'admin'
  ) => Promise<void>;
  onDeleteUser: (userId: number) => Promise<void>;
}

export function AdminStaffSection({
  staffUsers,
  currentUserId,
  onToggleUser,
  onInviteUser,
  onDeleteUser,
}: AdminStaffSectionProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'staff' | 'admin'>('staff');
  const [inviting, setInviting] = useState(false);

  const summary = useMemo(() => {
    const total = staffUsers.length;
    const active = staffUsers.filter((u) => u.isActive).length;
    const pending = staffUsers.filter((u) => !u.isActive).length;
    const admins = staffUsers.filter((u) => u.role === 'admin').length;
    return { total, active, pending, admins };
  }, [staffUsers]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await onInviteUser(inviteEmail.trim(), inviteName.trim(), inviteRole);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('staff');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-200 rounded-xl bg-white overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-4">
          <div className="text-xs text-slate-500">Total Accounts</div>
          <div className="text-xl font-mono font-bold text-[#0B2545] tabular-nums mt-1">
            {summary.total}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Active Access</div>
          <div className="text-xl font-mono font-bold text-[#15803D] tabular-nums mt-1">
            {summary.active}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Pending Approval</div>
          <div className="text-xl font-mono font-bold text-[#D97706] tabular-nums mt-1">
            {summary.pending}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Administrators</div>
          <div className="text-xl font-mono font-bold text-[#0B2545] tabular-nums mt-1">
            {summary.admins}
          </div>
        </div>
      </div>

      {/* Pre-Authorise Staff Email Form */}
      <form
        onSubmit={handleInviteSubmit}
        className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
      >
        <div>
          <h2 className="text-base font-bold text-[#0B2545] flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Pre-Authorise Ward Staff Google Account</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pre-approve a colleague&apos;s Google email so they receive immediate
            access upon signing in, or approve pending staff who have already
            signed in below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Email Address *
            </label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@gmail.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Staff Name (Optional)
            </label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Ward Engineer / Officer"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role
            </label>
            <div className="flex gap-2">
              <select
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value === 'admin' ? 'admin' : 'staff')
                }
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="staff">Authorised Staff</option>
                <option value="admin">Administrator</option>
              </select>
              <button
                type="submit"
                disabled={inviting}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg whitespace-nowrap disabled:opacity-60"
              >
                {inviting ? 'Saving...' : 'Authorise'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-base font-bold text-[#0B2545]">
            Administrator & Authorised Staff Directory
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Authorised Staff can update complaints, development works, and
            announcements. Administrators also manage representatives, portal
            settings, and staff permissions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Access Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {staffUsers.map((u) => {
                const isSelf = u.id === currentUserId;
                const isPrimary =
                  u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
                const isPreInvited = u.uid.startsWith('pending:');
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {u.name || 'Ward Staff Member'}
                        {isSelf ? ' (You)' : ''}
                      </div>
                      <div className="text-xs font-mono text-slate-500">
                        {u.email}
                        {isPreInvited ? ' · Awaiting first sign-in' : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isSelf || isPrimary}
                        onChange={(e) =>
                          onToggleUser(u.id, e.target.value, u.isActive)
                        }
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white disabled:opacity-60"
                      >
                        <option value="staff">Authorised Staff</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                      {u.isActive ? (
                        <span className="text-[#15803D]">Active</span>
                      ) : (
                        <span className="text-[#D97706]">Pending Approval</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isSelf || isPrimary}
                          onClick={() =>
                            onToggleUser(u.id, u.role, !u.isActive)
                          }
                          className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
                        >
                          {u.isActive ? 'Revoke Access' : 'Approve Access'}
                        </button>
                        {!isSelf && !isPrimary && (
                          <button
                            type="button"
                            onClick={() => onDeleteUser(u.id)}
                            aria-label={`Remove ${u.email}`}
                            title="Remove staff record"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
