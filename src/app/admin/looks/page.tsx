'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import Select from '@/components/Select';
import { useToast, Toast } from '@/components/admin/Toast';
import { Confirm } from '@/components/admin/Confirm';
import {
  AdminLook, AdminLookSpot, AdminProduct, LookInput,
  listLooks, listProducts, saveLook, deleteLook, uploadImage,
} from '@/lib/admin/queries';

const NEW_LOOK = {
  title: '', image_url: '', image_url_2: null, is_active: true, display_order: 0, spots: [],
} satisfies Omit<AdminLook, 'id'>;

export default function AdminLooksPage() {
  const [looks, setLooks] = useState<AdminLook[] | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [toDelete, setToDelete] = useState<AdminLook | null>(null);
  const [busy, setBusy] = useState(false);
  const [newLookVersion, setNewLookVersion] = useState(0);
  const { toast, ok, err, clear } = useToast();

  const load = useCallback(async () => {
    try {
      const [l, p] = await Promise.all([listLooks(), listProducts()]);
      setLooks(l);
      setProducts(p);
    } catch (e) {
      setLooks([]);
      err(e instanceof Error ? e.message : 'Load failed.');
    }
  }, [err]);

  useEffect(() => { load(); }, [load]);

  const save = async (input: LookInput) => {
    setBusy(true);
    try {
      const savedId = await saveLook(input);
      const persistedLooks = await listLooks();
      if (!persistedLooks.some((look) => look.id === savedId)) {
        throw new Error('Look save was not confirmed by Supabase. Please try again.');
      }
      ok(input.id ? 'Look updated.' : 'Look created.');
      if (!input.id) setNewLookVersion((version) => version + 1);
      await load();
    }
    catch (e) { err(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try { await deleteLook(toDelete.id); ok('Look deleted.'); setToDelete(null); load(); }
    catch (e) { err(e instanceof Error ? e.message : 'Delete failed.'); }
    finally { setBusy(false); }
  };

  const productOptions = products.map((p) => ({ value: p.id, label: p.title }));
  const primarySlots = [0, 1] as const;
  const extraLooks = (looks ?? []).filter((look) => !primarySlots.includes(look.display_order as 0 | 1));

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <div className="admin-breadcrumb"><Icon>collections</Icon> Homepage content</div>
          <h1>Curated Looks</h1>
          <p>Build editorial looks with up to two photos and tappable product hotspots.</p>
        </div>
      </div>

      <div className="admin-guide" aria-label="Look workflow">
        <div><span>01</span><strong>Add photos</strong><small>Use one or two lifestyle images.</small></div>
        <div><span>02</span><strong>Place hotspots</strong><small>Select the photo, then click to place a product.</small></div>
        <div><span>03</span><strong>Save & publish</strong><small>Only active looks appear on the homepage.</small></div>
      </div>

      {products.length === 0 && looks && (
        <div className="admin-notice admin-notice--info"><Icon>info</Icon><span>Create at least one product before adding hotspots.</span><Link href="/admin/products/new/">Create product</Link></div>
      )}

      {!looks ? <div className="admin-loading"><Icon>progress_activity</Icon><span>Loading looks…</span></div> : (
        <div className="admin-look-slots">
          {primarySlots.map((displayOrder) => {
            const existing = looks.find((look) => look.display_order === displayOrder);
            return <LookCard
              key={`slot-${displayOrder}-${existing?.id ?? newLookVersion}`}
              initial={existing ?? { ...NEW_LOOK, display_order: displayOrder }}
              isNew={!existing}
              slotNumber={displayOrder + 1}
              busy={busy}
              productOptions={productOptions}
              onSave={save}
              onDelete={existing ? () => setToDelete(existing) : undefined}
              onError={err}
            />;
          })}
        </div>
      )}

      {extraLooks.length > 0 && <div className="admin-extra-looks"><div className="admin-section-head"><div><span className="admin-cardhead__eyebrow">Additional content</span><h2>Extra looks</h2></div></div>{extraLooks.map((look) => <LookCard key={look.id} initial={look} busy={busy} productOptions={productOptions} onSave={save} onDelete={() => setToDelete(look)} onError={err} />)}</div>}

      <Confirm open={!!toDelete} title="Delete look?" body={`“${toDelete?.title}” and its hotspots will be removed.`} busy={busy} onConfirm={confirmDelete} onCancel={() => !busy && setToDelete(null)} />
      <Toast toast={toast} onDone={clear} />
    </>
  );
}

type Draft = {
  id?: string;
  title: string;
  image_url: string;
  image_url_2: string | null;
  is_active: boolean;
  display_order: number;
  spots: AdminLookSpot[];
};

function LookCard({ initial, isNew, slotNumber, busy, productOptions, onSave, onDelete, onError }: {
  initial: Omit<AdminLook, 'id'> | AdminLook;
  isNew?: boolean;
  slotNumber?: number;
  busy: boolean;
  productOptions: { value: string; label: string }[];
  onSave: (input: LookInput) => void;
  onDelete?: () => void;
  onError: (message: string) => void;
}) {
  const [d, setD] = useState<Draft>(() => ({
    id: 'id' in initial ? initial.id : undefined,
    title: initial.title,
    image_url: initial.image_url,
    image_url_2: initial.image_url_2 ?? null,
    is_active: initial.is_active,
    display_order: initial.display_order,
    spots: initial.spots,
  }));
  const [activeImage, setActiveImage] = useState(0);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<Array<HTMLInputElement | null>>([]);
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  const images = [d.image_url, d.image_url_2 ?? ''];
  const currentImage = images[activeImage] || '';

  const onFile = async (file: File | undefined, imageIndex: number) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return onError('Please choose an image file.');
    setUploading(imageIndex);
    try {
      const img = await uploadImage(file, 'looks');
      set(imageIndex === 0 ? { image_url: img.image_url } : { image_url_2: img.image_url });
      setActiveImage(imageIndex);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Image upload failed.');
    } finally {
      setUploading(null);
      if (fileRefs.current[imageIndex]) fileRefs.current[imageIndex]!.value = '';
    }
  };

  const removeImage = (imageIndex: number) => {
    if (imageIndex === 0 && d.image_url_2) {
      set({
        image_url: d.image_url_2,
        image_url_2: null,
        spots: d.spots.filter((s) => s.image_index === 1).map((s) => ({ ...s, image_index: 0 })),
      });
      setActiveImage(0);
      return;
    }
    set(imageIndex === 0
      ? { image_url: '', spots: d.spots.filter((s) => s.image_index !== 0) }
      : { image_url_2: null, spots: d.spots.filter((s) => s.image_index !== 1) });
    setActiveImage(0);
  };

  const setSpot = (idx: number, patch: Partial<AdminLookSpot>) =>
    setD((prev) => ({ ...prev, spots: prev.spots.map((s, i) => (i === idx ? { ...s, ...patch } : s)) }));
  const addSpot = (x = 50, y = 50) => {
    if (!productOptions.length || !currentImage) return;
    setD((prev) => ({ ...prev, spots: [...prev.spots, { product_id: productOptions[0].value, x, y, image_index: activeImage }] }));
  };
  const removeSpot = (idx: number) => setD((prev) => ({ ...prev, spots: prev.spots.filter((_, i) => i !== idx) }));
  const currentSpots = d.spots
    .map((spot, index) => ({ spot, index }))
    .filter(({ spot }) => spot.image_index === activeImage);

  return (
    <form className="admin-section admin-look-card" noValidate onSubmit={(e) => {
      e.preventDefault();
      if (!d.title.trim()) return onError('Add a title for this look.');
      if (!d.image_url) return onError('Upload the primary look image first.');
      onSave({ id: isNew ? undefined : d.id, title: d.title, image_url: d.image_url, image_url_2: d.image_url_2, is_active: d.is_active, display_order: d.display_order, spots: d.spots });
    }}>
      <div className="admin-cardhead">
        <div>
          <span className="admin-cardhead__eyebrow">{slotNumber ? `Website position · ${slotNumber === 1 ? 'Left' : 'Right'}` : `Look ${String(d.display_order + 1).padStart(2, '0')}`}</span>
          <h2>{slotNumber ? `Look ${slotNumber}${d.title ? ` · ${d.title}` : ''}` : (d.title || 'Untitled look')}</h2>
        </div>
        <label className="admin-switch"><input type="checkbox" checked={d.is_active} onChange={(e) => set({ is_active: e.target.checked })} /><span /> <b>{d.is_active ? 'Published' : 'Draft'}</b></label>
      </div>

      <div className="admin-fieldrow">
        <label className="admin-field">
          <span className="admin-field__label">Title</span>
          <input type="text" value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="The daily carry" />
        </label>
        <label className="admin-field admin-field--compact">
          <span className="admin-field__label">Display order</span>
          <input type="text" inputMode="numeric" value={d.display_order} onChange={(e) => set({ display_order: Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0) })} />
          <span className="admin-field__hint">Lower numbers appear first.</span>
        </label>
      </div>

      <div className="admin-field">
        <div className="admin-field__rowlabel"><span className="admin-field__label">Look photos</span><span className="admin-field__hint">Up to 2 images · JPG, PNG, or WebP</span></div>
        <div className="admin-look-media-grid">
          {images.map((url, imageIndex) => (
            <div className={`admin-look-media ${activeImage === imageIndex ? 'is-selected' : ''}`} key={imageIndex}>
              <button type="button" className="admin-look-media__select" onClick={() => { setActiveImage(imageIndex); if (!url) fileRefs.current[imageIndex]?.click(); }} aria-pressed={activeImage === imageIndex}>
                {url ? <img src={url} alt={`Look image ${imageIndex + 1}`} loading="lazy" /> : <span><Icon>add_photo_alternate</Icon><strong>{imageIndex === 0 ? 'Add primary image' : 'Add second image'}</strong><small>{imageIndex === 0 ? 'Required' : 'Optional'}</small></span>}
              </button>
              <div className="admin-look-media__footer">
                <span>Image {imageIndex + 1}{imageIndex === 0 ? ' · Primary' : ' · Optional'}</span>
                <div>
                  {url && <button type="button" className="admin-btn admin-btn--ghost" onClick={() => removeImage(imageIndex)} disabled={uploading !== null} aria-label={`Remove image ${imageIndex + 1}`}><Icon>delete</Icon></button>}
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => fileRefs.current[imageIndex]?.click()} disabled={uploading !== null} aria-label={`${url ? 'Replace' : 'Upload'} image ${imageIndex + 1}`}><Icon>{uploading === imageIndex ? 'progress_activity' : url ? 'swap_horiz' : 'upload'}</Icon></button>
                </div>
              </div>
              <input ref={(node) => { fileRefs.current[imageIndex] = node; }} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onFile(e.target.files?.[0], imageIndex)} hidden />
            </div>
          ))}
        </div>
      </div>

      <div className="admin-hotspot-header">
        <div><span className="admin-field__label">Product hotspots</span><p className="admin-field__hint">Choose a photo, then click on it to place a product marker.</p></div>
        <button type="button" className="admin-btn admin-btn--outline" onClick={() => addSpot()} disabled={!productOptions.length || !currentImage}><Icon>add</Icon> Add hotspot</button>
      </div>

      <div className="admin-image-tabs" role="tablist" aria-label="Choose look photo">
        {images.map((url, imageIndex) => <button type="button" role="tab" aria-selected={activeImage === imageIndex} className={activeImage === imageIndex ? 'is-active' : ''} onClick={() => setActiveImage(imageIndex)} key={imageIndex} disabled={!url}>Image {imageIndex + 1}{url ? ` · ${d.spots.filter((s) => s.image_index === imageIndex).length} hotspots` : ' · empty'}</button>)}
      </div>

      <HotspotCanvas image={currentImage} spots={currentSpots.map(({ spot }) => spot)} onMove={(visibleIndex, x, y) => setSpot(currentSpots[visibleIndex].index, { x, y })} onAdd={(x, y) => addSpot(x, y)} />

      {currentSpots.length > 0 && (
        <div className="admin-hotspot-list">
          {currentSpots.map(({ spot: s, index }, i) => (
            <div className="admin-hotspot-row" key={s.id ?? `${activeImage}-${index}`}>
              <span className="admin-hotspot-num">{i + 1}</span>
              <Select value={s.product_id ?? ''} onChange={(v) => setSpot(index, { product_id: v })} options={productOptions} />
              <span className="admin-hotspot-coord">{Math.round(s.x)}% · {Math.round(s.y)}%</span>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => removeSpot(index)} aria-label="Remove hotspot"><Icon>delete</Icon></button>
            </div>
          ))}
        </div>
      )}

      <div className="admin-sticky-actions">
        <button type="submit" className="admin-btn admin-btn--dark" disabled={busy || uploading !== null || !d.image_url}><Icon>save</Icon> {busy ? 'Saving…' : isNew ? `Create Look ${slotNumber ?? ''}`.trim() : 'Save changes'}</button>
        {onDelete && <button type="button" className="admin-btn admin-btn--danger" onClick={onDelete} disabled={busy}><Icon>delete</Icon> Delete look</button>}
        <span className="admin-save-hint">{d.is_active ? 'Visible on homepage when saved' : 'Saved as draft'}</span>
      </div>
    </form>
  );
}

