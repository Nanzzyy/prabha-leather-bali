import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CartDrawer from '@/components/CartDrawer';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { CurrencyProvider } from '@/lib/currency/CurrencyContext';
import { LangProvider } from '@/lib/i18n/LangContext';
import { isValidLang, LANGS } from '@/lib/i18n/dictionaries';
import { SiteContentProvider } from '@/lib/content/SiteContentContext';
import { ServiceStatusProvider } from '@/lib/service/ServiceStatusContext';
import StorefrontGate from '@/components/StorefrontGate';
import { buildMetadata, getLiveSeo } from '@/lib/seo/metadata';

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
  return (
    <CurrencyProvider>
      <LangProvider lang={lang}>
        <SiteContentProvider lang={lang}>
          <ServiceStatusProvider>
            <StorefrontGate>
              <SiteHeader />
              {children}
              <SiteFooter />
              <CartDrawer />
            </StorefrontGate>
          </ServiceStatusProvider>
        </SiteContentProvider>
      </LangProvider>
    </CurrencyProvider>
  );
}
