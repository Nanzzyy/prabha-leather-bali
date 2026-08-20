'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import AdminPageHead from '@/components/admin/AdminPageHead';
import { Confirm } from '@/components/admin/Confirm';
import { Toast, useToast } from '@/components/admin/Toast';
import {
  deletePromoCampaign,
  getPromoSettings,
  listProducts,
  listPromoCampaigns,
  savePromoCampaign,
  savePromoSettings,
  type AdminProduct,
  type AdminPromoCampaign,
} from '@/lib/admin/queries';

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
  prices: Record<string, string>;
};

const emptyDraft = (): Draft => ({ name: '', slug: '', description: '', is_active: false, display_order: 0, prices: {} });

export default function AdminPromosPage() {
  const [campaigns, setCampaigns] = useState<AdminPromoCampaign[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [menuEnabled, setMenuEnabled] = useState(false);
  const [navCampaignId, setNavCampaignId] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [toDelete, setToDelete] = useState<AdminPromoCampaign | null>(null);
  const { toast, ok, err, clear } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextCampaigns, nextProducts, nextSettings] = await Promise.all([listPromoCampaigns(), listProducts(), getPromoSettings()]);
      setCampaigns(nextCampaigns);
      setProducts(nextProducts);
      setMenuEnabled(nextSettings.is_enabled);
      setNavCampaignId(nextSettings.nav_campaign_id ?? '');
      setSchemaMissing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Promotions could not be loaded.';
      setSchemaMissing(/promo_campaign|promo_item|promo_settings|schema cache|does not exist|404/i.test(message));
      err(message);
    } finally {
      setLoading(false);
    }
  }, [err]);

  // The effect starts the remote CMS read when the page mounts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const selectedCount = Object.keys(draft.prices).length;
  const selectedProducts = useMemo(
    () => products.filter((product) => Object.prototype.hasOwnProperty.call(draft.prices, product.id)),
    [draft.prices, products],
  );
  const activeCampaigns = useMemo(() => campaigns.filter((campaign) => campaign.is_active), [campaigns]);

  const saveMenu = async () => {
    if (menuEnabled && !navCampaignId) { err('Choose an active campaign before enabling the menu.'); return; }
    setSavingSettings(true);
    try {
      await savePromoSettings(menuEnabled, navCampaignId || null);
      ok(menuEnabled ? 'Promotional menu enabled.' : 'Promotional menu disabled.');
    } catch (error) {
      err(error instanceof Error ? error.message : 'Promotional menu settings could not be saved.');
    } finally {
      setSavingSettings(false);
    }
  };

  const edit = (campaign: AdminPromoCampaign) => {
    setDraft({
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      description: campaign.description,
      is_active: campaign.is_active,
      display_order: campaign.display_order,
      prices: Object.fromEntries(campaign.items.map((item) => [item.product_id, String(item.promo_price_usd)])),
    });
    setSlugTouched(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newCampaign = () => {
    setDraft(emptyDraft());
    setSlugTouched(false);
  };

  const toggleProduct = (product: AdminProduct) => {
    setDraft((current) => {
      const prices = { ...current.prices };
      if (Object.prototype.hasOwnProperty.call(prices, product.id)) delete prices[product.id];
      else prices[product.id] = String(product.base_price_usd);
      return { ...current, prices };
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.slug.trim()) { err('Campaign name and slug are required.'); return; }
    const invalid = selectedProducts.find((product) => {
      const price = Number(draft.prices[product.id]);
      return !Number.isFinite(price) || price < 0 || price > product.base_price_usd;
    });
    if (invalid) { err(`Promo price for “${invalid.title}” must be between $0 and its normal price.`); return; }

    setSaving(true);
    try {
      const savedId = await savePromoCampaign({
        id: draft.id,
        name: draft.name,
        slug: draft.slug,
        description: draft.description,
        is_active: draft.is_active,
        display_order: draft.display_order,
        items: selectedProducts.map((product) => ({ product_id: product.id, promo_price_usd: Number(draft.prices[product.id]) })),
      });
      setDraft((current) => ({ ...current, id: savedId }));
      ok(`“${draft.name}” saved.`);
      await load();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Promotion could not be saved.';
      err(/duplicate|23505/i.test(message) ? 'That campaign slug already exists.' : message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      await deletePromoCampaign(toDelete.id);
      ok(`“${toDelete.name}” deleted.`);
      setToDelete(null);
      newCampaign();
      await load();
    } catch (error) {
      err(error instanceof Error ? error.message : 'Promotion could not be deleted.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHead
        eyebrow="Catalog management"
        title="Promotions"
        description="Create named promotional menus and assign existing products with their discounted prices."
        actions={<button type="button" className="admin-btn admin-btn--outline" onClick={newCampaign}><Icon>add</Icon>New promotion</button>}
      />

      {schemaMissing && <div className="admin-collection-notice" role="status"><Icon>database</Icon><div><strong>Database setup is required</strong><span>Run <code>supabase/promo-campaigns.sql</code> in the Supabase SQL Editor, then reload this page.</span></div><button type="button" className="admin-btn admin-btn--outline" onClick={load}>Reload</button></div>}

      {!loading && <section className="admin-promo-menu-settings admin-card"><div className="admin-cardhead"><div><span className="admin-cardhead__eyebrow">Website navigation</span><h2>Promotional menu</h2></div><Icon>web</Icon></div><div className="admin-promo-menu-settings__body"><label className="admin-checkbox"><input type="checkbox" checked={menuEnabled} onChange={(event) => setMenuEnabled(event.target.checked)} /><span>Show promotional menu in the website navbar</span></label><label className="admin-field"><span className="admin-field__label">Menu destination and name</span><select value={navCampaignId} onChange={(event) => setNavCampaignId(event.target.value)}><option value="">Choose an active campaign</option>{activeCampaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name} · /{campaign.slug}/</option>)}</select><span className="admin-field__hint">The navbar label follows the selected campaign name and links directly to its custom slug.</span></label><button type="button" className="admin-btn admin-btn--dark" onClick={saveMenu} disabled={savingSettings || schemaMissing}><Icon>save</Icon>{savingSettings ? 'Saving…' : 'Save menu settings'}</button></div></section>}

      {loading ? <div className="admin-loading"><Icon>progress_activity</Icon><span>Loading promotions…</span></div> : <div className="admin-promo-workspace">
        <aside className="admin-promo-list" aria-label="Promotional campaigns">
          <div className="admin-cardhead"><div><span className="admin-cardhead__eyebrow">Menu campaigns</span><h2>Saved promotions</h2></div><strong>{campaigns.length}</strong></div>
          {campaigns.length === 0 ? <div className="admin-empty admin-empty--small"><Icon>local_offer</Icon><p>No promotions yet.</p></div> : <div className="admin-promo-list__items">{campaigns.map((campaign) => <button type="button" key={campaign.id} className={`admin-promo-list__item ${draft.id === campaign.id ? 'is-selected' : ''}`} onClick={() => edit(campaign)}><span><strong>{campaign.name}</strong><small>{campaign.items.length} {campaign.items.length === 1 ? 'item' : 'items'} · {campaign.is_active ? 'Visible on website' : 'Hidden'}</small></span><Icon>chevron_right</Icon></button>)}</div>}
        </aside>

        <form className="admin-promo-editor admin-card" onSubmit={save}>
          <div className="admin-cardhead"><div><span className="admin-cardhead__eyebrow">{draft.id ? 'Edit campaign' : 'New campaign'}</span><h2>{draft.name || 'Untitled promotion'}</h2></div>{draft.id && <button type="button" className="admin-btn admin-btn--danger" onClick={() => setToDelete(campaigns.find((campaign) => campaign.id === draft.id) ?? null)}><Icon>delete</Icon>Delete</button>}</div>
          <div className="admin-fieldrow">
            <label className="admin-field"><span className="admin-field__label">Menu name</span><input value={draft.name} onChange={(event) => { const name = event.target.value; setDraft((current) => ({ ...current, name, slug: slugTouched ? current.slug : slugify(name) })); }} placeholder="Summer Sale" required /></label>
            <label className="admin-field"><span className="admin-field__label">URL slug</span><input value={draft.slug} onChange={(event) => { setSlugTouched(true); setDraft((current) => ({ ...current, slug: slugify(event.target.value) })); }} placeholder="summer-sale" required /><span className="admin-field__hint">Website URL: /{draft.slug || 'summer-sale'}/</span></label>
          </div>
          <label className="admin-field"><span className="admin-field__label">Short description</span><textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="A seasonal selection at a considered price." rows={3} /></label>
          <div className="admin-fieldrow">
            <label className="admin-field"><span className="admin-field__label">Display order</span><input type="number" min="0" step="1" value={draft.display_order} onChange={(event) => setDraft((current) => ({ ...current, display_order: Number(event.target.value) }))} /></label>
            <label className="admin-checkbox" style={{ alignSelf: 'center' }}><input type="checkbox" checked={draft.is_active} onChange={(event) => setDraft((current) => ({ ...current, is_active: event.target.checked }))} /><span>Make this campaign available for the website menu</span></label>
          </div>

          <div className="admin-promo-products"><div className="admin-section-head"><div><span className="admin-cardhead__eyebrow">Promo items</span><h3>Select products and set prices</h3></div><strong>{selectedCount} selected</strong></div>{products.length === 0 ? <div className="admin-empty"><Icon>inventory_2</Icon><p>Create products first, then add them to a promotion.</p></div> : <div className="admin-promo-products__grid">{products.map((product) => { const selected = Object.prototype.hasOwnProperty.call(draft.prices, product.id); return <div className={`admin-promo-product ${selected ? 'is-selected' : ''}`} key={product.id}><button type="button" className="admin-promo-product__toggle" onClick={() => toggleProduct(product)} aria-pressed={selected}><span className="admin-promo-product__image">{product.images[0] ? <img src={product.images[0].image_url} alt="" loading="lazy" /> : <Icon>image</Icon>}</span><span><strong>{product.title}</strong><small>Normal price ${product.base_price_usd.toFixed(2)}</small></span><Icon>{selected ? 'check_circle' : 'add_circle_outline'}</Icon></button>{selected && <label className="admin-field admin-promo-product__price"><span className="admin-field__label">Promo price (USD)</span><input type="number" min="0" max={product.base_price_usd} step="0.01" value={draft.prices[product.id]} onChange={(event) => setDraft((current) => ({ ...current, prices: { ...current.prices, [product.id]: event.target.value } }))} /></label>}</div>; })}</div>}</div>

          <div className="admin-sticky-actions"><span className="admin-field__hint"><Icon>info</Icon> The selected active campaign controls the public menu.</span><button type="submit" className="admin-btn admin-btn--dark" disabled={saving || schemaMissing}><Icon>save</Icon>{saving ? 'Saving…' : 'Save promotion'}</button></div>
        </form>
      </div>}

      <Confirm open={Boolean(toDelete)} title="Delete promotion?" body={`“${toDelete?.name ?? ''}” and its product assignments will be removed.`} busy={saving} onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
      <Toast toast={toast} onDone={clear} />
    </>
  );
}