// Coordinates are stored as percentages so the markers remain correct at any display size.
function HotspotCanvas({ image, spots, onMove, onAdd }: {
  image: string;
  spots: AdminLookSpot[];
  onMove: (idx: number, x: number, y: number) => void;
  onAdd: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragIdx = useRef<number | null>(null);
  const moved = useRef(false);

  const pct = (cx: number, cy: number) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: Math.min(100, Math.max(0, ((cx - r.left) / r.width) * 100)), y: Math.min(100, Math.max(0, ((cy - r.top) / r.height) * 100)) };
  };
  const startDrag = (e: React.PointerEvent, idx: number) => {
    e.stopPropagation(); dragIdx.current = idx; moved.current = false; (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const onMoveEv = (e: React.PointerEvent) => {
    if (dragIdx.current === null) return;
    moved.current = true; const { x, y } = pct(e.clientX, e.clientY); onMove(dragIdx.current, Math.round(x), Math.round(y));
  };
  const onCanvasClick = (e: React.MouseEvent) => {
    if (moved.current) { moved.current = false; return; }
    if (!(e.target as HTMLElement).dataset.bg) return;
    const { x, y } = pct(e.clientX, e.clientY); onAdd(Math.round(x), Math.round(y));
  };

  return (
    <div className="admin-hotspot-canvas" ref={ref} onPointerDown={() => { moved.current = false; }} onPointerMove={onMoveEv} onPointerUp={() => { dragIdx.current = null; }} onPointerLeave={() => { dragIdx.current = null; }} onClick={onCanvasClick}>
      {image ? <img src={image} alt="Selected look" data-bg="1" draggable={false} loading="lazy" /> : <div className="admin-hotspot-empty" data-bg="1"><Icon>image</Icon><span>Upload an image to place hotspots.</span></div>}
      {image && spots.map((s, i) => <div key={s.id ?? i} className="admin-hotspot-marker" style={{ left: `${s.x}%`, top: `${s.y}%` }} onPointerDown={(e) => startDrag(e, i)}><span>{i + 1}</span></div>)}
      {image && <span className="admin-hotspot-hint">Click to add · drag to move</span>}
    </div>
  );
}
