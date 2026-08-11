'use client';

import Image from 'next/image';
import { Product } from '@/lib/types/repository';
import { useCartStore } from '@/lib/store/cartStore';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { useLang } from '@/lib/i18n/LangContext';
import { flyToPouch } from '@/lib/utils/flyToCart';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';
import Icon from './Icon';
import LocaleLink from './LocaleLink';

interface Props {
  product: Product;
  compact?: boolean;
  showOrderAction?: boolean;
}

export default function ProductCard({ product, compact = false, showOrderAction = true }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const { formatPrice } = useCurrency();
  const { t } = useLang();
  const firstVariant = product.variants[0];

  const handleOrder = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!firstVariant) return;
    addItem(product, firstVariant);
    flyToPouch(event.currentTarget, product.images[0]);
  };

  return (
    <article className={`product-card ${compact ? 'product-card--compact' : ''}`}>
      <LocaleLink href={`/catalog/${product.slug}/`} className="product-card__media" ariaLabel={`View ${product.name}`}>
        {product.images[0]
          ? <Image src={getSupabaseImageUrl(product.images[0], { width: 640, height: 800, quality: 74, resize: 'cover' })} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="product-card__image product-card__image--primary" />
          : <span className="product-card__image product-card__image--placeholder" aria-hidden>{product.name.charAt(0)}</span>}
        {product.images[1] && <Image src={getSupabaseImageUrl(product.images[1], { width: 640, height: 800, quality: 74, resize: 'cover' })} alt="" fill loading="lazy" fetchPriority="low" sizes="(max-width: 768px) 50vw, 25vw" className="product-card__image product-card__image--swap" />}
        {product.isFeatured && <span className="product-card__badge">Featured</span>}
        <span className="product-card__view">{t('cta.viewPiece')} <Icon>arrow_outward</Icon></span>
      </LocaleLink>
      <div className="product-card__body">
        <span className="eyebrow">{product.category}</span>
        <LocaleLink href={`/catalog/${product.slug}/`}><h3>{product.name}</h3></LocaleLink>
        <p>{product.leatherType}</p>
        <div className="product-card__footer">
          <span>{formatPrice(product.basePrice)}</span>
          {showOrderAction && <button type="button" onClick={handleOrder}><Icon>shopping_bag</Icon> {t('cta.addToPouch')}</button>}
        </div>
      </div>
    </article>
  );
}
