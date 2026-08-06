'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { useToast, Toast } from '@/components/admin/Toast';
import { Confirm } from '@/components/admin/Confirm';
import { AdminHero, listHeroes, addHero, updateHero, deleteHero, uploadImage } from '@/lib/admin/queries';

export default function AdminHeroesPage() {
  const [heroes, setHeroes] = useState<AdminHero[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [toDelete, setToDelete] = useState<AdminHero | null>(null);
  const [edits, setEdits] = useState<Record<string, { alt_text: string; caption: string }>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast, ok, err, clear } = useToast();

  const load = () => { listHeroes().then(setHeroes).catch((e) => { setHeroes([]); err(e instanceof Error ? e.message : 'Load failed.'); }); };
  useEffect(load, []);

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const img = await uploadImage(file);
        await addHero(img.image_url);
      }
      ok('Hero image(s) added.');
      load();
    } catch (e) {
      err(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    if (!heroes) return;
    const j = idx + dir;
    if (j < 0 || j >= heroes.length) return;
    const a = heroes[idx]; const b = heroes[j];
    setBusy(true);
    try {
      await updateHero(a.id, { display_order: b.display_order });
      await updateHero(b.id, { display_order: a.display_order });
      load();
    } catch (e) { err(e instanceof Error ? e.message : 'Reorder failed.'); }
    finally { setBusy(false); }
  };

  const toggle = async (h: AdminHero) => {
    setBusy(true);
    try { await updateHero(h.id, { is_active: !h.is_active }); load(); }
    catch (e) { err(e instanceof Error ? e.message : 'Update failed.'); }
    finally { setBusy(false); }
  };

  const saveMeta = async (hero: AdminHero) => {
    const edit = edits[hero.id] ?? { alt_text: hero.alt_text, caption: hero.caption };
    if (!edit.alt_text.trim()) return err('Add accessible alt text for this hero image.');
    setBusy(true);
    try { await updateHero(hero.id, { alt_text: edit.alt_text.trim(), caption: edit.caption.trim() }); ok('Hero text updated.'); setEdits((prev) => { const next = { ...prev }; delete next[hero.id]; return next; }); load(); }
    catch (e) { err(e instanceof Error ? e.message : 'Update failed.'); }
    finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try { await deleteHero(toDelete.id); ok('Hero removed.'); setToDelete(null); load(); }
    catch (e) { err(e instanceof Error ? e.message : 'Delete failed.'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <h1>Hero images</h1>
          <p>Homepage carousel slides. First image is the opening view; order is left-to-right.</p>
        </div>
      </div>

      <label
        className={`admin-dropzone ${drag ? 'is-drag' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
      >
        <Icon>cloud_upload</Icon>
        <span>{busy ? 'Working…' : 'Click or drop images to add hero slides'}</span>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
      </label>

      {!heroes ? <div className="admin-loading"><Icon>progress_activity</Icon></div> : heroes.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: '1rem' }}><Icon>photo_library</Icon><p>No hero images yet. The storefront falls back to its default slides until you add one.</p></div>
      ) : (
        <div className="admin-images" style={{ marginTop: '1rem' }}>
          {heroes.map((h, i) => (
            <div className="admin-image admin-hero-card" key={h.id}>
              <img src={h.image_url} alt={h.alt_text} />
              {!h.is_active && <span className="admin-image__primary" style={{ background: '#8a8178' }}>Hidden</span>}
              <div className="admin-image__actions">
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => move(i, -1)} disabled={busy || i === 0} aria-label="Move left"><Icon>chevron_left</Icon></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={busy || i === heroes.length - 1} aria-label="Move right"><Icon>chevron_right</Icon></button>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => toggle(h)} disabled={busy} aria-label={h.is_active ? 'Hide' : 'Show'}><Icon>{h.is_active ? 'visibility' : 'visibility_off'}</Icon></button>
                  <button type="button" onClick={() => setToDelete(h)} disabled={busy} aria-label="Delete"><Icon>delete</Icon></button>
                </div>
              </div>
              <div className="admin-hero-meta">
                <label className="admin-field"><span className="admin-field__label">Image alt text</span><input type="text" value={edits[h.id]?.alt_text ?? h.alt_text} onChange={(e) => setEdits((prev) => ({ ...prev, [h.id]: { alt_text: e.target.value, caption: prev[h.id]?.caption ?? h.caption } }))} /></label>
                <label className="admin-field"><span className="admin-field__label">Caption</span><input type="text" value={edits[h.id]?.caption ?? h.caption} onChange={(e) => setEdits((prev) => ({ ...prev, [h.id]: { alt_text: prev[h.id]?.alt_text ?? h.alt_text, caption: e.target.value } }))} placeholder="Full-grain leather / Bali, Indonesia" /></label>
                <button type="button" className="admin-btn admin-btn--outline" onClick={() => saveMeta(h)} disabled={busy}><Icon>save</Icon> Save image details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Confirm open={!!toDelete} title="Remove hero image?" body="The slide will be removed from the carousel (the stored file is kept)." busy={busy} onConfirm={confirmDelete} onCancel={() => !busy && setToDelete(null)} />
      <Toast toast={toast} onDone={clear} />
    </>
  );
}
