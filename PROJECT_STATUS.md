# Project Status: Prabha Leather Bali

**Current Phase:** Inisialisasi Proyek & Core Architecture
**Target Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Zustand, PostgreSQL (via Docker).
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

## Remaining Errors / To Do
- Setup Docker Compose untuk Postgres.
- Implementasi tipe dan interface `IProductRepository`.
- Implementasi `PostgresAdapter`.
- Setup Zustand & WhatsApp Generator.
- Layout UI sederhana.

---
*Catatan untuk Agen Selanjutnya:*
- Jangan mengubah arsitektur Adapter Pattern tanpa persetujuan eksplisit.
- Hindari ORM berat yang mempersulit deployment shared hosting jika tidak diperlukan (kita menggunakan `pg` biasa).
- Pastikan mencatat perubahan signifikan di file ini.
