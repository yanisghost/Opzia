// src/pages/BagPage/BagPage.jsx
// Shopping bag — reviews cart contents before checkout.
// Cart lives entirely in CartContext (client-side, localStorage-persisted).
// No backend calls on this page.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@hooks/useCart';
import { useLanguage } from '@hooks/useLanguage';
import CartItem from '@components/cart/CartItem/CartItem';
import OrderSummaryPanel from '@components/cart/OrderSummaryPanel/OrderSummaryPanel';
import Button from '@components/ui/Button/Button';
import styles from './BagPage.module.css';

// ─── Empty state ──────────────────────────────────────────────────────────
function EmptyBag() {
  const { t } = useLanguage();
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon} aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <h2 className={styles.emptyTitle}>{t('bag.emptyTitle')}</h2>
      <p className={styles.emptySubtitle}>
        {t('bag.emptySubtitle')}
      </p>
      <Link to="/shop">
        <Button variant="primary" size="lg">{t('hero.shopCollection')}</Button>
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
function BagPage() {
  const { t } = useLanguage();
  const { items, subtotal } = useCart();
  const navigate = useNavigate();

  // Promo code is stored locally here and passed to OrderSummaryPanel.
  // Actual validation happens at order creation (POST /api/v1/orders).
  const [promoCode, setPromoCode] = React.useState('');

  if (items.length === 0) return <EmptyBag />;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* ── Header ── */}
        <div className={styles.pageHeader}>
          <div>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link to="/" className={styles.breadcrumbLink}>{t('navbar.home')}</Link>
              <span className={styles.breadcrumbSep} aria-hidden="true">›</span>
              <span className={styles.breadcrumbCurrent}>{t('bag.selection')}</span>
            </nav>
            <h1 className={styles.title}>{t('bag.title')}</h1>
            <p className={styles.subtitle}>{t('bag.subtitle')}</p>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className={styles.layout}>
          {/* Cart items */}
          <div className={styles.itemsCol}>
            {items.map((item) => (
              <CartItem key={`${item.type}-${item.id}`} item={item} />
            ))}

            {/* Continue shopping */}
            <div className={styles.continueWrap}>
              <Link to="/shop" className={styles.continueLink}>
                {t('bag.continueShopping')}
              </Link>
            </div>
          </div>

          {/* Summary panel */}
          <div className={styles.summaryCol}>
            <OrderSummaryPanel
              showItems={false}
              promoCode={promoCode}
              onPromoApply={setPromoCode}
              shipping={0}
            />
            <div className={styles.checkoutBtn}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/checkout')}
              >
                {t('bag.proceedCheckout')}
              </Button>
            </div>
            {/* Complementary shipping note */}
            <p className={styles.shippingNote}>
              {t('bag.shippingNote')}
            </p>
            <p className={styles.shippingNote}>
              {t('bag.secureNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BagPage;
