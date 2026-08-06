'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/i18n/LangContext';

// /collection/explore/ has moved into the catalog. Preserve any category &
// subcategory query and redirect there. Client-side so it works under the
// static export (query strings aren't known at build time).
export default function CollectionExploreRedirect() {
  const router = useRouter();
  const { lang } = useLang();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('category')) params.set('category', 'all');
    router.replace(`/${lang}/catalog/?${params.toString()}`);
  }, [router, lang]);
  return <div className="route-loader route-loader--storefront" role="status" aria-live="polite"><div className="storefront-loader__mark"><span>PRABA</span><small>LEATHER BALI</small></div><span className="storefront-loader__bar" /><p>Taking you to the catalog…</p></div>;
}
