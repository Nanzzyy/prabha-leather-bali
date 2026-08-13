import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase-config';

// Browser Supabase client for the CMS. Uses ONLY the public anon key + Supabase
// Auth sessions. Writes succeed because RLS policies (supabase/admin.sql) gate
// them to the signed-in admin. The privileged role key is NEVER referenced here.
export const adminSupabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = 'product-images';
