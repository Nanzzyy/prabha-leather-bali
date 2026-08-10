'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Icon from './Icon';
import { LANG_LABELS, LANGS, type Lang } from '@/lib/i18n/dictionaries';
import { useLang } from '@/lib/i18n/LangContext';

export default function LocaleSwitch() {
  const { lang } = useLang();
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Read the browser query string through an external-store subscription so the
  // server snapshot stays deterministic without a post-mount setState.
  const search = useSyncExternalStore(
    (onChange) => {
      window.addEventListener('popstate', onChange);
      return () => window.removeEventListener('popstate', onChange);
    },
    () => window.location.search,
    () => '',
  );

  // Keep the menu open while the pointer crosses its small visual offset. The
  // old mouseleave handler closed it before a language link could be clicked.
  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const target = (other: Lang) => {
    const match = pathname.match(/^\/(en|id)(\/.*)?$/);
    const rest = match ? (match[2] || '/') : pathname;
    const base = rest === '/' ? `/${other}/` : `/${other}${rest}`;
    return search ? `${base}${search}` : base;
  };

  return (
    <div className="locale-switch" ref={rootRef}>
      <button type="button" className="header-action locale-switch__btn" onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open} aria-label="Change language">
        {LANG_LABELS[lang]} <Icon>expand_more</Icon>
      </button>
      {open && (
        <div className="locale-switch__menu" role="menu">
          {LANGS.map((l) => (
            <Link key={l} role="menuitem" href={target(l)} className={l === lang ? 'is-active' : ''} onClick={() => setOpen(false)}>
              {l === 'en' ? 'English' : 'Bahasa Indonesia'}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
