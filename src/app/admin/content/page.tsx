'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from '@/components/Icon';
import Select from '@/components/Select';
import { IconPickerField } from '@/components/admin/IconLibrary';
import { Toast, useToast } from '@/components/admin/Toast';
import { Confirm } from '@/components/admin/Confirm';
import {
  CONTENT_SECTIONS,
  getDefaultContent,
  mergeSiteContent,
  normalizeCollectionSubcategory,
  type SeoPageKey,
  type SiteSeo,
  type ContentSection,
  type SiteContent,
} from '@/lib/content/defaults';
import { deleteContentSnapshot, listContentSnapshots, listSiteContent, restoreContentSnapshot, saveContentSnapshot, saveSiteContent, syncGlobalBrand, uploadImage, type AdminContentSnapshot } from '@/lib/admin/queries';

const SECTION_LABELS: Record<ContentSection, string> = {
  global: 'Global',
  home: 'Homepage',
  collection: 'Collection',
  catalog: 'Catalog',
  contact: 'Contact',
  about: 'About us',
};

type Locale = 'en' | 'id';

export default function AdminContentPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [section, setSection] = useState<ContentSection>('global');
  const [draft, setDraft] = useState<SiteContent>(() => getDefaultContent('en'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [safeBusy, setSafeBusy] = useState(false);
  const [snapshots, setSnapshots] = useState<AdminContentSnapshot[]>([]);
  const [safeSchemaMissing, setSafeSchemaMissing] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [restoreTarget, setRestoreTarget] = useState<AdminContentSnapshot | null>(null);
  const [savedDraft, setSavedDraft] = useState<SiteContent | null>(null);
  const { toast, ok, err, clear } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fallback = getDefaultContent(locale);
      const rows = await listSiteContent(locale);
      let next = fallback;
      for (const row of rows) {
        next = {
          ...next,
          [row.section]: mergeSiteContent(next[row.section], row.content as never),
        };
      }
      setDraft(next);
      setSavedDraft(next);
      try {
        const rows = await listContentSnapshots(locale);
        setSnapshots(rows);
        setSafeSchemaMissing(false);
      } catch (safeError) {
        const message = safeError && typeof safeError === 'object' && 'message' in safeError ? String(safeError.message) : '';
        if (/site_content_snapshots|schema cache|404|does not exist/i.test(message)) {
          setSafeSchemaMissing(true);
          setSnapshots([]);
        } else throw safeError;
      }
    } catch (error) {
      err(error instanceof Error ? error.message : 'Content could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [err, locale]);

  // The effect intentionally starts the remote CMS read when locale changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await saveSiteContent(locale, section, draft[section]);
      if (section === 'global') await syncGlobalBrand(draft.global.brand);
      try { window.sessionStorage.removeItem(`praba:content:${locale}`); } catch { /* storage can be unavailable */ }
      setSavedDraft((previous) => ({ ...(previous ?? draft), [section]: draft[section] }));
      ok(`${SECTION_LABELS[section]} content saved.`);
    } catch (error) {
      err(error instanceof Error ? error.message : 'Content could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = <K extends ContentSection>(key: K, value: SiteContent[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  const isSectionDirty = (key: ContentSection) => savedDraft !== null && JSON.stringify(draft[key]) !== JSON.stringify(savedDraft[key]);
  const changeSection = (next: ContentSection) => {
    if (next === section) return;
    if (isSectionDirty(section) && !window.confirm(`The ${SECTION_LABELS[section]} section has unsaved changes. Switch sections and discard them?`)) return;
    setSection(next);
  };

  const createSafeVersion = async () => {
    setSafeBusy(true);
    try {
      const rows = await listSiteContent(locale);
      let published = getDefaultContent(locale);
      for (const row of rows) published = { ...published, [row.section]: mergeSiteContent(published[row.section], row.content as never) };
      const snapshot = await saveContentSnapshot(locale, published, snapshotLabel);
      setSnapshots((previous) => [snapshot, ...previous]);
      setSnapshotLabel('');
      setSafeSchemaMissing(false);
      ok(`Safe version saved for ${locale.toUpperCase()}.`);
    } catch (error) {
      err(error instanceof Error ? error.message : 'Safe version could not be saved.');
    } finally {
      setSafeBusy(false);
    }
  };

  const restoreSafeVersion = async () => {
    if (!restoreTarget) return;
    setSafeBusy(true);
    try {
      await restoreContentSnapshot(restoreTarget.id);
      setRestoreTarget(null);
      await load();
      ok(`Restored snapshot from ${new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(restoreTarget.created_at))}.`);
    } catch (error) {
      err(error instanceof Error ? error.message : 'Snapshot could not be restored.');
    } finally {
      setSafeBusy(false);
    }
  };

  const removeSnapshot = async (snapshot: AdminContentSnapshot) => {
    setSafeBusy(true);
    try {
      await deleteContentSnapshot(snapshot.id);
      setSnapshots((previous) => previous.filter((item) => item.id !== snapshot.id));
      ok('Snapshot removed.');
    } catch (error) {
      err(error instanceof Error ? error.message : 'Snapshot could not be removed.');
    } finally {
      setSafeBusy(false);
    }
  };

  return (
    <>
      <div className="admin-pagehead admin-content-pagehead">
        <div>
          <div className="admin-breadcrumb"><Icon>edit_note</Icon> Website content</div>
          <h1>Content manager</h1>
          <p>Change the words, links, and images that shape the storefront. Choose a page, edit, then save.</p>
        </div>
        <div className="admin-content-locale">
          <span className="admin-field__label">Editing language</span>
          <Select
            value={locale}
            onChange={(value) => { if (!isSectionDirty(section) || window.confirm(`The ${SECTION_LABELS[section]} section has unsaved changes. Change language and discard them?`)) setLocale(value as Locale); }}
            options={[{ value: 'en', label: 'English (EN)' }, { value: 'id', label: 'Bahasa Indonesia (ID)' }]}
          />
        </div>
      </div>

      <section className={`admin-safe-version ${safeSchemaMissing ? 'admin-safe-version--setup' : ''}`}>
        <div className="admin-safe-version__icon"><Icon>{safeSchemaMissing ? 'database' : 'verified_user'}</Icon></div>
        <div className="admin-safe-version__copy"><strong>Safe website versions · {locale.toUpperCase()}</strong><span>{safeSchemaMissing ? <><code>supabase/cms-safe-version-history.sql</code> must be run first.</> : 'Save the current published website before experimenting. Restore any saved version if an edit looks wrong.'}</span></div>
        {!safeSchemaMissing && <div className="admin-safe-version__actions">
          <label className="admin-field admin-safe-version__label"><span className="admin-field__label">Label (optional)</span><input type="text" value={snapshotLabel} onChange={(event) => setSnapshotLabel(event.target.value)} placeholder="e.g. Before homepage rewrite" /></label>
          <button type="button" className="admin-btn admin-btn--outline" onClick={createSafeVersion} disabled={safeBusy || loading}><Icon>shield</Icon>Save safe version</button>
        </div>}
        {!safeSchemaMissing && snapshots.length > 0 && <ul className="admin-safe-version__history">
          {snapshots.map((snapshot) => <li key={snapshot.id}>
            <div className="admin-safe-version__meta"><Icon>history</Icon><div><strong>{snapshot.label || 'Untitled snapshot'}</strong><span>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(snapshot.created_at))}</span></div></div>
            <div className="admin-safe-version__row-actions"><button type="button" className="admin-btn admin-btn--dark" onClick={() => setRestoreTarget(snapshot)} disabled={safeBusy}><Icon>restore</Icon>Restore</button><button type="button" className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip="Delete snapshot" title="Delete snapshot" onClick={() => removeSnapshot(snapshot)} disabled={safeBusy} aria-label="Delete snapshot"><Icon>delete</Icon></button></div>
          </li>)}
        </ul>}
      </section>

      <div className="admin-content-layout">
        <aside className="admin-content-nav" aria-label="Content sections">
          <span className="admin-sidebar__group-label">Pages & areas</span>
          {CONTENT_SECTIONS.map((key) => (
            <button type="button" key={key} className={section === key ? 'is-active' : ''} onClick={() => changeSection(key)}>
              <Icon>{sectionIcon(key)}</Icon><span>{SECTION_LABELS[key]}{isSectionDirty(key) && <span className="admin-dirty-dot" title="Unsaved changes" aria-label="Unsaved changes" />}</span><Icon>chevron_right</Icon>
            </button>
          ))}
        </aside>

        <section className="admin-content-editor">
          <div className="admin-content-editor__head">
            <div><span className="admin-cardhead__eyebrow">{SECTION_LABELS[section]} · {locale.toUpperCase()}</span><h2>Edit {SECTION_LABELS[section].toLowerCase()}</h2></div>
            <button type="button" className="admin-btn admin-btn--dark" onClick={save} disabled={saving || loading}><Icon>save</Icon>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
          {loading ? <div className="admin-loading"><Icon>progress_activity</Icon><span>Loading content…</span></div> : <ContentSectionEditor section={section} content={draft} updateSection={updateSection} onError={err} />}
          {!loading && <div className="admin-content-editor__footer"><Icon>info</Icon><span>Unsaved changes stay on this page until you save this section.</span><button type="button" className="admin-btn admin-btn--outline" onClick={load}>Discard changes</button></div>}
        </section>
      </div>
      <Confirm open={!!restoreTarget} title="Restore this safe version?" body={`All currently published text, links, and image references for ${locale.toUpperCase()} will be replaced by this snapshot${restoreTarget?.label ? ` (${restoreTarget.label})` : ''}. You can continue editing after restore.`} confirmLabel="Restore safe version" busy={safeBusy} onConfirm={restoreSafeVersion} onCancel={() => !safeBusy && setRestoreTarget(null)} />
      <Toast toast={toast} onDone={clear} />
    </>
  );
}

function ContentSectionEditor({ section, content, updateSection, onError }: {
  section: ContentSection;
  content: SiteContent;
  updateSection: <K extends ContentSection>(key: K, value: SiteContent[K]) => void;
  onError: (message: string) => void;
}) {
  if (section === 'global') return <GlobalEditor value={content.global} onChange={(value) => updateSection('global', value)} onError={onError} />;
  if (section === 'home') return <HomeEditor value={content.home} onChange={(value) => updateSection('home', value)} />;
  if (section === 'collection') return <CollectionEditor value={content.collection} onChange={(value) => updateSection('collection', value)} onError={onError} />;
  if (section === 'catalog') return <CatalogEditor value={content.catalog} onChange={(value) => updateSection('catalog', value)} />;
  if (section === 'contact') return <ContactEditor value={content.contact} onChange={(value) => updateSection('contact', value)} />;
  return <AboutEditor value={content.about} onChange={(value) => updateSection('about', value)} onError={onError} />;
}

function GlobalEditor({ value, onChange, onError }: { value: SiteContent['global']; onChange: (value: SiteContent['global']) => void; onError: (message: string) => void }) {
  return (
    <div className="admin-content-form">
      <EditorCard title="Navbar logo" description="Shared by the English and Indonesian storefronts. Use a transparent PNG, WebP, or SVG for the cleanest result.">
        <ImageField label="Logo image" value={value.brand} onChange={(brand) => onChange({ ...value, brand })} onError={onError} contain />
      </EditorCard>
      <SeoEditor value={value.seo} onChange={(seo) => onChange({ ...value, seo })} onError={onError} />
      <EditorCard title="Main navigation" description="Labels shown in the header and primary menus.">
        <StringFields values={value.nav} onChange={(key, next) => onChange({ ...value, nav: { ...value.nav, [key]: next } })} />
      </EditorCard>
      <EditorCard title="Header actions">
        <StringFields values={value.header} onChange={(key, next) => onChange({ ...value, header: { ...value.header, [key]: next } })} />
      </EditorCard>
      <EditorCard title="Footer and contact details" description="These values are also used by the footer's contact links.">
        <StringFields values={value.footer} multilineKeys={['tagline', 'handcrafted']} onChange={(key, next) => onChange({ ...value, footer: { ...value.footer, [key]: next } })} />
      </EditorCard>
      <EditorCard title="Order pouch">
        <StringFields values={value.cart} multilineKeys={['emptyBody', 'notes', 'confirmation']} onChange={(key, next) => onChange({ ...value, cart: { ...value.cart, [key]: next } })} />
      </EditorCard>
    </div>
  );
}

const SEO_PAGE_KEYS: Array<{ key: SeoPageKey; label: string }> = [
  { key: 'home', label: 'Homepage' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'collection', label: 'Collection' },
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms of Service' },
  { key: 'cookies', label: 'Cookies' },
  { key: 'product', label: 'Product detail' },
  { key: 'collectionDetail', label: 'Collection detail' },
];

function SeoEditor({ value, onChange, onError }: { value: SiteSeo; onChange: (value: SiteSeo) => void; onError: (message: string) => void }) {
  const set = <K extends keyof SiteSeo>(key: K, next: SiteSeo[K]) => onChange({ ...value, [key]: next });
  return <>
    <EditorCard title="SEO defaults" description="These values are rendered in the initial HTML head for search engines and social sharing. Keep titles concise and descriptions specific to Praba Leather Bali.">
      <FieldGrid fields={[
        <TextField key="siteName" label="Site name" value={value.siteName} onChange={(next) => set('siteName', next)} />,
        <TextField key="siteTitle" label="Meta title" value={value.siteTitle} onChange={(next) => set('siteTitle', next)} hint="Default site title · Recommended: 50–60 characters." />,
        <TextField key="siteDescription" label="Meta description" value={value.siteDescription} onChange={(next) => set('siteDescription', next)} multiline hint="Default site description · Recommended: 140–160 characters." />,
        <TextField key="keywords" label="Keywords" value={value.keywords} onChange={(next) => set('keywords', next)} hint="Separate phrases with commas." />,
        <TextField key="canonicalUrl" label="Canonical site URL" value={value.canonicalUrl} onChange={(next) => set('canonicalUrl', next)} hint="Use the public HTTPS domain without a trailing slash." />,
        <TextField key="robots" label="Robots directive" value={value.robots} onChange={(next) => set('robots', next)} hint="Example: index,follow or noindex,nofollow." />,
      ]} />
    </EditorCard>
    <EditorCard title="Open Graph & Twitter" description="Controls previews when pages are shared on WhatsApp, Instagram, Facebook, X, and other link-preview clients.">
      <FieldGrid fields={[
        <TextField key="ogTitle" label="Open Graph title" value={value.ogTitle} onChange={(next) => set('ogTitle', next)} />,
        <TextField key="ogDescription" label="Open Graph description" value={value.ogDescription} onChange={(next) => set('ogDescription', next)} multiline />,
        <TextField key="twitterTitle" label="Twitter title" value={value.twitterTitle} onChange={(next) => set('twitterTitle', next)} />,
        <TextField key="twitterDescription" label="Twitter description" value={value.twitterDescription} onChange={(next) => set('twitterDescription', next)} multiline />,
      ]} />
      <ImageField label="Open Graph image" value={value.ogImage} onChange={(ogImage) => set('ogImage', ogImage)} onError={onError} />
      <ImageField label="Twitter image" value={value.twitterImage} onChange={(twitterImage) => set('twitterImage', twitterImage)} onError={onError} />
    </EditorCard>
    <EditorCard title="Favicon" description="Upload a square PNG, SVG, or ICO. The selected icon is emitted as the browser favicon in the rendered document head.">
      <ImageField label="Favicon" value={value.favicon} onChange={(favicon) => set('favicon', favicon)} onError={onError} contain />
    </EditorCard>
    <EditorCard title="Page titles & descriptions" description="Edit the title and description used by each public page. Product and collection detail pages use these as fallbacks.">
      <div className="admin-seo-pages">{SEO_PAGE_KEYS.map(({ key, label }) => <div className="admin-seo-page" key={key}>
        <h4>{label}</h4>
        <FieldGrid fields={[
          <TextField key="title" label="Meta title" value={value.pages[key].title} onChange={(next) => set('pages', { ...value.pages, [key]: { ...value.pages[key], title: next } })} />,
          <TextField key="description" label="Meta description" value={value.pages[key].description} onChange={(next) => set('pages', { ...value.pages, [key]: { ...value.pages[key], description: next } })} multiline />,
        ]} />
      </div>)}</div>
    </EditorCard>
  </>;
}

function HomeEditor({ value, onChange }: { value: SiteContent['home']; onChange: (value: SiteContent['home']) => void }) {
  const set = (key: keyof SiteContent['home'], next: string) => onChange({ ...value, [key]: next } as SiteContent['home']);
  const updateTrust = (index: number, patch: Partial<SiteContent['home']['trust'][number]>) => onChange({ ...value, trust: value.trust.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });

  return (
    <div className="admin-content-form">
      <EditorCard title="Intro section" description="The first text block below the homepage hero.">
        <StringFields values={{ introEyebrow: value.introEyebrow, introH1a: value.introH1a, introH1b: value.introH1b, introBody: value.introBody, introCta: value.introCta }} multilineKeys={['introBody']} onChange={(key, next) => set(key as keyof SiteContent['home'], next)} />
      </EditorCard>
      <EditorCard title="Featured products"><StringFields values={{ featuredEyebrow: value.featuredEyebrow, featuredTitle: value.featuredTitle, featuredCta: value.featuredCta }} onChange={(key, next) => set(key as keyof SiteContent['home'], next)} /></EditorCard>
      <EditorCard title="Curated looks heading"><StringFields values={value.lookbook} multilineKeys={['body']} onChange={(key, next) => onChange({ ...value, lookbook: { ...value.lookbook, [key]: next } })} /></EditorCard>
      <EditorCard title="Promise section"><StringFields values={{ noteEyebrow: value.noteEyebrow, noteH2a: value.noteH2a, noteH2b: value.noteH2b, noteBody: value.noteBody, noteCta: value.noteCta }} multilineKeys={['noteBody']} onChange={(key, next) => set(key as keyof SiteContent['home'], next)} /></EditorCard>
      <EditorCard title="Trust pillars" description="The proof points between the intro and featured products.">
        <Repeater items={value.trust} addLabel="Add trust pillar" onAdd={() => onChange({ ...value, trust: [...value.trust, { number: `0${value.trust.length + 1}`, title: '', body: '' }] })} onRemove={(index) => onChange({ ...value, trust: value.trust.filter((_, itemIndex) => itemIndex !== index) })} render={(item, index) => (
          <FieldGrid fields={[
            <TextField key="number" label="Number" value={item.number} onChange={(next) => updateTrust(index, { number: next })} />,
            <TextField key="title" label="Title" value={item.title} onChange={(next) => updateTrust(index, { title: next })} />,
            <TextField key="body" label="Description" value={item.body} onChange={(next) => updateTrust(index, { body: next })} multiline />,
          ]} />
        )} />
      </EditorCard>
    </div>
  );
}

function CollectionEditor({ value, onChange, onError }: { value: SiteContent['collection']; onChange: (value: SiteContent['collection']) => void; onError: (message: string) => void }) {
  const updateItem = (index: number, patch: Partial<SiteContent['collection']['items'][number]>) => onChange({ ...value, items: value.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  return (
    <div className="admin-content-form">
      <EditorCard title="Collection hero"><StringFields values={{ eyebrow: value.hero.eyebrow, h1a: value.hero.h1a, h1b: value.hero.h1b, body: value.hero.body, collectionLink: value.hero.collectionLink, scroll: value.hero.scroll }} multilineKeys={['body']} onChange={(key, next) => onChange({ ...value, hero: { ...value.hero, [key]: next } })} /><ImageField label="Hero image" value={value.hero.image} onChange={(next) => onChange({ ...value, hero: { ...value.hero, image: next } })} onError={onError} /></EditorCard>
      <EditorCard title="Explore section"><StringFields values={value.explore} multilineKeys={['body']} onChange={(key, next) => onChange({ ...value, explore: { ...value.explore, [key]: next } })} /></EditorCard>
      <EditorCard title="Collection card labels"><StringFields values={{ cardLabel: value.cardLabel, exploreCta: value.exploreCta, megaMenuCta: value.megaMenuCta }} onChange={(key, next) => onChange({ ...value, [key]: next } as SiteContent['collection'])} /></EditorCard>
      <EditorCard title="Collection cards" description="Each card controls the Collection page grid and the header mega menu.">
        <Repeater items={value.items} addLabel="Add collection" onAdd={() => onChange({ ...value, items: [...value.items, { slug: '', title: '', copy: '', image_url: '', subcategories: [] }] })} onRemove={(index) => onChange({ ...value, items: value.items.filter((_, itemIndex) => itemIndex !== index) })} render={(item, index) => (
          <FieldGrid fields={[
            <TextField key="slug" label="Slug" value={item.slug} onChange={(next) => updateItem(index, { slug: next })} />,
            <TextField key="title" label="Title" value={item.title} onChange={(next) => updateItem(index, { title: next })} />,
            <TextField key="copy" label="Description" value={item.copy} onChange={(next) => updateItem(index, { copy: next })} multiline />,
            <TextField key="subcategories" label="Subcategories (comma separated)" value={item.subcategories.map((entry) => normalizeCollectionSubcategory(entry).title).join(', ')} onChange={(next) => {
              const previous = item.subcategories.map(normalizeCollectionSubcategory);
              const titles = next.split(',').map((entry) => entry.trim()).filter(Boolean);
              updateItem(index, { subcategories: titles.map((title, subcategoryIndex) => ({ title, slug: previous[subcategoryIndex]?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') })) });
            }} hint="Labels can change; their saved slugs stay stable so product assignments remain connected." />,
            <ImageField key="image" label="Card image" value={{ image_url: item.image_url, alt: item.title }} onChange={(next) => updateItem(index, { image_url: next.image_url })} onError={onError} />,
          ]} />
        )} />
      </EditorCard>
    </div>
  );
}

function CatalogEditor({ value, onChange }: { value: SiteContent['catalog']; onChange: (value: SiteContent['catalog']) => void }) {
  return (
    <div className="admin-content-form">
      <EditorCard title="Catalog hero"><StringFields values={value.hero} multilineKeys={['body']} onChange={(key, next) => onChange({ ...value, hero: { ...value.hero, [key]: next } })} /></EditorCard>
      <EditorCard title="Filters, sorting, and empty states"><StringFields values={value.ui} multilineKeys={['noPiecesBody']} onChange={(key, next) => onChange({ ...value, ui: { ...value.ui, [key]: next } })} /></EditorCard>
      <EditorCard title="Product detail labels"><StringFields values={{ home: value.product.home, guarantee: value.product.guarantee, handcrafted: value.product.handcrafted, shipping: value.product.shipping, rating: value.product.rating, color: value.product.color, colorPlaceholder: value.product.colorPlaceholder, size: value.product.size, sizeGuide: value.product.sizeGuide, emboss: value.product.emboss, embossOptional: value.product.embossOptional, embossPlaceholder: value.product.embossPlaceholder, addToPouch: value.product.addToPouch, outOfStock: value.product.outOfStock, completeKicker: value.product.completeKicker, completeTitle: value.product.completeTitle }} onChange={(key, next) => onChange({ ...value, product: { ...value.product, [key]: next } })} /></EditorCard>
      <EditorCard title="Product detail dropdowns" description="These three settings control the expandable text panels shown on every product detail page.">
        <FieldGrid fields={[
          <TextField key="materialTitle" label="Quality / material dropdown title" value={value.product.materialTitle} onChange={(next) => onChange({ ...value, product: { ...value.product, materialTitle: next } })} />,
          <TextField key="materialBody" label="Quality / material dropdown text" value={value.product.materialBody} onChange={(next) => onChange({ ...value, product: { ...value.product, materialBody: next } })} multiline />,
          <TextField key="careTitle" label="Care dropdown title" value={value.product.careTitle} onChange={(next) => onChange({ ...value, product: { ...value.product, careTitle: next } })} />,
          <TextField key="careBody" label="Care dropdown text" value={value.product.careBody} onChange={(next) => onChange({ ...value, product: { ...value.product, careBody: next } })} multiline />,
          <TextField key="shippingTitle" label="Shipping dropdown title" value={value.product.shippingTitle} onChange={(next) => onChange({ ...value, product: { ...value.product, shippingTitle: next } })} />,
          <TextField key="shippingBody" label="Shipping dropdown text" value={value.product.shippingBody} onChange={(next) => onChange({ ...value, product: { ...value.product, shippingBody: next } })} multiline />,
        ]} />
      </EditorCard>
      <EditorCard title="Product category labels"><StringFields values={value.categories} onChange={(key, next) => onChange({ ...value, categories: { ...value.categories, [key]: next } })} /></EditorCard>
    </div>
  );
}

function ContactEditor({ value, onChange }: { value: SiteContent['contact']; onChange: (value: SiteContent['contact']) => void }) {
  return (
    <div className="admin-content-form">
      <EditorCard title="Contact hero"><StringFields values={value.hero} multilineKeys={['body']} onChange={(key, next) => onChange({ ...value, hero: { ...value.hero, [key]: next } })} /></EditorCard>
      <EditorCard title="Store card labels"><StringFields values={value.labels} onChange={(key, next) => onChange({ ...value, labels: { ...value.labels, [key]: next } })} /></EditorCard>
      <EditorCard title="Checkout WhatsApp" description="The number saved here receives orders from the checkout button and the contact page."><FieldGrid fields={[
        <TextField key="whatsappNumber" label="Checkout WhatsApp number" value={value.whatsappNumber} onChange={(next) => onChange({ ...value, whatsappNumber: next.replace(/\D/g, '') })} hint="Include country code without + or spaces." />,
        <TextField key="whatsappMessage" label="Default message" value={value.whatsappMessage} onChange={(next) => onChange({ ...value, whatsappMessage: next })} multiline />,
      ]} /></EditorCard>
    </div>
  );
}

function AboutEditor({ value, onChange, onError }: { value: SiteContent['about']; onChange: (value: SiteContent['about']) => void; onError: (message: string) => void }) {
  const updateFeature = (index: number, patch: Partial<SiteContent['about']['features'][number]>) => onChange({ ...value, features: value.features.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  const updateTestimonial = (index: number, patch: Partial<SiteContent['about']['testimonials'][number]>) => onChange({ ...value, testimonials: value.testimonials.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  const updateShopgram = (index: number, patch: Partial<SiteContent['about']['shopgram']['items'][number]>) => onChange({ ...value, shopgram: { ...value.shopgram, items: value.shopgram.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) } });
  const sectionEditor = (section: 'beginning' | 'belief') => {
    const current = value[section];
    return <EditorCard title={section === 'beginning' ? 'The beginning section' : 'Beliefs section'}><StringFields values={{ eyebrow: current.eyebrow, title: current.title, body1: current.body1, body2: current.body2 }} multilineKeys={['body1', 'body2']} onChange={(key, next) => onChange({ ...value, [section]: { ...current, [key]: next } })} /><ImageField label="Section image" value={current.image} onChange={(next) => onChange({ ...value, [section]: { ...current, image: next } })} onError={onError} /></EditorCard>;
  };

  return (
    <div className="admin-content-form">
      <EditorCard title="About hero" description="This image is used behind the About Us hero copy. Upload a new photo or paste a public image URL."><StringFields values={{ eyebrow: value.hero.eyebrow, title: value.hero.title }} onChange={(key, next) => onChange({ ...value, hero: { ...value.hero, [key]: next } })} /><ImageField label="Hero image" value={value.hero.image} onChange={(image) => onChange({ ...value, hero: { ...value.hero, image } })} onError={onError} /></EditorCard>
      <EditorCard title="Feature pillars">
        <Repeater items={value.features} addLabel="Add feature" onAdd={() => onChange({ ...value, features: [...value.features, { icon: 'star', title: '', body: '' }] })} onRemove={(index) => onChange({ ...value, features: value.features.filter((_, itemIndex) => itemIndex !== index) })} render={(item, index) => <FieldGrid fields={[
          <IconPickerField key="icon" label="Icon" value={item.icon} onChange={(next) => updateFeature(index, { icon: next })} />,
          <TextField key="title" label="Title" value={item.title} onChange={(next) => updateFeature(index, { title: next })} />,
          <TextField key="body" label="Description" value={item.body} onChange={(next) => updateFeature(index, { body: next })} multiline />,
        ]} />} />
      </EditorCard>
      {sectionEditor('beginning')}
      {sectionEditor('belief')}
      <EditorCard title="Testimonials heading"><StringFields values={value.testimonial} multilineKeys={['intro']} onChange={(key, next) => onChange({ ...value, testimonial: { ...value.testimonial, [key]: next } })} /></EditorCard>
      <EditorCard title="Testimonials">
        <Repeater items={value.testimonials} addLabel="Add testimonial" onAdd={() => onChange({ ...value, testimonials: [...value.testimonials, { name: '', role: '', src: '', quote: '' }] })} onRemove={(index) => onChange({ ...value, testimonials: value.testimonials.filter((_, itemIndex) => itemIndex !== index) })} render={(item, index) => <FieldGrid fields={[
          <TextField key="name" label="Name" value={item.name} onChange={(next) => updateTestimonial(index, { name: next })} />,
          <TextField key="role" label="Location / role" value={item.role} onChange={(next) => updateTestimonial(index, { role: next })} />,
          <TextField key="quote" label="Quote" value={item.quote} onChange={(next) => updateTestimonial(index, { quote: next })} multiline />,
          <ImageField key="image" label="Client image" value={{ image_url: item.src, alt: item.name }} onChange={(next) => updateTestimonial(index, { src: next.image_url })} onError={onError} />,
        ]} />} />
      </EditorCard>
      <EditorCard title="Shop Gram"><StringFields values={{ title: value.shopgram.title, intro: value.shopgram.intro }} multilineKeys={['intro']} onChange={(key, next) => onChange({ ...value, shopgram: { ...value.shopgram, [key]: next } })} /><Repeater items={value.shopgram.items} addLabel="Add image" onAdd={() => onChange({ ...value, shopgram: { ...value.shopgram, items: [...value.shopgram.items, { image_url: '', alt: '', label: '', icon: 'image' }] } })} onRemove={(index) => onChange({ ...value, shopgram: { ...value.shopgram, items: value.shopgram.items.filter((_, itemIndex) => itemIndex !== index) } })} render={(item, index) => <FieldGrid fields={[
        <TextField key="alt" label="Alt text" value={item.alt} onChange={(next) => updateShopgram(index, { alt: next })} />,
        <TextField key="label" label="Placeholder label" value={item.label} onChange={(next) => updateShopgram(index, { label: next })} />,
        <IconPickerField key="icon" label="Placeholder icon" value={item.icon} onChange={(next) => updateShopgram(index, { icon: next })} />,
        <ImageField key="image" label="Image" value={item} onChange={(next) => updateShopgram(index, { image_url: next.image_url, alt: next.alt })} onError={onError} />,
      ]} />} /></EditorCard>
    </div>
  );
}

function StringFields({ values, onChange, multilineKeys = [] }: { values: Record<string, string>; onChange: (key: string, value: string) => void; multilineKeys?: string[] }) {
  return <FieldGrid fields={Object.entries(values).map(([key, value]) => <TextField key={key} label={labelize(key)} value={value} onChange={(next) => onChange(key, next)} multiline={multilineKeys.includes(key)} />)} />;
}

function EditorCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="admin-content-card"><div className="admin-content-card__head"><div><h3>{title}</h3>{description && <p>{description}</p>}</div></div>{children}</section>;
}

function FieldGrid({ fields }: { fields: ReactNode[] }) { return <div className="admin-content-fields">{fields}</div>; }

function TextField({ label, value, onChange, multiline = false, hint }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: string }) {
  return <label className="admin-field"><span className="admin-field__label">{label}</span>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} /> : <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />}{hint && <span className="admin-field__hint">{hint}</span>}</label>;
}

function ImageField({ label, value, onChange, onError, contain = false }: { label: string; value: { image_url: string; alt: string }; onChange: (value: { image_url: string; alt: string }) => void; onError: (message: string) => void; contain?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const image = await uploadImage(file, 'content');
      onChange({ ...value, image_url: image.image_url });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };
  return <div className={`admin-content-image-field ${contain ? 'admin-content-image-field--contain' : ''}`}><div className="admin-content-image-field__preview">{value.image_url ? <img src={value.image_url} alt={value.alt} loading="lazy" /> : <Icon>image</Icon>}</div><div className="admin-content-image-field__controls"><TextField label={`${label} URL`} value={value.image_url} onChange={(next) => onChange({ ...value, image_url: next })} /><TextField label="Alt text" value={value.alt} onChange={(next) => onChange({ ...value, alt: next })} /><button type="button" className="admin-btn admin-btn--outline" onClick={() => inputRef.current?.click()} disabled={uploading}><Icon>{uploading ? 'progress_activity' : 'upload'}</Icon>{uploading ? 'Uploading…' : 'Upload image'}</button><input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => upload(event.target.files?.[0])} /></div></div>;
}

function Repeater<T>({ items, render, onAdd, onRemove, addLabel }: { items: T[]; render: (item: T, index: number) => ReactNode; onAdd: () => void; onRemove: (index: number) => void; addLabel: string }) {
  return <div className="admin-repeater">{items.map((item, index) => <div className="admin-repeater__item" key={index}><div className="admin-repeater__bar"><span>Item {String(index + 1).padStart(2, '0')}</span><button type="button" className="admin-btn admin-btn--ghost admin-tooltip" data-tooltip="Remove item" title={`Remove item ${index + 1}`} onClick={() => onRemove(index)} aria-label={`Remove item ${index + 1}`}><Icon>delete</Icon></button></div>{render(item, index)}</div>)}<button type="button" className="admin-btn admin-btn--outline" onClick={onAdd}><Icon>add</Icon>{addLabel}</button></div>;
}

function sectionIcon(section: ContentSection) {
  return section === 'global' ? 'public' : section === 'home' ? 'home' : section === 'collection' ? 'collections_bookmark' : section === 'catalog' ? 'inventory_2' : section === 'contact' ? 'contact_page' : 'auto_stories';
}

function labelize(value: string) { return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()); }
