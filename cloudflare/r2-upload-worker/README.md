# Praba R2 upload worker

This Worker keeps R2 credentials off the static Hostinger frontend. It accepts
uploads only from an authenticated Supabase admin session and writes objects to
the `praba-leather-asset` R2 bucket. Uploads are capped at 12 MB, buffered only
within that bound for R2 compatibility, validated by file signature, and
limited per admin account.

## Deploy

Install dependencies and log in to the Cloudflare account that owns the bucket:

```bash
cd cloudflare/r2-upload-worker
npm install
npx wrangler login
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npm run deploy
```

The Worker must be deployed in the same Cloudflare account as the R2 bucket so
the `R2_BUCKET` binding works. Copy the deployed URL into the storefront build
environment:

```env
NEXT_PUBLIC_R2_UPLOAD_URL=https://praba-r2-upload.assetpraba.workers.dev
NEXT_PUBLIC_R2_PUBLIC_BASE_URL=https://assetpraba.prvtech.site
```

Then rebuild and deploy the Next.js application. Do not put R2 access
keys in `.env`, `NEXT_PUBLIC_*`, or browser code.
