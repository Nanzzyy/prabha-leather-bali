import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegalPage from '@/components/LegalPage';
import { getLegalPolicy } from '@/lib/legal/policies';
import { isValidLang, LANGS, type Lang } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = { title: 'Terms of Service — Praba Leather Bali', description: 'Terms for browsing, enquiries, pouch orders, shipping, returns, and custom leather work.' };

export function generateStaticParams() { return LANGS.map((lang) => ({ lang })); }

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  return <LegalPage policy={getLegalPolicy(lang as Lang, 'terms')} />;
}
