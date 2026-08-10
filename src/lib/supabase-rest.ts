import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase-config';

/**
 * Small read-only browser client for public Supabase tables.
 * Keeping public reads on fetch avoids shipping the full supabase-js client
 * to every storefront visitor. Admin/auth code still uses supabase-js.
 */
export async function fetchSupabaseRows<T>(table: string, query: Record<string, string>): Promise<T[]> {
  const endpoint = new URL(`${supabaseUrl}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(query)) endpoint.searchParams.set(key, value);

  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`);
  return response.json() as Promise<T[]>;
}
