'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from './LanguageProvider.tsx';
import { BeforeAfterViewer } from './BeforeAfterViewer.tsx';
import { ANNOUNCEMENT_TYPE_LABELS, DEV_CATEGORY_LABELS } from '../lib/i18n.ts';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_REPRESENTATIVES,
} from '../lib/defaults.ts';
import type { HeroSlideItem } from '../db/schema.ts';

export interface PortalSettingsData {
  id: number;
  bannerImageUrl: string | null;
  bannerAlt: string | null;
  heroSlides?: HeroSlideItem[] | null;
  officeAddressEn: string;
  officeAddressKn: string;
  officePhone: string | null;
  officeEmail: string | null;
  whatsappNumber: string | null;
  googleMapsUrl: string | null;
  emergencyWaterPhone: string | null;
  emergencyPowerPhone: string | null;
  emergencySanitationPhone: string | null;
}

export interface RepresentativeData {
  id: number;
  slotOrder: number;
  nameEn: string;
  nameKn: string;
  designationEn: string;
  designationKn: string;
  introEn: string;
  introKn: string;
  workEn: string;
  workKn: string;
  phone: string | null;
  email: string | null;
  officeHours: string | null;
  photoUrl: string | null;
}

export interface DevelopmentWorkData {
  id: number;
  titleEn: string;
  titleKn: string;
  area: string;
  category: string;
  status: string;
  descriptionEn: string;
  descriptionKn: string;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
  completionDate: string | null;
}

export interface AnnouncementData {
  id: number;
  titleEn: string;
  titleKn: string;
  type: string;
  location: string;
  eventDate: string;
  descriptionEn: string;
  descriptionKn: string;
  photoUrl: string | null;
}

export interface PortalStatsData {
  totalComplaints: number;
  pendingComplaints: number;
  underProcessComplaints: number;
  resolvedComplaints: number;
  totalProjects: number;
  completedProjects: number;
}

export interface PublicPortalPayload {
  settings: PortalSettingsData | null;
  representatives: RepresentativeData[];
  developmentWorks: DevelopmentWorkData[];
  announcements: AnnouncementData[];
  stats: PortalStatsData;
}

