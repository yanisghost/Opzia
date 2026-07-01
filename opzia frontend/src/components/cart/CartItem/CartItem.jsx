// src/components/cart/CartItem/CartItem.jsx
// Single line item in the shopping bag.
// Supports both 'product' and 'pack' cart item types.
// Image URL helper branches on type automatically.

import React, { useState } from 'react';
import { productImageUrl, packImageUrl } from '@utils/imageUrl';
import { formatPrice } from '@utils/formatPrice';
import QuantitySelector from '@components/product/QuantitySelector/QuantitySelector';
import { useCart } from '@hooks/useCart';
import { useLanguage } from '@hooks/useLanguage';
import styles from './CartItem.module.css';

function CartItem({ item }) {
  const { t } = useLanguage();
  const { updateQuantity, removeItem, updateItemPromoCode } = useCart();

  const { id, type, name, price, originalPrice, imageCover, quantity, enteredCode } = item;
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoVal, setPromoVal] = useState(enteredCode || '');
  const [errorMsg, setErrorMsg] = useState('');

  const imageUrl = type === 'pack'
    ? packImageUrl(imageCover)
    : productImageUrl(imageCover);

  const hasDiscount = originalPrice != null && originalPrice > price;
  const lineTotal = price * quantity;
  const originalLineTotal = (originalPrice ?? price) * quantity;

  const handleQuantityChange = (newQty) => {
    updateQuantity(id, type, newQty);
  };

  const handleRemove = () => {
    removeItem(id, type);
  };

  const handleApplyPromo = () => {
    const trimmed = promoVal.trim().toUpperCase();
    if (!trimmed) return;

    // Validate the code client-side using item.discounts
    const validDiscount = (item.discounts || []).find(
      (d) =>
        d.active &&
        d.requiresCode &&
        d.code.trim().toUpperCase() === trimmed &&
        (!d.discountStart || Date.now() >= new Date(d.discountStart).getTime()) &&
        (!d.discountEnd || Date.now() <= new Date(d.discountEnd).getTime())
    );

    if (validDiscount) {
      updateItemPromoCode(id, type, trimmed);
      setErrorMsg('');
      setShowPromoInput(false);
    } else {
      setErrorMsg(t('cart.invalidPromo') || 'This code is not valid for this product.');
    }
  };

  const handleRemovePromo = () => {
    updateItemPromoCode(id, type, null);
    setPromoVal('');
    setErrorMsg('');
    setShowPromoInput(false);
  };

  const handleCancelPromo = () => {
    setErrorMsg('');
    setShowPromoInput(false);
  };

  return (
    <div className={styles.item}>
      {/* Image */}
      <div className={styles.imageWrap}>
        <img
          src={imageUrl}
          alt={name}
          className={styles.image}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
          }}
        />
      </div>

      {/* Details */}
      <div className={styles.details}>
        <div className={styles.topRow}>
          <div>
            <p className={styles.typeLabel}>
              {type === 'pack' ? t('cart.pack') : t('cart.product')}
            </p>
            <h3 className={styles.name}>{name}</h3>
          </div>
          <div className={styles.pricing}>
            <span className={styles.lineTotal}>{formatPrice(lineTotal)}</span>
            {hasDiscount && (
              <span className={styles.originalLineTotal}>
                {formatPrice(originalLineTotal)}
              </span>
            )}
          </div>
        </div>

        {/* Promo code area */}
        <div className={styles.promoArea}>
          {enteredCode ? (
            <div className={styles.promoApplied}>
              <span className={styles.promoBadge}>🎫 {enteredCode}</span>
              <button
                type="button"
                className={styles.removePromoBtn}
                onClick={handleRemovePromo}
                aria-label="Remove discount code"
              >
                ✕
              </button>
            </div>
          ) : showPromoInput ? (
            <div className={styles.promoInputContainer}>
              <div className={styles.promoInputGroup}>
                <input
                  type="text"
                  placeholder={t('cart.promoPlaceholder')}
                  value={promoVal}
                  onChange={(e) => {
                    setPromoVal(e.target.value.toUpperCase());
                    setErrorMsg('');
                  }}
                  className={styles.promoInput}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                  aria-label="Enter item promo code"
                />
                <button
                  type="button"
                  className={styles.applyPromoBtn}
                  onClick={handleApplyPromo}
                  disabled={!promoVal.trim()}
                >
                  {t('cart.apply')}
                </button>
                <button
                  type="button"
                  className={styles.cancelPromoBtn}
                  onClick={handleCancelPromo}
                >
                  {t('cart.cancel')}
                </button>
              </div>
              {errorMsg && <p className={styles.promoError}>{errorMsg}</p>}
            </div>
          ) : (
            <button
              type="button"
              className={styles.addPromoBtn}
              onClick={() => setShowPromoInput(true)}
            >
              {t('cart.addPromo')}
            </button>
          )}
        </div>

        <div className={styles.bottomRow}>
          <QuantitySelector
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            size="sm"
          />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemove}
            aria-label={t('navbar.bag', { count: quantity }) /* or remove label */}
          >
            {t('cart.remove')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
