// Wrangler generates all configured bindings in worker-configuration.d.ts.
// Deployed secrets are intentionally absent from configuration and are merged
// here so they remain type checked without being committed.
interface WorkerEnv extends Cloudflare.Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const ALLOWED_FOLDERS = new Set(['products', 'content', 'looks', 'heroes']);
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

function origins(env: WorkerEnv) {
  return new Set(env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean));
}

function corsHeaders(request: Request, env: WorkerEnv) {
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

function json(request: Request, env: WorkerEnv, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request, env) },
  });
}

function bearer(request: Request) {
  const value = request.headers.get('Authorization') || '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

async function authenticatedAdminId(request: Request, env: WorkerEnv) {
  const token = bearer(request);
  if (!token) return null;
  const base = env.SUPABASE_URL.replace(/\/$/, '');
  const user = await fetch(`${base}/auth/v1/user`, { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  if (!user.ok) return null;
  const userData = await user.json<{ id?: string }>();
  if (!userData.id) return null;
  const adminCheck = await fetch(`${base}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  return adminCheck.ok && (await adminCheck.json()) === true ? userData.id : null;
}

function safePath(value: string) {
  const path = value.replace(/^\/+/, '');
  const [folder, filename, ...rest] = path.split('/');
  if (!folder || !filename || rest.length || !ALLOWED_FOLDERS.has(folder)) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(filename) || filename.startsWith('.')) return null;
  return `${folder}/${filename}`;
}

function hasImageSignature(bytes: Uint8Array, contentType: string) {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (contentType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === 'image/png') return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (contentType === 'image/webp') return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
  if (contentType === 'image/gif') return ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a';
  if (contentType === 'image/avif') return ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12));
  return false;
}

async function readValidatedImage(request: Request, contentType: string) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > MAX_UPLOAD_BYTES) throw new RangeError('Image is too large');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (bytesRead === 0) return null;

  const image = new Uint8Array(bytesRead);
  let offset = 0;
  for (const chunk of chunks) {
    image.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return hasImageSignature(image.subarray(0, 12), contentType) ? image.buffer : null;
}

const worker = {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const requestId = crypto.randomUUID();
    let stage = 'route';
    try {
      if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request, env) });
      const url = new URL(request.url);
      if (url.pathname !== '/upload' && url.pathname !== '/delete') return json(request, env, { error: 'Not found' }, 404);
      if (!origins(env).has(request.headers.get('Origin') || '')) return json(request, env, { error: 'Origin not allowed' }, 403);
      stage = 'supabase-auth';
      const adminId = await authenticatedAdminId(request, env);
      if (!adminId) return json(request, env, { error: 'Admin authentication required' }, 401);
      stage = 'rate-limit';
      const { success } = await env.UPLOAD_RATE_LIMITER.limit({ key: `${adminId}:${url.pathname}` });
      if (!success) return json(request, env, { error: 'Too many upload requests. Try again shortly.' }, 429);

      if (url.pathname === '/upload') {
        stage = 'read-upload';
        const path = safePath(request.headers.get('X-R2-Path') || '');
        const contentType = (request.headers.get('Content-Type') || 'application/octet-stream').split(';', 1)[0].trim().toLowerCase();
        const length = Number(request.headers.get('Content-Length') || 0);
        if (!path) return json(request, env, { error: 'Invalid R2 path' }, 400);
        if (!ALLOWED_IMAGE_TYPES.has(contentType)) return json(request, env, { error: 'Unsupported image format' }, 415);
        if (length > MAX_UPLOAD_BYTES) return json(request, env, { error: 'Image is too large' }, 413);
        let body: ArrayBuffer | null;
        try {
          body = await readValidatedImage(request, contentType);
          if (!body) return json(request, env, { error: 'File signature does not match the declared image type' }, 415);
          stage = 'r2-put';
          await env.R2_BUCKET.put(path, body, { httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' } });
        } catch (error) {
          if (error instanceof RangeError) return json(request, env, { error: 'Image is too large' }, 413);
          throw error;
        }
        return json(request, env, { image_url: `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${path}` });
      }

      stage = 'delete';
      const payload = await request.json().catch(() => null) as { path?: string } | null;
      const path = safePath(payload?.path || '');
      if (!path) return json(request, env, { error: 'Invalid R2 path' }, 400);
      await env.R2_BUCKET.delete(path);
      return json(request, env, { ok: true });
    } catch (error) {
      console.error('r2_upload_request_failed', {
        request_id: requestId,
        stage,
        error: error instanceof Error ? error.message : String(error),
        path: new URL(request.url).pathname,
      });
      return json(request, env, { error: 'Upload service temporarily unavailable', request_id: requestId, stage }, 500);
    }
  },
} satisfies ExportedHandler<WorkerEnv>;

export default worker;
