import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Praba Leather Bali — Handcrafted Excellence',
  description: 'Discover Praba Leather Bali, Kuta’s premier workshop for handcrafted, custom leather goods. Bringing over 30+ years of craftsmanship to every creation, we specialize in premium leather bags, boots, and timeless accessories. Delivering unmatched Balinese artistry right in the heart of the island.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Material+Symbols+Outlined:FILL@0..1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
