'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Product, ProductVariant } from '@/lib/types/repository';
import { useCartStore } from '@/lib/store/cartStore';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { flyToPouch } from '@/lib/utils/flyToCart';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';
import Accordion from './Accordion';
import LocaleLink from './LocaleLink';
import ProductCard from './ProductCard';
import Icon from './Icon';
import { useSiteContent } from '@/lib/content/SiteContentContext';

interface Props { product: Product; related: Product[]; }

export default function ProductDetailClient({ product, related }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const fallbackVariant: ProductVariant = {
    sku: product.id, color: '—', colorHex: '#8B4513', size: '', priceAdjustment: 0, stockStatus: 'available',
  };
  // Keep the color unselected until the customer explicitly chooses a swatch.
  // Products without variants can still be added using the fallback variant.
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | null>(null);
  const selectedVariant = selectedVariantSku
    ? product.variants.find((variant) => variant.sku === selectedVariantSku) || null
    : product.variants.length === 0 ? fallbackVariant : null;
  const [quantity, setQuantity] = useState(1);
  const [emboss, setEmboss] = useState('');
  const addItem = useCartStore((state) => state.addItem);
  const { formatPrice } = useCurrency();
  const { content } = useSiteContent();
  const labels = content.catalog.product;
  const specifications = {
    materialTitle: product.specifications?.materialTitle?.trim() || labels.materialTitle,
    materialBody: product.specifications?.materialBody?.trim() || labels.materialBody,
    careTitle: product.specifications?.careTitle?.trim() || labels.careTitle,
    careBody: product.specifications?.careBody?.trim() || labels.careBody,
    shippingTitle: product.specifications?.shippingTitle?.trim() || labels.shippingTitle,
    shippingBody: product.specifications?.shippingBody?.trim() || labels.shippingBody,
  };
  const colors = useMemo(() => Array.from(new Map(product.variants.map((variant) => [variant.color, variant])).values()), [product.variants]);
  const sizes = useMemo(() => Array.from(new Set(product.variants.map((variant) => variant.size).filter(Boolean))), [product.variants]);
  const displayedPrice = product.basePrice + (selectedVariant?.priceAdjustment || 0);

  const focusVariantImage = (variant: ProductVariant) => {
    if (!variant.image) return;
    const idx = product.images.indexOf(variant.image);
    if (idx >= 0) setActiveImage(idx);
  };

  const chooseColor = (color: string) => {
    const next = product.variants.find((variant) => variant.color === color && variant.size === selectedVariant?.size)
      || product.variants.find((variant) => variant.color === color)
      || null;
    if (!next) return;
    setSelectedVariantSku(next.sku);
    focusVariantImage(next);
  };
  const chooseSize = (size: string) => {
    if (!selectedVariant) return;
    const next = product.variants.find((variant) => variant.color === selectedVariant?.color && variant.size === size)
      || product.variants.find((variant) => variant.size === size)
      || null;
    if (!next) return;
    setSelectedVariantSku(next.sku);
    focusVariantImage(next);
  };
  const addToPouch = (event: React.MouseEvent<HTMLButtonElement>) => { if (!selectedVariant || selectedVariant.stockStatus === 'out_of_stock') return; addItem(product, selectedVariant, quantity, emboss); flyToPouch(event.currentTarget, product.images[activeImage] || product.images[0]); };

  return (
    <>
      <div className="product-detail__breadcrumbs"><LocaleLink href="/">{labels.home}</LocaleLink><Icon>chevron_right</Icon><LocaleLink href="/catalog/">{content.global.nav.catalog}</LocaleLink><Icon>chevron_right</Icon><span>{product.name}</span></div>
      <div className="product-detail__layout">
        <section className="product-gallery"><span className="guarantee"><Icon>verified</Icon> {labels.guarantee}</span><div className="product-gallery__thumbs">{product.images.map((image, index) => <button type="button" key={image} onClick={() => setActiveImage(index)} className={index === activeImage ? 'is-active' : ''}><Image src={getSupabaseImageUrl(image, { width: 240, height: 300, quality: 70, resize: 'cover' })} alt={`${product.name} view ${index + 1}`} fill sizes="80px" /></button>)}</div><div className="product-gallery__main"><Image src={getSupabaseImageUrl(product.images[activeImage] || product.images[0], { width: 1600, quality: 78 }) || ''} alt={product.name} fill priority sizes="(max-width: 900px) 100vw, 55vw" /></div></section>
        <section className="product-info"><span className="eyebrow">{labels.handcrafted} · {product.leatherType}</span><h1>{product.name}</h1><div className="product-info__price">{formatPrice(displayedPrice)}</div>{product.description.trim() && <p className="product-info__description">{product.description}</p>}<p className="product-info__shipping">{labels.shipping}</p>{selectedVariant?.description?.trim() && <p className="product-info__variant-description">{selectedVariant.description}</p>}<div className="product-rating"><span>★★★★★</span><span>{labels.rating}</span></div><fieldset className="option-group"><legend>{labels.color}: <span>{selectedVariant?.color || labels.colorPlaceholder}</span></legend><div className="color-swatches color-swatches--large">{colors.map((variant) => <button type="button" key={variant.color} className={selectedVariant?.color === variant.color ? 'is-selected' : ''} style={{ '--swatch': variant.colorHex || '#8B4513' } as React.CSSProperties} onClick={() => chooseColor(variant.color)} aria-label={variant.color} />)}</div></fieldset>{sizes.length > 0 && <fieldset className="option-group"><legend>{labels.size} <button type="button" className="text-link">{labels.sizeGuide}</button></legend><div className="size-options">{sizes.map((size) => <button type="button" key={size} className={selectedVariant?.size === size ? 'is-selected' : ''} onClick={() => chooseSize(size as string)} disabled={!selectedVariant}>{size}</button>)}</div></fieldset>}<label className="emboss-field">{labels.emboss} <span>{labels.embossOptional}</span><input value={emboss} maxLength={12} onChange={(event) => setEmboss(event.target.value)} placeholder={labels.embossPlaceholder} /></label><div className="product-info__actions"><div className="quantity-control"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">+</button></div><button className="button button--dark" type="button" onClick={addToPouch} disabled={!selectedVariant || selectedVariant.stockStatus === 'out_of_stock'}>{!selectedVariant ? labels.colorPlaceholder : selectedVariant.stockStatus === 'out_of_stock' ? labels.outOfStock : labels.addToPouch} <Icon>arrow_forward</Icon></button></div><div className="product-accordions"><Accordion title={specifications.materialTitle} defaultOpen><p>{specifications.materialBody}</p></Accordion><Accordion title={specifications.careTitle}><p>{specifications.careBody}</p></Accordion><Accordion title={specifications.shippingTitle}><p>{specifications.shippingBody}</p></Accordion></div></section>
      </div>
      <section className="complete-look"><div className="section-heading section-heading--center"><span className="eyebrow">{labels.completeKicker}</span><h2>{labels.completeTitle}</h2></div><div className="complete-look__grid">{related.slice(0, 3).map((item) => <ProductCard compact key={item.id} product={item} showOrderAction={false} />)}</div></section>
    </>
  );
}
