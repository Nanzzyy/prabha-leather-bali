import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase-config';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

/**
 * Public Supabase client used for build-time catalog reads.
 * Never place a service-role key in NEXT_PUBLIC_* variables.
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetchWithTimeout(input, init, 2500) },
    })
  : null;
