import ContactClient from '@/components/ContactClient';
import ContactHero from '@/components/ContactHero';
import { getPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return getPageMetadata(lang, 'contact', '/contact/');
}

export default async function ContactPage() {
  return (
    <main className="contact-page">
      <ContactHero />

      <ContactClient />
    </main>
  );
}
