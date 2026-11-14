'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Phone,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  HDMC_DEPARTMENTS,
  WARD_65_AREAS,
} from '../../lib/constants.ts';
import {
  exportComplaintsToExcel,
  exportComplaintsToPdf,
} from '../../lib/export-reports.ts';
import type { AdminComplaintRow, ComplaintTimelineRow } from './types.ts';

interface AdminComplaintsSectionProps {
  complaintsList: AdminComplaintRow[];
  complaintsLoading: boolean;
  isAdmin: boolean;
  searchQ: string;
  setSearchQ: (v: string) => void;
  areaFilter: string;
  setAreaFilter: (v: string) => void;
  catFilter: string;
  setCatFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  onApplyFilter: () => void;
  onResetFilters: () => void;
  selectedComplaint: AdminComplaintRow | null;
  selectedTimeline: ComplaintTimelineRow[];
  timelineLoading: boolean;
  onSelectComplaint: (row: AdminComplaintRow) => void;
  editStatus: string;
  setEditStatus: (v: string) => void;
  editDept: string;
  setEditDept: (v: string) => void;
  editNote: string;
  setEditNote: (v: string) => void;
  editResolution: string;
  setEditResolution: (v: string) => void;
  updatingComplaint: boolean;
  onUpdateComplaint: (overrideStatus?: string) => void;
  onDeleteComplaint: (id: number) => Promise<void>;
}

function getStatusTextColor(status: string) {
  switch (status) {
    case 'Resolved':
    case 'Closed':
      return 'text-[#15803D]';
    case 'Submitted':
    case 'Under Review':
      return 'text-[#D97706]';
    default:
      return 'text-[#0B2545]';
  }
}

