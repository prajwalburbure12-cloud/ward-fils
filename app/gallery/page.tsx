'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../src/components/LanguageProvider.tsx';
import { BeforeAfterViewer } from '../../src/components/BeforeAfterViewer.tsx';
import {
  ImageLightbox,
  type LightboxImageItem,
} from '../../src/components/ImageLightbox.tsx';
import type { DevelopmentWorkData } from '../../src/components/HomePortalView.tsx';
import { DEVELOPMENT_CATEGORIES, WARD_65_AREAS } from '../../src/lib/constants.ts';
import { DEV_CATEGORY_LABELS } from '../../src/lib/i18n.ts';

export default function GalleryPage() {
  const { lang, t } = useLanguage();
  const [works, setWorks] = useState<DevelopmentWorkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/portal', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.developmentWorks) {
          setWorks(json.developmentWorks);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = works.filter((w) => {
    const matchArea = areaFilter === 'ALL' || w.area === areaFilter;
    const matchCat = categoryFilter === 'ALL' || w.category === categoryFilter;
    return matchArea && matchCat;
  });

  const lightboxEntries = useMemo(() => {
    const entries: { workId: number; item: LightboxImageItem }[] = [];
    for (const work of filtered) {
      const primarySrc = work.afterPhotoUrl || work.beforePhotoUrl;
      if (!primarySrc) continue;
      const title = lang === 'kn' ? work.titleKn : work.titleEn;
      const catLabel = DEV_CATEGORY_LABELS[work.category]?.[lang] ?? work.category;
      entries.push({
        workId: work.id,
        item: {
          src: primarySrc,
          title,
          subtitle: `${work.area} · ${catLabel} · ${work.status}`,
          beforeSrc: work.beforePhotoUrl,
          afterSrc: work.afterPhotoUrl,
        },
      });
    }
    return entries;
  }, [filtered, lang]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#15803D]">
          {t.brandShort} · {t.municipality}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B2545]">
          {t.gallery.heading}
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          {t.gallery.subheading}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            Filter by Ward 65 Area
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setAreaFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                areaFilter === 'ALL'
                  ? 'bg-[#0B2545] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.gallery.allAreas}
            </button>
            {WARD_65_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setAreaFilter(area)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  areaFilter === area
                    ? 'bg-[#0B2545] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-700">
            Filter by Work Category
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === 'ALL'
                  ? 'bg-[#15803D] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.gallery.allCategories}
            </button>
            {DEVELOPMENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-[#15803D] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {DEV_CATEGORY_LABELS[cat]?.[lang] ?? cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
          {t.gallery.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((work) => {
            const title = lang === 'kn' ? work.titleKn : work.titleEn;
            const desc =
              lang === 'kn' ? work.descriptionKn : work.descriptionEn;
            const entryIdx = lightboxEntries.findIndex(
              (entry) => entry.workId === work.id
            );
            return (
              <article
                key={work.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
              >
                <BeforeAfterViewer
                  title={title}
                  beforePhotoUrl={work.beforePhotoUrl}
                  afterPhotoUrl={work.afterPhotoUrl}
                  onOpenFullScreen={
                    entryIdx >= 0 ? () => setLightboxIndex(entryIdx) : undefined
                  }
                />
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#0B2545]">
                      {work.area}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {DEV_CATEGORY_LABELS[work.category]?.[lang] ??
                        work.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-[#15803D]">
                      {work.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {desc}
                  </p>
                  {work.completionDate && (
                    <div className="text-xs text-slate-500 font-mono pt-1">
                      Date: {work.completionDate}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ImageLightbox
        open={lightboxIndex !== null}
        initialIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        items={lightboxEntries.map((e) => e.item)}
      />
    </div>
  );
}
