import HeroCarousel from '@/components/HeroCarousel';
import HomeEditorialSections from '@/components/HomeEditorialSections';
import { getCatalogProducts } from '@/lib/repositories';
import { fetchLiveHeroes, fetchLiveLooks } from '@/lib/catalog/live';

export default async function Home() {
  const [products, heroes, looks] = await Promise.all([
    getCatalogProducts(),
    fetchLiveHeroes(),
    fetchLiveLooks(),
  ]);
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);

  return (
    <main>
      <HeroCarousel initialSlides={heroes} />
      <HomeEditorialSections featured={featured} initialLooks={looks} />
    </main>
  );
}
