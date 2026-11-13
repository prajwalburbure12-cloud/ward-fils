'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../../src/components/LanguageProvider.tsx';
import { ComplaintTracker } from '../../src/components/ComplaintTracker.tsx';

function TrackContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') ?? '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#15803D]">
          {t.brandShort} · {t.municipality}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B2545]">
          {t.track.heading}
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          {t.track.subheading}
        </p>
      </div>

      <ComplaintTracker initialCode={initialCode} />
    </div>
  );
}

export default function TrackComplaintPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm text-slate-500">
          Loading tracker...
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
