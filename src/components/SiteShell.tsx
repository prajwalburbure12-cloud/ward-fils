'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useLanguage } from './LanguageProvider.tsx';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: t.nav.home },
    { href: '/track', label: t.nav.track },
    { href: '/gallery', label: t.nav.gallery },
    { href: '/updates', label: t.nav.updates },
    { href: '/contact', label: t.nav.contact },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Subtle Tricolor Civic Accent Hairline */}
      <div className="h-1 w-full bg-gradient-to-r from-[#EA580C] via-[#0B2545] to-[#15803D]" />

      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Title */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[#0B2545] whitespace-nowrap shrink-0"
          >
            {t.brandShort}
          </Link>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                    isActive
                      ? 'text-[#0B2545] border-[#0B2545] font-semibold'
                      : 'border-transparent hover:text-[#0B2545] hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary CTA Action (+ mobile menu toggle on small viewports) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] rounded-lg hover:bg-[#133868] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.register}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                  pathname === item.href
                    ? 'bg-slate-100 text-[#0B2545] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-lg text-base font-semibold text-white bg-[#0B2545]"
            >
              {t.nav.register}
            </Link>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    lang === 'en'
                      ? 'bg-white text-[#0B2545] shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('kn')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    lang === 'kn'
                      ? 'bg-white text-[#0B2545] shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#0B2545] hover:underline"
              >
                {t.nav.admin}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Non-sticky Institutional Utility Strip (Language Toggle + Admin Access) */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">{t.municipality}</span>
            <span aria-hidden="true">·</span>
            <span>{t.cityState}</span>
          </div>
          <div className="flex items-center gap-4">
            <div
              role="group"
              aria-label="Language selector"
              className="inline-flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'en'
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('kn')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'kn'
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
            <Link
              href="/admin"
              className="font-semibold text-[#0B2545] hover:underline whitespace-nowrap shrink-0"
            >
              {t.nav.admin}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Official Ward 65 Footer */}
      <footer className="bg-[#0B2545] text-slate-200 mt-16 border-t border-[#163864]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-6 space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {t.footer.title}
              </h2>
              <p className="text-sm font-medium text-slate-200">
                {t.footer.corp}
              </p>
              <p className="text-sm text-slate-300">{t.footer.place}</p>
              <p className="pt-3 text-sm font-medium text-amber-300">
                {t.footer.motto}
              </p>
            </div>

            <div className="md:col-span-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                {t.footer.quickLinksTitle}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <Link
                  href="/"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {t.nav.home}
                </Link>
                <Link
                  href="/register"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {t.nav.register}
                </Link>
                <Link
                  href="/track"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {t.nav.track}
                </Link>
                <Link
                  href="/gallery"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {t.footer.worksLink}
                </Link>
                <Link
                  href="/gallery"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {t.nav.gallery}
                </Link>
                <Link
                  href="/contact"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {t.nav.contact}
                </Link>
                <Link
                  href="/updates"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {t.nav.updates}
                </Link>
                <Link
                  href="/admin"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {t.nav.admin}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
            <p suppressHydrationWarning>
              © {new Date().getFullYear()} {t.footer.title} · {t.footer.corp}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`hover:text-white ${
                  lang === 'en' ? 'text-white font-semibold underline' : ''
                }`}
              >
                English
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setLang('kn')}
                className={`hover:text-white ${
                  lang === 'kn' ? 'text-white font-semibold underline' : ''
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
