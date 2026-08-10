'use client';

import AdminPageHead from '@/components/admin/AdminPageHead';
import IconLibrary from '@/components/admin/IconLibrary';

export default function AdminIconsPage() {
  return (
    <>
      <AdminPageHead
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/' }, { label: 'Icon library' }]}
        eyebrow="Content & visuals"
        title="Icon library"
        description="Browse reusable Material Symbols for homepage sections, menus, and content fields."
      />
      <div className="admin-notice admin-notice--info"><span className="material-symbols-outlined">info</span><span>Choose an icon to copy its name. Content fields store the name, so the same icon can be reused anywhere the storefront renders an icon.</span></div>
      <section className="admin-section admin-icon-library-card"><IconLibrary /></section>
    </>
  );
}
