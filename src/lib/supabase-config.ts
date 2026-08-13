function clean(value: string | undefined, variableName: string): string {
  return (value ?? '')
    .trim()
    .replace(new RegExp(`^${variableName}\\s*=\\s*`, 'i'), '')
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

function requireSupabaseUrl(value: string): string {
  if (!value) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Configure it before starting or building the app.');
  }

  try {
    const url = new URL(value);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) throw new Error('invalid protocol');
    return url.toString().replace(/\/$/, '');
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL (HTTP is allowed only for local development).');
  }
}

function requireSupabaseKey(value: string): string {
  if (!value) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Configure it before starting or building the app.');
  }
  return value;
}

const configuredUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
const configuredKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Values are public by design, but configuration mistakes must fail loudly.
// Silent fallbacks can connect a production build to the wrong project.
export const supabaseUrl = requireSupabaseUrl(configuredUrl);
export const supabaseAnonKey = requireSupabaseKey(configuredKey);
