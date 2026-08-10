import type { MetadataRoute } from 'next';
import { getLiveSeo, getCanonicalSiteUrl } from '@/lib/seo/metadata';

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getLiveSeo('en');
  const indexable = !seo.robots.toLowerCase().includes('noindex');
  const siteUrl = getCanonicalSiteUrl(seo);
  return {
    rules: { userAgent: '*', allow: indexable ? '/' : '/', disallow: ['/admin/', '/api/'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
