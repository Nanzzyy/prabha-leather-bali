'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/Icon';
import Select from '@/components/Select';
import AdminPageHead from '@/components/admin/AdminPageHead';
import { useToast, Toast } from '@/components/admin/Toast';
import {
  AdminCategory, AdminImage, AdminVariant, STOCK_STATUSES,
  listCategories, getProductById, saveProduct, uploadImage, deleteImageByUrl,
} from '@/lib/admin/queries';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const emptyVariant = (): AdminVariant => ({ sku: '', color_name: '', color_hex: '#8B4513', size_eu: '', image_url: '', stock_status: 'available' });
const serializeProductForm = (input: { title: string; slug: string; description: string; leatherType: string; price: string; categoryId: string; featured: boolean; variants: AdminVariant[]; images: AdminImage[] }) => JSON.stringify({ ...input, variants: input.variants, images: input.images });

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { toast, ok, err, clear } = useToast();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [leatherType, setLeatherType] = useState('Full-Grain Cowhide');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featured, setFeatured] = useState(false);
  const [variants, setVariants] = useState<AdminVariant[]>([emptyVariant()]);
  const [images, setImages] = useState<AdminImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(() => productId ? null : serializeProductForm({ title: '', slug: '', description: '', leatherType: 'Full-Grain Cowhide', price: '', categoryId: '', featured: false, variants: [emptyVariant()], images: [] }));
  const allowNavigationRef = useRef(false);

  useEffect(() => {
    listCategories().then(setCategories).catch((e) => err(e instanceof Error ? e.message : 'Categories failed.'));
    if (!productId) return;
    getProductById(productId)
      .then((p) => {
        if (!p) { err('Product not found.'); router.replace('/admin/products/'); return; }
        setTitle(p.title); setSlug(p.slug); setSlugTouched(true);
        setDescription(p.description); setLeatherType(p.leather_type);
        setPrice(String(p.base_price_usd)); setCategoryId(p.category_id ?? '');
        setFeatured(p.is_featured);
        setVariants(p.variants.length ? p.variants : [emptyVariant()]);
        setImages(p.images);
        setInitialSnapshot(serializeProductForm({ title: p.title, slug: p.slug, description: p.description, leatherType: p.leather_type, price: String(p.base_price_usd), categoryId: p.category_id ?? '', featured: p.is_featured, variants: p.variants.length ? p.variants : [emptyVariant()], images: p.images }));
      })
      .catch((e) => err(e instanceof Error ? e.message : 'Load failed.'))
      .finally(() => setLoading(false));
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentSnapshot = useMemo(() => serializeProductForm({ title, slug, description, leatherType, price, categoryId, featured, variants, images }), [title, slug, description, leatherType, price, categoryId, featured, variants, images]);
  const isDirty = !loading && initialSnapshot !== null && initialSnapshot !== currentSnapshot;

  useEffect(() => {
    if (!isDirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const confirmNavigation = (event: MouseEvent) => {
      if (allowNavigationRef.current) return;
      const target = event.target instanceof Element ? event.target.closest('a') : null;
      const href = target?.getAttribute('href');
      if (!target || !href || href.startsWith('#') || target.getAttribute('target') === '_blank' || target.hasAttribute('download')) return;
      if (!window.confirm('You have unsaved changes. Leave this product form?')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      } else {
        allowNavigationRef.current = true;
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', confirmNavigation, true);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', confirmNavigation, true); };
  }, [isDirty]);

  const onTitle = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const setVariant = (idx: number, patch: Partial<AdminVariant>) =>
    setVariants((vs) => vs.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  const addVariant = () => setVariants((vs) => [...vs, emptyVariant()]);
  const removeVariant = (idx: number) => setVariants((vs) => vs.filter((_, i) => i !== idx));

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const img = await uploadImage(file);
        setImages((prev) => [...prev, img]);
      }
    } catch (e) {
      err(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const setImagePrimary = (idx: number) => setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === idx })));
  const moveImage = (idx: number, dir: -1 | 1) => setImages((prev) => {
    const next = [...prev]; const j = idx + dir;
    if (j < 0 || j >= next.length) return prev;
    [next[idx], next[j]] = [next[j], next[idx]]; return next;
  });
  const removeImage = async (idx: number) => {
    const img = images[idx];
    try { await deleteImageByUrl(img.image_url); }
    catch { /* storage file may already be gone — row removal is what matters */ }
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setVariants((prev) => prev.map((variant) => variant.image_url === img.image_url ? { ...variant, image_url: '' } : variant));
  };

  const categoryOptions = useMemo(() => categories.map((c) => ({ value: c.id, label: c.name })), [categories]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return err('Title is required.');
    if (!slug.trim()) return err('Slug is required.');
    if (!categoryId) return err('Choose a category.');
    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) return err('Enter a valid base price.');
    const cleanVariants = variants.map((v) => ({ ...v, sku: v.sku.trim(), color_name: v.color_name.trim() }));
    if (!cleanVariants.length) return err('Add at least one variant.');
    if (cleanVariants.some((v) => !v.sku || !v.color_name)) return err('Each variant needs a SKU and color.');

    setSaving(true);
    try {
      await saveProduct({
        id: productId,
        title, slug, description, leather_type: leatherType,
        base_price_usd: Number(price) || 0, is_featured: featured,
        category_id: categoryId, variants: cleanVariants, images,
      });
      ok(productId ? 'Product updated.' : 'Product created.');
      setInitialSnapshot(currentSnapshot);
      allowNavigationRef.current = true;
      setTimeout(() => router.push('/admin/products/'), 450);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed.';
      err(/duplicate|23505/i.test(msg) ? 'That slug or SKU already exists.' : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading"><Icon>progress_activity</Icon><span>Loading product…</span></div>;

  return (
    <>
      <AdminPageHead
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/' }, { label: 'Products', href: '/admin/products/' }, { label: productId ? 'Edit product' : 'New product' }]}
        eyebrow="Catalog"
        title={productId ? 'Edit product' : 'New product'}
        description={isDirty ? <span className="admin-dirty-status"><span className="admin-dirty-dot" /> Unsaved changes</span> : 'Keep the product details, variants, and images together in one place.'}
        actions={<Link href="/admin/products/" className="admin-btn admin-btn--outline"><Icon>arrow_back</Icon> Back to products</Link>}
      />

      <nav className="admin-form-anchors" aria-label="Product form sections">
        <a href="#details">Details</a>
        <a href="#variants">Variants</a>
        <a href="#images">Images</a>
      </nav>

      <form className="admin-form" noValidate onSubmit={submit}>
        <div id="details" className="admin-section admin-form-section" style={{ marginTop: 0 }}>
          <h2>Details</h2>
          <div className="admin-fieldrow">
            <label className="admin-field">
              <span className="admin-field__label">Title *</span>
              <input type="text" value={title} onChange={(e) => onTitle(e.target.value)} />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">Slug *</span>
              <input type="text" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
              <span className="admin-field__hint">URL: /catalog/{slug || '…'}/</span>
            </label>
          </div>
          <label className="admin-field">
            <span className="admin-field__label">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="admin-fieldrow">
            <div className="admin-field">
              <span className="admin-field__label">Category *</span>
              <Select value={categoryId} onChange={setCategoryId} options={categoryOptions.length ? categoryOptions : [{ value: '', label: 'No categories — create one first' }]} />
            </div>
            <label className="admin-field">
              <span className="admin-field__label">Base price (USD) *</span>
              <input type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" />
            </label>
          </div>
          <div className="admin-fieldrow">
            <label className="admin-field">
              <span className="admin-field__label">Leather type</span>
              <input type="text" value={leatherType} onChange={(e) => setLeatherType(e.target.value)} />
            </label>
            <label className="admin-checkbox" style={{ alignSelf: 'end', paddingBottom: '0.7rem' }}>
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Feature on homepage
            </label>
          </div>
        </div>

        <div id="variants" className="admin-section admin-form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Variants</h2>
            <button type="button" className="admin-btn admin-btn--outline" onClick={addVariant}><Icon>add</Icon> Add variant</button>
          </div>
          <p className="admin-field__hint">Each variant needs a unique SKU (across all products) and a color name. Size is optional.</p>
          {variants.map((v, i) => (
            <div className="admin-variant" key={i}>
              <div className="admin-variant__heading"><strong>Variant {i + 1}</strong><span>{v.color_name || 'Unnamed color'}</span></div>
              <div>
                <span className="admin-variant__label">SKU</span>
                <input type="text" value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} placeholder="DHB-TAN-42" />
              </div>
              <div>
                <span className="admin-variant__label">Color name</span>
                <input type="text" value={v.color_name} onChange={(e) => setVariant(i, { color_name: e.target.value })} placeholder="Saddle Tan" />
              </div>
              <div>
                <span className="admin-variant__label">Color</span>
                <ColorPicker value={v.color_hex || '#8B4513'} onChange={(color) => setVariant(i, { color_hex: color })} />
              </div>
              <div>
                <span className="admin-variant__label">Size (EU)</span>
                <input type="text" value={v.size_eu || ''} onChange={(e) => setVariant(i, { size_eu: e.target.value })} placeholder="42" />
              </div>
              <div className="admin-variant__image">
                <span className="admin-variant__label">Variant image (optional)</span>
                <Select
                  value={v.image_url || ''}
                  onChange={(val) => setVariant(i, { image_url: val || '' })}
                  options={[{ value: '', label: '— Use default gallery —' }, ...images.map((img, idx) => {
                    const filename = img.image_url.split('/').pop()?.split('?')[0] || '';
                    return { value: img.image_url, label: `Image ${idx + 1}${filename ? ` · ${filename}` : ''}`, prefix: <img src={img.image_url} alt="" /> };
                  })]}
                />
                {v.image_url && <div className="admin-variant__image-preview"><img src={v.image_url} alt="" /><span>Selected image</span></div>}
                <span className="admin-field__hint">Shown on the product page when this color is picked. Just points to a gallery image.</span>
              </div>
              <div className="admin-variant__stock">
                <span className="admin-variant__label">Stock</span>
                <Select value={v.stock_status} onChange={(val) => setVariant(i, { stock_status: val as AdminVariant['stock_status'] })}
                  options={STOCK_STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))} />
              </div>
              <button type="button" className="admin-btn admin-btn--ghost admin-tooltip admin-variant__remove" data-tooltip="Remove variant" title={`Remove variant ${i + 1}`} onClick={() => removeVariant(i)} disabled={variants.length === 1} aria-label={`Remove variant ${i + 1}`}><Icon>delete</Icon></button>
            </div>
          ))}
        </div>

        <div id="images" className="admin-section admin-form-section">
          <h2>Images</h2>
          <p className="admin-field__hint">First image is the primary (card thumbnail). Drag to reorder isn’t supported — use the arrows.</p>
          <label
            className={`admin-dropzone ${dragOver ? 'is-drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
          >
            <Icon>cloud_upload</Icon>
            <span>{uploading ? 'Uploading…' : 'Click or drop images to upload'}</span>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
          </label>
          {images.length > 0 && (
            <div className="admin-images" style={{ marginTop: '0.75rem' }}>
              {images.map((img, i) => (
                <div className="admin-image" key={img.image_url + i}>
                  <img src={img.image_url} alt="" />
                  {(i === 0 || img.is_primary) && <span className="admin-image__primary">Primary</span>}
                  <div className="admin-image__actions">
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move left"><Icon>chevron_left</Icon></button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} aria-label="Move right"><Icon>chevron_right</Icon></button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {i !== 0 && <button type="button" onClick={() => setImagePrimary(i)} aria-label="Make primary"><Icon>star</Icon></button>}
                      <button type="button" onClick={() => removeImage(i)} aria-label="Delete image"><Icon>delete</Icon></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-sticky-actions">
          <button type="submit" className="admin-btn admin-btn--dark" disabled={saving}><Icon>save</Icon> {saving ? 'Saving…' : (productId ? 'Save changes' : 'Create product')}</button>
          <button type="button" className="admin-btn admin-btn--outline" onClick={() => { if (!isDirty || window.confirm('You have unsaved changes. Leave this product form?')) { allowNavigationRef.current = true; router.push('/admin/products/'); } }}>Cancel</button>
        </div>
      </form>

      <Toast toast={toast} onDone={clear} />
    </>
  );
}

const COLOR_PALETTE = ['#181311', '#8B4513', '#A0522D', '#C5A059', '#D7B98E', '#6B6259', '#2F4858', '#4D7850', '#B0413E', '#F1ECE4'];

function ColorPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const safeValue = /^#[0-9a-f]{6}$/i.test(value) ? value : '#8B4513';

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="admin-color-picker" ref={rootRef}>
      <button type="button" className="admin-color-picker__trigger" onClick={() => setOpen((isOpen) => !isOpen)} aria-expanded={open} aria-haspopup="dialog">
        <span className="admin-color-picker__swatch" style={{ background: safeValue }} /><span>{safeValue}</span><Icon>expand_more</Icon>
      </button>
      {open && <div className="admin-color-picker__popover" role="dialog" aria-label="Choose color">
        <span className="admin-color-picker__label">Choose a color</span>
        <div className="admin-color-picker__palette">{COLOR_PALETTE.map((color) => <button type="button" key={color} className={color.toLowerCase() === safeValue.toLowerCase() ? 'is-selected' : ''} style={{ background: color }} aria-label={color} onClick={() => { onChange(color); setOpen(false); }} />)}</div>
        <label className="admin-color-picker__custom"><span>Custom hex</span><input type="text" value={value} maxLength={7} onChange={(event) => { const next = event.target.value.startsWith('#') ? event.target.value : `#${event.target.value}`; if (/^#[0-9a-f]{0,6}$/i.test(next)) onChange(next); }} placeholder="#8B4513" /></label>
      </div>}
    </div>
  );
}
