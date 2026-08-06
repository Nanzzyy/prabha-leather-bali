import CatalogClient from '@/components/CatalogClient';
import CatalogHero from '@/components/CatalogHero';
import { getCatalogProducts } from '@/lib/repositories';

export const metadata = { title: 'Catalog — Praba Leather Bali', description: 'Explore handcrafted full-grain leather pieces from Bali.' };

export default async function CatalogPage() {
  const products = await getCatalogProducts();

  return <main className="catalog-page"><CatalogHero /><CatalogClient products={products} /></main>;
}
