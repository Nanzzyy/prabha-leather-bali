'use client';

import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { stripLocale, useLang } from '@/lib/i18n/LangContext';
import Icon from './Icon';
import LocaleLink from './LocaleLink';
import LocaleSwitch from './LocaleSwitch';
import { useSiteContent } from '@/lib/content/SiteContentContext';

const CollectionMegaMenu = dynamic(() => import('./CollectionMegaMenu'), { ssr: false });

const navLinks = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.catalog', href: '/catalog/' },
  { key: 'nav.contact', href: '/contact/' },
  { key: 'nav.about', href: '/about/' },
];

const normalize = (path: string) => path.replace(/\/$/, '') || '/';

export default function SiteHeader() {
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const { code: currencyCode, toggle: toggleCurrency } = useCurrency();
  const { lang } = useLang();
  const { content } = useSiteContent();
  const navLabels = content.global.nav;
  const headerLabels = content.global.header;
  const brand = content.global.brand;
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const collectionCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const isActive = (href: string) => {
    const target = normalize(href);
    const here = normalize(stripLocale(pathname));
    if (target === '/') return here === '/';
    return here === target || here.startsWith(`${target}/`);
  };

  const openCollection = () => {
    if (collectionCloseTimer.current) clearTimeout(collectionCloseTimer.current);
    setCollectionOpen(true);
  };

  const closeCollection = () => {
    if (collectionCloseTimer.current) clearTimeout(collectionCloseTimer.current);
    collectionCloseTimer.current = setTimeout(() => setCollectionOpen(false), 260);
  };

  const closeCollectionImmediately = () => {
    if (collectionCloseTimer.current) clearTimeout(collectionCloseTimer.current);
    setCollectionOpen(false);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/${lang}/catalog/?q=${encodeURIComponent(search.trim())}`);
    setSearchOpen(false);
  };

  // Cmd/Ctrl+K toggles search; Escape closes it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <LocaleLink className="brand-mark" href="/" ariaLabel="Praba Leather Bali home">
          {/* CMS image URLs are rendered as-is so SVG, PNG, and WebP logos keep their proportions. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.image_url || '/praba-logo.svg'}
            alt={brand.alt || 'Praba Leather Bali'}
            width="336"
            height="96"
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/praba-logo.svg'; }}
          />
        </LocaleLink>

        <nav className={`site-nav ${menuOpen ? 'site-nav--open' : ''}`} aria-label="Primary navigation">
          {navLinks.slice(0, 2).map((link) => (
            <LocaleLink key={link.key} href={link.href} ariaCurrent={isActive(link.href) ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{link.key === 'nav.home' ? navLabels.home : navLabels.catalog}</LocaleLink>
          ))}
          <div className="site-nav__collection" onMouseEnter={openCollection} onMouseLeave={closeCollection} onFocus={openCollection} onBlur={(event) => { const nextTarget = event.relatedTarget; if (!nextTarget || !(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) closeCollection(); }}>
            <LocaleLink href="/collection/" ariaCurrent={isActive('/collection/') ? 'page' : undefined} aria-haspopup="true" aria-expanded={collectionOpen} onClick={() => { setMenuOpen(false); closeCollectionImmediately(); }}>{navLabels.collection} <Icon>expand_more</Icon></LocaleLink>
            {collectionOpen && <CollectionMegaMenu onNavigate={() => { setMenuOpen(false); closeCollectionImmediately(); }} />}
          </div>
          {navLinks.slice(2).map((link) => (
            <LocaleLink key={link.key} href={link.href} ariaCurrent={isActive(link.href) ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{link.key === 'nav.contact' ? navLabels.contact : navLabels.about}</LocaleLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <button className="header-action header-search-trigger" type="button" onClick={() => setSearchOpen((open) => !open)} aria-label={headerLabels.search}>
            <Icon>search</Icon><span className="header-action__label">{headerLabels.search}</span><kbd>⌘ K</kbd>
          </button>
          <button className="header-action currency-switcher" type="button" onClick={toggleCurrency} aria-label={`Switch currency (currently ${currencyCode})`}>{currencyCode} <Icon>expand_more</Icon></button>
          <LocaleSwitch />
          <button id="pouch-trigger" className="header-action pouch-trigger" type="button" onClick={openCart} aria-label={`Open shopping pouch with ${itemCount} items`}>
            <Icon>shopping_bag</Icon><span className="header-action__label">{headerLabels.pouch}</span>
            {mounted && itemCount > 0 && <span className="pouch-count">{itemCount}</span>}
          </button>
          <button className="mobile-menu-trigger" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
            <Icon>{menuOpen ? 'close' : 'menu'}</Icon>
          </button>
        </div>
      </div>

      {searchOpen && (
        <form className="search-panel" onSubmit={handleSearch}>
          <Icon>search</Icon>
          <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={headerLabels.searchPlaceholder} aria-label={headerLabels.searchPlaceholder} />
          <button type="submit">{headerLabels.search}</button>
        </form>
      )}
    </header>
  );
}
