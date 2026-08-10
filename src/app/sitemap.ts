import type { MetadataRoute } from 'next';
import { getDefaultContent } from '@/lib/content/defaults';
import { LANGS } from '@/lib/i18n/dictionaries';
import { getCatalogProducts } from '@/lib/repositories';
import { getCanonicalSiteUrl, getLiveSeo } from '@/lib/seo/metadata';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getLiveSeo('en');
  const siteUrl = getCanonicalSiteUrl(seo);
  const now = new Date();
  const staticPaths = ['', 'catalog', 'collection', 'collection/explore', 'about', 'contact', 'privacy', 'terms', 'cookies'];
  const urls: MetadataRoute.Sitemap = LANGS.flatMap((lang) => staticPaths.map((path) => ({
    url: `${siteUrl}/${lang}/${path}`.replace(/\/\/$/, '/'),
    lastModified: now,
    changeFrequency: path === '' || path === 'catalog' ? 'weekly' as const : 'monthly' as const,
    priority: path === '' ? 1 : path === 'catalog' || path === 'collection' ? 0.8 : 0.6,
  })));

  const [products, collections] = await Promise.all([
    getCatalogProducts().catch(() => []),
    Promise.resolve(getDefaultContent('en').collection.items),
  ]);
  for (const lang of LANGS) {
    for (const product of products) urls.push({ url: `${siteUrl}/${lang}/catalog/${product.slug}/`, lastModified: now, changeFrequency: 'weekly', priority: 0.7, images: product.images.slice(0, 3) });
    for (const collection of collections) urls.push({ url: `${siteUrl}/${lang}/collection/${collection.slug}/`, lastModified: now, changeFrequency: 'monthly', priority: 0.7, images: collection.image_url ? [collection.image_url] : undefined });
  }
  return urls;
}
