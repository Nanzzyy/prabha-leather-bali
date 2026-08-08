import { getDefaultContent } from '@/lib/content/defaults';
import { LANGS } from '@/lib/i18n/dictionaries';
import { getCatalogProducts } from '@/lib/repositories';
import CollectionBrowser from '@/components/CollectionBrowser';

export const dynamicParams = true;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => getDefaultContent(lang).collection.items.map((item) => ({ lang, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const item = getDefaultContent(lang === 'id' ? 'id' : 'en').collection.items.find((entry) => entry.slug === slug);
  return { title: item ? `${item.title} — Praba Leather Bali` : 'Collection — Praba Leather Bali' };
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { slug } = await params;
  const products = await getCatalogProducts();
  return <CollectionBrowser slug={slug} initialProducts={products} />;
}
