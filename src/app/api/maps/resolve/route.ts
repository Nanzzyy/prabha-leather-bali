import { NextRequest, NextResponse } from 'next/server';
import { extractGoogleMapsEmbedQuery, isGoogleMapsUrl } from '@/lib/maps';

export const dynamic = 'force-dynamic';

async function resolveRedirects(input: string): Promise<string | null> {
  let current = input;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(current, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'user-agent': 'PrabaLeatherMapsResolver/1.0' },
        cache: 'no-store',
      });

      if (response.status < 300 || response.status >= 400) return current;
      const location = response.headers.get('location');
      if (!location) return null;
      const next = new URL(location, current).toString();
      if (!isGoogleMapsUrl(next)) return null;
      current = next;
    }
    return current;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url')?.trim() || '';
  if (!isGoogleMapsUrl(raw)) return NextResponse.json({ error: 'Invalid Google Maps URL.' }, { status: 400 });

  const resolved = await resolveRedirects(raw);
  const query = resolved ? extractGoogleMapsEmbedQuery(resolved) : null;
  if (!query) return NextResponse.json({ error: 'The Maps link did not contain a place or coordinates.' }, { status: 422 });

  return NextResponse.json({ query }, { headers: { 'Cache-Control': 'private, max-age=300' } });
}
