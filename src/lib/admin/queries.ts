import { adminSupabase, STORAGE_BUCKET } from '@/lib/supabase-admin';
import type { ContentSection, SiteContent } from '@/lib/content/defaults';

// Single seam for all CMS read/write logic. Every function assumes an admin
// session is present — RLS enforces it; non-admins get PostgrestError, not data.

export type StockStatus = 'available' | 'preorder' | 'out_of_stock';
export const STOCK_STATUSES: StockStatus[] = ['available', 'preorder', 'out_of_stock'];

export interface AdminCategory { id: string; name: string; slug: string; }

export interface AdminCollectionProductGroup {
  category_id: string;
  subcategory_slug: string;
  product_id: string;
  display_order: number;
}

export interface AdminVariant {
  id?: string;
  sku: string;
  color_name: string;
  color_hex?: string | null;
  size_eu?: string | null;
  image_url?: string | null;
  stock_status: StockStatus;
}

export interface AdminImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  leather_type: string;
  base_price_usd: number;
  is_featured: boolean;
  created_at: string;
  category_id: string | null;
  category_slug: string | null;
  images: AdminImage[];
  variants: AdminVariant[];
}

export interface ProductInput {
  id?: string;
  title: string;
  slug: string;
  description: string;
  leather_type: string;
  base_price_usd: number;
  is_featured: boolean;
  category_id: string | null;
  variants: AdminVariant[];
  images: AdminImage[];
}

function requireClient() {
  if (!adminSupabase) throw new Error('Supabase env missing (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).');
  return adminSupabase;
}

