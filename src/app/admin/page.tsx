'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { AdminProduct, AdminCategory, listProducts, listCategories } from '@/lib/admin/queries';

export default function AdminDashboard() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    Promise.all([listProducts(), listCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load dashboard.'));
  }, [retryKey]);

  const retry = () => { setProducts(null); setError(null); setRetryKey((key) => key + 1); };

  if (error) return <div className="admin-state-card"><Icon>error</Icon><h2>Dashboard unavailable</h2><p>{error}</p><button type="button" className="admin-btn admin-btn--dark" onClick={retry}><Icon>refresh</Icon> Try again</button></div>;
  if (!products) return <div className="admin-loading"><Icon>progress_activity</Icon><span>Preparing your workspace…</span></div>;

  const featured = products.filter((p) => p.is_featured).length;
  const outOfStock = products.reduce((n, p) => n + p.variants.filter((v) => v.stock_status === 'out_of_stock').length, 0);
  const recent = products.slice(0, 5);
  const catName = (slug: string | null) => categories.find((c) => c.slug === slug)?.name ?? 'Uncategorized';

  return (
    <>
      <div className="admin-pagehead admin-pagehead--dashboard">
        <div>
          <span className="admin-pagehead__eyebrow">Good to see you</span>
          <h1>Dashboard</h1>
          <p>One calm place to keep your catalog and storefront in shape.</p>
        </div>
        <div className="admin-pagehead__actions">
          <Link href="/en/" className="admin-btn admin-btn--outline"><Icon>open_in_new</Icon> View storefront</Link>
          <Link href="/admin/products/new/" className="admin-btn admin-btn--dark"><Icon>add</Icon> New product</Link>
        </div>
      </div>

      <section className="admin-welcome">
        <div className="admin-welcome__copy">
          <span className="admin-cardhead__eyebrow">Your next best step</span>
          <h2>Make the storefront feel alive.</h2>
          <p>Add a new piece, refresh a homepage image, or curate a new look for visitors to discover.</p>
        </div>
        <div className="admin-welcome__actions">
          <Link href="/admin/looks/" className="admin-welcome__action"><Icon>collections</Icon><span><strong>Curate a look</strong><small>Pair products with visual stories.</small></span><Icon>arrow_forward</Icon></Link>
          <Link href="/admin/heroes/" className="admin-welcome__action"><Icon>photo_library</Icon><span><strong>Refresh homepage</strong><small>Update the first impression.</small></span><Icon>arrow_forward</Icon></Link>
          <Link href="/admin/content/" className="admin-welcome__action"><Icon>edit_note</Icon><span><strong>Edit website content</strong><small>Update page copy, links, and images.</small></span><Icon>arrow_forward</Icon></Link>
        </div>
      </section>

      <section className="admin-stats admin-stats--dashboard" aria-label="Catalog summary">
        <div className="admin-stat"><span className="admin-stat__icon"><Icon>inventory_2</Icon></span><div><div className="admin-stat__label">Products</div><div className="admin-stat__value">{products.length}</div><div className="admin-stat__sub">pieces in catalog</div></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><Icon>category</Icon></span><div><div className="admin-stat__label">Categories</div><div className="admin-stat__value">{categories.length}</div><div className="admin-stat__sub">ways to browse</div></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><Icon>star</Icon></span><div><div className="admin-stat__label">Featured</div><div className="admin-stat__value">{featured}</div><div className="admin-stat__sub">on the homepage</div></div></div>
        <div className={`admin-stat ${outOfStock ? 'admin-stat--attention' : ''}`}><span className="admin-stat__icon"><Icon>{outOfStock ? 'warning' : 'check_circle'}</Icon></span><div><div className="admin-stat__label">Stock alerts</div><div className="admin-stat__value">{outOfStock}</div><div className="admin-stat__sub">{outOfStock ? 'variants need attention' : 'everything looks good'}</div></div></div>
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-section admin-recent-section">
          <div className="admin-section-head"><div><span className="admin-cardhead__eyebrow">Catalog</span><h2>Recent products</h2></div><Link href="/admin/products/" className="admin-btn admin-btn--ghost">View all <Icon>arrow_forward</Icon></Link></div>
          {recent.length === 0 ? <div className="admin-empty admin-empty--small"><Icon>inventory_2</Icon><p>Your catalog is empty.</p><Link href="/admin/products/new/" className="admin-text-link">Create your first product <Icon>arrow_forward</Icon></Link></div> : (
            <div className="admin-tablewrap admin-tablewrap--plain">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead>
                <tbody>{recent.map((p) => (
                  <tr key={p.id}>
                    <td data-label=""><div className="admin-table__head-cell">{p.images[0] ? <img src={p.images[0].image_url} alt="" className="admin-table__thumb" /> : <span className="admin-table__thumb admin-table__thumb--empty"><Icon>image</Icon></span>}<span>{p.title}</span></div></td>
                    <td data-label="Category">{catName(p.category_slug)}</td>
                    <td data-label="Price">${p.base_price_usd.toFixed(0)}</td>
                    <td data-label="Status">{p.is_featured && <span className="admin-pill admin-pill--featured">Featured</span>}{p.variants.some((v) => v.stock_status === 'out_of_stock') && <span className="admin-pill admin-pill--out">Stock issue</span>}{!p.is_featured && !p.variants.some((v) => v.stock_status === 'out_of_stock') && <span className="admin-pill">Ready</span>}</td>
                    <td data-label=""><Link href={`/admin/products/edit/?id=${p.id}`} className="admin-btn admin-btn--ghost" aria-label={`Edit ${p.title}`}><Icon>edit</Icon><span className="admin-action-label">Edit</span></Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="admin-section admin-checklist">
          <div className="admin-section-head"><div><span className="admin-cardhead__eyebrow">At a glance</span><h2>Content checklist</h2></div><Icon>task_alt</Icon></div>
          <div className="admin-checklist__items">
            <ChecklistItem icon="inventory_2" label="Products" value={products.length} href="/admin/products/" done={products.length > 0} />
            <ChecklistItem icon="category" label="Categories" value={categories.length} href="/admin/categories/" done={categories.length > 0} />
            <ChecklistItem icon="star" label="Featured pieces" value={featured} href="/admin/products/" done={featured > 0} />
            <ChecklistItem icon="photo_library" label="Homepage visuals" value="Manage" href="/admin/heroes/" done />
            <ChecklistItem icon="edit_note" label="Website content" value="Manage" href="/admin/content/" done />
          </div>
          <p className="admin-checklist__hint"><Icon>info</Icon> You can update every homepage section from the Homepage group in the sidebar.</p>
        </aside>
      </div>
    </>
  );
}

function ChecklistItem({ icon, label, value, href, done }: { icon: string; label: string; value: number | string; href: string; done: boolean }) {
  return <Link href={href} className="admin-checklist__item"><span className={`admin-checklist__status ${done ? 'is-done' : ''}`}><Icon>{done ? 'check' : icon}</Icon></span><span><strong>{label}</strong><small>{value} {typeof value === 'number' ? 'added' : ''}</small></span><Icon>chevron_right</Icon></Link>;
}
