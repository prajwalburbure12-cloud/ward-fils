'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../../src/components/LanguageProvider.tsx';
import type { AnnouncementData } from '../../src/components/HomePortalView.tsx';
import { ANNOUNCEMENT_TYPES } from '../../src/lib/constants.ts';
import { ANNOUNCEMENT_TYPE_LABELS } from '../../src/lib/i18n.ts';

export default function UpdatesPage() {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/portal', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.announcements) {
          setItems(json.announcements);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    typeFilter === 'ALL' ? items : items.filter((i) => i.type === typeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#15803D]">
          {t.brandShort} · {t.municipality}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B2545]">
          {t.updates.heading}
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          {t.updates.subheading}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
        <button
          type="button"
          onClick={() => setTypeFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            typeFilter === 'ALL'
              ? 'bg-[#0B2545] text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          {t.updates.allTypes}
        </button>
        {ANNOUNCEMENT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              typeFilter === type
                ? 'bg-[#0B2545] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {ANNOUNCEMENT_TYPE_LABELS[type]?.[lang] ?? type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
          {t.updates.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const title = lang === 'kn' ? item.titleKn : item.titleEn;
            const desc =
              lang === 'kn' ? item.descriptionKn : item.descriptionEn;
            return (
              <article
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="w-full h-52 object-cover border-b border-slate-200"
                  />
                )}
                <div className="p-6 space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#D97706]">
                      {ANNOUNCEMENT_TYPE_LABELS[item.type]?.[lang] ?? item.type}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.eventDate}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.location}</span>
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">
                    {desc}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
