'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import { LANG_LABELS, LANGS, type Lang } from '@/lib/i18n/dictionaries';
import { useLang } from '@/lib/i18n/LangContext';

export default function LocaleSwitch() {
  const { lang } = useLang();
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // query string is only known in the browser; read it after mount to avoid SSR mismatch.
  useEffect(() => setSearch(typeof window !== 'undefined' ? window.location.search : ''), []);

  const target = (other: Lang) => {
    const match = pathname.match(/^\/(en|id)(\/.*)?$/);
    const rest = match ? (match[2] || '/') : pathname;
    const base = rest === '/' ? `/${other}/` : `/${other}${rest}`;
    return search ? `${base}${search}` : base;
  };

  return (
    <div className="locale-switch" onMouseLeave={() => setOpen(false)}>
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
