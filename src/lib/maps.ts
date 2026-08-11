const GOOGLE_MAPS_HOSTS = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'google.com',
  'www.google.com',
  'maps.google.com',
]);

function parseUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:') return null;
    if (!GOOGLE_MAPS_HOSTS.has(url.hostname)) return null;
    if (url.hostname === 'goo.gl' && !url.pathname.startsWith('/maps')) return null;
    if ((url.hostname === 'google.com' || url.hostname === 'www.google.com') && !url.pathname.startsWith('/maps')) return null;
    return url;
  } catch {
    return null;
  }
}

export function isGoogleMapsUrl(value: string): boolean {
  return Boolean(parseUrl(value));
}

/** Keep a pasted Maps share link intact so mobile users open the exact place. */
export function getGoogleMapsHref(value: string, fallbackQuery: string): string {
  const direct = parseUrl(value);
  if (direct) return direct.toString();
  const query = value.trim() || fallbackQuery.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Build the no-key Google Maps embed URL from text or resolved coordinates. */
export function getGoogleMapsEmbedSrc(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

/** Extract an embed-safe coordinate/place query from a full Maps URL. */
export function extractGoogleMapsEmbedQuery(value: string): string | null {
  const url = parseUrl(value);
  if (!url) return null;

  const raw = url.toString();
  const atCoordinates = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atCoordinates) return `${atCoordinates[1]},${atCoordinates[2]}`;

  const placeCoordinates = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (placeCoordinates) return `${placeCoordinates[1]},${placeCoordinates[2]}`;

  const query = url.searchParams.get('query');
  if (query) return query;

  const place = url.pathname.match(/\/maps\/place\/([^/]+)/)?.[1];
  return place ? decodeURIComponent(place).replace(/\+/g, ' ') : null;
}
