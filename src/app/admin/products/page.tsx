'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import Select from '@/components/Select';
import AdminPageHead from '@/components/admin/AdminPageHead';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { useToast, Toast } from '@/components/admin/Toast';
import { Confirm } from '@/components/admin/Confirm';
import { AdminProduct, AdminCategory, listProducts, listCategories, deleteProduct } from '@/lib/admin/queries';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('newest');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<AdminProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast, ok, err, clear } = useToast();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const load = () => {
    Promise.all([listProducts(), listCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch((e) => { setProducts([]); err(e instanceof Error ? e.message : 'Failed to load.'); });
  };
  useEffect(load, []);
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (!typing && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        router.push('/admin/products/new/');
      }
    };
    document.addEventListener('keydown', onShortcut);
    return () => document.removeEventListener('keydown', onShortcut);
  }, [router]);

  const catName = (slug: string | null) => categories.find((c) => c.slug === slug)?.name ?? '—';

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    const result = products.filter((p) =>
      (catFilter === 'all' || p.category_slug === catFilter) &&
      (!q || p.title.toLowerCase().includes(q) || p.slug.includes(q))
    );
    return [...result].sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'price') return a.base_price_usd - b.base_price_usd;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, search, catFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / Number(pageSize)));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

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
      <AdminPageHead
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/' }, { label: 'Products' }]}
        eyebrow="Catalog"
        title="Products"
        description="Manage the pieces, variants, and storefront status in your catalog."
        actions={<Link href="/admin/products/new/" className="admin-btn admin-btn--dark"><Icon>add</Icon> New product</Link>}
      />

      <div className="admin-toolbar">
        <label className="admin-field" style={{ minWidth: 240 }}>
          <input ref={searchRef} type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search title or slug" aria-keyshortcuts="Control+K Meta+K" />
        </label>
        <div style={{ minWidth: 220 }}>
          <Select value={catFilter} onChange={(value) => { setCatFilter(value); setPage(1); }} label="Category"
            options={[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]} />
        </div>
        <div style={{ minWidth: 170 }}>
          <Select value={sortBy} onChange={(value) => { setSortBy(value as typeof sortBy); setPage(1); }} label="Sort"
            options={[{ value: 'newest', label: 'Newest' }, { value: 'name', label: 'Name' }, { value: 'price', label: 'Price' }]} />
        </div>
        <div style={{ minWidth: 150 }}>
          <Select value={pageSize} onChange={(value) => { setPageSize(value); setPage(1); }} label="Rows"
            options={[{ value: '10', label: '10 per page' }, { value: '25', label: '25 per page' }, { value: '50', label: '50 per page' }]} />
        </div>
        <span className="admin-toolbar__count" aria-live="polite">{products ? `${filtered.length} result${filtered.length === 1 ? '' : 's'}` : 'Loading results…'}</span>
      </div>

      {!products ? <div className="admin-loading"><Icon>progress_activity</Icon><span>Loading…</span></div> : filtered.length === 0 ? (
        <div className="admin-tablewrap">
          <AdminEmptyState
            icon="inventory_2"
            title={products.length === 0 ? 'No products yet' : 'No products match these filters'}
            description={products.length === 0 ? 'Add your first piece to start building the catalog.' : 'Try a different search or clear the active filters.'}
            action={products.length === 0 ? <Link href="/admin/products/new/" className="admin-btn admin-btn--outline"><Icon>add</Icon> Create product</Link> : <button type="button" className="admin-btn admin-btn--outline" onClick={() => { setSearch(''); setCatFilter('all'); }}><Icon>filter_alt_off</Icon> Clear filters</button>}
          />
        </div>
      ) : (
        <>
        <div className="admin-tablewrap">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Variants</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {pageItems.map((p) => {
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
                        <Link href={`/admin/products/edit/?id=${p.id}`} className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip="Edit product" title={`Edit ${p.title}`} aria-label={`Edit ${p.title}`}><Icon>edit</Icon></Link>
                        <button type="button" className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip="Delete product" title={`Delete ${p.title}`} onClick={() => setToDelete(p)} aria-label={`Delete ${p.title}`}><Icon>delete</Icon></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <div className="admin-pagination" aria-label="Product pagination">
          <span>Page {currentPage} of {totalPages}</span>
          <div>
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1}><Icon>chevron_left</Icon> Previous</button>
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={currentPage === totalPages}>Next <Icon>chevron_right</Icon></button>
          </div>
        </div>}
        </>
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
