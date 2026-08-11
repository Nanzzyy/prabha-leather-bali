import type { Metadata } from 'next';
import { EB_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const serifFont = EB_Garamond({
  subsets: ['latin'],
  weight: 'variable',
  style: 'normal',
  display: 'swap',
  variable: '--font-serif',
});

const serifItalicFont = EB_Garamond({
  subsets: ['latin'],
  weight: 'variable',
  style: 'italic',
  display: 'swap',
  preload: false,
  variable: '--font-serif-italic',
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Praba Leather Bali — Handcrafted Excellence',
  description: 'Discover Praba Leather Bali, Kuta’s premier workshop for handcrafted, custom leather goods. Bringing over 30+ years of craftsmanship to every creation, we specialize in premium leather bags, boots, and timeless accessories. Delivering unmatched Balinese artistry right in the heart of the island.',
};

// The Hostinger CDN must not cache a document from an older deployment while
// the current deployment serves a different hashed chunk manifest.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`light ${serifFont.variable} ${serifItalicFont.variable} ${sansFont.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              // Host caches can briefly serve HTML from one build with assets
              // from another. A single cache-busting retry prevents a blank
              // loader when a hashed Next.js chunk or stylesheet is missing.
              const recoveryKey = 'praba:asset-recovery';
              const recover = (event) => {
                const target = event.target;
                const asset = target && (target.src || target.href || '');
                if (!asset.includes('/_next/') || sessionStorage.getItem(recoveryKey)) return;
                sessionStorage.setItem(recoveryKey, '1');
                const url = new URL(window.location.href);
                url.searchParams.set('_asset_recovery', Date.now().toString());
                window.location.replace(url.toString());
              };
              window.addEventListener('error', recover, true);
              window.addEventListener('load', () => window.setTimeout(() => sessionStorage.removeItem(recoveryKey), 10000), { once: true });
            })();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
