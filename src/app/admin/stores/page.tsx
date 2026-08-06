'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { useToast, Toast } from '@/components/admin/Toast';
import { Confirm } from '@/components/admin/Confirm';
import { AdminStore, listStores, saveStore, deleteStore } from '@/lib/admin/queries';

const EMPTY: Omit<AdminStore, 'id'> = {
  name: '', address: '', phone: '', phone_href: '', email: '', hours: '', map_query: '', display_order: 0, is_active: true,
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<AdminStore[] | null>(null);
  const [toDelete, setToDelete] = useState<AdminStore | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast, ok, err, clear } = useToast();

  const load = () => { listStores().then(setStores).catch((e) => { setStores([]); err(e instanceof Error ? e.message : 'Load failed.'); }); };
  useEffect(load, []);

  const save = async (input: Partial<AdminStore> & { id?: string }) => {
    if (!input.name?.trim()) return err('Store name is required.');
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return err('Enter a valid store email.');
    setBusy(true);
    try {
      await saveStore(input);
      ok(input.id ? 'Store updated.' : 'Store added.');
      load();
    } catch (e) { err(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try { await deleteStore(toDelete.id); ok('Store deleted.'); setToDelete(null); load(); }
    catch (e) { err(e instanceof Error ? e.message : 'Delete failed.'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <h1>Stores</h1>
          <p>Contact page ateliers. The first active store opens selected on the map.</p>
        </div>
      </div>

      <StoreCard key="new" initial={EMPTY} isNew busy={busy} onSave={save} />

      {!stores ? <div className="admin-loading"><Icon>progress_activity</Icon></div> : stores.length === 0 ? (
        <div className="admin-empty"><Icon>storefront</Icon><p>No stores yet. Add the first atelier above.</p></div>
      ) : stores.map((s) => (
        <StoreCard key={s.id} initial={s} busy={busy} onSave={save} onDelete={() => setToDelete(s)} />
      ))}

      <Confirm open={!!toDelete} title="Delete store?" body={`“${toDelete?.name}” will be removed from the Contact page.`} busy={busy} onConfirm={confirmDelete} onCancel={() => !busy && setToDelete(null)} />
      <Toast toast={toast} onDone={clear} />
    </>
  );
}

function StoreCard({ initial, isNew, busy, onSave, onDelete }: {
  initial: Omit<AdminStore, 'id'> | AdminStore;
  isNew?: boolean;
  busy: boolean;
  onSave: (input: Partial<AdminStore> & { id?: string }) => void;
  onDelete?: () => void;
}) {
  const [d, setD] = useState(initial);
  const id = 'id' in initial ? initial.id : undefined;
  const set = (patch: Partial<typeof d>) => setD((prev) => ({ ...prev, ...patch }));

  return (
    <form className="admin-section" noValidate onSubmit={(e) => { e.preventDefault(); onSave({ ...d, id }); }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2>{isNew ? 'Add store' : (d.name || 'Untitled store')}</h2>
        <label className="admin-checkbox"><input type="checkbox" checked={d.is_active} onChange={(e) => set({ is_active: e.target.checked })} /> Active</label>
      </div>
      <div className="admin-fieldrow">
        <label className="admin-field"><span className="admin-field__label">Name</span><input type="text" value={d.name} onChange={(e) => set({ name: e.target.value })} /></label>
        <label className="admin-field"><span className="admin-field__label">Hours</span><input type="text" value={d.hours} onChange={(e) => set({ hours: e.target.value })} placeholder="Mon–Sat · 09:00–19:00" /></label>
      </div>
      <div className="admin-fieldrow">
        <label className="admin-field"><span className="admin-field__label">Phone (display)</span><input type="text" value={d.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+62 818 …" /></label>
        <label className="admin-field"><span className="admin-field__label">Phone link (tel:)</span><input type="text" value={d.phone_href} onChange={(e) => set({ phone_href: e.target.value })} placeholder="+62818…" /></label>
      </div>
      <label className="admin-field"><span className="admin-field__label">Email</span><input type="text" inputMode="email" value={d.email} onChange={(e) => set({ email: e.target.value })} placeholder="hello@prabaleather.com" /></label>
      <label className="admin-field"><span className="admin-field__label">Address</span><input type="text" value={d.address} onChange={(e) => set({ address: e.target.value })} /></label>
      <label className="admin-field"><span className="admin-field__label">Map query</span><input type="text" value={d.map_query} onChange={(e) => set({ map_query: e.target.value })} placeholder="Jl. Nelayan, Canggu, Bali" /></label>
      <div className="admin-sticky-actions">
        <button type="submit" className="admin-btn admin-btn--dark" disabled={busy}><Icon>save</Icon> {isNew ? 'Add store' : 'Save changes'}</button>
        {onDelete && <button type="button" className="admin-btn admin-btn--danger" onClick={onDelete} disabled={busy}><Icon>delete</Icon> Delete</button>}
      </div>
    </form>
  );
}
