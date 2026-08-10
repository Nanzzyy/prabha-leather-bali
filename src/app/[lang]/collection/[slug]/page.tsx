import { getDefaultContent } from '@/lib/content/defaults';
import { LANGS } from '@/lib/i18n/dictionaries';
import { getCatalogProducts } from '@/lib/repositories';
import CollectionBrowser from '@/components/CollectionBrowser';
import { getPageMetadata } from '@/lib/seo/metadata';

// Static Hostinger exports can only emit paths known at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => getDefaultContent(lang).collection.items.map((item) => ({ lang, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  return getPageMetadata(lang, 'collectionDetail', `/collection/${slug}/`);
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { slug } = await params;
  const products = await getCatalogProducts();
  return <CollectionBrowser slug={slug} initialProducts={products} />;
}