function mapProduct(row: any): AdminProduct {
  const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? '',
    leather_type: row.leather_type ?? 'Full-Grain Cowhide',
    base_price_usd: Number(row.base_price_usd ?? 0),
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at,
    category_id: cat?.id ?? null,
    category_slug: cat?.slug ?? null,
    images: (row.product_images ?? [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((i: any) => ({ id: i.id, image_url: i.image_url, is_primary: i.is_primary, display_order: i.display_order })),
    variants: (row.product_variants ?? []).map((v: any) => ({
      id: v.id, sku: v.sku, color_name: v.color_name, color_hex: v.color_hex ?? null,
      size_eu: v.size_eu ?? null, image_url: v.image_url ?? null, stock_status: v.stock_status,
    })),
  };
}

const PRODUCT_SELECT = `
  id, title, slug, description, leather_type, base_price_usd, is_featured, created_at,
  categories!products_category_id_fkey ( id, name, slug ),
  product_images ( id, image_url, is_primary, display_order ),
  product_variants ( id, sku, color_name, color_hex, size_eu, image_url, stock_status )
`;

export async function listCategories(): Promise<AdminCategory[]> {
  const sb = requireClient();
  const { data, error } = await sb.from('categories').select('id, name, slug').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function categoryProductCounts(): Promise<Record<string, number>> {
  const sb = requireClient();
  const { data, error } = await sb.from('products').select('category_id');
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  return counts;
}

export async function listProducts(): Promise<AdminProduct[]> {
  const sb = requireClient();
  const { data, error } = await sb.from('products').select(PRODUCT_SELECT).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getProductById(id: string): Promise<AdminProduct | null> {
  const sb = requireClient();
  const { data, error } = await sb.from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function saveProduct(input: ProductInput): Promise<string> {
  const sb = requireClient();
  const row = {
    title: input.title.trim(),
    slug: input.slug.trim(),
    description: input.description.trim(),
    leather_type: input.leather_type.trim() || 'Full-Grain Cowhide',
    base_price_usd: Number(input.base_price_usd) || 0,
    is_featured: input.is_featured,
    category_id: input.category_id,
  };

  let id: string;
  if (input.id) {
    id = input.id;
    const { error } = await sb.from('products').update(row).eq('id', id);
    if (error) throw error;
  } else {
    const { data, error } = await sb.from('products').insert(row).select('id').single();
    if (error) throw error;
    id = data!.id;
  }

  // Replace variants and images wholesale. Image files in Storage are only
  // removed when the user explicitly deletes one in the UI (deleteImage), so
  // re-inserting rows here does not orphan or delete stored files.
  await sb.from('product_variants').delete().eq('product_id', id);
  if (input.variants.length) {
    const variants = input.variants.map((v) => ({
      product_id: id, sku: v.sku.trim(), color_name: v.color_name.trim() || 'Default',
      color_hex: v.color_hex || null, size_eu: v.size_eu || null, image_url: v.image_url || null, stock_status: v.stock_status,
    }));
    const { error } = await sb.from('product_variants').insert(variants);
    if (error) throw error;
  }

  await sb.from('product_images').delete().eq('product_id', id);
  if (input.images.length) {
    const images = input.images.map((img, idx) => ({
      product_id: id, image_url: img.image_url, is_primary: idx === 0 ? true : !!img.is_primary,
      display_order: idx,
    }));
    const { error } = await sb.from('product_images').insert(images);
    if (error) throw error;
  }

  return id;
}

export async function deleteProduct(id: string): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function createCategory(name: string, slug: string): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('categories').insert({ name: name.trim(), slug: slug.trim() });
  if (error) throw error;
}

export async function updateCategory(id: string, name: string, slug: string): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('categories').update({ name: name.trim(), slug: slug.trim() }).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// --- Collection product grouping -----------------------------------------

export async function listCollectionProductGroups(): Promise<AdminCollectionProductGroup[]> {
  const sb = requireClient();
  const { data, error } = await sb
    .from('collection_product_groups')
    .select('category_id, subcategory_slug, product_id, display_order')
    .order('display_order');
  if (error) throw error;
  return data ?? [];
}

export async function saveCollectionProductGroup(categoryId: string, subcategorySlug: string, productIds: string[]): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.rpc('replace_collection_product_group', {
    p_category_id: categoryId,
    p_subcategory_slug: subcategorySlug,
    p_product_ids: productIds,
  });
  if (error) throw error;
}

// --- Site content ---------------------------------------------------------

export interface AdminSiteContent { id: string; locale: 'en' | 'id'; section: ContentSection; content: Partial<SiteContent[ContentSection]>; updated_at: string; }

export async function listSiteContent(locale?: 'en' | 'id'): Promise<AdminSiteContent[]> {
  const sb = requireClient();
  let query = sb.from('site_content').select('id, locale, section, content, updated_at').order('section');
  if (locale) query = query.eq('locale', locale);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminSiteContent[];
}

export async function saveSiteContent(locale: 'en' | 'id', section: ContentSection, content: SiteContent[ContentSection]): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('site_content').upsert({ locale, section, content }, { onConflict: 'locale,section' });
  if (error) throw error;
}

/** Keep visual branding shared across languages without overwriting translated copy. */
export async function syncGlobalBrand(brand: SiteContent['global']['brand']): Promise<void> {
  const sb = requireClient();
  const { data, error } = await sb
    .from('site_content')
    .select('locale, content')
    .eq('section', 'global')
    .in('locale', ['en', 'id']);
  if (error) throw error;

  const rows = (['en', 'id'] as const).map((locale) => {
    const existing = data?.find((row) => row.locale === locale)?.content;
    const content = existing && typeof existing === 'object' && !Array.isArray(existing)
      ? existing as Record<string, unknown>
      : {};
    return { locale, section: 'global', content: { ...content, brand } };
  });
  const { error: saveError } = await sb.from('site_content').upsert(rows, { onConflict: 'locale,section' });
  if (saveError) throw saveError;
}

export interface AdminContentSafeVersion { locale: 'en' | 'id'; content: SiteContent; updated_at: string; }

export async function getContentSafeVersion(locale: 'en' | 'id'): Promise<AdminContentSafeVersion | null> {
  const sb = requireClient();
  const { data, error } = await sb
    .from('site_content_safe_versions')
    .select('locale, content, updated_at')
    .eq('locale', locale)
    .maybeSingle();
  if (error) throw error;
  return data as AdminContentSafeVersion | null;
}

export async function saveContentSafeVersion(locale: 'en' | 'id', content: SiteContent): Promise<void> {
  const sb = requireClient();
  const { error } = await sb
    .from('site_content_safe_versions')
    .upsert({ locale, content, updated_at: new Date().toISOString() }, { onConflict: 'locale' });
  if (error) throw error;
}

export async function restoreContentSafeVersion(locale: 'en' | 'id'): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.rpc('restore_site_content_safe_version', { p_locale: locale });
  if (error) throw error;
}

