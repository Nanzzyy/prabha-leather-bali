# Project Status: Prabha Leather Bali

**Current Phase:** UI/UX Implementation & Static Export Architecture
**Target Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Zustand, Supabase PostgreSQL & Storage.
**Architecture:** Adapter Pattern untuk multi-driver data source.
**Checkout Flow:** WhatsApp Text Payload Generator (Zero PII on DB).

## Goals
1. Membangun sistem katalog yang bisa berjalan dengan 3 driver: `sheets`, `supabase`, `postgres`.
2. Saat ini fokus pada **Postgres** driver dengan Docker lokal.
3. Menggunakan Tailwind CSS seadanya dulu untuk mempercepat logika, akan ada perombakan UI mendalam nantinya.
4. Output akhir bisa di-export statis (`output: 'export'`) atau Dockerized, tergantung env.

## Latest Updates
- **[07 Aug 2026]** Fixed PGRST201 in admin queries: `PRODUCT_SELECT` in `src/lib/admin/queries.ts` still used bare `categories(…)` embed which became ambiguous after `collection_product_groups` table created a second products→categories FK. Pinned to `categories!products_category_id_fkey`. This was the root cause of admin dashboard/products/categories/collection pages showing PGRST201 (HTTP 300) and failing to load data on Vercel. The catalog live query (`src/lib/catalog/live.ts`) and collection live query (`src/lib/collection/live.ts`) already had the pin from an earlier fix. Added `vercel.json` for explicit static export config.
- **[06 Aug 2026]** All pending Supabase SQL applied to cloud: `admin.sql`, `collection-product-groups.sql`, `cms-safe-version-history.sql`, `variant-images.sql`. Catalog subcategories now read live assignments (PGRST205 gone), admin writes allowed via RLS (42501 gone), snapshot history live, per-variant image column live.
- **[06 Aug 2026]** Per-variant image shipped: variant `image_url` flows SQL → mappers → admin variant form (dropdown over gallery) → `ProductDetailClient` gallery swap on color click. Verified in browser (click "Saddle Tan" → main gallery moves to that variant's image).
- **[06 Aug 2026]** Fixed PGRST201: creating `collection_product_groups` added a second products→categories relationship, breaking every live nested `categories(slug)` embed. Pinned both embeds: `categories!products_category_id_fkey(slug)` (products) and `categories!collection_product_groups_category_id_fkey(slug)` (groups). Commits `7f3849d`, `e0d7d9c` pushed via SSH.
- **[06 Aug 2026]** Added Collection product grouping: subcategory labels remain in Content manager, `/admin/collection/` assigns existing category products, and `/collection/explore/` browses each type and subcategory without duplicating product records.
- **[06 Aug 2026]** Added admin-only CMS safe versions with atomic restore, branded route/loading states, maintenance/offline recovery, global error handling, and short-lived live-data caches.

## Remaining Errors / To Do
- Seed `product_images` / `product_variants` for the 6 non-sample products (they render with empty galleries; browser logs `src=""` warnings on detail pages). `praba-sample-piece` is the only fully-seeded product.
- Replace the placeholder WhatsApp admin number in `src/lib/utils/whatsappGenerator.ts`.
- Replace reference image URLs with owned Supabase Storage assets.

---
*Catatan untuk Agen Selanjutnya:*
- Jangan mengubah arsitektur Adapter Pattern tanpa persetujuan eksplisit.
- Hindari ORM berat yang mempersulit deployment shared hosting jika tidak diperlukan (kita menggunakan `pg` biasa).
- Pastikan mencatat perubahan signifikan di file ini.
