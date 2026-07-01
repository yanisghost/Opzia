// src/components/common/PromoCodeInput/PromoCodeInput.jsx
// Promo code field + APPLY button.
// Used on: BagPage, CheckoutPage.
//
// Architecture note (from architecture doc §2.4):
// Promo code validation is NOT available as a standalone endpoint.
// The backend validates discount codes only during POST /api/v1/orders (createOrder).
// This component therefore accepts an onApply callback that the parent
// stores the code value and passes to the order payload — there is no
// real-time validation here. A subtle note is shown to the user.

import React, { useState } from 'react';
import styles from './PromoCodeInput.module.css';

function PromoCodeInput({ onApply, appliedCode = '', isLoading = false }) {
  const [value, setValue] = useState('');

  const handleApply = () => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;
    onApply?.(trimmed);
    setValue('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className={styles.wrapper}>
      {appliedCode ? (
        <div className={styles.applied}>
          <span className={styles.appliedCode}>{appliedCode}</span>
          <span className={styles.appliedNote}>Applied at checkout</span>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onApply?.(null)}
            aria-label="Remove promo code"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className={styles.inputRow}>
          <input
            type="text"
            placeholder="Promo code"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            onKeyDown={handleKey}
            className={styles.input}
            aria-label="Enter promo code"
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.applyBtn}
            onClick={handleApply}
            disabled={!value.trim() || isLoading}
          >
            APPLY
          </button>
        </div>
      )}
    </div>
  );
}

export default PromoCodeInput;
