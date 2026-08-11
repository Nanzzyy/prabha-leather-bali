import type { Metadata } from 'next';
import { getDefaultContent, mergeSiteContent, type SeoPageKey, type SiteSeo } from '@/lib/content/defaults';
import { isValidLang, type Lang } from '@/lib/i18n/dictionaries';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase-config';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

const FALLBACK_SITE_URL = 'https://prabaleather.com';

function normalizeSiteUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return FALLBACK_SITE_URL;
    return url.toString().replace(/\/$/, '');
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function getCanonicalSiteUrl(seo: SiteSeo) {
  return normalizeSiteUrl(seo.canonicalUrl);
}

function absoluteAssetUrl(value: string, siteUrl: string, optimize = true) {
  try {
    const absolute = new URL(value, `${siteUrl}/`).toString();
    return optimize ? (getSupabaseImageUrl(absolute, { width: 1200, quality: 78 }) ?? absolute) : absolute;
  } catch { return `${siteUrl}/praba-logo.svg`; }
}

function parseRobots(value: string) {
  const directive = value.toLowerCase();
  const index = !directive.includes('noindex');
  const follow = !directive.includes('nofollow');
  return { index, follow };
}

export async function getLiveSeo(lang: Lang): Promise<SiteSeo> {
  const fallback = getDefaultContent(lang).global.seo;
  if (!supabaseUrl || !supabaseAnonKey) return fallback;

  try {
    const endpoint = new URL(`${supabaseUrl}/rest/v1/site_content`);
    endpoint.searchParams.set('select', 'content');
    endpoint.searchParams.set('locale', `eq.${lang}`);
    endpoint.searchParams.set('section', 'eq.global');
    endpoint.searchParams.set('limit', '1');
    const response = await fetchWithTimeout(endpoint, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
      next: { revalidate: 60, tags: [`site-seo-${lang}`] },
    }, 2500);
    if (!response.ok) return fallback;
    const rows = await response.json() as Array<{ content?: { seo?: Partial<SiteSeo> } }>;
    return mergeSiteContent(fallback, rows[0]?.content?.seo as never);
  } catch {
    return fallback;
  }
}

export function buildMetadata(seo: SiteSeo, lang: Lang, page: SeoPageKey, path: string): Metadata {
  const siteUrl = getCanonicalSiteUrl(seo);
  const pageSeo = seo.pages[page] ?? seo.pages.home;
  const pagePath = path === '/' ? `/${lang}/` : `/${lang}${path.startsWith('/') ? path : `/${path}`}`;
  const canonical = new URL(pagePath, `${siteUrl}/`).toString();
  const robots = parseRobots(seo.robots);
  const ogImage = absoluteAssetUrl(seo.ogImage.image_url, siteUrl);
  const twitterImage = absoluteAssetUrl(seo.twitterImage.image_url || seo.ogImage.image_url, siteUrl);
  const favicon = absoluteAssetUrl(seo.favicon.image_url, siteUrl, false);

  return {
    metadataBase: new URL(`${siteUrl}/`),
    title: pageSeo.title || seo.siteTitle,
    description: pageSeo.description || seo.siteDescription,
    keywords: seo.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean),
    authors: [{ name: seo.siteName }],
    creator: seo.siteName,
    publisher: seo.siteName,
    applicationName: seo.siteName,
    alternates: { canonical },
    robots: {
      index: robots.index,
      follow: robots.follow,
      googleBot: { index: robots.index, follow: robots.follow, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    openGraph: {
      type: 'website',
      locale: lang === 'id' ? 'id_ID' : 'en_US',
      url: canonical,
      siteName: seo.siteName,
      title: seo.ogTitle || pageSeo.title,
      description: seo.ogDescription || pageSeo.description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: seo.ogImage.alt || seo.ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || pageSeo.title,
      description: seo.twitterDescription || pageSeo.description,
      images: [{ url: twitterImage, alt: seo.twitterImage.alt || seo.twitterTitle }],
    },
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
  };
}

export async function getPageMetadata(langValue: string, page: SeoPageKey, path: string): Promise<Metadata> {
  const lang: Lang = isValidLang(langValue) ? langValue : 'en';
  return buildMetadata(await getLiveSeo(lang), lang, page, path);
}

export function getSeoPagePath(page: SeoPageKey) {
  if (page === 'home') return '/';
  if (page === 'collectionDetail') return '/collection/';
  if (page === 'product') return '/catalog/';
  return `/${page}/`;
}
