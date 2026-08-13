import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { CurrencyProvider } from '@/lib/currency/CurrencyContext';
import { LangProvider } from '@/lib/i18n/LangContext';
import { isValidLang, LANGS } from '@/lib/i18n/dictionaries';
import { SiteContentProvider } from '@/lib/content/SiteContentContext';
import { fetchLiveSiteContent } from '@/lib/content/live';
import { ServiceStatusProvider } from '@/lib/service/ServiceStatusContext';
import StorefrontGate from '@/components/StorefrontGate';
import LazyCartDrawer from '@/components/LazyCartDrawer';
import { buildMetadata, getLiveSeo } from '@/lib/seo/metadata';

// Public storefront data may be shared between visitors. Revalidate often
// enough for CMS edits while allowing Next.js and the CDN to serve ISR HTML.
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return {};
  return buildMetadata(await getLiveSeo(lang), lang, 'home', '/');
}

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const initialContent = await fetchLiveSiteContent(lang).catch(() => null);
  return (
    <CurrencyProvider>
      <LangProvider lang={lang}>
        <SiteContentProvider lang={lang} initialContent={initialContent}>
          <ServiceStatusProvider>
            <StorefrontGate>
              <SiteHeader />
              {children}
              <SiteFooter />
              <LazyCartDrawer />
            </StorefrontGate>
          </ServiceStatusProvider>
        </SiteContentProvider>
      </LangProvider>
    </CurrencyProvider>
  );
}
