'use client';

import React from 'react';
import { useLanguage } from '../../src/components/LanguageProvider.tsx';
import { ComplaintForm } from '../../src/components/ComplaintForm.tsx';

export default function RegisterComplaintPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#15803D]">
          {t.brandShort} · {t.municipality}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B2545]">
          {t.register.heading}
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          {t.register.subheading}
        </p>
      </div>

      <ComplaintForm />
    </div>
  );
}
