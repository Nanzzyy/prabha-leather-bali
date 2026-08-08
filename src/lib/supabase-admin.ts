import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase-config';

// Browser Supabase client for the CMS. Uses ONLY the public anon key + Supabase
// Auth sessions. Writes succeed because RLS policies (supabase/admin.sql) gate
// them to the signed-in admin. The privileged role key is NEVER referenced here.
const url = supabaseUrl;
const anonKey = supabaseAnonKey;

export const adminSupabase = url && anonKey
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const STORAGE_BUCKET = 'product-images';
