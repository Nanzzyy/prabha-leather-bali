import CatalogClient from '@/components/CatalogClient';
import CatalogHero from '@/components/CatalogHero';
import { getCatalogProducts } from '@/lib/repositories';
import { getPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return getPageMetadata(lang, 'catalog', '/catalog/');
}

export default async function CatalogPage() {
  const products = await getCatalogProducts();

  return <main className="catalog-page"><CatalogHero /><CatalogClient products={products} /></main>;
}
