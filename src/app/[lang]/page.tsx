import HeroCarousel from '@/components/HeroCarousel';
import HomeEditorialSections from '@/components/HomeEditorialSections';
import { getCatalogProducts } from '@/lib/repositories';

export default async function Home() {
  const products = await getCatalogProducts();
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);

  return (
    <main>
      <HeroCarousel />
      <HomeEditorialSections featured={featured} />
    </main>
  );
}
