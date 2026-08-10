import CollectionGrid from '@/components/CollectionGrid';
import CollectionHero from '@/components/CollectionHero';
import { getPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return getPageMetadata(lang, 'collection', '/collection/');
}

export default async function CollectionPage() {
  return <main className="collection-page">
    <CollectionHero />
    <CollectionGrid />
  </main>;
}
