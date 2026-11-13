'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  FileImage,
  FileVideo,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { useLanguage } from './LanguageProvider.tsx';
import { COMPLAINT_CATEGORIES, WARD_65_AREAS } from '../lib/constants.ts';
import { CATEGORY_LABELS } from '../lib/i18n.ts';
import { compressImageIfNeeded, readFileAsDataUrl } from '../lib/media-utils.ts';

interface MediaUpload {
  name: string;
  type: 'image' | 'video';
  dataUrl: string;
}

interface SubmittedReceipt {
  complaintCode: string;
  citizenName: string;
  areaStreet: string;
  wardNumber: string;
  category: string;
  status: string;
  createdAt: string;
}

export function ComplaintForm() {
  const { lang, t } = useLanguage();

  const [citizenName, setCitizenName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmMobile, setConfirmMobile] = useState('');
  const [areaStreet, setAreaStreet] = useState('');
  const [category, setCategory] = useState<string>(COMPLAINT_CATEGORIES[0]);
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaUpload[]>([]);
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');

  const [captchaNums, setCaptchaNums] = useState<{ a: number; b: number }>({
    a: 4,
    b: 5,
  });
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SubmittedReceipt | null>(null);

  const refreshCaptcha = () => {
    setCaptchaNums({
      a: Math.floor(Math.random() * 8) + 2,
      b: Math.floor(Math.random() * 8) + 1,
    });
    setCaptchaAnswer('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remainingSlots = 4 - mediaFiles.length;
    if (remainingSlots <= 0) {
      setError('Maximum 4 photographs or short videos can be attached.');
      return;
    }

    const nextItems: MediaUpload[] = [];
    for (const file of files.slice(0, remainingSlots)) {
      if (file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`Image "${file.name}" exceeds 10 MB limit.`);
          continue;
        }
        const dataUrl = await compressImageIfNeeded(file, 1400, 0.8);
        nextItems.push({ name: file.name, type: 'image', dataUrl });
      } else if (file.type.startsWith('video/')) {
        if (file.size > 5 * 1024 * 1024) {
          setError(
            `Video "${file.name}" exceeds 5 MB limit. Please upload a shorter clip.`
          );
          continue;
        }
        const dataUrl = await readFileAsDataUrl(file);
        nextItems.push({ name: file.name, type: 'video', dataUrl });
      } else {
        setError(`Unsupported file type: ${file.name}`);
      }
    }

    setMediaFiles((prev) => [...prev, ...nextItems]);
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedMobile = mobileNumber.replace(/\D/g, '');
    const cleanedConfirm = confirmMobile.replace(/\D/g, '');

    if (citizenName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (cleanedMobile !== cleanedConfirm) {
      setError('Mobile numbers do not match. Please verify both fields.');
      return;
    }
    if (areaStreet.trim().length < 2) {
      setError('Please specify your Area or Street name.');
      return;
    }
    if (description.trim().length < 15) {
      setError(
        'Please describe the civic problem in at least 15 characters.'
      );
      return;
    }
    if (Number(captchaAnswer) !== captchaNums.a + captchaNums.b) {
      setError('Incorrect verification sum. Please check the math answer.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenName: citizenName.trim(),
          mobileNumber: cleanedMobile,
          areaStreet: areaStreet.trim(),
          wardNumber: '65',
          category,
          landmark: landmark.trim(),
          description: description.trim(),
          mediaFiles,
          website: websiteHoneypot,
          captchaA: captchaNums.a,
          captchaB: captchaNums.b,
          captchaAnswer: Number(captchaAnswer),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint.');
      }

      setReceipt(data.complaint);
      setCitizenName('');
      setMobileNumber('');
      setConfirmMobile('');
      setAreaStreet('');
      setLandmark('');
      setDescription('');
      setMediaFiles([]);
      refreshCaptcha();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to submit complaint.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#15803D]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              {t.register.successTitle}
            </h2>
            <p className="text-sm text-slate-600">{t.register.successNote}</p>
          </div>
        </div>

        <div className="mt-6 p-5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-xs font-medium text-slate-500">
            {t.register.complaintIdLabel}
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-mono font-bold tracking-tight text-[#0B2545] tabular-nums">
            {receipt.complaintCode}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">{t.register.nameLabel}: </span>
              <span className="font-medium text-slate-900">
                {receipt.citizenName}
              </span>
            </div>
            <div>
              <span className="text-slate-500">{t.register.areaLabel}: </span>
              <span className="font-medium text-slate-900">
                {receipt.areaStreet}
              </span>
            </div>
            <div>
              <span className="text-slate-500">
                {t.register.categoryLabel}:{' '}
              </span>
              <span className="font-medium text-slate-900">
                {CATEGORY_LABELS[receipt.category]?.[lang] ?? receipt.category}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Status: </span>
              <span className="font-semibold text-[#15803D]">
                {receipt.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/track?code=${encodeURIComponent(receipt.complaintCode)}`}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0B2545] rounded-lg hover:bg-[#133868] transition-colors"
          >
            {t.register.trackNowBtn}
          </Link>
          <button
            type="button"
            onClick={() => setReceipt(null)}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {t.register.submitAnotherBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6"
    >
      {/* Hidden Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={websiteHoneypot}
          onChange={(e) => setWebsiteHoneypot(e.target.value)}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 font-medium"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="citizenName"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            {t.register.nameLabel} *
          </label>
          <input
            id="citizenName"
            type="text"
            required
            value={citizenName}
            onChange={(e) => setCitizenName(e.target.value)}
            placeholder={t.register.namePlaceholder}
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
          />
        </div>

        <div>
          <label
            htmlFor="wardNumber"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            {t.register.wardLabel}
          </label>
          <input
            id="wardNumber"
            type="text"
            readOnly
            value="65 (Hubballi-Dharwad Municipal Corporation)"
            className="w-full px-3.5 py-2.5 text-base border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
          />
        </div>

        <div>
          <label
            htmlFor="mobileNumber"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            {t.register.mobileLabel} *
          </label>
          <input
            id="mobileNumber"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            required
            value={mobileNumber}
            onChange={(e) =>
              setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
            }
            placeholder={t.register.mobilePlaceholder}
            className="w-full px-3.5 py-2.5 text-base font-mono tabular-nums border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
          />
        </div>

        <div>
          <label
            htmlFor="confirmMobile"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            {t.register.confirmMobileLabel} *
          </label>
          <input
            id="confirmMobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            required
            value={confirmMobile}
            onChange={(e) =>
              setConfirmMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
            }
            placeholder={t.register.confirmMobilePlaceholder}
            className="w-full px-3.5 py-2.5 text-base font-mono tabular-nums border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="areaStreet"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            {t.register.areaLabel} *
          </label>
          <input
            id="areaStreet"
            type="text"
            list="ward65-areas-list"
            required
            value={areaStreet}
            onChange={(e) => setAreaStreet(e.target.value)}
            placeholder={t.register.areaPlaceholder}
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
          />
          <datalist id="ward65-areas-list">
            {WARD_65_AREAS.map((area) => (
              <option key={area} value={area} />
            ))}
          </datalist>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {WARD_65_AREAS.slice(0, 4).map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setAreaStreet(area)}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            {t.register.categoryLabel} *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
          >
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]?.[lang] ?? cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="landmark"
          className="block text-sm font-semibold text-slate-800 mb-1.5"
        >
          {t.register.landmarkLabel}
        </label>
        <input
          id="landmark"
          type="text"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder={t.register.landmarkPlaceholder}
          className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-slate-800 mb-1.5"
        >
          {t.register.descLabel} *
        </label>
        <textarea
          id="description"
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.register.descPlaceholder}
          className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
        />
      </div>

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1">
          {t.register.mediaLabel}
        </label>
        <p className="text-xs text-slate-500 mb-3">{t.register.mediaHint}</p>

        <label className="flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
          <Upload className="w-6 h-6 text-[#0B2545] mb-2" />
          <span className="text-sm font-medium text-slate-700">
            Select Photographs (JPG/PNG) or Short Videos (MP4/WebM, max 5 MB)
          </span>
          <span className="text-xs text-slate-500 mt-1">
            Up to 4 attachments ({mediaFiles.length}/4 added)
          </span>
          <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {mediaFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mediaFiles.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.type === 'image' ? (
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center shrink-0">
                      <FileVideo className="w-5 h-5 text-[#0B2545]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      {item.type === 'image' ? (
                        <FileImage className="w-3 h-3" />
                      ) : (
                        <FileVideo className="w-3 h-3" />
                      )}
                      <span>{item.type === 'image' ? 'Photo' : 'Video'}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMedia(idx)}
                  aria-label="Remove attachment"
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spam Protection Verification */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0" />
          <div>
            <div className="text-sm font-semibold text-slate-800">
              {t.register.captchaLabel}
            </div>
            <div className="text-xs text-slate-600">
              Solve: What is{' '}
              <span className="font-mono font-bold text-[#0B2545]">
                {captchaNums.a} + {captchaNums.b}
              </span>
              ?
            </div>
          </div>
        </div>
        <input
          type="number"
          required
          value={captchaAnswer}
          onChange={(e) => setCaptchaAnswer(e.target.value)}
          placeholder="Answer"
          className="w-32 px-3 py-2 text-base font-mono tabular-nums border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-[#0B2545]"
        />
      </div>

      <p className="text-xs text-slate-500">{t.register.privacyNotice}</p>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
      >
        {submitting ? t.register.submittingBtn : t.register.submitBtn}
      </button>
    </form>
  );
}
