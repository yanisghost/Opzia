// src/components/cart/OrderSummaryPanel/OrderSummaryPanel.jsx
// Right-column summary box shown on BagPage and CheckoutPage.
// Displays: line items (optional), subtotal, shipping note, promo, total.

import React from 'react';
import { useCart } from '@hooks/useCart';
import { useLanguage } from '@hooks/useLanguage';
import { formatPrice } from '@utils/formatPrice';
import { productImageUrl, packImageUrl } from '@utils/imageUrl';
import PromoCodeInput from '@components/common/PromoCodeInput/PromoCodeInput';
import styles from './OrderSummaryPanel.module.css';

function OrderSummaryPanel({
  showItems    = false,
  promoCode    = '',
  onPromoApply,
  shipping     = null,
}) {
  const { t } = useLanguage();
  const { items, subtotal } = useCart();

  // shipping is the raw DZD number from Yalidine (null = not yet calculated)
  const hasShipping = shipping != null && shipping > 0;
  const shippingDisplay = hasShipping
    ? `${shipping} DZD`
    : t('summary.calculated');

  const estimatedTotal = subtotal + (hasShipping ? 0 : 0); // products only; shipping is shown separately

  return (
    <div className={styles.panel}>
      <h2 className={styles.heading}>{t('summary.title')}</h2>

      {/* ── Optional item list (CheckoutPage) ── */}
      {showItems && items.length > 0 && (
        <ul className={styles.itemList}>
          {items.map((item) => {
            const imgUrl = item.type === 'pack'
              ? packImageUrl(item.imageCover)
              : productImageUrl(item.imageCover);
            return (
              <li key={`${item.type}-${item.id}`} className={styles.lineItem}>
                <div className={styles.itemImg}>
                  <img
                    src={imgUrl}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                    }}
                  />
                </div>
                <div className={styles.itemMeta}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemQty}>{t('cart.qty', { quantity: item.quantity })}</p>
                </div>
                <span className={styles.itemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Promo Code ── */}
      {onPromoApply && (
        <div className={styles.promoRow}>
          <PromoCodeInput onApply={onPromoApply} appliedCode={promoCode} />
        </div>
      )}

      {/* ── Totals ── */}
      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>Products</span>
          <span>
            <small className={styles.currency}>USD</small>
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className={styles.totalRow}>
          <span>&#128666; Delivery</span>
          <span className={hasShipping ? styles.shippingAmt : styles.shippingTbd}>
            {hasShipping ? formatPrice(shipping) : t('summary.calculated')}
          </span>
        </div>
        <div className={[styles.totalRow, styles.grandTotal].join(' ')}>
          <span>{t('summary.total')}</span>
          <span>
            <small className={styles.currency}>USD</small>
            {formatPrice(subtotal + (hasShipping ? shipping : 0))}
          </span>
        </div>
      </div>

      {/* ── Trust Badges ── */}
      <div className={styles.badges}>
        <TrustBadge icon="🔒" label={t('summary.secure')} />
        <TrustBadge icon="🚚" label={t('summary.insured')} />
        <TrustBadge icon="🌿" label={t('summary.crueltyFree')} />
      </div>
    </div>
  );
}

function TrustBadge({ icon, label }) {
  return (
    <div className={styles.badge}>
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export default OrderSummaryPanel;
