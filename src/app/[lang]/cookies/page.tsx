import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegalPage from '@/components/LegalPage';
import { getLegalPolicy } from '@/lib/legal/policies';
import { isValidLang, LANGS, type Lang } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = { title: 'Cookies & Browser Storage — Praba Leather Bali', description: 'The browser storage used by the Praba Leather Bali storefront and how to manage it.' };

export function generateStaticParams() { return LANGS.map((lang) => ({ lang })); }

export default async function CookiesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  return <LegalPage policy={getLegalPolicy(lang as Lang, 'cookies')} />;
}
