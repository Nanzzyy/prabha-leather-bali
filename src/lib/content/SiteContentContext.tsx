'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getDefaultContent, mergeSiteContent, type ContentSection, type SiteContent } from './defaults';
import type { Lang } from '@/lib/i18n/dictionaries';

type SiteContentContextValue = { content: SiteContent; loading: boolean; unavailable: boolean };
const SiteContentContext = createContext<SiteContentContextValue | null>(null);

const CONTENT_TTL = 60_000;
// Hard cap on the blocking loader so a slow/failed fetch can never stall the
// page for seconds. Content normally arrives in <1s; after this we reveal the
// bundled defaults with a degraded banner.
const CONTENT_FETCH_CAP = 2000;

export async function fetchLiveSiteContent(lang: Lang): Promise<Partial<Record<ContentSection, object>> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('site_content').select('section, content').eq('locale', lang);
  if (error) throw error;
  if (!data) return null;
  return data.reduce<Partial<Record<ContentSection, object>>>((result, row) => {
    result[row.section as ContentSection] = row.content as object;
    return result;
  }, {});
}

function mergeLive(fallback: SiteContent, live: Partial<Record<ContentSection, object>> | null): SiteContent {
  let next = fallback;
  for (const section of Object.keys(live ?? {}) as ContentSection[]) {
    next = { ...next, [section]: mergeSiteContent(next[section], live?.[section] as never) };
  }
  return next;
}

function readStoredContent(lang: Lang): { value: SiteContent; at: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(`praba:content:${lang}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: SiteContent; at: number };
    return typeof parsed?.at === 'number' ? parsed : null;
  } catch { return null; }
}

export function SiteContentProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  // SSR-safe initial state (bundled defaults + loading=true) matches between
  // server and first client render, so no hydration mismatch. The loader masks
  // the fallback until real content is ready — that prevents the "old text then
  // swap" flash. sessionStorage hydrates the real copy in the effect so repeat
  // loads lift the loader almost instantly.
  const fallback = useMemo(() => getDefaultContent(lang), [lang]);
  const [content, setContent] = useState<SiteContent>(fallback);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrating from / syncing with the sessionStorage + Supabase external stores */
  useEffect(() => {
    let mounted = true;

    const stored = readStoredContent(lang);
    if (stored) {
      setContent(stored.value);
      if (Date.now() - stored.at < CONTENT_TTL) {
        setLoading(false);
        return () => { mounted = false; };
      }
    }

    const cap = window.setTimeout(() => {
      if (!mounted) return;
      setUnavailable(true);
      setLoading(false);
    }, CONTENT_FETCH_CAP);

    fetchLiveSiteContent(lang).then((live) => {
      if (!mounted) return;
      window.clearTimeout(cap);
      const next = mergeLive(fallback, live);
      setContent(next);
      setUnavailable(false);
      setLoading(false);
      try { window.sessionStorage.setItem(`praba:content:${lang}`, JSON.stringify({ value: next, at: Date.now() })); } catch { /* quota */ }
    }).catch(() => { if (mounted) { window.clearTimeout(cap); setUnavailable(true); setLoading(false); } });

    return () => { mounted = false; window.clearTimeout(cap); };
  }, [fallback, lang]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return <SiteContentContext.Provider value={{ content, loading, unavailable }}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const value = useContext(SiteContentContext);
  if (!value) throw new Error('useSiteContent must be used inside SiteContentProvider');
  return value;
}
