'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { COPY, type Language } from '../lib/i18n.ts';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof COPY)[Language];
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: COPY.en,
});

const LANG_EVENT = 'ward65_lang_change';

function subscribeLang(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(LANG_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(LANG_EVENT, callback);
  };
}

function getLangSnapshot(): Language {
  try {
    const saved = window.localStorage.getItem('ward65_lang');
    if (saved === 'en' || saved === 'kn') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'en';
}

function getServerLangSnapshot(): Language {
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getServerLangSnapshot
  );

  const setLang = (next: Language) => {
    try {
      window.localStorage.setItem('ward65_lang', next);
      window.dispatchEvent(new Event(LANG_EVENT));
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: COPY[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
