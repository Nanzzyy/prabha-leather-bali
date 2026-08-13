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

function projectRefFromUrl(value: string): string | null {
  try {
    const hostname = new URL(value).hostname;
    return hostname.endsWith('.supabase.co') ? hostname.slice(0, -'.supabase.co'.length) : null;
  } catch {
    return null;
  }
}

function projectRefFromJwt(value: string): string | null {
  const payload = value.split('.')[1];
  if (!payload || typeof atob !== 'function') return null;
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as { ref?: unknown };
    return typeof parsed.ref === 'string' ? parsed.ref : null;
  } catch {
    return null;
  }
}

function requireSupabaseKey(value: string, url: string): string {
  if (!value) {
    throw new Error('Missing Supabase public key. Configure NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY before starting or building the app.');
  }

  const urlRef = projectRefFromUrl(url);
  const keyRef = value.startsWith('eyJ') ? projectRefFromJwt(value) : null;
  if (urlRef && keyRef && urlRef !== keyRef) {
    throw new Error(`Supabase configuration mismatch: URL targets project "${urlRef}" but the public key belongs to "${keyRef}". Use URL and key from the same Supabase project.`);
  }

  return value;
}

const configuredUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
const configuredKey = clean(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
) || clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Values are public by design, but configuration mistakes must fail loudly.
// Silent fallbacks can connect a production build to the wrong project.
export const supabaseUrl = requireSupabaseUrl(configuredUrl);
export const supabaseAnonKey = requireSupabaseKey(configuredKey, supabaseUrl);
