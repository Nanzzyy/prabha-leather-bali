# Praba R2 upload worker

This Worker keeps R2 credentials off the static Hostinger frontend. It accepts
uploads only from an authenticated Supabase admin session and writes objects to
the `praba-leather-asset` R2 bucket.

## Deploy

Install Wrangler and log in to the Cloudflare account that owns the bucket:

```bash
npm install -g wrangler
wrangler login
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler deploy
```

The Worker must be deployed in the same Cloudflare account as the R2 bucket so
the `R2_BUCKET` binding works. Copy the deployed URL into the storefront build
environment:

```env
NEXT_PUBLIC_R2_UPLOAD_URL=https://praba-r2-upload.<your-subdomain>.workers.dev
NEXT_PUBLIC_R2_PUBLIC_BASE_URL=https://assetpraba.prvtech.site
```

Then rebuild and re-upload the static export to Hostinger. Do not put R2 access
keys in `.env`, `NEXT_PUBLIC_*`, or browser code.