// --- Safe-version history (multi-snapshot) --------------------------------

export interface AdminContentSnapshot { id: string; locale: 'en' | 'id'; label: string; created_at: string; }

export async function listContentSnapshots(locale: 'en' | 'id'): Promise<AdminContentSnapshot[]> {
  const sb = requireClient();
  const { data, error } = await sb
    .from('site_content_snapshots')
    .select('id, locale, label, created_at')
    .eq('locale', locale)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminContentSnapshot[];
}

export async function saveContentSnapshot(locale: 'en' | 'id', content: SiteContent, label = ''): Promise<AdminContentSnapshot> {
  const sb = requireClient();
  const { data, error } = await sb
    .from('site_content_snapshots')
    .insert({ locale, content, label: label.trim() })
    .select('id, locale, label, created_at')
    .single();
  if (error) throw error;
  return data as AdminContentSnapshot;
}

export async function restoreContentSnapshot(id: string): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.rpc('restore_site_content_snapshot', { p_id: id });
  if (error) throw error;
}

export async function deleteContentSnapshot(id: string): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('site_content_snapshots').delete().eq('id', id);
  if (error) throw error;
}

// --- Storage ---------------------------------------------------------------

export async function uploadImage(file: File, folder = 'products'): Promise<AdminImage> {
  const sb = requireClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(STORAGE_BUCKET).upload(path, file, {
    contentType: file.type || `image/${ext}`,
    upsert: false,
  });
  if (error) throw error;
  const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { image_url: data.publicUrl, is_primary: false, display_order: 0 };
}

export async function deleteImageByUrl(url: string): Promise<void> {
  const sb = requireClient();
  // ponytail: derives the storage object path from the public URL; breaks only
  // if Supabase changes the /object/public/<bucket>/ URL contract.
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await sb.storage.from(STORAGE_BUCKET).remove([path]);
}

// --- Auth ------------------------------------------------------------------

export async function signIn(email: string, password: string) {
  const sb = requireClient();
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signOut() {
  if (!adminSupabase) return;
  await adminSupabase.auth.signOut();
}

// --- Heroes ---------------------------------------------------------------

export interface AdminHero { id: string; image_url: string; alt_text: string; caption: string; display_order: number; is_active: boolean; }

export async function listHeroes(): Promise<AdminHero[]> {
  const sb = requireClient();
  const { data, error } = await sb.from('hero_images').select('*').order('display_order');
  if (error) throw error;
  return data ?? [];
}

export async function addHero(image_url: string, alt_text = 'Editorial view of handcrafted leather', caption = ''): Promise<void> {
  const sb = requireClient();
  const { data: existing } = await sb.from('hero_images').select('id');
  const { error } = await sb.from('hero_images').insert({ image_url, alt_text, caption, display_order: (existing?.length ?? 0), is_active: true });
  if (error) throw error;
}

export async function updateHero(id: string, patch: Partial<Pick<AdminHero, 'display_order' | 'is_active' | 'alt_text' | 'caption'>>): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('hero_images').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteHero(id: string): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('hero_images').delete().eq('id', id);
  if (error) throw error;
}

// --- Stores ---------------------------------------------------------------

