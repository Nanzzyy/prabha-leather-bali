import { supabaseUrl } from '@/lib/supabase-config';

export type SupabaseImagePreset = {
  width: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
};

const PUBLIC_OBJECT_PATH = '/storage/v1/object/public/';

/**
 * Convert a public Supabase Storage object URL into a cached, resized WebP
 * delivery URL. Non-Supabase and local assets are returned unchanged.
 *
 * Database rows continue to store the original public URL. This keeps the CMS
 * and existing records backwards-compatible while reducing delivery bytes at
 * the point where the display size is known.
 */
export function getSupabaseImageUrl(source: string, preset: SupabaseImagePreset): string;
export function getSupabaseImageUrl(source: undefined, preset: SupabaseImagePreset): undefined;
export function getSupabaseImageUrl(source: string | undefined, preset: SupabaseImagePreset): string | undefined;
export function getSupabaseImageUrl(source: string | undefined, preset: SupabaseImagePreset): string | undefined {
  if (!source) return source;

  let sourceUrl: URL;
  let projectUrl: URL;
  try {
    sourceUrl = new URL(source);
    projectUrl = new URL(supabaseUrl);
  } catch {
    return source;
  }

  const objectIndex = sourceUrl.pathname.indexOf(PUBLIC_OBJECT_PATH);
  if (sourceUrl.hostname !== projectUrl.hostname || objectIndex === -1) return source;

  const objectPath = sourceUrl.pathname.slice(objectIndex + PUBLIC_OBJECT_PATH.length);
  if (!objectPath) return source;

  const transformed = new URL(`${sourceUrl.origin}/storage/v1/render/image/public/${objectPath}`);
  transformed.searchParams.set('width', String(Math.max(1, Math.round(preset.width))));
  if (preset.height) transformed.searchParams.set('height', String(Math.max(1, Math.round(preset.height))));
  if (preset.resize && preset.height) transformed.searchParams.set('resize', preset.resize);
  transformed.searchParams.set('quality', String(Math.min(100, Math.max(20, Math.round(preset.quality ?? 75)))));
  transformed.searchParams.set('format', 'webp');
  return transformed.toString();
}
