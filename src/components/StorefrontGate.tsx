'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import { useServiceStatus } from '@/lib/service/ServiceStatusContext';
import { fetchLiveProducts, fetchLiveHeroes, fetchLiveStores, fetchLiveLooks } from '@/lib/catalog/live';
import { fetchLiveCollectionProductGroups } from '@/lib/collection/live';
import MaintenanceState from './MaintenanceState';
import ServiceBanner from './ServiceBanner';

function subscribeNetwork(notify: () => void) {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => { window.removeEventListener('online', notify); window.removeEventListener('offline', notify); };
}

export default function StorefrontGate({ children }: { children: React.ReactNode }) {
  const { loading, unavailable } = useSiteContent();
  const { reportDataError } = useServiceStatus();
  const online = useSyncExternalStore(subscribeNetwork, () => navigator.onLine, () => true);

  // A failed content fetch (after the cap) means we are on bundled defaults —
  // flag degraded so the banner shows, but stay interactive.
  useEffect(() => { if (unavailable) reportDataError(); }, [unavailable, reportDataError]);

  // Warm shared data caches in the background. Navbar/page text are gated only
  // on content (above); products/heroes/looks refresh after first paint.
  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      fetchLiveProducts(),
      fetchLiveHeroes(),
      fetchLiveStores(),
      fetchLiveLooks(),
      fetchLiveCollectionProductGroups(),
    ]).then((results) => {
      if (!mounted) return;
      const allEmpty = results.every((r) => r.status === 'fulfilled' && (r.value === null || (Array.isArray(r.value) && r.value.length === 0)));
      if (allEmpty) reportDataError();
    });
    return () => { mounted = false; };
  }, [reportDataError]);

  // Maintenance only when offline. The loader masks the content swap (no text
  // flash) and lifts as soon as content is ready (capped <2s; ~instant on repeat
  // loads via sessionStorage).
  if (!online) return <MaintenanceState compact />;
  return (
    <>
      {loading && (
        <div className="storefront-loader" role="status" aria-live="polite">
          <div className="storefront-loader__mark"><span>PRABA</span><small>LEATHER BALI</small></div>
          <span className="storefront-loader__bar" />
          <p>Preparing the collection…</p>
        </div>
      )}
      <div className="storefront-reveal">
        <ServiceBanner />
        {children}
      </div>
    </>
  );
}
