'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Search,
  Building2,
  MapPin,
  Calendar,
  History,
} from 'lucide-react';
import { useLanguage } from './LanguageProvider.tsx';
import { COMPLAINT_STATUSES } from '../lib/constants.ts';
import { CATEGORY_LABELS, STATUS_LABELS } from '../lib/i18n.ts';

interface TimelineEntry {
  id: number;
  status: string;
  note: string;
  updatedBy: string;
  createdAt: string;
}

interface TrackedComplaint {
  id: number;
  complaintCode: string;
  citizenName: string;
  areaStreet: string;
  wardNumber: string;
  category: string;
  description: string;
  landmark: string | null;
  mediaFiles: Array<{ name: string; type: 'image' | 'video'; dataUrl: string }>;
  status: string;
  assignedDepartment: string | null;
  latestUpdate: string | null;
  resolutionDetails: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
}

export function ComplaintTracker({ initialCode = '' }: { initialCode?: string }) {
  const { lang, t } = useLanguage();
  const [complaintCode, setComplaintCode] = useState(initialCode);
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackedComplaint | null>(null);
  const [history, setHistory] = useState<TrackedComplaint[]>([]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setHistory([]);

    const cleanedMobile = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
      setError('Please enter your 10-digit registered mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/complaints/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintCode: complaintCode.trim(),
          mobileNumber: cleanedMobile,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to locate complaint.');
      }
      setResult(data.complaint);
      setHistory(
        Array.isArray(data.history)
          ? data.history
          : data.complaint
            ? [data.complaint]
            : []
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to fetch complaint status.'
      );
    } finally {
      setLoading(false);
    }
  };

  const activeStageIndex = result
    ? COMPLAINT_STATUSES.indexOf(
        result.status as (typeof COMPLAINT_STATUSES)[number]
      )
    : -1;

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleTrack}
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="trackCode"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              {t.track.codeLabel} ({lang === 'kn' ? 'ಐಚ್ಛಿಕ' : 'Optional'})
            </label>
            <input
              id="trackCode"
              type="text"
              value={complaintCode}
              onChange={(e) => setComplaintCode(e.target.value.toUpperCase())}
              placeholder={t.track.codePlaceholder}
              className="w-full px-3.5 py-2.5 text-base font-mono border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
            />
          </div>

          <div className="md:col-span-4">
            <label
              htmlFor="trackMobile"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              {t.track.mobileLabel} *
            </label>
            <input
              id="trackMobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              value={mobileNumber}
              onChange={(e) =>
                setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder={t.track.mobilePlaceholder}
              className="w-full px-3.5 py-2.5 text-base font-mono tabular-nums border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-base font-semibold text-white bg-[#0B2545] hover:bg-[#133868] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>
                {loading ? t.track.searchingBtn : t.track.searchBtn}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 font-medium"
          >
            {error}
          </div>
        )}
      </form>

      {history.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#0B2545] flex items-center gap-2">
              <History className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'kn'
                  ? `ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯಲ್ಲಿ ದಾಖಲಾದ ದೂರುಗಳು (${history.length})`
                  : `Registered Complaints History (${history.length})`}
              </span>
            </h2>
            <span className="text-xs text-slate-500">
              {lang === 'kn'
                ? 'ವಿವರಗಳನ್ನು ನೋಡಲು ದೂರಿನ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ'
                : 'Select any complaint to view full timeline & details'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item) => {
              const isSelected = result?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setResult(item)}
                  className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0B2545] bg-[#0B2545]/5 ring-1 ring-[#0B2545]/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-mono font-bold text-[#0B2545] tabular-nums">
                      {item.complaintCode}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        item.status === 'Resolved' || item.status === 'Closed'
                          ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {STATUS_LABELS[item.status]?.[lang] ?? item.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-800 truncate">
                    {CATEGORY_LABELS[item.category]?.[lang] ?? item.category}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 truncate">
                    {item.areaStreet}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 font-mono tabular-nums">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-8">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-xs font-medium text-slate-500">
                {t.track.codeLabel}
              </div>
              <h2 className="text-2xl font-mono font-bold text-[#0B2545] tabular-nums mt-0.5">
                {result.complaintCode}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Ward {result.wardNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{result.citizenName}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {CATEGORY_LABELS[result.category]?.[lang] ?? result.category}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
              {result.status === 'Resolved' || result.status === 'Closed' ? (
                <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
              ) : (
                <Clock className="w-5 h-5 text-[#D97706]" />
              )}
              <span className="text-sm font-bold text-slate-900">
                {STATUS_LABELS[result.status]?.[lang] ?? result.status}
              </span>
            </div>
          </div>

          {/* 6-Step Visual Progress Timeline */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              {t.track.timelineTitle}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {COMPLAINT_STATUSES.map((stage, idx) => {
                const isDone = activeStageIndex >= idx;
                const isCurrent = activeStageIndex === idx;
                return (
                  <div
                    key={stage}
                    className={`p-3 rounded-lg border transition-colors ${
                      isCurrent
                        ? 'border-[#0B2545] bg-[#0B2545]/5'
                        : isDone
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        0{idx + 1}
                      </span>
                      {isDone ? (
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            isCurrent ? 'text-[#0B2545]' : 'text-[#15803D]'
                          }`}
                        />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <div
                      className={`text-xs font-semibold leading-snug ${
                        isDone ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {STATUS_LABELS[stage]?.[lang] ?? stage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500">
                    {t.track.regDate}
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {new Date(result.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500">{t.track.area}</div>
                  <div className="text-sm font-medium text-slate-900">
                    {result.areaStreet}
                    {result.landmark ? ` (${result.landmark})` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500">
                    {t.track.department}
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {result.assignedDepartment || 'Ward 65 Civic Office'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {result.description && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Complaint Description
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    {result.description}
                  </p>
                </div>
              )}

              {result.latestUpdate && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    {t.track.latestUpdate}
                  </div>
                  <p className="text-sm font-medium text-[#0B2545] bg-blue-50/50 p-3.5 rounded-lg border border-blue-100">
                    {result.latestUpdate}
                  </p>
                </div>
              )}

              {result.resolutionDetails && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    {t.track.resolution}
                  </div>
                  <p className="text-sm font-medium text-emerald-900 bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200">
                    {result.resolutionDetails}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Media Evidence */}
          {result.mediaFiles && result.mediaFiles.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                {t.track.mediaTitle}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {result.mediaFiles.map((file, idx) =>
                  file.type === 'image' ? (
                    <img
                      key={idx}
                      src={file.dataUrl}
                      alt={file.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <video
                      key={idx}
                      src={file.dataUrl}
                      controls
                      className="w-full h-44 rounded-lg border border-slate-200 bg-black"
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* Chronological Official History */}
          {result.timeline && result.timeline.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                {t.track.historyTitle}
              </h3>
              <div className="space-y-3">
                {result.timeline.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0B2545]">
                        {STATUS_LABELS[entry.status]?.[lang] ?? entry.status}
                      </div>
                      <p className="text-sm text-slate-700 mt-0.5">
                        {entry.note}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
                      {new Date(entry.createdAt).toLocaleString('en-IN')} ·{' '}
                      {entry.updatedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
