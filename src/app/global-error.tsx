'use client';

import Link from 'next/link';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body style={{ margin: 0, background: '#fcf9f3', color: '#181311', fontFamily: 'Arial, sans-serif' }}><main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}><div style={{ maxWidth: 560 }}><p style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 11, color: '#8b4513' }}>Praba Leather Bali</p><h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: 500, margin: '18px 0' }}>Something needs our attention.</h1><p style={{ color: '#756d68', lineHeight: 1.7 }}>The storefront could not finish loading. Your order and CMS data have not been changed.</p><div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28, flexWrap: 'wrap' }}><button onClick={reset} style={{ border: 0, background: '#181311', color: '#fff', padding: '14px 22px', cursor: 'pointer' }}>Try again</button><Link href="/maintenance/" style={{ border: '1px solid #181311', color: '#181311', padding: '13px 22px', textDecoration: 'none' }}>Maintenance page</Link></div></div></main></body></html>;
}
