'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
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
  const [editing, setEditing] = useState<Record<string, { name: string; slug: string }>>({});
  const [toDelete, setToDelete] = useState<AdminCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast, ok, err, clear } = useToast();

  const load = () => {
    Promise.all([listCategories(), categoryProductCounts()])
      .then(([c, cnt]) => { setCats(c); setCounts(cnt); })
      .catch((e) => { setCats([]); err(e instanceof Error ? e.message : 'Load failed.'); });
  };
  useEffect(load, []);

  const onName = (v: string) => { setName(v); if (!slugTouched) setSlug(slugify(v)); };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return err('Name and slug required.');
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
    if (!ed || !ed.name.trim() || !ed.slug.trim()) return;
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
      <div className="admin-pagehead">
        <div>
          <h1>Categories</h1>
          <p>Group products into collections. Deleting is blocked while products use it.</p>
        </div>
      </div>

      <form className="admin-section" noValidate onSubmit={add} style={{ display: 'grid', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Add category</h2>
        <div className="admin-fieldrow">
          <label className="admin-field">
            <span className="admin-field__label">Name</span>
            <input type="text" value={name} onChange={(e) => onName(e.target.value)} placeholder="Belts" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Slug</span>
            <input type="text" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} placeholder="belts" />
          </label>
        </div>
        <button type="submit" className="admin-btn admin-btn--dark" disabled={busy}><Icon>add</Icon> Add</button>
      </form>

      {!cats ? <div className="admin-loading"><Icon>progress_activity</Icon></div> : cats.length === 0 ? (
        <div className="admin-tablewrap"><div className="admin-empty"><Icon>category</Icon><p>No categories yet.</p></div></div>
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
                      {ed ? <input type="text" value={ed.name} onChange={(e) => setEditing((p) => ({ ...p, [c.id]: { ...p[c.id], name: e.target.value } }))} /> : c.name}
                    </td>
                    <td data-label="Slug">
                      {ed ? <input type="text" value={ed.slug} onChange={(e) => setEditing((p) => ({ ...p, [c.id]: { ...p[c.id], slug: slugify(e.target.value) } }))} /> : c.slug}
                    </td>
                    <td data-label="Products">{counts[c.id] ?? 0}</td>
                    <td data-label="Actions" className="admin-table__actions--icon">
                      <div className="admin-table__action-group">
                        {ed ? <>
                          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => saveEdit(c.id)} disabled={busy}><Icon>save</Icon></button>
                          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setEditing((p) => { const n = { ...p }; delete n[c.id]; return n; })} disabled={busy}><Icon>close</Icon></button>
                        </> : <>
                          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setEditing((p) => ({ ...p, [c.id]: { name: c.name, slug: c.slug } }))}><Icon>edit</Icon></button>
                          <button type="button" className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip={inUse ? 'Remove products first' : 'Delete category'} aria-label={inUse ? 'Remove products first' : `Delete ${c.name}`} onClick={() => setToDelete(c)} disabled={inUse}><Icon>delete</Icon></button>
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
