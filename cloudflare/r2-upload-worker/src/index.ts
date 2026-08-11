interface R2BucketLike {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }): Promise<unknown>;
  delete(key: string): Promise<void>;
}

interface Env {
  R2_BUCKET: R2BucketLike;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  R2_PUBLIC_BASE_URL: string;
  ALLOWED_ORIGINS: string;
}

const ALLOWED_FOLDERS = new Set(['products', 'content', 'looks', 'heroes']);
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

function origins(env: Env) {
  return new Set(env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean));
}

function corsHeaders(request: Request, env: Env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = origins(env);
  return {
    'Access-Control-Allow-Origin': allowed.has(origin) ? origin : [...allowed][0] || '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-R2-Path',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(request: Request, env: Env, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request, env) },
  });
}

function bearer(request: Request) {
  const value = request.headers.get('Authorization') || '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

async function isAdmin(request: Request, env: Env) {
  const token = bearer(request);
  if (!token) return false;
  const base = env.SUPABASE_URL.replace(/\/$/, '');
  const user = await fetch(`${base}/auth/v1/user`, { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  if (!user.ok) return false;
  const adminCheck = await fetch(`${base}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  return adminCheck.ok && (await adminCheck.json()) === true;
}

function safePath(value: string) {
  const path = value.replace(/^\/+/, '');
  const [folder, filename, ...rest] = path.split('/');
  if (!folder || !filename || rest.length || !ALLOWED_FOLDERS.has(folder)) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(filename) || filename.startsWith('.')) return null;
  return `${folder}/${filename}`;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request, env) });
    const url = new URL(request.url);
    if (url.pathname !== '/upload' && url.pathname !== '/delete') return json(request, env, { error: 'Not found' }, 404);
    if (!origins(env).has(request.headers.get('Origin') || '')) return json(request, env, { error: 'Origin not allowed' }, 403);
    if (!(await isAdmin(request, env))) return json(request, env, { error: 'Admin authentication required' }, 401);

    if (url.pathname === '/upload') {
      const path = safePath(request.headers.get('X-R2-Path') || '');
      const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
      const length = Number(request.headers.get('Content-Length') || 0);
      if (!path) return json(request, env, { error: 'Invalid R2 path' }, 400);
      if (!contentType.startsWith('image/')) return json(request, env, { error: 'Only image uploads are allowed' }, 415);
      if (length > MAX_UPLOAD_BYTES) return json(request, env, { error: 'Image is too large' }, 413);
      const body = await request.arrayBuffer();
      if (!body.byteLength || body.byteLength > MAX_UPLOAD_BYTES) return json(request, env, { error: 'Image is too large or empty' }, 413);
      await env.R2_BUCKET.put(path, body, { httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' } });
      return json(request, env, { image_url: `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${path}` });
    }

    const payload = await request.json().catch(() => null) as { path?: string } | null;
    const path = safePath(payload?.path || '');
    if (!path) return json(request, env, { error: 'Invalid R2 path' }, 400);
    await env.R2_BUCKET.delete(path);
    return json(request, env, { ok: true });
  },
};

export default worker;
