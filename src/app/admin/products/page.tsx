'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import Select from '@/components/Select';
import { useToast, Toast } from '@/components/admin/Toast';
import { Confirm } from '@/components/admin/Confirm';
import { AdminProduct, AdminCategory, listProducts, listCategories, deleteProduct } from '@/lib/admin/queries';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [toDelete, setToDelete] = useState<AdminProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast, ok, err, clear } = useToast();

  const load = () => {
    Promise.all([listProducts(), listCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch((e) => { setProducts([]); err(e instanceof Error ? e.message : 'Failed to load.'); });
  };
  useEffect(load, []);

  const catName = (slug: string | null) => categories.find((c) => c.slug === slug)?.name ?? '—';

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    return products.filter((p) =>
      (catFilter === 'all' || p.category_slug === catFilter) &&
      (!q || p.title.toLowerCase().includes(q) || p.slug.includes(q))
    );
  }, [products, search, catFilter]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteProduct(toDelete.id);
      ok(`Deleted “${toDelete.title}”.`);
      setToDelete(null);
      load();
    } catch (e) {
      err(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <h1>Products</h1>
          <p>{products ? `${filtered.length} of ${products.length} pieces` : 'Loading…'}</p>
        </div>
        <Link href="/admin/products/new/" className="admin-btn admin-btn--dark"><Icon>add</Icon> New product</Link>
      </div>

      <div className="admin-toolbar">
        <label className="admin-field" style={{ minWidth: 240 }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or slug" />
        </label>
        <div style={{ minWidth: 220 }}>
          <Select value={catFilter} onChange={setCatFilter} label="Category"
            options={[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]} />
        </div>
      </div>

      {!products ? <div className="admin-loading"><Icon>progress_activity</Icon><span>Loading…</span></div> : filtered.length === 0 ? (
        <div className="admin-tablewrap"><div className="admin-empty"><Icon>inventory_2</Icon><p>No products match. <Link href="/admin/products/new/">Create one</Link>.</p></div></div>
      ) : (
        <div className="admin-tablewrap">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Variants</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((p) => {
                const out = p.variants.filter((v) => v.stock_status === 'out_of_stock').length;
                const pre = p.variants.filter((v) => v.stock_status === 'preorder').length;
                return (
                  <tr key={p.id}>
                    <td data-label="">
                      <div className="admin-table__head-cell">
                        {p.images[0] ? <img src={p.images[0].image_url} alt="" loading="lazy" className="admin-table__thumb" /> : <span className="admin-table__thumb admin-table__thumb--empty"><Icon>image</Icon></span>}
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td data-label="Category">{catName(p.category_slug)}</td>
                    <td data-label="Price">${p.base_price_usd.toFixed(0)}</td>
                    <td data-label="Variants">{p.variants.length}</td>
                    <td data-label="Status">
                      {p.is_featured && <span className="admin-pill admin-pill--featured">Featured</span>}{' '}
                      {out > 0 && <span className="admin-pill admin-pill--out">{out} out</span>}
                      {pre > 0 && <span className="admin-pill admin-pill--preorder">{pre} pre</span>}
                    </td>
                    <td data-label="Actions" className="admin-table__actions--icon">
                      <div className="admin-table__action-group">
                        <Link href={`/admin/products/edit/?id=${p.id}`} className="admin-btn admin-btn--ghost" aria-label={`Edit ${p.title}`}><Icon>edit</Icon></Link>
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setToDelete(p)} aria-label={`Delete ${p.title}`}><Icon>delete</Icon></button>
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
        title="Delete product?"
        body={`“${toDelete?.title}” and all its variants and images (DB rows) will be removed. Stored image files are kept unless you removed them in the editor.`}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => !busy && setToDelete(null)}
      />
      <Toast toast={toast} onDone={clear} />
    </>
  );
}
