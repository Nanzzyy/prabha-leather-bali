'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { Toast, useToast } from '@/components/admin/Toast';
import {
  listCategories,
  listCollectionProductGroups,
  listProducts,
  listSiteContent,
  saveCollectionProductGroup,
  type AdminCategory,
  type AdminProduct,
} from '@/lib/admin/queries';
import { getDefaultContent, mergeSiteContent, normalizeCollectionSubcategory, type CollectionContentItem } from '@/lib/content/defaults';

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const groupKey = (categoryId: string, subcategory: string) => `${categoryId}:${slugify(subcategory)}`;

export default function AdminCollectionGroupingPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [collections, setCollections] = useState<CollectionContentItem[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const { toast, ok, err, clear } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextCategories, nextProducts, contentRows] = await Promise.all([
        listCategories(),
        listProducts(),
        listSiteContent('en'),
      ]);
      let collectionContent = getDefaultContent('en').collection;
      const savedCollection = contentRows.find((row) => row.section === 'collection');
      if (savedCollection) collectionContent = mergeSiteContent(collectionContent, savedCollection.content as never);

      let groups: Awaited<ReturnType<typeof listCollectionProductGroups>> = [];
      try {
        groups = await listCollectionProductGroups();
        setSchemaMissing(false);
      } catch (groupError) {
        const message = groupError instanceof Error ? groupError.message : '';
        if (/collection_product_groups|schema cache|404|does not exist/i.test(message)) setSchemaMissing(true);
        else throw groupError;
      }

      const grouped = groups.reduce<Record<string, string[]>>((result, row) => {
        const key = `${row.category_id}:${row.subcategory_slug}`;
        result[key] = [...(result[key] ?? []), row.product_id];
        return result;
      }, {});

      setCategories(nextCategories);
      setProducts(nextProducts);
      setCollections(collectionContent.items);
      setAssignments(grouped);
      setSelectedType((current) => current && collectionContent.items.some((item) => item.slug === current) ? current : collectionContent.items[0]?.slug ?? '');
    } catch (error) {
      err(error instanceof Error ? error.message : 'Collection grouping could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [err]);

  // The effect intentionally starts the remote CMS read when the page mounts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const activeCollection = collections.find((item) => item.slug === selectedType) ?? collections[0];
  const activeCategory = categories.find((category) => category.slug === activeCollection?.slug);
  const eligibleProducts = useMemo(
    () => products.filter((product) => product.category_id === activeCategory?.id),
    [activeCategory?.id, products],
  );
  const subcategories = (activeCollection?.subcategories ?? []).map(normalizeCollectionSubcategory);
  const activeSubcategory = subcategories.find((item) => item.slug === selectedSubcategory) ?? subcategories[0];
  const key = activeCategory && activeSubcategory ? groupKey(activeCategory.id, activeSubcategory.slug) : '';
  const selectedIds = assignments[key] ?? [];

  const selectType = (slug: string) => {
    setSelectedType(slug);
    const next = collections.find((item) => item.slug === slug);
    setSelectedSubcategory(next?.subcategories[0] ? normalizeCollectionSubcategory(next.subcategories[0]).slug : '');
  };

  const toggleProduct = (productId: string) => {
    if (!key) return;
    setAssignments((current) => {
      const selected = current[key] ?? [];
      return { ...current, [key]: selected.includes(productId) ? selected.filter((id) => id !== productId) : [...selected, productId] };
    });
  };

  const save = async () => {
    if (!activeCategory || !activeSubcategory) return;
    setSaving(true);
    try {
      await saveCollectionProductGroup(activeCategory.id, activeSubcategory.slug, selectedIds);
      ok(`${selectedIds.length} product${selectedIds.length === 1 ? '' : 's'} saved to “${activeSubcategory.title}”.`);
      setSchemaMissing(false);
    } catch (error) {
      err(error instanceof Error ? error.message : 'Product assignment could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <div className="admin-breadcrumb"><Icon>account_tree</Icon> Catalog structure</div>
          <h1>Collection products</h1>
          <p>Choose existing products for every type and subcategory. Product details continue to come from Products.</p>
        </div>
        <Link href="/admin/content/" className="admin-btn admin-btn--outline"><Icon>edit_note</Icon>Edit names in Content</Link>
      </div>

      {schemaMissing && <div className="admin-collection-notice" role="status"><Icon>database</Icon><div><strong>Database setup is required</strong><span>Run <code>supabase/collection-product-groups.sql</code> in the Supabase SQL Editor, then reload this page.</span></div><button type="button" className="admin-btn admin-btn--outline" onClick={load}>Reload</button></div>}

      {loading ? <div className="admin-loading"><Icon>progress_activity</Icon><span>Loading collection structure…</span></div> : (
        <div className="admin-collection-workspace">
          <aside className="admin-collection-types" aria-label="Collection types">
            <span className="admin-sidebar__group-label">Collection types</span>
            {collections.map((item) => {
              const category = categories.find((entry) => entry.slug === item.slug);
              const count = products.filter((product) => product.category_id === category?.id).length;
              return <button type="button" key={item.slug} className={activeCollection?.slug === item.slug ? 'is-active' : ''} onClick={() => selectType(item.slug)}><span><strong>{item.title}</strong><small>{count} catalog products</small></span><Icon>chevron_right</Icon></button>;
            })}
          </aside>

          <section className="admin-collection-editor">
            {!activeCollection ? <div className="admin-empty"><Icon>category</Icon><p>Create collection types in Content first.</p></div> : !activeCategory ? <div className="admin-empty"><Icon>link_off</Icon><p>“{activeCollection.title}” has no matching product category. Create category slug <strong>{activeCollection.slug}</strong> first.</p></div> : <>
              <div className="admin-collection-editor__head"><div><span className="admin-cardhead__eyebrow">{activeCollection.title}</span><h2>Choose a subcategory</h2></div><span>{eligibleProducts.length} eligible products</span></div>
              {subcategories.length === 0 ? <div className="admin-empty"><Icon>segment</Icon><p>Add subcategories to this collection type in Content Manager first.</p></div> : <>
                <div className="admin-collection-subtabs" role="tablist" aria-label={`${activeCollection.title} subcategories`}>
                  {subcategories.map((subcategory) => {
                    const subKey = groupKey(activeCategory.id, subcategory.slug);
                    return <button type="button" role="tab" aria-selected={activeSubcategory?.slug === subcategory.slug} className={activeSubcategory?.slug === subcategory.slug ? 'is-active' : ''} key={subcategory.slug} onClick={() => setSelectedSubcategory(subcategory.slug)}><span>{subcategory.title}</span><small>{assignments[subKey]?.length ?? 0}</small></button>;
                  })}
                </div>

                <div className="admin-collection-picker-head"><div><span className="admin-cardhead__eyebrow">Assign products</span><h3>{activeSubcategory?.title}</h3></div><strong>{selectedIds.length} selected</strong></div>
                {eligibleProducts.length === 0 ? <div className="admin-empty"><Icon>inventory_2</Icon><p>No products use the {activeCollection.title} category yet.</p></div> : <div className="admin-collection-product-picker">{eligibleProducts.map((product) => {
                  const selected = selectedIds.includes(product.id);
                  return <button type="button" key={product.id} className={selected ? 'is-selected' : ''} aria-pressed={selected} onClick={() => toggleProduct(product.id)}><span className="admin-collection-product-picker__image">{product.images[0]?.image_url ? <img src={product.images[0].image_url} alt="" /> : <Icon>image</Icon>}</span><span className="admin-collection-product-picker__copy"><strong>{product.title}</strong><small>{product.slug}</small></span><span className="admin-collection-product-picker__check"><Icon>{selected ? 'check' : 'add'}</Icon></span></button>;
                })}</div>}

                <div className="admin-collection-actions"><span><Icon>info</Icon>Only products from {activeCollection.title} can be selected.</span><button type="button" className="admin-btn admin-btn--dark" onClick={save} disabled={saving || schemaMissing}><Icon>save</Icon>{saving ? 'Saving…' : `Save ${activeSubcategory?.title ?? 'subcategory'}`}</button></div>
              </>}
            </>}
          </section>
        </div>
      )}
      <Toast toast={toast} onDone={clear} />
    </>
  );
}
