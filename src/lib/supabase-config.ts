const PROJECT_REF = 'fqygslqmhdiqypubdxkz';
const DEFAULT_URL = `https://${PROJECT_REF}.supabase.co`;
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeWdzbHFtaGRpcXlwdWJkeGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NzQ1NDgsImV4cCI6MjEwMTQ1MDU0OH0.H3yfKJAWhY_ViOJTHO6kr7JTMI9N6SLK7hbjki-qXiU';

function clean(value: string | undefined, variableName: string): string {
  return (value ?? '')
    .trim()
    .replace(new RegExp(`^${variableName}\\s*=\\s*`, 'i'), '')
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

function isProjectUrl(value: string): boolean {
  try {
    return new URL(value).hostname === `${PROJECT_REF}.supabase.co`;
  } catch {
    return false;
  }
}

function isProjectAnonKey(value: string): boolean {
  const payload = value.split('.')[1];
  if (!payload) return false;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const claims = JSON.parse(atob(normalized)) as { ref?: string; role?: string };
    return claims.ref === PROJECT_REF && claims.role === 'anon';
  } catch {
    return false;
  }
}

const configuredUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
const configuredKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Vercel values can be pasted with quotes, a KEY= prefix, or from another
// Supabase project. Keep both browser clients on the same verified project.
export const supabaseUrl = isProjectUrl(configuredUrl) ? configuredUrl : DEFAULT_URL;
export const supabaseAnonKey = isProjectAnonKey(configuredKey) ? configuredKey : DEFAULT_ANON_KEY;
