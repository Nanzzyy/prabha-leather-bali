import AdminShell from '@/components/admin/AdminShell';
import './admin.css';

// Admin documents must never enter the public storefront cache. Authentication
// is performed by src/proxy.ts before this route can render; database writes
// remain independently protected by Supabase RLS.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
