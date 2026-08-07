import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fqygslqmhdiqypubdxkz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeWdzbHFtaGRpcXlwdWJkeGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NzQ1NDgsImV4cCI6MjEwMTQ1MDU0OH0.H3yfKJAWhY_ViOJTHO6kr7JTMI9N6SLK7hbjki-qXiU';

/**
 * Public Supabase client used for build-time catalog reads.
 * Never place a service-role key in NEXT_PUBLIC_* variables.
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