export function HomePortalView({
  initialData,
}: {
  initialData: PublicPortalPayload;
}) {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<PublicPortalPayload>(initialData);

  useEffect(() => {
    let active = true;
    fetch('/api/portal', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json) {
          setData((prev) => ({
            ...json,
            settings: json.settings ?? prev.settings,
            representatives:
              Array.isArray(json.representatives) &&
              json.representatives.length > 0
                ? json.representatives
                : prev.representatives,
          }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const { settings, developmentWorks, announcements, stats } = data;
  const representatives =
    data.representatives.length > 0
      ? data.representatives
      : DEFAULT_REPRESENTATIVES;

  const heroSlides = useMemo(() => {
    const customSlides = (settings?.heroSlides ?? []).filter(
      (s) => s && typeof s.src === 'string' && s.src.trim().length > 0
    );
    if (customSlides.length > 0) {
      return customSlides;
    }

    const dynamicSlides: HeroSlideItem[] = [];
    for (const work of developmentWorks) {
      const url = work.afterPhotoUrl || work.beforePhotoUrl;
      if (url) {
        dynamicSlides.push({
          src: url,
          titleEn: work.titleEn,
          titleKn: work.titleKn || work.titleEn,
        });
      }
      if (dynamicSlides.length >= 4) break;
    }

    for (const item of announcements) {
      if (item.photoUrl && dynamicSlides.length < 6) {
        dynamicSlides.push({
          src: item.photoUrl,
          titleEn: item.titleEn,
          titleKn: item.titleKn || item.titleEn,
        });
      }
    }

    return [...dynamicSlides, ...DEFAULT_HERO_SLIDES];
  }, [settings?.heroSlides, developmentWorks, announcements]);

  const [slideIndex, setSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const totalSlides = heroSlides.length;

  useEffect(() => {
    if (totalSlides <= 1 || isSlidePaused) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [totalSlides, isSlidePaused]);

  const activeSlide =
    heroSlides[slideIndex % Math.max(1, totalSlides)] ?? heroSlides[0];

  const statItems = [
    {
      label: t.stats.totalComplaints,
      value: stats.totalComplaints,
      accent: 'text-[#0B2545]',
    },
    {
      label: t.stats.pendingComplaints,
      value: stats.pendingComplaints,
      accent: 'text-[#D97706]',
    },
    {
      label: t.stats.underProcess,
      value: stats.underProcessComplaints,
      accent: 'text-[#1D4ED8]',
    },
    {
      label: t.stats.resolvedComplaints,
      value: stats.resolvedComplaints,
      accent: 'text-[#15803D]',
    },
    {
      label: t.stats.totalProjects,
      value: stats.totalProjects,
      accent: 'text-[#0B2545]',
    },
    {
      label: t.stats.completedProjects,
      value: stats.completedProjects,
      accent: 'text-[#15803D]',
    },
  ];

  const cleanWhatsapp = settings?.whatsappNumber
    ? settings.whatsappNumber.replace(/\D/g, '')
    : '';

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* 1. HOMEPAGE BANNER SECTION */}
      <section aria-label="Ward 65 Official Banner" className="bg-slate-50 border-b border-slate-200">
        {settings?.bannerImageUrl ? (
          <div className="w-full bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto">
              <img
                src={settings.bannerImageUrl}
                alt={
                  settings.bannerAlt ||
                  'Ward No. 65, Hubballi-Dharwad Municipal Corporation Banner'
                }
                referrerPolicy="no-referrer"
                className="w-full h-auto block"
              />
            </div>
          </div>
        ) : null}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="bg-[#0B2545] text-white rounded-2xl p-8 sm:p-10 lg:p-12 border border-[#163864] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 lg:gap-10">
            <div className="flex-1 min-w-0 max-w-xl space-y-4">
              <p className="text-xs sm:text-sm font-medium tracking-wide text-amber-300">
                {t.hero.eyebrow}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white [text-wrap:balance]">
                {t.hero.title}
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-slate-200">
                {t.hero.subtitle}
              </p>
              <p className="text-base sm:text-lg text-emerald-300 font-medium">
                {t.hero.motto}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <FileText className="w-5 h-5" />
                  <span>{t.hero.ctaRegister}</span>
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-[#0B2545] bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Search className="w-5 h-5" />
                  <span>{t.hero.ctaTrack}</span>
                </Link>
              </div>

              {!settings?.bannerImageUrl && (
                <p className="pt-2 text-xs text-slate-300/80">
                  {t.hero.bannerPending}
                </p>
              )}
            </div>

            {/* Right-side Responsive Slideshow: Square on vertical mobile, Big Landscape Rectangle on horizontal / laptop */}
            {activeSlide && (
              <div
                onMouseEnter={() => setIsSlidePaused(true)}
                onMouseLeave={() => setIsSlidePaused(false)}
                className="w-full max-w-[260px] aspect-square sm:max-w-none sm:w-[270px] sm:aspect-[16/10] md:w-[340px] lg:w-[460px] xl:w-[520px] shrink-0 mx-auto sm:mx-0 rounded-xl overflow-hidden border border-white/15 bg-[#081b34] relative shadow-md group"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${slideIndex % totalSlides}-${activeSlide.src}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <img
                      src={activeSlide.src}
                      alt={
                        lang === 'kn' ? activeSlide.titleKn : activeSlide.titleEn
                      }
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Bottom contrast scrim & caption */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent pt-10 pb-3 px-3.5 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                    {lang === 'kn' ? activeSlide.titleKn : activeSlide.titleEn}
                  </p>

                  {totalSlides > 1 && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        {heroSlides.map((slide, idx) => {
                          const active = idx === slideIndex % totalSlides;
                          return (
                            <button
                              key={`${slide.src}-${idx}`}
                              type="button"
                              onClick={() => setSlideIndex(idx)}
                              aria-label={`View slide ${idx + 1}`}
                              className={`h-1 rounded-full transition-all cursor-pointer ${
                                active
                                  ? 'flex-[2] bg-amber-300'
                                  : 'flex-1 bg-white/35 hover:bg-white/60'
                              }`}
                            />
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setSlideIndex(
                              (prev) => (prev - 1 + totalSlides) % totalSlides
                            )
                          }
                          aria-label="Previous slide"
                          className="w-6 h-6 rounded-md bg-black/45 hover:bg-black/70 text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSlideIndex((prev) => (prev + 1) % totalSlides)
                          }
                          aria-label="Next slide"
                          className="w-6 h-6 rounded-md bg-black/45 hover:bg-black/70 text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. LIVE DATABASE STATISTICS */}
      <section
        aria-label="Live Civic Statistics"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2545]">
              {t.stats.heading}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t.stats.subheading}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-slate-200 rounded-xl bg-white overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {statItems.map((item) => (
            <div key={item.label} className="p-5 flex flex-col justify-between">
              <div className="text-xs font-medium text-slate-600 leading-snug">
                {item.label}
              </div>
              <div
                className={`mt-3 text-3xl font-mono font-bold tabular-nums ${item.accent}`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. OUR PUBLIC REPRESENTATIVES */}
      <section
        id="representatives"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2545]">
            {t.reps.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5">
            {t.reps.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {representatives.map((rep) => {
            const name = lang === 'kn' ? rep.nameKn : rep.nameEn;
            const designation =
              lang === 'kn' ? rep.designationKn : rep.designationEn;
            const intro = lang === 'kn' ? rep.introKn : rep.introEn;
            const work = lang === 'kn' ? rep.workKn : rep.workEn;

            return (
              <article
                key={rep.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                {/* Exact Supplied Photograph Frame (No alteration or replacement faces) */}
                <div className="w-full aspect-[4/3] bg-slate-100 border-b border-slate-200 flex items-center justify-center overflow-hidden">
                  {rep.photoUrl ? (
                    <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-slate-200 bg-white shadow-xs shrink-0">
                      <img
                        src={rep.photoUrl}
                        alt={name}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${
                          rep.slotOrder === 1
                            ? 'object-[50%_20%]'
                            : rep.slotOrder === 2
                              ? 'object-[50%_24%]'
                              : 'object-[50%_18%]'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3">
                        <UserCheck className="w-7 h-7 text-[#0B2545]" />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {t.reps.photoPending}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {name}
                      </h3>
                      <p className="text-sm font-semibold text-[#15803D] mt-0.5">
                        {designation}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {intro}
                    </p>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-xs font-semibold text-[#0B2545] mb-1">
                        {t.reps.publicWorkLabel}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {work}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                    <div className="font-semibold text-slate-800">
                      {t.reps.contactLabel}
                    </div>
                    {rep.phone || rep.email || rep.officeHours ? (
                      <>
                        {rep.phone && (
                          <div className="flex items-center gap-2 font-mono">
                            <Phone className="w-3.5 h-3.5 text-[#0B2545]" />
                            <a
                              href={`tel:${rep.phone.replace(/[^\d+]/g, '')}`}
                              className="hover:underline font-semibold text-[#0B2545]"
                            >
                              Call {rep.phone}
                            </a>
                          </div>
                        )}
                        {rep.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-[#0B2545]" />
                            <a
                              href={`mailto:${rep.email}`}
                              className="hover:underline truncate"
                            >
                              {rep.email}
                            </a>
                          </div>
                        )}
                        {rep.officeHours && (
                          <div className="text-slate-500">{rep.officeHours}</div>
                        )}
                      </>
                    ) : (
                      <div className="text-slate-500">{t.reps.notProvided}</div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. RESIDENT SERVICES DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2545] mb-6">
          {t.quickServices.heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/register"
            className="group p-6 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <FileText className="w-6 h-6 text-[#15803D]" />
              <h3 className="text-base font-bold text-slate-900">
                {t.quickServices.registerTitle}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.quickServices.registerDesc}
              </p>
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] group-hover:gap-2.5 transition-all">
              <span>{t.nav.register}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/track"
            className="group p-6 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <Search className="w-6 h-6 text-[#0B2545]" />
              <h3 className="text-base font-bold text-slate-900">
                {t.quickServices.trackTitle}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.quickServices.trackDesc}
              </p>
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] group-hover:gap-2.5 transition-all">
              <span>{t.nav.track}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/gallery"
            className="group p-6 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <Camera className="w-6 h-6 text-[#D97706]" />
              <h3 className="text-base font-bold text-slate-900">
                {t.quickServices.galleryTitle}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.quickServices.galleryDesc}
              </p>
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] group-hover:gap-2.5 transition-all">
              <span>{t.nav.gallery}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/updates"
            className="group p-6 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <Building2 className="w-6 h-6 text-[#0B2545]" />
              <h3 className="text-base font-bold text-slate-900">
                {t.quickServices.updatesTitle}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.quickServices.updatesDesc}
              </p>
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] group-hover:gap-2.5 transition-all">
              <span>{t.nav.updates}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* 5. WARD DEVELOPMENT GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2545]">
              {t.gallery.heading}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t.gallery.subheading}</p>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] hover:underline whitespace-nowrap shrink-0"
          >
            <span>View Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {developmentWorks.length === 0 ? (
          <div className="p-8 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
            {t.gallery.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {developmentWorks.slice(0, 3).map((work) => {
              const title = lang === 'kn' ? work.titleKn : work.titleEn;
              const desc =
                lang === 'kn' ? work.descriptionKn : work.descriptionEn;
              return (
                <article
                  key={work.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
                >
                  <BeforeAfterViewer
                    title={title}
                    beforePhotoUrl={work.beforePhotoUrl}
                    afterPhotoUrl={work.afterPhotoUrl}
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
                      <span className="text-[#15803D] font-medium">
                        {work.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {desc}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. LATEST UPDATES & ANNOUNCEMENTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2545]">
              {t.updates.heading}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t.updates.subheading}</p>
          </div>
          <Link
            href="/updates"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] hover:underline whitespace-nowrap shrink-0"
          >
            <span>All Announcements</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="p-8 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
            {t.updates.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.slice(0, 3).map((item) => {
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
                      className="w-full h-48 object-cover border-b border-slate-200"
                    />
                  )}
                  <div className="p-5 space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#D97706]">
                        {ANNOUNCEMENT_TYPE_LABELS[item.type]?.[lang] ??
                          item.type}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.eventDate}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
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
      </section>

      {/* 7. CONTACT & PUBLIC GRIEVANCE SNAPSHOT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#0B2545]">
              {t.contact.heading}
            </h2>
            <p className="text-sm text-slate-600">{t.contact.subheading}</p>

            <div className="space-y-2 text-sm text-slate-800 pt-2">
              <div className="font-semibold text-[#0B2545]">
                {t.contact.officeTitle}
              </div>
              <p className="text-slate-700">
                {lang === 'kn'
                  ? settings?.officeAddressKn
                  : settings?.officeAddressEn}
              </p>
              {settings?.officePhone && (
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-4 h-4 text-[#0B2545]" />
                  <a
                    href={`tel:${settings.officePhone}`}
                    className="hover:underline"
                  >
                    {settings.officePhone}
                  </a>
                </div>
              )}
              {settings?.officeEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0B2545]" />
                  <a
                    href={`mailto:${settings.officeEmail}`}
                    className="hover:underline"
                  >
                    {settings.officeEmail}
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors"
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B2545] bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{t.contact.mapsBtn}</span>
                </a>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#0B2545] hover:underline"
              >
                <span>Full Contact Directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {t.contact.emergencyTitle}
            </h3>
            <dl className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-slate-600">{t.contact.waterEmergency}</dt>
                <dd className="font-mono font-bold text-[#0B2545] tabular-nums">
                  {settings?.emergencyWaterPhone || '1533'}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-slate-600">{t.contact.powerEmergency}</dt>
                <dd className="font-mono font-bold text-[#0B2545] tabular-nums">
                  {settings?.emergencyPowerPhone || '1912'}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-slate-600">
                  {t.contact.sanitationEmergency}
                </dt>
                <dd className="font-mono font-bold text-[#0B2545] tabular-nums">
                  {settings?.emergencySanitationPhone || '1533'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
