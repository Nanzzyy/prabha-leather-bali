import ContactClient, { Store } from '@/components/ContactClient';
import ContactHero from '@/components/ContactHero';
import { getPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return getPageMetadata(lang, 'contact', '/contact/');
}

// ponytail: placeholder store details — swap for Praba's real addresses/phone/email.
const stores: Store[] = [
  {
    name: 'Praba Atelier · Canggu',
    address: 'Jl. Nelayan, Canggu, Kec. Kuta Utara, Kabupaten Badung, Bali',
    phone: '+62 818 0459 5666',
    phoneHref: '+6281804595666',
    email: 'hello@prabaleather.com',
    hours: 'Mon–Sat · 09:00–19:00',
    mapQuery: 'Jl. Nelayan, Canggu, Bali',
  },
  {
    name: 'Praba Boutique · Ubud',
    address: 'Jl. Monkey Forest, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571',
    phone: '+62 818 0459 5666',
    phoneHref: '+6281804595666',
    email: 'hello@prabaleather.com',
    hours: 'Mon–Sun · 10:00–20:00',
    mapQuery: 'Jl. Monkey Forest, Ubud, Bali',
  },
  {
    name: 'Praba Studio · Seminyak',
    address: 'Jl. Raya Seminyak, Kec. Kuta, Kabupaten Badung, Bali',
    phone: '+62 818 0459 5666',
    phoneHref: '+6281804595666',
    email: 'hello@prabaleather.com',
    hours: 'Mon–Sat · 10:00–19:00',
    mapQuery: 'Jl. Raya Seminyak, Bali',
  },
];

export default async function ContactPage() {
  return (
    <main className="contact-page">
      <ContactHero />

      <ContactClient stores={stores} />
    </main>
  );
}
