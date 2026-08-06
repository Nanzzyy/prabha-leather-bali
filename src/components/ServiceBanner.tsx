'use client';

import Icon from './Icon';
import { useLang } from '@/lib/i18n/LangContext';
import { useServiceStatus } from '@/lib/service/ServiceStatusContext';

// Non-blocking notice shown when live data reads failed but the page still
// rendered from build-time/fallback data. Lets visitors know they may be seeing
// a stale version rather than a broken page.
export default function ServiceBanner() {
  const { lang } = useLang();
  const { degraded } = useServiceStatus();
  if (!degraded) return null;
  const text = lang === 'id'
    ? 'Sementara menampilkan versi tersimpan — koneksi terbatas.'
    : 'Showing the last saved version — connection is limited.';
  return <div className="service-banner" role="status" aria-live="polite"><Icon>wifi_off</Icon><span>{text}</span></div>;
}
