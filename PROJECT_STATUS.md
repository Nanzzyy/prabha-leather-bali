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
- **[04 Aug 2026]** Proyek Next.js berhasil diinisialisasi.
- **[04 Aug 2026]** Ditetapkan untuk memulai dengan Postgres & Docker terlebih dahulu.
- **[04 Aug 2026]** Desain sementara menggunakan UI Tailwind standar.
- **[05 Aug 2026]** Implemented reusable editorial navigation, footer, hero carousel, catalog filters, product detail route, lookbook hotspots, and WhatsApp pouch drawer.
- **[05 Aug 2026]** Added Supabase client, static catalog fallback, schema/seed/storage SQL, and `output: 'export'` configuration for Hostinger.
- **[06 Aug 2026]** Improved CMS navigation with homepage content shortcuts and a guided Looks workflow. Looks now supports a primary + optional second image, image-specific hotspots, and a public image switcher.
- **[06 Aug 2026]** Added a locale-aware Content manager for global UI, homepage, Collection, Catalog, Contact, About, product detail, footer, and order pouch copy/images. Storefront sections now read live CMS JSON with safe defaults, while hero alt text/captions and footer links are editable.
- **[06 Aug 2026]** Added Collection product grouping: subcategory labels remain in Content manager, `/admin/collection/` assigns existing category products, and `/collection/explore/` browses each type and subcategory without duplicating product records.
- **[06 Aug 2026]** Added admin-only CMS safe versions with atomic restore, branded route/loading states, maintenance/offline recovery, global error handling, and short-lived live-data caches.

## Remaining Errors / To Do
- Apply `supabase/schema.sql`, `supabase/seed.sql`, and `supabase/storage.sql` in the Supabase project.
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the build environment.
- Replace the placeholder WhatsApp admin number in `src/lib/utils/whatsappGenerator.ts`.
- Replace reference image URLs with owned Supabase Storage assets.
- Re-run `supabase/cms-content.sql` after the Looks schema update so existing projects get `looks.image_url_2` and `look_spots.image_index`.
- Apply `supabase/cms-content.sql` to create `site_content`; after that, use `/admin/content/` to seed and maintain the editable storefront copy for each locale.
- Apply `supabase/collection-product-groups.sql` in Supabase SQL Editor to enable live Collection subcategory assignments.
- Apply `supabase/cms-safe-version.sql` in Supabase SQL Editor to enable safe-version save and restore.

---
*Catatan untuk Agen Selanjutnya:*
- Jangan mengubah arsitektur Adapter Pattern tanpa persetujuan eksplisit.
- Hindari ORM berat yang mempersulit deployment shared hosting jika tidak diperlukan (kita menggunakan `pg` biasa).
- Pastikan mencatat perubahan signifikan di file ini.
