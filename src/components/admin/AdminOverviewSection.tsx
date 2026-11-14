'use client';

import React, { useMemo } from 'react';
import {
  ArrowRight,
  Building2,
  ClipboardList,
  Megaphone,
  Users,
} from 'lucide-react';
import type {
  AnnouncementData,
  DevelopmentWorkData,
  PortalStatsData,
} from '../HomePortalView.tsx';
import type { AdminComplaintRow, AdminSection } from './types.ts';

interface AdminOverviewSectionProps {
  stats: PortalStatsData;
  complaints: AdminComplaintRow[];
  developmentWorks: DevelopmentWorkData[];
  announcements: AnnouncementData[];
  pendingStaffCount: number;
  isAdmin: boolean;
  onNavigateSection: (section: AdminSection) => void;
  onInspectComplaint: (row: AdminComplaintRow) => void;
  onFilterComplaintsByStatus: (status: string) => void;
}

export function AdminOverviewSection({
  stats,
  complaints,
  developmentWorks,
  announcements,
  pendingStaffCount,
  isAdmin,
  onNavigateSection,
  onInspectComplaint,
  onFilterComplaintsByStatus,
}: AdminOverviewSectionProps) {
  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of complaints) {
      counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
    }
    const order = [
      'Submitted',
      'Under Review',
      'Assigned to Department',
      'Work in Progress',
      'Resolved',
      'Closed',
    ];
    return order.map((status) => ({
      status,
      count: counts.get(status) ?? 0,
    }));
  }, [complaints]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of complaints) {
      counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [complaints]);

  const areaBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of complaints) {
      counts.set(c.areaStreet, (counts.get(c.areaStreet) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [complaints]);

  const recentOpenComplaints = useMemo(
    () =>
      complaints
        .filter((c) => c.status !== 'Resolved' && c.status !== 'Closed')
        .slice(0, 5),
    [complaints]
  );

  const totalComplaintsCount = complaints.length;

  return (
    <div className="space-y-8">
      {/* Live KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-slate-200 rounded-xl bg-white overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <button
          type="button"
          onClick={() => onFilterComplaintsByStatus('')}
          className="p-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="text-xs font-medium text-slate-500">
            Total Complaints
          </div>
          <div className="text-2xl font-mono font-bold text-[#0B2545] tabular-nums mt-1">
            {stats.totalComplaints}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterComplaintsByStatus('Submitted')}
          className="p-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="text-xs font-medium text-slate-500">
            Pending Review
          </div>
          <div className="text-2xl font-mono font-bold text-[#D97706] tabular-nums mt-1">
            {stats.pendingComplaints}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterComplaintsByStatus('Work in Progress')}
          className="p-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="text-xs font-medium text-slate-500">Under Process</div>
          <div className="text-2xl font-mono font-bold text-[#0B2545] tabular-nums mt-1">
            {stats.underProcessComplaints}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterComplaintsByStatus('Resolved')}
          className="p-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="text-xs font-medium text-slate-500">Resolved</div>
          <div className="text-2xl font-mono font-bold text-[#15803D] tabular-nums mt-1">
            {stats.resolvedComplaints}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateSection('gallery')}
          className="p-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="text-xs font-medium text-slate-500">
            Total Projects
          </div>
          <div className="text-2xl font-mono font-bold text-[#0B2545] tabular-nums mt-1">
            {stats.totalProjects}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateSection('gallery')}
          className="p-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="text-xs font-medium text-slate-500">
            Completed Works
          </div>
          <div className="text-2xl font-mono font-bold text-[#15803D] tabular-nums mt-1">
            {stats.completedProjects}
          </div>
        </button>
      </div>

      {/* Quick Operations Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigateSection('complaints')}
          className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0B2545] transition-colors text-left"
        >
          <div>
            <div className="text-xs font-medium text-slate-500">
              Grievance Queue
            </div>
            <div className="text-sm font-bold text-[#0B2545] mt-0.5">
              Manage Complaints
            </div>
          </div>
          <ClipboardList className="w-5 h-5 text-[#0B2545] shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateSection('gallery')}
          className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0B2545] transition-colors text-left"
        >
          <div>
            <div className="text-xs font-medium text-slate-500">
              {developmentWorks.length} Published Works
            </div>
            <div className="text-sm font-bold text-[#0B2545] mt-0.5">
              Update Ward Gallery
            </div>
          </div>
          <Building2 className="w-5 h-5 text-[#15803D] shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateSection('announcements')}
          className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0B2545] transition-colors text-left"
        >
          <div>
            <div className="text-xs font-medium text-slate-500">
              {announcements.length} Active Notices
            </div>
            <div className="text-sm font-bold text-[#0B2545] mt-0.5">
              Publish Announcement
            </div>
          </div>
          <Megaphone className="w-5 h-5 text-[#D97706] shrink-0" />
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onNavigateSection('staff')}
            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0B2545] transition-colors text-left"
          >
            <div>
              <div className="text-xs font-medium text-slate-500">
                {pendingStaffCount > 0
                  ? `${pendingStaffCount} Pending Approval`
                  : 'Team Permissions'}
              </div>
              <div className="text-sm font-bold text-[#0B2545] mt-0.5">
                Staff Access Control
              </div>
            </div>
            <Users className="w-5 h-5 text-[#0B2545] shrink-0" />
          </button>
        )}
      </div>

      {/* Breakdown & Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Open Grievances */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#0B2545]">
                Active Grievances Requiring Action
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Open resident complaints awaiting inspection or resolution
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('complaints')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B2545] hover:underline whitespace-nowrap shrink-0"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOpenComplaints.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700">
                No pending grievances in the active queue.
              </p>
              <p className="text-xs text-slate-500">
                New citizen submissions from Ward No. 65 will appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentOpenComplaints.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => onInspectComplaint(row)}
                  className="w-full px-5 py-3.5 text-left hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-[#0B2545]">
                        {row.complaintCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{row.areaStreet}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(row.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                      {row.citizenName} — {row.category}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#D97706] whitespace-nowrap shrink-0">
                    {row.status}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Real-Time Distribution Breakdown */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          <div className="p-5 space-y-3">
            <h2 className="text-base font-bold text-[#0B2545]">
              Complaint Status Distribution
            </h2>
            {totalComplaintsCount === 0 ? (
              <p className="text-xs text-slate-500">
                Status breakdown will populate as resident complaints are
                recorded.
              </p>
            ) : (
              <div className="space-y-2.5">
                {statusBreakdown.map((item) => {
                  const pct = Math.round(
                    (item.count / Math.max(totalComplaintsCount, 1)) * 100
                  );
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 font-medium">
                          {item.status}
                        </span>
                        <span className="font-mono tabular-nums text-slate-600">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.status === 'Resolved' ||
                            item.status === 'Closed'
                              ? 'bg-[#15803D]'
                              : item.status === 'Submitted' ||
                                  item.status === 'Under Review'
                                ? 'bg-[#D97706]'
                                : 'bg-[#0B2545]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Top Issue Categories & Areas
            </h3>
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500">
                No complaint categories logged yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500">
                    By Category
                  </div>
                  {categoryBreakdown.map((c) => (
                    <div
                      key={c.category}
                      className="flex items-center justify-between text-xs gap-2"
                    >
                      <span className="text-slate-700 truncate">
                        {c.category}
                      </span>
                      <span className="font-mono font-semibold text-[#0B2545] tabular-nums shrink-0">
                        {c.count}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500">
                    By Area / Street
                  </div>
                  {areaBreakdown.map((a) => (
                    <div
                      key={a.area}
                      className="flex items-center justify-between text-xs gap-2"
                    >
                      <span className="text-slate-700 truncate">{a.area}</span>
                      <span className="font-mono font-semibold text-[#0B2545] tabular-nums shrink-0">
                        {a.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
