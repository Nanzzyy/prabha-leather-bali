'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';
import { fetchLiveStores } from '@/lib/catalog/live';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import { useServiceStatus } from '@/lib/service/ServiceStatusContext';
import { extractGoogleMapsEmbedQuery, getGoogleMapsEmbedSrc, getGoogleMapsHref, isGoogleMapsUrl } from '@/lib/maps';

export type Store = {
  name: string;
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
  hours: string;
  mapQuery: string;
};

interface Props {
  stores: Store[];
}

export default function ContactClient({ stores: initialStores }: Props) {
  const { content } = useSiteContent();
  const labels = content.contact.labels;
  const waHref = `https://wa.me/${content.contact.whatsappNumber}?text=${encodeURIComponent(content.contact.whatsappMessage)}`;
  const [live, setLive] = useState<Store[] | null>(null);
  const { reportDataError } = useServiceStatus();
  useEffect(() => {
    fetchLiveStores()
      .then((s) => { if (s && s.length) setLive(s); else if (!initialStores.length) reportDataError(); })
      .catch(() => { if (!initialStores.length) reportDataError(); });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  // Dedupe by name in case the build-time + live sources overlap; keep first.
  const stores = (live ?? initialStores).filter((s, i, arr) => arr.findIndex((x) => x.name === s.name) === i);
  const [active, setActive] = useState(0);
  const store = stores[active];
  const mapInput = store.mapQuery.trim();
  const fallbackMapQuery = store.address.trim() || store.name;
  const [resolvedMap, setResolvedMap] = useState<{ input: string; query: string } | null>(null);
  const localMapQuery = isGoogleMapsUrl(mapInput) ? extractGoogleMapsEmbedQuery(mapInput) : null;

  useEffect(() => {
    let cancelled = false;
    if (!isGoogleMapsUrl(mapInput)) return () => { cancelled = true; };

    const normalizedMapInput = mapInput.toLowerCase();
    if (!normalizedMapInput.includes('maps.app.goo.gl') && !normalizedMapInput.includes('goo.gl/maps')) return () => { cancelled = true; };

    fetch(`/api/maps/resolve?url=${encodeURIComponent(mapInput)}`)
      .then((response) => response.ok ? response.json() as Promise<{ query?: string }> : null)
      .then((result) => {
        if (!cancelled && result?.query) setResolvedMap({ input: mapInput, query: result.query });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [mapInput]);

  const mapHref = getGoogleMapsHref(mapInput, fallbackMapQuery);
  const embedQuery = resolvedMap?.input === mapInput ? resolvedMap.query : (localMapQuery || fallbackMapQuery);
  const embedSrc = getGoogleMapsEmbedSrc(embedQuery);

  return (
    <section className="contact-layout">
      <div className="contact-cards">
        {stores.map((s, i) => (
          <button
            key={`${s.name}-${i}`}
            type="button"
            className={`contact-card contact-card--button ${i === active ? 'contact-card--featured' : ''}`}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            <h3>{s.name}</h3>
            <dl>
              <div className="contact-card__row">
                <dt><span className="material-symbols-outlined" aria-hidden>place</span> {labels.address}</dt>
                <dd>{s.address}</dd>
              </div>
              <div className="contact-card__row">
                <dt><span className="material-symbols-outlined" aria-hidden>call</span> {labels.phone}</dt>
                <dd><a href={`tel:${s.phoneHref}`} onClick={(e) => e.stopPropagation()}>{s.phone}</a></dd>
              </div>
              <div className="contact-card__row">
                <dt><span className="material-symbols-outlined" aria-hidden>mail</span> {labels.email}</dt>
                <dd><a href={`mailto:${s.email}`} onClick={(e) => e.stopPropagation()}>{s.email}</a></dd>
              </div>
              <div className="contact-card__row">
                <dt><span className="material-symbols-outlined" aria-hidden>schedule</span> {labels.hours}</dt>
                <dd>{s.hours}</dd>
              </div>
            </dl>
            <span className="contact-card__hint">{i === active ? labels.showingOnMap : labels.showOnMap} <Icon>arrow_forward</Icon></span>
          </button>
        ))}
        <a className="contact-whatsapp" href={waHref} target="_blank" rel="noopener noreferrer">
          <Icon>chat</Icon> {labels.whatsapp}
        </a>
      </div>

      <div className="contact-map">
        <div className="contact-map__label">
          <span className="eyebrow">{labels.selectedAtelier}</span>
          <a href={mapHref} target="_blank" rel="noopener noreferrer">{store.name} <Icon>open_in_new</Icon></a>
        </div>
        <iframe
          key={store.mapQuery}
          title={`${store.name} — map`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