export interface AdminStore {
  id: string; name: string; address: string; phone: string; phone_href: string;
  email: string; hours: string; map_query: string; display_order: number; is_active: boolean;
}
export type StoreInput = Omit<AdminStore, 'id'>;

export async function listStores(): Promise<AdminStore[]> {
  const sb = requireClient();
  const { data, error } = await sb.from('stores').select('*').order('display_order');
  if (error) throw error;
  return data ?? [];
}

export async function saveStore(input: Partial<StoreInput> & { id?: string }): Promise<string> {
  const sb = requireClient();
  const row = {
    name: input.name?.trim() || 'Untitled',
    address: input.address ?? '', phone: input.phone ?? '', phone_href: input.phone_href ?? '',
    email: input.email ?? '', hours: input.hours ?? '', map_query: input.map_query ?? '',
    is_active: input.is_active ?? true, display_order: input.display_order ?? 0,
  };
  if (input.id) {
    const { error } = await sb.from('stores').update(row).eq('id', input.id);
    if (error) throw error;
    return input.id;
  }
  const { data: existing } = await sb.from('stores').select('id');
  const { data, error } = await sb.from('stores').insert({ ...row, display_order: input.display_order ?? (existing?.length ?? 0) }).select('id').single();
  if (error) throw error;
  return data!.id;
}

export async function deleteStore(id: string): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('stores').delete().eq('id', id);
  if (error) throw error;
}

// --- Looks (+ spots) ------------------------------------------------------

export interface AdminLookSpot { id?: string; product_id: string | null; product_title?: string; x: number; y: number; image_index: number; }
export interface AdminLook { id: string; title: string; image_url: string; image_url_2: string | null; display_order: number; is_active: boolean; spots: AdminLookSpot[]; }
export interface LookInput { id?: string; title: string; image_url: string; image_url_2?: string | null; is_active: boolean; display_order: number; spots: AdminLookSpot[]; }

export async function listLooks(): Promise<AdminLook[]> {
  const sb = requireClient();
  const { data, error } = await sb.from('looks')
    .select('id, title, image_url, image_url_2, display_order, is_active, look_spots(id, product_id, x, y, image_index, display_order, products(title))')
    .order('display_order');
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id, title: row.title, image_url: row.image_url, image_url_2: row.image_url_2 ?? null,
    display_order: row.display_order, is_active: row.is_active,
    spots: (row.look_spots ?? [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((s: any) => ({ id: s.id, product_id: s.product_id, product_title: s.products?.title ?? null, x: Number(s.x), y: Number(s.y), image_index: Number(s.image_index ?? 0) })),
  }));
}

export async function saveLook(input: LookInput): Promise<string> {
  const sb = requireClient();
  const row = { title: input.title.trim() || 'Untitled look', image_url: input.image_url, image_url_2: input.image_url_2 || null, is_active: input.is_active, display_order: input.display_order };
  let id: string;
  if (input.id) {
    id = input.id;
    const { error } = await sb.from('looks').update(row).eq('id', id);
    if (error) throw error;
  } else {
    const { data, error } = await sb.from('looks').insert(row).select('id').single();
    if (error) throw error;
    id = data!.id;
  }
  const { error: deleteSpotsError } = await sb.from('look_spots').delete().eq('look_id', id);
  if (deleteSpotsError) throw deleteSpotsError;
  if (input.spots.length) {
    const spots = input.spots
      .filter((s) => s.product_id)
      .map((s, idx) => ({ look_id: id, product_id: s.product_id, x: s.x, y: s.y, image_index: s.image_index === 1 ? 1 : 0, display_order: idx }));
    if (spots.length) {
      const { error } = await sb.from('look_spots').insert(spots);
      if (error) throw error;
    }
  }
  return id;
}

export async function deleteLook(id: string): Promise<void> {
  const sb = requireClient();
  const { error } = await sb.from('looks').delete().eq('id', id);
  if (error) throw error;
}
