'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { DEFAULT_LANG, dicts, type Lang } from './dictionaries';

interface LangContextValue {
  lang: Lang;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LangContextValue>(() => {
    const dict = dicts[lang] ?? dicts[DEFAULT_LANG];
    return { lang, t: (key: string) => dict[key] ?? dicts[DEFAULT_LANG][key] ?? key };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within a LangProvider');
  return ctx;
}

/** Strip a leading /en or /id from a path. */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|id)(\/.*)?$/);
  return match ? (match[2] || '/') : pathname;
}

/** Prefix an internal path with the locale, preserving query/hash. Skips external & non-http hrefs. */
export function localizePath(lang: Lang, href: string): string {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const [path, query = ''] = href.split('?');
  const base = stripLocale(path || '/');
  const localized = base === '/' ? `/${lang}/` : `/${lang}${base}`;
  return query ? `${localized}?${query}` : localized;
}
