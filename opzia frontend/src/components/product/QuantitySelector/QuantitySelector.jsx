// src/components/product/QuantitySelector/QuantitySelector.jsx
// Minus / count / plus selector. Used on ProductDetailsPage and CartItem.
// Enforces min (default 1) and optional max (product stock).

import React from 'react';
import styles from './QuantitySelector.module.css';

function QuantitySelector({ value, onChange, min = 1, max = 99, size = 'md', disabled = false }) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div
      className={[styles.selector, styles[size], disabled ? styles.disabled : ''].filter(Boolean).join(' ')}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        className={styles.btn}
        onClick={decrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={styles.value} aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <button
        type="button"
        className={styles.btn}
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default QuantitySelector;
