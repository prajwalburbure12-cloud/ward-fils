'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { readFileAsDataUrl } from '../../lib/media-utils.ts';
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
          Homepage Official Banner & Ward Contact Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Changes saved here update the public homepage banner, Contact Us page,
          and emergency helplines immediately.
        </p>
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
