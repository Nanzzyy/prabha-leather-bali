import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegalPage from '@/components/LegalPage';
import { getLegalPolicy } from '@/lib/legal/policies';
import { isValidLang, LANGS, type Lang } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = { title: 'Privacy Policy — Praba Leather Bali', description: 'How Praba Leather Bali handles storefront, enquiry, order, and browser data.' };

export function generateStaticParams() { return LANGS.map((lang) => ({ lang })); }

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  return <LegalPage policy={getLegalPolicy(lang as Lang, 'privacy')} />;
}
