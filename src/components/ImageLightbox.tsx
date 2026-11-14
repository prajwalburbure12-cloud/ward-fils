'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from './LanguageProvider.tsx';

export interface LightboxImageItem {
  src: string;
  title?: string;
  subtitle?: string;
  beforeSrc?: string | null;
  afterSrc?: string | null;
}

interface ImageLightboxProps {
  items: LightboxImageItem[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

function ImageLightboxContent({
  items,
  initialIndex,
  onClose,
}: {
  items: LightboxImageItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [compareTab, setCompareTab] = useState<'compare' | 'before' | 'after'>('compare');
  const [sliderPos, setSliderPos] = useState(50);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && items.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setCompareTab('compare');
        setSliderPos(50);
      } else if (e.key === 'ArrowLeft' && items.length > 1) {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        setCompareTab('compare');
        setSliderPos(50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [items.length, onClose]);

  const currentItem = items[currentIndex] ?? items[0];
  if (!currentItem) return null;

  const hasBeforeAfter = Boolean(
    currentItem.beforeSrc && currentItem.afterSrc
  );

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.title || 'Full screen image viewer'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col select-none"
    >
      {/* Top Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 border-b border-white/10 bg-black/60 text-white shrink-0"
      >
        <div className="min-w-0">
          {currentItem.title && (
            <h2 className="text-sm sm:text-base font-bold text-white truncate">
              {currentItem.title}
            </h2>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-300 truncate">
            {currentItem.subtitle && <span>{currentItem.subtitle}</span>}
            {items.length > 1 && (
              <span className="font-mono text-amber-300">
                {currentIndex + 1} / {items.length}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close full screen view"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Close</span>
        </button>
      </div>

      {/* Main Full-Screen Image Canvas */}
      <div
        onClick={onClose}
        className="flex-1 min-h-0 relative flex items-center justify-center p-3 sm:p-8"
      >
        {items.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(
                (prev) => (prev - 1 + items.length) % items.length
              );
              setCompareTab('compare');
              setSliderPos(50);
            }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-5 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <motion.div
          key={`${currentIndex}-${currentItem.src}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-full max-h-full flex flex-col items-center justify-center"
        >
          {hasBeforeAfter && compareTab === 'compare' ? (
            <div className="w-[92vw] sm:w-[82vw] max-w-5xl space-y-3">
              <div className="relative w-full h-[65vh] sm:h-[72vh] rounded-lg overflow-hidden border border-white/15 bg-black">
                <img
                  src={currentItem.afterSrc!}
                  alt={`${currentItem.title || 'Work'} - ${t.gallery.afterLabel}`}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={currentItem.beforeSrc!}
                    alt={`${currentItem.title || 'Work'} - ${t.gallery.beforeLabel}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="absolute inset-y-0 w-0.5 bg-white shadow"
                  style={{ left: `${sliderPos}%` }}
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 text-xs font-semibold bg-slate-900/85 text-white rounded">
                  {t.gallery.beforeLabel}
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 text-xs font-semibold bg-[#15803D]/90 text-white rounded">
                  {t.gallery.afterLabel}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                aria-label="Full screen before and after slider"
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          ) : (
            <img
              src={
                hasBeforeAfter && compareTab === 'before'
                  ? currentItem.beforeSrc!
                  : hasBeforeAfter && compareTab === 'after'
                    ? currentItem.afterSrc!
                    : currentItem.src
              }
              alt={currentItem.title || 'Full screen view'}
              referrerPolicy="no-referrer"
              className="max-w-[94vw] max-h-[78vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
          )}
        </motion.div>

        {items.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % items.length);
              setCompareTab('compare');
              setSliderPos(50);
            }}
            aria-label="Next image"
            className="absolute right-2 sm:right-5 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Controls for Before/After works */}
      {hasBeforeAfter && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="px-4 py-3 border-t border-white/10 bg-black/75 flex items-center justify-center gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={() => setCompareTab('compare')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              compareTab === 'compare'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {t.gallery.beforeLabel} / {t.gallery.afterLabel}
          </button>
          <button
            type="button"
            onClick={() => setCompareTab('before')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              compareTab === 'before'
                ? 'bg-white text-slate-950'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {t.gallery.beforeLabel}
          </button>
          <button
            type="button"
            onClick={() => setCompareTab('after')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              compareTab === 'after'
                ? 'bg-[#15803D] text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {t.gallery.afterLabel}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export function ImageLightbox({
  items,
  initialIndex = 0,
  open,
  onClose,
}: ImageLightboxProps) {
  return (
    <AnimatePresence>
      {open && items.length > 0 && (
        <ImageLightboxContent
          key={`lightbox-${initialIndex}-${items.length}`}
          items={items}
          initialIndex={initialIndex}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