export function AdminComplaintsSection({
  complaintsList,
  complaintsLoading,
  isAdmin,
  searchQ,
  setSearchQ,
  areaFilter,
  setAreaFilter,
  catFilter,
  setCatFilter,
  statusFilter,
  setStatusFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onApplyFilter,
  onResetFilters,
  selectedComplaint,
  selectedTimeline,
  timelineLoading,
  onSelectComplaint,
  editStatus,
  setEditStatus,
  editDept,
  setEditDept,
  editNote,
  setEditNote,
  editResolution,
  setEditResolution,
  updatingComplaint,
  onUpdateComplaint,
  onDeleteComplaint,
}: AdminComplaintsSectionProps) {
  const [lightboxMedia, setLightboxMedia] = useState<{
    name: string;
    dataUrl: string;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const hasActiveFilters = Boolean(
    searchQ || areaFilter || catFilter || statusFilter || fromDate || toDate
  );

  const handleConfirmDelete = async (id: number) => {
    setDeleting(true);
    try {
      await onDeleteComplaint(id);
      setConfirmDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Status Segmented Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter by complaint status"
          className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg"
        >
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === ''
                ? 'bg-white text-[#0B2545] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Statuses
          </button>
          {COMPLAINT_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === s
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono tabular-nums text-slate-600">
          Showing {complaintsList.length}{' '}
          {complaintsList.length === 1 ? 'record' : 'records'}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onApplyFilter();
        }}
        className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Search ID / Resident / Mobile / Text
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="HDMC-W65-... or mobile or name"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-2 focus:outline-[#0B2545]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Area
            </label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Areas</option>
              {WARD_65_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Category
            </label>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Categories</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Statuses</option>
              {COMPLAINT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg whitespace-nowrap"
            >
              Apply Filter
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                title="Reset all filters"
                aria-label="Reset all filters"
                className="p-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-slate-600">
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded font-mono tabular-nums"
              />
            </label>
            <label className="flex items-center gap-1.5 text-slate-600">
              <span>To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded font-mono tabular-nums"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => exportComplaintsToExcel(complaintsList)}
              disabled={complaintsList.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#15803D] bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => exportComplaintsToPdf(complaintsList)}
              disabled={complaintsList.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B2545] bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 disabled:opacity-50 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Complaints Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {complaintsLoading ? (
            <div className="divide-y divide-slate-200">
              {[1, 2, 3, 4].map((skeleton) => (
                <div key={skeleton} className="p-4 animate-pulse space-y-2">
                  <div className="h-3.5 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-56 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : complaintsList.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-medium text-slate-700">
                No complaints match the current filter criteria.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B2545] border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Complaint ID</th>
                    <th className="px-4 py-3">Resident & Area</th>
                    <th className="px-4 py-3">Category & Wing</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {complaintsList.map((row) => {
                    const isSelected = selectedComplaint?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => {
                          setConfirmDeleteId(null);
                          onSelectComplaint(row);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-bold text-[#0B2545] whitespace-nowrap align-top">
                          <div>{row.complaintCode}</div>
                          <div className="text-[11px] font-normal text-slate-500 tabular-nums mt-0.5">
                            {new Date(row.createdAt).toLocaleDateString(
                              'en-IN'
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-slate-900">
                            {row.citizenName}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {row.areaStreet} ·{' '}
                            <span className="font-mono tabular-nums">
                              {row.mobileNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700 align-top">
                          <div className="font-medium text-slate-800">
                            {row.category}
                          </div>
                          {row.assignedDepartment && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {row.assignedDepartment}
                            </div>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 text-xs font-semibold text-right whitespace-nowrap align-top ${getStatusTextColor(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Complaint Detail & Resolution Editor */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          {!selectedComplaint ? (
            <div className="text-sm text-slate-500 py-10 text-center">
              Select a complaint row from the list to inspect uploaded
              photos/videos, call the resident, review timeline history, assign
              a department, or update resolution progress.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono font-bold text-[#0B2545]">
                    {selectedComplaint.complaintCode}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedComplaint.citizenName}
                  </h3>
                  <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                    <a
                      href={`tel:${selectedComplaint.mobileNumber}`}
                      className="inline-flex items-center gap-1 font-mono font-semibold text-[#0B2545] hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedComplaint.mobileNumber}</span>
                    </a>
                    <span aria-hidden="true">·</span>
                    <span>
                      {selectedComplaint.areaStreet}
                      {selectedComplaint.landmark
                        ? ` (${selectedComplaint.landmark})`
                        : ''}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="shrink-0">
                    {confirmDeleteId === selectedComplaint.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() =>
                            handleConfirmDelete(selectedComplaint.id)
                          }
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md"
                        >
                          {deleting ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs font-semibold text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(selectedComplaint.id)}
                        title="Delete invalid or duplicate record"
                        aria-label="Delete complaint record"
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  Problem Description ({selectedComplaint.category})
                </div>
                <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              {selectedComplaint.mediaFiles &&
                selectedComplaint.mediaFiles.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      Uploaded Evidence ({selectedComplaint.mediaFiles.length})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedComplaint.mediaFiles.map((m, idx) =>
                        m.type === 'image' ? (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setLightboxMedia({
                                name: m.name,
                                dataUrl: m.dataUrl,
                              })
                            }
                            className="block w-full overflow-hidden rounded border border-slate-200 hover:border-[#0B2545] transition-colors"
                          >
                            <img
                              src={m.dataUrl}
                              alt={m.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-28 object-cover"
                            />
                          </button>
                        ) : (
                          <video
                            key={idx}
                            src={m.dataUrl}
                            controls
                            className="w-full h-28 rounded border border-slate-200 bg-black"
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Resolution & Status Form */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Complaint Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {COMPLAINT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Department
                    </label>
                    <select
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {HDMC_DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Progress Report Note (Visible to Resident)
                  </label>
                  <textarea
                    rows={2}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Field inspection or action update..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resolution Details
                  </label>
                  <textarea
                    rows={2}
                    value={editResolution}
                    onChange={(e) => setEditResolution(e.target.value)}
                    placeholder="Details of completed repair or resolution..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={updatingComplaint}
                    onClick={() => onUpdateComplaint()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg disabled:opacity-60 whitespace-nowrap"
                  >
                    {updatingComplaint ? 'Saving...' : 'Save Progress Update'}
                  </button>
                  <button
                    type="button"
                    disabled={updatingComplaint}
                    onClick={() => onUpdateComplaint('Resolved')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg disabled:opacity-60 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>

              {/* Action Audit Timeline */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-[#0B2545]" />
                  <span>Action & Status Timeline</span>
                </div>

                {timelineLoading ? (
                  <p className="text-xs text-slate-500">Loading history...</p>
                ) : selectedTimeline.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No timeline entries recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedTimeline.map((entry) => (
                      <div
                        key={entry.id}
                        className="text-xs pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-semibold ${getStatusTextColor(
                              entry.status
                            )}`}
                          >
                            {entry.status}
                          </span>
                          <span className="font-mono tabular-nums text-[11px] text-slate-400">
                            {new Date(entry.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-0.5">{entry.note}</p>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Updated by {entry.updatedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Citizen Evidence Photos */}
      {lightboxMedia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxMedia.name}
          onClick={() => setLightboxMedia(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-3xl w-full overflow-hidden border border-slate-200"
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {lightboxMedia.name}
              </span>
              <button
                type="button"
                onClick={() => setLightboxMedia(null)}
                aria-label="Close image preview"
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-900 flex items-center justify-center max-h-[75vh]">
              <img
                src={lightboxMedia.dataUrl}
                alt={lightboxMedia.name}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
