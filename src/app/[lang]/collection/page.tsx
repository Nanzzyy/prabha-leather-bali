import CollectionGrid from '@/components/CollectionGrid';
import CollectionHero from '@/components/CollectionHero';

export const metadata = { title: 'Collection — Praba Leather Bali', description: 'Explore the handcrafted leather categories from Praba Leather Bali.' };

export default async function CollectionPage() {
  return <main className="collection-page">
    <CollectionHero />
    <CollectionGrid />
  </main>;
}
