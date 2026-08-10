import { notFound } from 'next/navigation';
import LegalPage from '@/components/LegalPage';
import { getLegalPolicy } from '@/lib/legal/policies';
import { isValidLang, LANGS, type Lang } from '@/lib/i18n/dictionaries';
import { getPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return getPageMetadata(lang, 'privacy', '/privacy/');
}

export function generateStaticParams() { return LANGS.map((lang) => ({ lang })); }

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  return <LegalPage policy={getLegalPolicy(lang as Lang, 'privacy')} />;
}
