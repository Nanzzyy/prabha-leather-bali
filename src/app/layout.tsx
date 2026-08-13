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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`light ${serifFont.variable} ${serifItalicFont.variable} ${sansFont.variable}`}>
      <head>
        <link rel="preload" as="image" href="/praba-logo.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
