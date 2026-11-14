'use client';

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  compressImageIfNeeded,
  readFileAsDataUrl,
} from '../../lib/media-utils.ts';
import { DEFAULT_HERO_SLIDES } from '../../lib/defaults.ts';
import type { HeroSlideItem } from '../../db/schema.ts';
import type { PortalSettingsData } from '../HomePortalView.tsx';

interface AdminSettingsSectionProps {
  settings: PortalSettingsData | null;
  setSettings: React.Dispatch<React.SetStateAction<PortalSettingsData | null>>;
  onSaveSettings: (e: React.FormEvent) => Promise<void>;
}

export function AdminSettingsSection({
  settings,
  setSettings,
  onSaveSettings,
}: AdminSettingsSectionProps) {
  const [saving, setSaving] = useState(false);

  if (!settings) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
        Loading Ward No. 65 portal settings...
      </div>
    );
  }

  const activeSlides: HeroSlideItem[] =
    settings.heroSlides && settings.heroSlides.length > 0
      ? settings.heroSlides
      : DEFAULT_HERO_SLIDES;

  const updateSlides = (nextSlides: HeroSlideItem[]) => {
    setSettings({ ...settings, heroSlides: nextSlides });
  };

  const handleReplaceSlidePhoto = async (index: number, file: File) => {
    const dataUrl = await compressImageIfNeeded(file, 1400, 0.85);
    const updated = activeSlides.map((slide, idx) =>
      idx === index ? { ...slide, src: dataUrl } : slide
    );
    updateSlides(updated);
  };

  const handleAddSlidePhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newSlides: HeroSlideItem[] = [];
    for (const file of Array.from(files)) {
      if (activeSlides.length + newSlides.length >= 12) break;
      const dataUrl = await compressImageIfNeeded(file, 1400, 0.85);
      newSlides.push({
        src: dataUrl,
        titleEn: 'Ward No. 65 Civic Update',
        titleKn: 'ವಾರ್ಡ್ ನಂ. 65 ನಾಗರಿಕ ಮಾಹಿತಿ',
      });
    }
    updateSlides([...activeSlides, ...newSlides]);
  };

  const handleMoveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= activeSlides.length) return;
    const copy = [...activeSlides];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    updateSlides(copy);
  };

  const handleRemoveSlide = (index: number) => {
    const copy = activeSlides.filter((_, idx) => idx !== index);
    updateSlides(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setSaving(true);
    try {
      await onSaveSettings(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 max-w-4xl"
    >
      <div>
        <h2 className="text-xl font-bold text-[#0B2545]">
          Homepage Slideshow, Official Banner & Ward Contact Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Changes saved here update the homepage hero slideshow, official banner,
          Contact Us page, and emergency helplines immediately.
        </p>
      </div>

      {/* Hero Slideshow Images Manager */}
      <div className="space-y-4 p-4 sm:p-5 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545]">
              Hero Slideshow Images (Right Side of Welcome Card)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Upload, replace, reorder, or caption up to 12 photos shown in the
              homepage slideshow. Click <strong>Save Portal Settings</strong> at
              the bottom to publish changes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleAddSlidePhotos(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => updateSlides(DEFAULT_HERO_SLIDES)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Defaults</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {activeSlides.map((slide, idx) => (
            <div
              key={`${idx}-${slide.src.slice(0, 32)}`}
              className="p-3.5 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row gap-4 items-start"
            >
              <div className="w-full sm:w-40 aspect-[16/10] rounded-md overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                <img
                  src={slide.src}
                  alt={slide.titleEn || `Slide ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 w-full space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Slide {idx + 1} Caption (English)
                    </label>
                    <input
                      type="text"
                      value={slide.titleEn}
                      onChange={(e) => {
                        const updated = activeSlides.map((s, i) =>
                          i === idx ? { ...s, titleEn: e.target.value } : s
                        );
                        updateSlides(updated);
                      }}
                      placeholder="English caption"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Slide {idx + 1} Caption (Kannada)
                    </label>
                    <input
                      type="text"
                      value={slide.titleKn}
                      onChange={(e) => {
                        const updated = activeSlides.map((s, i) =>
                          i === idx ? { ...s, titleKn: e.target.value } : s
                        );
                        updateSlides(updated);
                      }}
                      placeholder="Kannada caption"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B2545] bg-slate-50 border border-slate-300 hover:bg-slate-100 rounded-md cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Replace Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleReplaceSlidePhoto(idx, f);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSlide(idx, -1)}
                    aria-label="Move slide up"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === activeSlides.length - 1}
                    onClick={() => handleMoveSlide(idx, 1)}
                    aria-label="Move slide down"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {activeSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(idx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md cursor-pointer ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <label className="block text-sm font-semibold text-slate-800">
          Official Supplied Homepage Banner (Displayed in Original Proportions)
        </label>
        {settings.bannerImageUrl && (
          <div className="space-y-2">
            <img
              src={settings.bannerImageUrl}
              alt={settings.bannerAlt || 'Current Homepage Banner'}
              referrerPolicy="no-referrer"
              className="w-full h-auto rounded border border-slate-200"
            />
            <button
              type="button"
              onClick={() =>
                setSettings({ ...settings, bannerImageUrl: null })
              }
              className="text-xs font-semibold text-red-700 hover:underline"
            >
              Remove Banner Image
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0B2545] bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100">
            <Upload className="w-4 h-4" />
            <span>Upload Supplied Banner Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const url = await readFileAsDataUrl(f);
                  setSettings({ ...settings, bannerImageUrl: url });
                }
              }}
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Banner Alt Text
          </label>
          <input
            type="text"
            value={settings.bannerAlt || ''}
            onChange={(e) =>
              setSettings({ ...settings, bannerAlt: e.target.value })
            }
            placeholder="Ward No. 65, Hubballi-Dharwad Municipal Corporation"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ward Office Address (English)
          </label>
          <input
            type="text"
            value={settings.officeAddressEn}
            onChange={(e) =>
              setSettings({ ...settings, officeAddressEn: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ward Office Address (Kannada)
          </label>
          <input
            type="text"
            value={settings.officeAddressKn}
            onChange={(e) =>
              setSettings({ ...settings, officeAddressKn: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ward Office Phone
          </label>
          <input
            type="text"
            value={settings.officePhone || ''}
            onChange={(e) =>
              setSettings({ ...settings, officePhone: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ward Office Email
          </label>
          <input
            type="email"
            value={settings.officeEmail || ''}
            onChange={(e) =>
              setSettings({ ...settings, officeEmail: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official WhatsApp Number (with country code, e.g. 9198450...)
          </label>
          <input
            type="text"
            value={settings.whatsappNumber || ''}
            onChange={(e) =>
              setSettings({ ...settings, whatsappNumber: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Google Maps Location URL
          </label>
          <input
            type="url"
            value={settings.googleMapsUrl || ''}
            onChange={(e) =>
              setSettings({ ...settings, googleMapsUrl: e.target.value })
            }
            placeholder="https://maps.google.com/..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Emergency Water Helpline
          </label>
          <input
            type="text"
            value={settings.emergencyWaterPhone || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                emergencyWaterPhone: e.target.value,
              })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Emergency Power / Streetlight Helpline
          </label>
          <input
            type="text"
            value={settings.emergencyPowerPhone || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                emergencyPowerPhone: e.target.value,
              })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Emergency Sanitation Helpline
          </label>
          <input
            type="text"
            value={settings.emergencySanitationPhone || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                emergencySanitationPhone: e.target.value,
              })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2.5 text-sm font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg disabled:opacity-60"
      >
        {saving ? 'Saving Settings...' : 'Save Portal Settings'}
      </button>
    </form>
  );
}
