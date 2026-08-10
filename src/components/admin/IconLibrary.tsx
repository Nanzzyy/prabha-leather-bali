'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { ADMIN_ICON_LIBRARY, type AdminIconCategory } from '@/lib/admin/icon-library';

interface IconLibraryProps {
  value?: string;
  onSelect?: (name: string) => void;
}

export default function IconLibrary({ value = '', onSelect }: IconLibraryProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | AdminIconCategory>('all');
  const [copied, setCopied] = useState('');

  const categories = useMemo(() => Array.from(new Set(ADMIN_ICON_LIBRARY.map((item) => item.category))), []);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ADMIN_ICON_LIBRARY.filter((item) => (
      (category === 'all' || item.category === category) &&
      (!normalized || item.name.includes(normalized) || item.category.toLowerCase().includes(normalized))
    ));
  }, [category, query]);

  const selectIcon = async (name: string) => {
    onSelect?.(name);
    if (!onSelect) {
      try { await navigator.clipboard.writeText(name); } catch { /* Clipboard permission is optional. */ }
      setCopied(name);
      window.setTimeout(() => setCopied((current) => current === name ? '' : current), 1600);
    }
  };

  return (
    <div className="admin-icon-library">
      <div className="admin-icon-library__toolbar">
        <label className="admin-field admin-icon-library__search">
          <span className="admin-field__label">Search icons</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. shopping, arrow, place" />
        </label>
        <span className="admin-icon-library__count" aria-live="polite">{filtered.length} icons</span>
      </div>
      <div className="admin-icon-library__categories" aria-label="Icon categories">
        <button type="button" className={category === 'all' ? 'is-active' : ''} onClick={() => setCategory('all')}>All</button>
        {categories.map((item) => <button type="button" key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <div className="admin-icon-library__grid" role="list" aria-label="Available icons">
        {filtered.map((item) => <button type="button" role="listitem" key={item.name} className={`admin-icon-tile ${value === item.name ? 'is-selected' : ''}`} onClick={() => selectIcon(item.name)} title={onSelect ? `Use ${item.name}` : `Copy ${item.name}`} aria-label={onSelect ? `Use icon ${item.name}` : `Copy icon name ${item.name}`}>
          <Icon>{item.name}</Icon>
          <span>{item.name}</span>
          {copied === item.name && <small>Copied</small>}
        </button>)}
      </div>
      {filtered.length === 0 && <div className="admin-empty admin-empty--small"><Icon>search_off</Icon><h2>No icons found</h2><p>Try another icon name or category.</p></div>}
      {!onSelect && <p className="admin-icon-library__hint"><Icon>info</Icon> Click any icon to copy its Material Symbols name, then use that name in homepage or content fields.</p>}
    </div>
  );
}

export function IconPickerField({ label, value, onChange }: { label: string; value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="admin-field admin-icon-picker-field">
      <span className="admin-field__label">{label}</span>
      <div className="admin-icon-picker-field__control">
        <span className="admin-icon-picker-field__preview"><Icon>{value || 'image'}</Icon></span>
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder="material_symbol_name" />
        <button type="button" className="admin-btn admin-btn--outline" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="dialog"><Icon>apps</Icon> Browse</button>
      </div>
      {open && <div className="admin-icon-picker-field__popover" role="dialog" aria-label={`${label} picker`}><div className="admin-icon-picker-field__popover-head"><strong>Choose an icon</strong><button type="button" className="admin-btn admin-btn--ghost" onClick={() => setOpen(false)} aria-label="Close icon picker"><Icon>close</Icon></button></div><IconLibrary value={value} onSelect={(name) => { onChange(name); setOpen(false); }} /></div>}
    </div>
  );
}
