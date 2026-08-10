'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import { useServiceStatus } from '@/lib/service/ServiceStatusContext';
import MaintenanceState from './MaintenanceState';
import ServiceBanner from './ServiceBanner';

function subscribeNetwork(notify: () => void) {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => { window.removeEventListener('online', notify); window.removeEventListener('offline', notify); };
}

export default function StorefrontGate({ children }: { children: React.ReactNode }) {
  const { unavailable } = useSiteContent();
  const { reportDataError } = useServiceStatus();
  const online = useSyncExternalStore(subscribeNetwork, () => navigator.onLine, () => true);

  // A failed content fetch (after the cap) means we are on bundled defaults —
  // flag degraded so the banner shows, but stay interactive.
  useEffect(() => { if (unavailable) reportDataError(); }, [unavailable, reportDataError]);

  // Maintenance only when offline. The loader masks the content swap (no text
  // flash) and lifts as soon as content is ready (capped <2s; ~instant on repeat
  // loads via sessionStorage).
  if (!online) return <MaintenanceState compact />;
  return (
    <>
      <div className="storefront-reveal">
        <ServiceBanner />
        {children}
      </div>
    </>
  );
}
