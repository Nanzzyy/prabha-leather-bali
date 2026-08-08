'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/i18n/LangContext';

// Keep this older URL working for bookmarks. A category without a subcategory
// now opens the collection browser so every subcategory is visible at once.
export default function CollectionExploreRedirect() {
  const router = useRouter();
  const { lang } = useLang();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const subcategory = params.get('subcategory');
    if (category && category !== 'all' && !subcategory) {
      router.replace(`/${lang}/collection/${encodeURIComponent(category)}/`);
      return;
    }
    if (!category) params.set('category', 'all');
    router.replace(`/${lang}/catalog/?${params.toString()}`);
  }, [router, lang]);
  return <div className="route-loader route-loader--storefront" role="status" aria-live="polite"><div className="storefront-loader__mark"><span>PRABA</span><small>LEATHER BALI</small></div><span className="storefront-loader__bar" /><p>Taking you to the catalog…</p></div>;
}
