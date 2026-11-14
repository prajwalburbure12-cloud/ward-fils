'use client';

import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  DEVELOPMENT_CATEGORIES,
  DEVELOPMENT_STATUSES,
  WARD_65_AREAS,
} from '../../lib/constants.ts';
import { compressImageIfNeeded } from '../../lib/media-utils.ts';
import type { DevelopmentWorkData } from '../HomePortalView.tsx';

interface AdminGallerySectionProps {
  developmentWorks: DevelopmentWorkData[];
  savingGallery: boolean;
  editingId: number | null;
  galTitleEn: string;
  setGalTitleEn: (v: string) => void;
  galTitleKn: string;
  setGalTitleKn: (v: string) => void;
  galArea: string;
  setGalArea: (v: string) => void;
  galCategory: string;
  setGalCategory: (v: string) => void;
  galStatus: string;
  setGalStatus: (v: string) => void;
  galDate: string;
  setGalDate: (v: string) => void;
  galDescEn: string;
  setGalDescEn: (v: string) => void;
  galDescKn: string;
  setGalDescKn: (v: string) => void;
  galBeforeUrl: string | null;
  setGalBeforeUrl: (v: string | null) => void;
  galAfterUrl: string | null;
  setGalAfterUrl: (v: string | null) => void;
  onSubmitGallery: (e: React.FormEvent) => void;
  onStartEditGallery: (work: DevelopmentWorkData) => void;
  onCancelEditGallery: () => void;
  onDeleteGallery: (id: number) => Promise<void>;
}

export function AdminGallerySection({
  developmentWorks,
  savingGallery,
  editingId,
  galTitleEn,
  setGalTitleEn,
  galTitleKn,
  setGalTitleKn,
  galArea,
  setGalArea,
  galCategory,
  setGalCategory,
  galStatus,
  setGalStatus,
  galDate,
  setGalDate,
  galDescEn,
  setGalDescEn,
  galDescKn,
  setGalDescKn,
  galBeforeUrl,
  setGalBeforeUrl,
  galAfterUrl,
  setGalAfterUrl,
  onSubmitGallery,
  onStartEditGallery,
  onCancelEditGallery,
  onDeleteGallery,
}: AdminGallerySectionProps) {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filteredWorks = useMemo(() => {
    if (!statusFilter) return developmentWorks;
    return developmentWorks.filter((w) => w.status === statusFilter);
  }, [developmentWorks, statusFilter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <form
        onSubmit={onSubmitGallery}
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
              {editingId ? 'Edit Development Work' : 'Add Development Work'}
            </span>
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={onCancelEditGallery}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Project Title (English) *
          </label>
          <input
            type="text"
            required
            value={galTitleEn}
            onChange={(e) => setGalTitleEn(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Project Title (Kannada - Optional)
          </label>
          <input
            type="text"
            value={galTitleKn}
            onChange={(e) => setGalTitleKn(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ward 65 Area
            </label>
            <select
              value={galArea}
              onChange={(e) => setGalArea(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {WARD_65_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={galCategory}
              onChange={(e) => setGalCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {DEVELOPMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Status
            </label>
            <select
              value={galStatus}
              onChange={(e) => setGalStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {DEVELOPMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Completion / Work Date
            </label>
            <input
              type="date"
              value={galDate}
              onChange={(e) => setGalDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description (English) *
          </label>
          <textarea
            rows={3}
            required
            value={galDescEn}
            onChange={(e) => setGalDescEn(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description (Kannada - Optional)
          </label>
          <textarea
            rows={2}
            value={galDescKn}
            onChange={(e) => setGalDescKn(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Before Work Photo
            </label>
            {galBeforeUrl && (
              <div className="relative">
                <img
                  src={galBeforeUrl}
                  alt="Before work preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-24 object-cover rounded border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setGalBeforeUrl(null)}
                  className="mt-1 text-[11px] font-semibold text-red-700 hover:underline"
                >
                  Remove photo
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setGalBeforeUrl(await compressImageIfNeeded(f));
              }}
              className="w-full text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              After Completion Photo
            </label>
            {galAfterUrl && (
              <div className="relative">
                <img
                  src={galAfterUrl}
                  alt="After completion preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-24 object-cover rounded border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setGalAfterUrl(null)}
                  className="mt-1 text-[11px] font-semibold text-red-700 hover:underline"
                >
                  Remove photo
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setGalAfterUrl(await compressImageIfNeeded(f));
              }}
              className="w-full text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingGallery}
          className="w-full py-2.5 text-sm font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg disabled:opacity-60"
        >
          {savingGallery
            ? 'Saving...'
            : editingId
              ? 'Save Project Changes'
              : 'Publish to Ward Gallery'}
        </button>
      </form>

      <div className="lg:col-span-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">
            Published Development Works ({filteredWorks.length})
          </h2>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                statusFilter === ''
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            {DEVELOPMENT_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-md ${
                  statusFilter === s
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filteredWorks.length === 0 ? (
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
            No development works match this status yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWorks.map((w) => (
              <div
                key={w.id}
                className={`p-4 bg-white border rounded-xl flex items-start justify-between gap-4 ${
                  editingId === w.id ? 'border-[#0B2545]' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {(w.afterPhotoUrl || w.beforePhotoUrl) && (
                    <img
                      src={w.afterPhotoUrl || w.beforePhotoUrl || ''}
                      alt={w.titleEn}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-[#0B2545]">
                        {w.area}
                      </span>{' '}
                      · {w.category} ·{' '}
                      <span
                        className={`font-semibold ${
                          w.status === 'Completed'
                            ? 'text-[#15803D]'
                            : w.status === 'Ongoing'
                              ? 'text-[#D97706]'
                              : 'text-slate-700'
                        }`}
                      >
                        {w.status}
                      </span>
                      {w.completionDate ? ` · ${w.completionDate}` : ''}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {w.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {w.descriptionEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartEditGallery(w)}
                    className="p-2 text-slate-500 hover:text-[#0B2545] rounded-lg hover:bg-slate-50"
                    aria-label="Edit project"
                    title="Edit project"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {confirmDeleteId === w.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={async () => {
                          await onDeleteGallery(w.id);
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
                      onClick={() => setConfirmDeleteId(w.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50"
                      aria-label="Delete project"
                      title="Delete project"
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
