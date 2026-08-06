# Praba Leather Bali

Static, editorial product catalog for Praba Leather Bali. The storefront is designed for international buyers and sends orders directly to WhatsApp without a payment gateway.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Zustand, Supabase PostgreSQL, and Supabase Storage.

## Local setup

Copy `.env.example` to `.env.local`, then provide the public Supabase URL and publishable/anon key. The app includes a local catalog fallback so UI work can run before the database is reachable.

Run the database scripts in Supabase SQL Editor:

```text
supabase/schema.sql
supabase/seed.sql
supabase/storage.sql
supabase/admin.sql
supabase/cms-content.sql
supabase/collection-product-groups.sql
supabase/cms-safe-version.sql
```

The CMS has a `Content manager` workspace at `/admin/content/` for English and Indonesian copy. It covers global navigation/footer/order pouch, homepage sections, collection cards and subcategory labels, catalog filters and product-detail labels, contact content, and the full About page including images. Use `/admin/collection/` to assign existing categorized products to those Collection subcategories without duplicating product data. Existing Products, Categories, Heroes, Looks, and Stores editors remain available from the sidebar. The Looks editor supports one required image plus one optional image per look; hotspots can be assigned to either image.

Apply `supabase/cms-content.sql` to create the `site_content` table and add hero metadata plus the second Looks image. The script is additive and safe to run again. Until the schema is applied, the storefront uses the built-in defaults and the admin content editor will report the database error rather than silently losing changes.

Apply `supabase/collection-product-groups.sql` to enable the Collection product-assignment panel and live subcategory product groups. It adds explicit Data API grants, RLS policies, and an admin-only atomic save function. Until it is applied, the storefront uses built-in sample assignments and the admin shows a setup notice.

Apply `supabase/cms-safe-version.sql` to enable protected CMS snapshots. Content Manager can then save the currently published text, links, and image references as one safe version per locale and restore it atomically. The snapshot table is private to authenticated admins.

Start development:

```bash
npm run dev
```

Build the static site for Hostinger Shared Hosting:

```bash
npm run build
```

The generated static site is written to `out/`; upload its contents to `public_html`.
