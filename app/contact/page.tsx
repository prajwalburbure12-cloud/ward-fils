'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../src/components/LanguageProvider.tsx';
import type {
  PortalSettingsData,
  RepresentativeData,
} from '../../src/components/HomePortalView.tsx';

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const [settings, setSettings] = useState<PortalSettingsData | null>(null);
  const [reps, setReps] = useState<RepresentativeData[]>([]);

  useEffect(() => {
    fetch('/api/portal', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) {
          setSettings(json.settings ?? null);
          setReps(json.representatives ?? []);
        }
      });
  }, []);

  const cleanWhatsapp = settings?.whatsappNumber
    ? settings.whatsappNumber.replace(/\D/g, '')
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#15803D]">
          {t.brandShort} · {t.municipality}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B2545]">
          {t.contact.heading}
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          {t.contact.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ward Office Details */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-6 h-6 text-[#0B2545] mt-1 shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t.contact.officeTitle}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {lang === 'kn'
                  ? settings?.officeAddressKn ||
                    'ವಾರ್ಡ್ ನಂ. 65 ನಾಗರಿಕ ಸೇವಾ ಕಚೇರಿ, ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಮಹಾನಗರ ಪಾಲಿಕೆ'
                  : settings?.officeAddressEn ||
                    'Ward No. 65 Civic Service Office, Hubballi-Dharwad Municipal Corporation, Hubballi, Karnataka'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <div className="text-xs font-medium text-slate-500">
                Office Phone
              </div>
              <div className="text-sm font-mono font-semibold text-slate-900 mt-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0B2545]" />
                {settings?.officePhone ? (
                  <a
                    href={`tel:${settings.officePhone}`}
                    className="hover:underline"
                  >
                    {settings.officePhone}
                  </a>
                ) : (
                  <span className="font-sans text-slate-500">
                    {t.reps.notProvided}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500">
                Office Email
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0B2545]" />
                {settings?.officeEmail ? (
                  <a
                    href={`mailto:${settings.officeEmail}`}
                    className="hover:underline truncate"
                  >
                    {settings.officeEmail}
                  </a>
                ) : (
                  <span className="text-slate-500">{t.reps.notProvided}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {cleanWhatsapp && (
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.contact.whatsappBtn}</span>
              </a>
            )}
            {settings?.googleMapsUrl && (
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0B2545] bg-slate-50 border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{t.contact.mapsBtn}</span>
              </a>
            )}
          </div>
        </div>

        {/* Emergency Helplines */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#D97706]" />
            <h2 className="text-xl font-bold text-slate-900">
              {t.contact.emergencyTitle}
            </h2>
          </div>

          <dl className="divide-y divide-slate-200 text-sm">
            <div className="py-3 flex items-center justify-between">
              <dt className="font-medium text-slate-700">
                {t.contact.waterEmergency}
              </dt>
              <dd className="font-mono font-bold text-lg text-[#0B2545] tabular-nums">
                {settings?.emergencyWaterPhone || '1533'}
              </dd>
            </div>
            <div className="py-3 flex items-center justify-between">
              <dt className="font-medium text-slate-700">
                {t.contact.powerEmergency}
              </dt>
              <dd className="font-mono font-bold text-lg text-[#0B2545] tabular-nums">
                {settings?.emergencyPowerPhone || '1912'}
              </dd>
            </div>
            <div className="py-3 flex items-center justify-between">
              <dt className="font-medium text-slate-700">
                {t.contact.sanitationEmergency}
              </dt>
              <dd className="font-mono font-bold text-lg text-[#0B2545] tabular-nums">
                {settings?.emergencySanitationPhone || '1533'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Public Representatives Direct Contact Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0B2545]">
          {t.reps.heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reps.map((rep) => (
            <div
              key={rep.id}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-2"
            >
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'kn' ? rep.nameKn : rep.nameEn}
              </h3>
              <p className="text-xs font-semibold text-[#15803D]">
                {lang === 'kn' ? rep.designationKn : rep.designationEn}
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-sm text-slate-700">
                {rep.phone && (
                  <div className="flex items-center gap-2 font-mono">
                    <Phone className="w-4 h-4 text-[#0B2545]" />
                    <a href={`tel:${rep.phone}`} className="hover:underline">
                      {rep.phone}
                    </a>
                  </div>
                )}
                {rep.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0B2545]" />
                    <a
                      href={`mailto:${rep.email}`}
                      className="hover:underline truncate"
                    >
                      {rep.email}
                    </a>
                  </div>
                )}
                {rep.officeHours && (
                  <div className="text-xs text-slate-500">
                    {rep.officeHours}
                  </div>
                )}
                {!rep.phone && !rep.email && (
                  <div className="text-xs text-slate-500">
                    {t.reps.notProvided}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
