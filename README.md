# Praba Leather Bali

Static, editorial product catalog for Praba Leather Bali. The storefront is designed for international buyers and sends orders directly to WhatsApp without a payment gateway.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Zustand, Supabase PostgreSQL/Auth, and Cloudflare R2.

## Local setup

Copy `.env.example` to `.env.local`, then provide the public Supabase URL and a publishable key (preferred) or legacy anon key. The URL and key must come from the same Supabase project; the build now fails with an actionable error if their project references differ. The app includes a local catalog fallback so UI work can run before the database is reachable.

Run the database scripts in Supabase SQL Editor:

```text
supabase/schema.sql
supabase/seed.sql
supabase/storage.sql
supabase/admin.sql
supabase/cms-content.sql
supabase/collection-product-groups.sql
supabase/cms-safe-version-history.sql
supabase/product-specifications.sql
supabase/variant-descriptions.sql
supabase/variant-images.sql
```

The CMS has a `Content manager` workspace at `/admin/content/` for English and Indonesian copy. It covers global navigation/footer/order pouch, homepage sections, collection cards and subcategory labels, catalog filters and product-detail labels, contact content, the full About page including images, and SEO metadata including page titles, descriptions, keywords, canonical URL, robots directives, Open Graph/Twitter images, and favicon. SEO values are rendered server-side with a 60-second revalidation window so search engines can read them from the initial HTML. Use `/admin/collection/` to assign existing categorized products to those Collection subcategories without duplicating product data. Existing Products, Categories, Heroes, Looks, and Stores editors remain available from the sidebar. The Looks editor supports one required image plus one optional image per look; hotspots can be assigned to either image.

Apply `supabase/cms-content.sql` to create the `site_content` table and add hero metadata plus the second Looks image. The script is additive and safe to run again. Until the schema is applied, the storefront uses the built-in defaults and the admin content editor will report the database error rather than silently losing changes.

Apply `supabase/collection-product-groups.sql` to enable the Collection product-assignment panel and live subcategory product groups. It adds explicit Data API grants, RLS policies, and an admin-only atomic save function. Until it is applied, the storefront uses built-in sample assignments and the admin shows a setup notice.

Apply `supabase/cms-safe-version-history.sql` to enable protected CMS snapshot history. Content Manager can save labelled versions of the currently published text, links, and image references and restore one atomically. The migration imports and removes the deprecated single-snapshot table when upgrading an existing installation.

Apply `supabase/product-specifications.sql` to add optional per-product overrides for material, leather care, and shipping panels. A `NULL` value keeps the current locale-wide Catalog default; edit the override from Products when a specific item needs custom copy.

Apply `supabase/variant-descriptions.sql` to add optional copy for each product color/size variant. The text appears after that variant is selected on the product detail page.

Start development:

```bash
npm run dev
```

Build for Hostinger Node.js Web App / Vercel:

```bash
npm run build
npm run start:standalone
```

For Hostinger's GitHub-connected Node.js Web App, use branch `main`, build
command `npm run build`, output mode `standalone`, and start command
`npm run start:standalone`. Use `.next` as the output directory if Hostinger
requires one. Set `NEXT_PUBLIC_SUPABASE_URL` and the matching
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in
Hostinger's build environment before rebuilding. Do not upload `out/` for this
deployment.
