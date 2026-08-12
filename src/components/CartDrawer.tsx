'use client';

import Image from 'next/image';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { generateWhatsAppPayload, normalizeWhatsAppNumber } from '@/lib/utils/whatsappGenerator';
import Icon from './Icon';
import { useSiteContent } from '@/lib/content/SiteContentContext';

export default function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const { formatPrice } = useCurrency();
  const { content } = useSiteContent();
  const labels = content.global.cart;
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    document.body.classList.toggle('drawer-open', isOpen);
    return () => document.body.classList.remove('drawer-open');
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product.basePrice + item.variant.priceAdjustment) * item.quantity, 0);

  const checkout = () => {
    if (!name.trim() || !destination.trim() || items.length === 0) return;
    const url = generateWhatsAppPayload(items, { name, destination, notes }, content.contact.whatsappNumber);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const checkoutPhoneConfigured = Boolean(normalizeWhatsAppNumber(content.contact.whatsappNumber));

  return (
    <div className="drawer-layer" role="dialog" aria-modal="true" aria-label={labels.title}>
      <button className="drawer-backdrop" type="button" onClick={closeCart} aria-label={labels.close} />
      <aside className="cart-drawer">
        <div className="cart-drawer__header"><h2>{labels.title} <span>({totalItems} {totalItems === 1 ? labels.item : labels.items})</span></h2><button type="button" onClick={closeCart} aria-label={labels.close}><Icon>close</Icon></button></div>
        <div className="cart-drawer__content">
          {items.length === 0 ? <div className="cart-empty"><Icon>shopping_bag</Icon><h3>{labels.emptyTitle}</h3><p>{labels.emptyBody}</p><button className="button button--dark" type="button" onClick={closeCart}>{labels.exploreCatalog}</button></div> : <>
            <div className="cart-items">
              {items.map((item) => <div className="cart-item" key={item.id}>
                <div className="cart-item__image">{item.product.images[0] && <Image src={getSupabaseImageUrl(item.product.images[0], { width: 256, height: 256, quality: 70, resize: 'cover' })} alt={item.product.name} fill sizes="96px" />}</div>
                <div className="cart-item__body"><div className="cart-item__title"><h3>{item.product.name}</h3><button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.product.name}`}><Icon>delete</Icon></button></div><p>{item.variant.size ? `${labels.sizePrefix} ${item.variant.size}` : ''}{item.variant.size && ' · '}{item.variant.color}</p>{item.customEmboss && <p>{labels.customStampPrefix} “{item.customEmboss}”</p>}<div className="cart-item__bottom"><div className="quantity-control"><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">+</button></div><strong>{formatPrice((item.product.basePrice + item.variant.priceAdjustment) * item.quantity)}</strong></div></div>
              </div>)}
            </div>
            <div className="cart-form"><div className="cart-form__heading"><span className="eyebrow">{labels.almostYours}</span><h3>{labels.orderDetails}</h3></div><label><span className="cart-form__label-line">{labels.fullName} <span className="cart-form__required">*</span></span><input value={name} onChange={(event) => setName(event.target.value)} placeholder={labels.fullNamePlaceholder} required /></label><label><span className="cart-form__label-line">{labels.delivery} <span className="cart-form__required">*</span></span><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder={labels.deliveryPlaceholder} required /></label><label><span className="cart-form__label-line">{labels.notes} <span>(optional)</span></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={labels.notesPlaceholder} rows={2} /></label></div>
          </>}
        </div>
        {items.length > 0 && <div className="cart-drawer__footer"><div className="cart-total"><span>{labels.subtotal}</span><strong>{formatPrice(subtotal)}</strong></div><div className="cart-shipping"><span>{labels.estimatedShipping}</span><span>{labels.calculatedViaWhatsapp}</span></div><button className="button button--whatsapp" type="button" onClick={checkout} disabled={!name.trim() || !destination.trim() || !checkoutPhoneConfigured}><Icon>chat</Icon> {labels.continueOrder} <Icon>arrow_forward</Icon></button><button className="cart-clear" type="button" onClick={clearCart}>{labels.clearPouch}</button><p>{labels.confirmation}</p></div>}
      </aside>
    </div>
  );
}
