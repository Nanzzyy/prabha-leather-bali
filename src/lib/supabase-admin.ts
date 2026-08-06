import { createClient } from '@supabase/supabase-js';

// Browser Supabase client for the CMS. Uses ONLY the public anon key + Supabase
// Auth sessions. Writes succeed because RLS policies (supabase/admin.sql) gate
// them to the signed-in admin. The privileged role key is NEVER referenced here.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const adminSupabase = url && anonKey
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const STORAGE_BUCKET = 'product-images';
