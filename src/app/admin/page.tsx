'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/Icon';
import AdminPageHead from '@/components/admin/AdminPageHead';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
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

  if (error) {
    return (
      <div className="admin-state-card">
        <Icon>error</Icon>
        <h2>Dashboard unavailable</h2>
        <p>{error}</p>
        <button type="button" className="admin-btn admin-btn--dark" onClick={retry}>
          <Icon>refresh</Icon> Try again
        </button>
      </div>
    );
  }

  if (!products) {
    return (
      <div className="admin-loading">
        <Icon>progress_activity</Icon>
        <span>Preparing your workspace…</span>
      </div>
    );
  }

  const featured = products.filter((p) => p.is_featured).length;
  const outOfStock = products.reduce((n, p) => n + p.variants.filter((v) => v.stock_status === 'out_of_stock').length, 0);
  const recent = products.slice(0, 5);
  const catName = (slug: string | null) => categories.find((c) => c.slug === slug)?.name ?? 'Uncategorized';

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page Header */}
      <AdminPageHead
        className="admin-pagehead--dashboard"
        eyebrow="Good to see you"
        title="Dashboard"
        description="One calm place to keep your catalog and storefront in shape."
        actions={<>
          <Link href="/en/" target="_blank" rel="noreferrer" className="admin-btn admin-btn--outline">
            <Icon>open_in_new</Icon> View storefront
          </Link>
          <Link href="/admin/products/new/" className="admin-btn admin-btn--dark">
            <Icon>add</Icon> New product
          </Link>
        </>}
      />

      {/* Welcome Hero */}
      <section className="admin-welcome">
        <div className="admin-welcome__copy">
          <span className="admin-cardhead__eyebrow">Your next best step</span>
          <h2>Make the storefront feel alive.</h2>
          <p>Add a new piece, refresh a homepage image, or curate a new look for visitors to discover.</p>
        </div>
        <div className="admin-welcome__actions">
          <Link href="/admin/looks/" className="admin-welcome__action">
            <Icon>collections</Icon>
            <span><strong>Curate a look</strong><small>Pair products with visual stories.</small></span>
            <Icon>arrow_forward</Icon>
          </Link>
          <Link href="/admin/heroes/" className="admin-welcome__action">
            <Icon>photo_library</Icon>
            <span><strong>Refresh homepage</strong><small>Update the first impression.</small></span>
            <Icon>arrow_forward</Icon>
          </Link>
          <Link href="/admin/content/" className="admin-welcome__action">
            <Icon>edit_note</Icon>
            <span><strong>Edit website content</strong><small>Update page copy, links, and images.</small></span>
            <Icon>arrow_forward</Icon>
          </Link>
        </div>
      </section>

      {/* Stats Row */}
      <div className="admin-stats admin-stats--dashboard">
        <div className="admin-stat">
          <div className="admin-stat__icon"><Icon>inventory_2</Icon></div>
          <div>
            <span className="admin-stat__label">Products</span>
            <div className="admin-stat__value">{products.length}</div>
            <span className="admin-stat__sub">pieces in catalog</span>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon"><Icon>category</Icon></div>
          <div>
            <span className="admin-stat__label">Categories</span>
            <div className="admin-stat__value">{categories.length}</div>
            <span className="admin-stat__sub">ways to browse</span>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon"><Icon>star</Icon></div>
          <div>
            <span className="admin-stat__label">Featured</span>
            <div className="admin-stat__value">{featured}</div>
            <span className="admin-stat__sub">on the homepage</span>
          </div>
        </div>
        <div className={`admin-stat ${outOfStock ? 'admin-stat--attention' : ''}`}>
          <div className="admin-stat__icon"><Icon>{outOfStock ? 'warning' : 'check_circle'}</Icon></div>
          <div>
            <span className="admin-stat__label">Stock alerts</span>
            <div className="admin-stat__value">{outOfStock}</div>
            <span className="admin-stat__sub">{outOfStock ? 'variants need attention' : 'everything looks good'}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Main Grid */}
      <div className="admin-dashboard-grid">
        {/* Recent Products */}
        <section>
          <div className="admin-section-head">
            <div>
              <span className="admin-cardhead__eyebrow">Catalog</span>
              <h2>Recent products</h2>
            </div>
            <Link href="/admin/products/" className="admin-text-link">
              View all <Icon>arrow_forward</Icon>
            </Link>
          </div>

          <div className="admin-tablewrap">
            {recent.length === 0 ? (
              <AdminEmptyState
                icon="inventory_2"
                title="Your catalog is empty"
                description="Add the first piece to start building your storefront."
                action={<Link href="/admin/products/new/" className="admin-btn admin-btn--outline"><Icon>add</Icon> Create product</Link>}
              />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Product">
                        <div className="admin-table__head-cell">
                          <div className="admin-table__thumb" style={{ position: 'relative', overflow: 'hidden' }}>
                            {p.images[0] ? (
                              <Image src={p.images[0].image_url} alt="" fill sizes="44px" className="object-cover" />
                            ) : (
                              <span className="admin-table__thumb--empty" style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }}>
                                <Icon>image</Icon>
                              </span>
                            )}
                          </div>
                          <span>{p.title}</span>
                        </div>
                      </td>
                      <td data-label="Category">{catName(p.category_slug)}</td>
                      <td data-label="Price">${p.base_price_usd.toFixed(0)}</td>
                      <td data-label="Status">
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {p.is_featured && <span className="admin-pill admin-pill--featured">Featured</span>}
                          {p.variants.some((v) => v.stock_status === 'out_of_stock') && <span className="admin-pill admin-pill--out">Stock issue</span>}
                          {!p.is_featured && !p.variants.some((v) => v.stock_status === 'out_of_stock') && <span className="admin-pill">Ready</span>}
                        </div>
                      </td>
                      <td data-label="" className="admin-table__actions--icon">
                        <div className="admin-table__action-group">
                          <Link href={`/admin/products/edit/?id=${p.id}`} className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip="Edit product" title={`Edit ${p.title}`} aria-label={`Edit ${p.title}`}>
                            <Icon>edit</Icon>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Checklist Sidebar */}
        <aside>
          <div className="admin-section-head">
            <div>
              <span className="admin-cardhead__eyebrow">At a glance</span>
              <h2>Content checklist</h2>
            </div>
            <Icon>task_alt</Icon>
          </div>

          <div className="admin-tablewrap" style={{ padding: '0.5rem' }}>
            <div className="admin-checklist__items">
              <Link href="/admin/products/" className="admin-checklist__item">
                <span className={`admin-checklist__status ${products.length > 0 ? 'is-done' : ''}`}><Icon>{products.length > 0 ? 'check' : 'inventory_2'}</Icon></span>
                <span><strong>Products</strong><small>{products.length} added</small></span>
                <Icon>chevron_right</Icon>
              </Link>
              <Link href="/admin/categories/" className="admin-checklist__item">
                <span className={`admin-checklist__status ${categories.length > 0 ? 'is-done' : ''}`}><Icon>{categories.length > 0 ? 'check' : 'category'}</Icon></span>
                <span><strong>Categories</strong><small>{categories.length} added</small></span>
                <Icon>chevron_right</Icon>
              </Link>
              <Link href="/admin/products/" className="admin-checklist__item">
                <span className={`admin-checklist__status ${featured > 0 ? 'is-done' : ''}`}><Icon>{featured > 0 ? 'check' : 'star'}</Icon></span>
                <span><strong>Featured pieces</strong><small>{featured} added</small></span>
                <Icon>chevron_right</Icon>
              </Link>
              <Link href="/admin/heroes/" className="admin-checklist__item">
                <span className="admin-checklist__status is-done"><Icon>check</Icon></span>
                <span><strong>Homepage visuals</strong><small>Manage</small></span>
                <Icon>chevron_right</Icon>
              </Link>
              <Link href="/admin/content/" className="admin-checklist__item">
                <span className="admin-checklist__status is-done"><Icon>check</Icon></span>
                <span><strong>Website content</strong><small>Manage</small></span>
                <Icon>chevron_right</Icon>
              </Link>
            </div>
            <div className="admin-checklist__hint">
              <Icon>info</Icon>
              <p>You can update every homepage section from the Homepage group in the sidebar.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
