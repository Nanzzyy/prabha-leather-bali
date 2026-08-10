import AboutClient from '@/components/AboutClient';
import { getPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return getPageMetadata(lang, 'about', '/about/');
}

export default function AboutPage() {
  return <AboutClient />;
}
