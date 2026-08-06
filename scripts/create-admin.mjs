// Bootstrap the first CMS admin user. LOCAL ONLY.
//
// Uses SUPABASE_SERVICE_ROLE_KEY (from .env.local) which bypasses RLS — therefore
// this script must never be imported by anything in src/ and never shipped to the
// browser. It runs on your machine, creates the auth user, and marks the profile
// role = 'admin' so the in-browser CMS (anon key + RLS) can write.
//
// Usage:
//   node scripts/create-admin.mjs <email> <password>
//
// Prerequisite: apply supabase/schema.sql, supabase/storage.sql, supabase/admin.sql
// in the Supabase SQL Editor first.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = { ...loadEnv('.env'), ...loadEnv('.env.local') };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const [email, password] = process.argv.slice(2);

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env / .env.local');
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters (Supabase minimum).');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  // If user already exists, fall back to listing and promoting.
  if (error.message && /already/i.test(error.message)) {
    console.log('User already exists — promoting to admin.');
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);
    if (!existing) {
      console.error('Could not locate existing user to promote.');
      process.exit(1);
    }
    const { error: upErr } = await supabase
      .from('profiles')
      .upsert({ id: existing.id, email, role: 'admin' });
    if (upErr) { console.error('Failed to promote:', upErr.message); process.exit(1); }
    console.log(`OK — ${email} is now an admin. Log in at /admin/login/`);
    process.exit(0);
  }
  console.error('createUser failed:', error.message);
  process.exit(1);
}

const { error: profileErr } = await supabase
  .from('profiles')
  .upsert({ id: data.user.id, email, role: 'admin' });

if (profileErr) {
  console.error('User created but profile upsert failed:', profileErr.message);
  process.exit(1);
}

console.log(`OK — admin created.`);
console.log(`  email: ${email}`);
console.log(`  log in at: /admin/login/`);
