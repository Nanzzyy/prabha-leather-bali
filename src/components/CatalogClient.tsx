'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Product } from '@/lib/types/repository';
import ProductCard from './ProductCard';
import Icon from './Icon';
import Select from './Select';
import { fetchLiveProducts } from '@/lib/catalog/live';
import { fetchLiveCollectionProductGroups, type CollectionProductGroup } from '@/lib/collection/live';
import { buildSubcategoryAssignments, matchesSubcategory, subcategoriesFor } from '@/lib/catalog/subcategories';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import { useServiceStatus } from '@/lib/service/ServiceStatusContext';

interface Props { products: Product[]; }

const categories = ['all', 'boots', 'bags', 'wallets', 'accessories', 'jackets'];
const viewOptions = [2, 3, 4, 5];
const colors = [
  { name: 'Saddle Tan', hex: '#8B4513' },
  { name: 'Deep Onyx', hex: '#181311' },
  { name: 'Dark Brown', hex: '#5C4033' },
  { name: 'Light Tan', hex: '#D2B48C' },
];

export default function CatalogClient({ products: initialProducts }: Props) {
  // Live-read: replace the build-time list with the current DB state on mount so
  // CMS edits appear without a rebuild. Falls back to build-time prop on any failure.
  const [live, setLive] = useState<Product[] | null>(null);
  const [liveGroups, setLiveGroups] = useState<CollectionProductGroup[] | null>(null);
  const { reportDataError } = useServiceStatus();
  useEffect(() => {
    fetchLiveProducts()
      .then((data) => {
        if (data === null && initialProducts.length === 0) reportDataError();
        if (data) setLive(data);
      })
      .catch(() => { if (initialProducts.length === 0) reportDataError(); });
    fetchLiveCollectionProductGroups().then(setLiveGroups).catch(() => {});
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  const products = live ?? initialProducts;
  const [leather, setLeather] = useState('all');
  const [color, setColor] = useState('all');
  const [price, setPrice] = useState(500);
  const [search, setSearch] = useState<string | null>(null);
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState(2);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const { content } = useSiteContent();
  const { ui, categories: categoryLabels } = content.catalog;
  const urlQuery = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('popstate', onStoreChange);
      return () => window.removeEventListener('popstate', onStoreChange);
    },
    () => window.location.search,
    () => '',
  );
  const urlParams = useMemo(() => new URLSearchParams(urlQuery), [urlQuery]);
  const urlSearch = urlParams.get('q') || '';
  const urlCategory = urlParams.get('category') || '';
  const urlSubcategory = urlParams.get('subcategory') || '';
  const activeSearch = search ?? urlSearch;
  const activeCategory = urlCategory || 'all';
  const activeSubcategory = activeCategory === 'all' ? 'all' : urlSubcategory || 'all';

  // Drive the Product-type filter from the URL so the address bar always reflects
  // the selected collection (and "All types" returns to /catalog/). history.pushState
  // + a popstate ping lets the existing useSyncExternalStore re-read location.search.
  const navigateToCategory = (item: string) => {
    const params = new URLSearchParams(window.location.search);
    if (item === 'all') { params.delete('category'); params.delete('subcategory'); }
    else { params.set('category', item); params.delete('subcategory'); }
    const query = params.toString();
    const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.pushState({}, '', next);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Subcategory follows the same URL-driven contract. Reset when the active
  // category no longer carries the chosen subcategory.
  const navigateToSubcategory = (item: string) => {
    const params = new URLSearchParams(window.location.search);
    if (item === 'all') params.delete('subcategory');
    else params.set('subcategory', item);
    const query = params.toString();
    const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.pushState({}, '', next);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const activeCollection = content.collection.items.find((item) => item.slug === activeCategory);
  const subcategoryOptions = useMemo(() => activeCollection ? subcategoriesFor(activeCollection.subcategories) : [], [activeCollection]);
  const subcategoryAssignments = useMemo(
    () => activeCollection ? buildSubcategoryAssignments(activeCollection.slug, products, liveGroups) : new Map<string, Set<string>>(),
    [activeCollection, products, liveGroups],
  );

  const leatherTypes = useMemo(() => ['all', ...Array.from(new Set(products.map((product) => product.leatherType)))], [products]);
  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const variantColors = product.variants.map((variant) => variant.color);
      const matchesSearch = `${product.name} ${product.description} ${product.leatherType}`.toLowerCase().includes(activeSearch.toLowerCase());
      const matchesColor = color === 'all' || variantColors.includes(color);
      return (activeCategory === 'all' || product.category === activeCategory) && (leather === 'all' || product.leatherType === leather) && matchesColor && product.basePrice <= price && matchesSearch && matchesSubcategory(product, subcategoryAssignments, activeSubcategory);
    });
    return result.sort((a, b) => sort === 'price-low' ? a.basePrice - b.basePrice : sort === 'price-high' ? b.basePrice - a.basePrice : Number(b.isFeatured) - Number(a.isFeatured));
  }, [activeCategory, activeSearch, color, leather, price, products, sort, subcategoryAssignments, activeSubcategory]);

  // Trending is derived automatically from the live result set (top pieces by price),
  // so it always reflects whatever the user searches/filters — no manually curated flag.
  const trendingProducts = useMemo(() => [...filteredProducts].sort((a, b) => b.basePrice - a.basePrice).slice(0, 4), [filteredProducts]);
  const categoryGroups = useMemo(() => {
    const groupCategories = activeCategory === 'all' ? categories.filter((item) => item !== 'all') : [activeCategory];
    return groupCategories.map((slug) => ({ slug, title: categoryLabels[slug] || slug, products: filteredProducts.filter((product) => product.category === slug) })).filter((group) => group.products.length > 0);
  }, [activeCategory, categoryLabels, filteredProducts]);

  const getVisibleCount = (group: string) => visibleCounts[group] || 2;
  const loadMore = (group: string) => setVisibleCounts((counts) => ({ ...counts, [group]: getVisibleCount(group) + 4 }));

  const reset = () => { setLeather('all'); setColor('all'); setPrice(500); setSearch(''); setVisibleCounts({}); navigateToCategory('all'); navigateToSubcategory('all'); };

  return (
    <>
      <div className="catalog-toolbar">
        <button type="button" className="filter-toggle" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>
          <Icon>tune</Icon><span>{ui.filter}</span><small>{filteredProducts.length} {ui.pieces}</small><Icon>{filtersOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</Icon>
        </button>
        <div className="catalog-toolbar__views" aria-label={ui.chooseDensity}>
          {viewOptions.map((option) => <button type="button" key={option} className={gridColumns === option ? 'is-selected' : ''} onClick={() => setGridColumns(option)} aria-label={`${ui.gridLabel} ${option} by ${option}`} title={`${option} × ${option} grid`} aria-pressed={gridColumns === option}><DensityIcon columns={option} rows={option} /></button>)}
        </div>
        <Select className="catalog-toolbar__sort" label={ui.sortBy} value={sort} onChange={setSort} options={[{ value: 'featured', label: ui.featured }, { value: 'price-low', label: ui.priceLow }, { value: 'price-high', label: ui.priceHigh }]} />
      </div>
      {filtersOpen && <button type="button" className="catalog-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label={ui.filter} />}
      <div className={`catalog-layout ${filtersOpen ? 'catalog-layout--filters-open' : 'catalog-layout--filters-closed'}`}>
        <aside className={`catalog-sidebar ${filtersOpen ? 'catalog-sidebar--open' : 'catalog-sidebar--collapsed'}`}>
        <div className="catalog-sidebar__panel">
          <div className="catalog-sidebar__top"><span className="eyebrow">{ui.refine}</span><button type="button" onClick={reset}>{ui.reset}</button></div>
          <label className="filter-search"><Icon>search</Icon><input value={search ?? urlSearch} onChange={(event) => setSearch(event.target.value)} placeholder={ui.searchPlaceholder} /></label>
          <FilterGroup title={ui.productType}><div className="filter-options">{categories.map((item) => <button type="button" key={item} className={activeCategory === item ? 'is-selected' : ''} onClick={() => navigateToCategory(item)}>{categoryLabels[item] || item}</button>)}</div></FilterGroup>
          <FilterGroup title={ui.leatherGrade}><div className="filter-options">{leatherTypes.map((item) => <button type="button" key={item} className={leather === item ? 'is-selected' : ''} onClick={() => setLeather(item)}>{item === 'all' ? ui.allGrades : item}</button>)}</div></FilterGroup>
          <FilterGroup title={ui.color}><div className="color-swatches">{colors.map((item) => <button type="button" key={item.name} className={color === item.name ? 'is-selected' : ''} style={{ '--swatch': item.hex } as React.CSSProperties} onClick={() => setColor(color === item.name ? 'all' : item.name)} aria-label={item.name} />)}</div></FilterGroup>
          <FilterGroup title={ui.priceRange}><div className="price-filter"><div><span>$0</span><span>${price}</span></div><input type="range" min="0" max="500" step="5" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></div></FilterGroup>
          {activeCategory !== 'all' && subcategoryOptions.length > 0 && <FilterGroup title={ui.subcategory}><div className="filter-options">{[ui.allSubcategories, ...subcategoryOptions.map((item) => item.title)].map((label, index) => {
            const value = index === 0 ? 'all' : subcategoryOptions[index - 1].slug;
            return <button type="button" key={value} className={activeSubcategory === value ? 'is-selected' : ''} onClick={() => navigateToSubcategory(value)}>{label}</button>;
          })}</div></FilterGroup>}
        </div>
        </aside>
        <section className="catalog-results">
          <div className="catalog-results__summary"><span className="eyebrow">{ui.showing}</span><p><strong>{filteredProducts.length}</strong> {ui.piecesFound}</p></div>
          {filteredProducts.length ? <>
            {activeCategory === 'all' && trendingProducts.length > 0 && <ProductSection group="trending" kicker={ui.trendingKicker} title={ui.trendingTitle} products={trendingProducts} total={trendingProducts.length} visibleCount={getVisibleCount('trending')} gridColumns={gridColumns} onLoadMore={() => loadMore('trending')} loadMoreLabel={ui.loadMore} pieceLabel={ui.pieces} />}
            {categoryGroups.map((group) => <ProductSection key={group.slug} group={group.slug} kicker={ui.shopByKind} title={group.title} products={group.products} total={group.products.length} visibleCount={getVisibleCount(group.slug)} gridColumns={gridColumns} onLoadMore={() => loadMore(group.slug)} loadMoreLabel={ui.loadMore} pieceLabel={ui.pieces} />)}
          </> : <div className="catalog-empty"><Icon>search_off</Icon><h3>{ui.noPieces}</h3><p>{ui.noPiecesBody}</p><button className="button button--outline" type="button" onClick={reset}>{ui.resetFilters}</button></div>}
        </section>
      </div>
    </>
  );
}

function ProductSection({ group, kicker, title, products, total, visibleCount, gridColumns, onLoadMore, loadMoreLabel, pieceLabel }: { group: string; kicker: string; title: string; products: Product[]; total: number; visibleCount: number; gridColumns: number; onLoadMore: () => void; loadMoreLabel: string; pieceLabel: string }) {
  const visibleProducts = products.slice(0, visibleCount);
  return <section className={`catalog-section catalog-section--${group}`}><div className="catalog-section__heading"><div><span className="eyebrow">{kicker}</span><h2>{title}</h2></div><span className="catalog-section__count">{total} {pieceLabel}</span></div><div className={`catalog-grid catalog-grid--${gridColumns}`}>{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>{visibleProducts.length < total && <button type="button" className="catalog-load-more" onClick={onLoadMore}>{loadMoreLabel} <Icon>north_east</Icon></button>}</section>;
}

function DensityIcon({ columns, rows }: { columns: number; rows: number }) {
  return <span className="catalog-density-icon" style={{ '--density-columns': columns, '--density-rows': rows } as React.CSSProperties} aria-hidden="true">{Array.from({ length: columns * rows }, (_, index) => <i key={index} />)}</span>;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="filter-group"><h3>{title}</h3>{children}</section>;
}
