'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider.tsx';

export function BeforeAfterViewer({
  title,
  beforePhotoUrl,
  afterPhotoUrl,
}: {
  title: string;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
}) {
  const { t } = useLanguage();
  const [sliderPos, setSliderPos] = useState(50);

  if (beforePhotoUrl && afterPhotoUrl) {
    return (
      <div className="space-y-2">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 select-none">
          <img
            src={afterPhotoUrl}
            alt={`${title} - ${t.gallery.afterLabel}`}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={beforePhotoUrl}
              alt={`${title} - ${t.gallery.beforeLabel}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="absolute inset-y-0 w-0.5 bg-white shadow"
            style={{ left: `${sliderPos}%` }}
          />
          <div className="absolute bottom-2 left-2 px-2 py-1 text-[11px] font-semibold bg-slate-900/75 text-white rounded">
            {t.gallery.beforeLabel}
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 text-[11px] font-semibold bg-[#15803D]/90 text-white rounded">
            {t.gallery.afterLabel}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          aria-label={`Compare before and after for ${title}`}
          className="w-full accent-[#0B2545] cursor-pointer"
        />
      </div>
    );
  }

  const singleUrl = afterPhotoUrl || beforePhotoUrl;
  if (singleUrl) {
    return (
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
        <img
          src={singleUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[4/3] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center p-4 text-center text-xs text-slate-500">
      {title}
    </div>
  );
}
