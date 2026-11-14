'use client';

import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { useLanguage } from './LanguageProvider.tsx';
import { ImageLightbox } from './ImageLightbox.tsx';

export function BeforeAfterViewer({
  title,
  subtitle,
  beforePhotoUrl,
  afterPhotoUrl,
  onOpenFullScreen,
}: {
  title: string;
  subtitle?: string;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
  onOpenFullScreen?: () => void;
}) {
  const { t } = useLanguage();
  const [sliderPos, setSliderPos] = useState(50);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const triggerFullScreen = () => {
    if (onOpenFullScreen) {
      onOpenFullScreen();
    } else {
      setLightboxOpen(true);
    }
  };

  if (beforePhotoUrl && afterPhotoUrl) {
    return (
      <>
        <div className="space-y-2">
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 select-none group">
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
            <button
              type="button"
              onClick={triggerFullScreen}
              aria-label={`View ${title} in full screen`}
              className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-black/70 hover:bg-black/90 text-white rounded-md border border-white/20 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>
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

        {!onOpenFullScreen && (
          <ImageLightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            items={[
              {
                src: afterPhotoUrl,
                title,
                subtitle,
                beforeSrc: beforePhotoUrl,
                afterSrc: afterPhotoUrl,
              },
            ]}
          />
        )}
      </>
    );
  }

  const singleUrl = afterPhotoUrl || beforePhotoUrl;
  if (singleUrl) {
    return (
      <>
        <button
          type="button"
          onClick={triggerFullScreen}
          aria-label={`View ${title} in full screen`}
          className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 block group cursor-pointer text-left"
        >
          <img
            src={singleUrl}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-black/70 group-hover:bg-black/90 text-white rounded-md border border-white/20 transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </span>
        </button>

        {!onOpenFullScreen && (
          <ImageLightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            items={[{ src: singleUrl, title, subtitle }]}
          />
        )}
      </>
    );
  }

  return (
    <div className="w-full aspect-[4/3] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center p-4 text-center text-xs text-slate-500">
      {title}
    </div>
  );
}
