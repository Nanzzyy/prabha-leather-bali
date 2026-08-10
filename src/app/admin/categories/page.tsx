'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import AdminPageHead from '@/components/admin/AdminPageHead';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { useToast, Toast } from '@/components/admin/Toast';
import { Confirm } from '@/components/admin/Confirm';
import {
  AdminCategory, listCategories, categoryProductCounts,
  createCategory, updateCategory, deleteCategory,
} from '@/lib/admin/queries';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<AdminCategory[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; slug?: string }>({});
  const [editing, setEditing] = useState<Record<string, { name: string; slug: string }>>({});
  const [editErrors, setEditErrors] = useState<Record<string, { name?: string; slug?: string }>>({});
  const [toDelete, setToDelete] = useState<AdminCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast, ok, err, clear } = useToast();

  const load = () => {
    Promise.all([listCategories(), categoryProductCounts()])
      .then(([c, cnt]) => { setCats(c); setCounts(cnt); })
      .catch((e) => { setCats([]); err(e instanceof Error ? e.message : 'Load failed.'); });
  };
  useEffect(load, []);

  const onName = (v: string) => { setName(v); setFormErrors((previous) => ({ ...previous, name: undefined })); if (!slugTouched) setSlug(slugify(v)); };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = { name: name.trim() ? undefined : 'Category name is required.', slug: slug.trim() ? undefined : 'Slug is required.' };
    setFormErrors(nextErrors);
    if (nextErrors.name || nextErrors.slug) return;
    setBusy(true);
    try {
      await createCategory(name, slug);
      ok(`Category “${name}” added.`);
      setName(''); setSlug(''); setSlugTouched(false);
      load();
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : 'Add failed.';
      err(/duplicate|23505/i.test(msg) ? 'That slug already exists.' : msg);
    } finally { setBusy(false); }
  };

  const saveEdit = async (id: string) => {
    const ed = editing[id];
    if (!ed) return;
    const nextErrors = { name: ed.name.trim() ? undefined : 'Name is required.', slug: ed.slug.trim() ? undefined : 'Slug is required.' };
    setEditErrors((previous) => ({ ...previous, [id]: nextErrors }));
    if (nextErrors.name || nextErrors.slug) return;
    setBusy(true);
    try {
      await updateCategory(id, ed.name, ed.slug);
      ok('Category updated.');
      setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
      load();
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : 'Update failed.';
      err(/duplicate|23505/i.test(msg) ? 'That slug already exists.' : msg);
    } finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteCategory(toDelete.id);
      ok(`Deleted “${toDelete.name}”.`);
      setToDelete(null);
      load();
    } catch (e2) {
      err(e2 instanceof Error ? e2.message : 'Delete failed.');
    } finally { setBusy(false); }
  };

  return (
    <>
      <AdminPageHead
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/' }, { label: 'Categories' }]}
        eyebrow="Catalog"
        title="Categories"
        description="Group products into collections. Deleting is blocked while products use a category."
      />

      <form className="admin-section" noValidate onSubmit={add} style={{ display: 'grid', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Add category</h2>
        <div className="admin-fieldrow">
          <label className="admin-field">
            <span className="admin-field__label">Name</span>
            <input type="text" value={name} onChange={(e) => onName(e.target.value)} placeholder="Belts" aria-invalid={!!formErrors.name} aria-describedby={formErrors.name ? 'category-name-error' : undefined} />
            {formErrors.name && <span className="admin-field__error" id="category-name-error">{formErrors.name}</span>}
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Slug</span>
            <input type="text" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); setFormErrors((previous) => ({ ...previous, slug: undefined })); }} placeholder="belts" aria-invalid={!!formErrors.slug} aria-describedby={formErrors.slug ? 'category-slug-error' : undefined} />
            {formErrors.slug && <span className="admin-field__error" id="category-slug-error">{formErrors.slug}</span>}
          </label>
        </div>
        <button type="submit" className="admin-btn admin-btn--dark" disabled={busy}><Icon>add</Icon> Add</button>
      </form>

      {!cats ? <div className="admin-loading"><Icon>progress_activity</Icon></div> : cats.length === 0 ? (
        <div className="admin-tablewrap"><AdminEmptyState icon="category" title="No categories yet" description="Add a category before creating products so visitors can browse the catalog." /></div>
      ) : (
        <div className="admin-tablewrap" style={{ marginTop: '1rem' }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th></th></tr></thead>
            <tbody>
              {cats.map((c) => {
                const ed = editing[c.id];
                const inUse = (counts[c.id] ?? 0) > 0;
                return (
                  <tr key={c.id}>
                    <td data-label="Name">
                      {ed ? <><input type="text" value={ed.name} onChange={(e) => { setEditing((p) => ({ ...p, [c.id]: { ...p[c.id], name: e.target.value } })); setEditErrors((p) => ({ ...p, [c.id]: { ...p[c.id], name: undefined } })); }} aria-invalid={!!editErrors[c.id]?.name} />{editErrors[c.id]?.name && <span className="admin-field__error">{editErrors[c.id]?.name}</span>}</> : c.name}
                    </td>
                    <td data-label="Slug">
                      {ed ? <><input type="text" value={ed.slug} onChange={(e) => { setEditing((p) => ({ ...p, [c.id]: { ...p[c.id], slug: slugify(e.target.value) } })); setEditErrors((p) => ({ ...p, [c.id]: { ...p[c.id], slug: undefined } })); }} aria-invalid={!!editErrors[c.id]?.slug} />{editErrors[c.id]?.slug && <span className="admin-field__error">{editErrors[c.id]?.slug}</span>}</> : c.slug}
                    </td>
                    <td data-label="Products"><span>{counts[c.id] ?? 0}</span>{inUse && <span className="admin-field__hint">used by {counts[c.id]} product{counts[c.id] === 1 ? '' : 's'}</span>}</td>
                    <td data-label="Actions" className="admin-table__actions--icon">
                      <div className="admin-table__action-group">
                        {ed ? <>
                          <button type="button" className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip="Save category" title="Save category" onClick={() => saveEdit(c.id)} disabled={busy} aria-label={`Save ${c.name}`}><Icon>save</Icon></button>
                          <button type="button" className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip="Cancel editing" title="Cancel editing" onClick={() => setEditing((p) => { const n = { ...p }; delete n[c.id]; return n; })} disabled={busy} aria-label={`Cancel editing ${c.name}`}><Icon>close</Icon></button>
                        </> : <>
                          <button type="button" className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip="Edit category" title={`Edit ${c.name}`} onClick={() => setEditing((p) => ({ ...p, [c.id]: { name: c.name, slug: c.slug } }))} aria-label={`Edit ${c.name}`}><Icon>edit</Icon></button>
                          <button type="button" className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip={inUse ? 'Remove products first' : 'Delete category'} title={inUse ? 'Remove products first' : `Delete ${c.name}`} aria-label={inUse ? 'Remove products first' : `Delete ${c.name}`} onClick={() => setToDelete(c)} disabled={inUse}><Icon>delete</Icon></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Confirm
        open={!!toDelete}
        title="Delete category?"
        body={`“${toDelete?.name}” will be removed. Products keep their data but lose this grouping.`}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => !busy && setToDelete(null)}
      />
      <Toast toast={toast} onDone={clear} />
    </>
  );
}
