import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
              document.head.appendChild(link);

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
