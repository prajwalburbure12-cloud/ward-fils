'use client';

import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { ANNOUNCEMENT_TYPES } from '../../lib/constants.ts';
import { compressImageIfNeeded } from '../../lib/media-utils.ts';
import type { AnnouncementData } from '../HomePortalView.tsx';

interface AdminAnnouncementsSectionProps {
  announcements: AnnouncementData[];
  savingAnnouncement: boolean;
  editingId: number | null;
  annTitleEn: string;
  setAnnTitleEn: (v: string) => void;
  annTitleKn: string;
  setAnnTitleKn: (v: string) => void;
  annType: string;
  setAnnType: (v: string) => void;
  annLocation: string;
  setAnnLocation: (v: string) => void;
  annDate: string;
  setAnnDate: (v: string) => void;
  annDescEn: string;
  setAnnDescEn: (v: string) => void;
  annDescKn: string;
  setAnnDescKn: (v: string) => void;
  annPhotoUrl: string | null;
  setAnnPhotoUrl: (v: string | null) => void;
  onSubmitAnnouncement: (e: React.FormEvent) => void;
  onStartEditAnnouncement: (item: AnnouncementData) => void;
  onCancelEditAnnouncement: () => void;
  onDeleteAnnouncement: (id: number) => Promise<void>;
}

export function AdminAnnouncementsSection({
  announcements,
  savingAnnouncement,
  editingId,
  annTitleEn,
  setAnnTitleEn,
  annTitleKn,
  setAnnTitleKn,
  annType,
  setAnnType,
  annLocation,
  setAnnLocation,
  annDate,
  setAnnDate,
  annDescEn,
  setAnnDescEn,
  annDescKn,
  setAnnDescKn,
  annPhotoUrl,
  setAnnPhotoUrl,
  onSubmitAnnouncement,
  onStartEditAnnouncement,
  onCancelEditAnnouncement,
  onDeleteAnnouncement,
}: AdminAnnouncementsSectionProps) {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filteredAnnouncements = useMemo(() => {
    if (!typeFilter) return announcements;
    return announcements.filter((a) => a.type === typeFilter);
  }, [announcements, typeFilter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <form
        onSubmit={onSubmitAnnouncement}
        className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[#0B2545] flex items-center gap-2">
            {editingId ? (
              <Pencil className="w-4 h-4" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>
              {editingId ? 'Edit Announcement' : 'Publish Announcement'}
            </span>
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={onCancelEditAnnouncement}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Headline (English) *
          </label>
          <input
            type="text"
            required
            value={annTitleEn}
            onChange={(e) => setAnnTitleEn(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Headline (Kannada - Optional)
          </label>
          <input
            type="text"
            value={annTitleKn}
            onChange={(e) => setAnnTitleKn(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Update Type
            </label>
            <select
              value={annType}
              onChange={(e) => setAnnType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {ANNOUNCEMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={annDate}
              onChange={(e) => setAnnDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            required
            value={annLocation}
            onChange={(e) => setAnnLocation(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Details (English) *
          </label>
          <textarea
            rows={3}
            required
            value={annDescEn}
            onChange={(e) => setAnnDescEn(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Details (Kannada - Optional)
          </label>
          <textarea
            rows={2}
            value={annDescKn}
            onChange={(e) => setAnnDescKn(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Attachment Photograph (Optional)
          </label>
          {annPhotoUrl && (
            <div className="space-y-1">
              <img
                src={annPhotoUrl}
                alt="Announcement attachment preview"
                referrerPolicy="no-referrer"
                className="w-full h-28 object-cover rounded border border-slate-200"
              />
              <button
                type="button"
                onClick={() => setAnnPhotoUrl(null)}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                Remove image
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setAnnPhotoUrl(await compressImageIfNeeded(f));
            }}
            className="w-full text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={savingAnnouncement}
          className="w-full py-2.5 text-sm font-bold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg disabled:opacity-60"
        >
          {savingAnnouncement
            ? 'Saving...'
            : editingId
              ? 'Save Announcement Changes'
              : 'Publish Announcement'}
        </button>
      </form>

      <div className="lg:col-span-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">
            Published Announcements ({filteredAnnouncements.length})
          </h2>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter announcements by type"
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
          >
            <option value="">All Types</option>
            {ANNOUNCEMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
            No announcements match this filter yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnnouncements.map((a) => (
              <div
                key={a.id}
                className={`p-4 bg-white border rounded-xl flex items-start justify-between gap-4 ${
                  editingId === a.id ? 'border-[#0B2545]' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {a.photoUrl && (
                    <img
                      src={a.photoUrl}
                      alt={a.titleEn}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-[#D97706]">
                        {a.type}
                      </span>{' '}
                      · <span className="font-mono tabular-nums">{a.eventDate}</span>{' '}
                      · {a.location}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {a.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {a.descriptionEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartEditAnnouncement(a)}
                    className="p-2 text-slate-500 hover:text-[#0B2545] rounded-lg hover:bg-slate-50"
                    aria-label="Edit announcement"
                    title="Edit announcement"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {confirmDeleteId === a.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={async () => {
                          await onDeleteAnnouncement(a.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 text-xs font-semibold text-slate-600 border border-slate-300 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(a.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50"
                      aria-label="Delete announcement"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
