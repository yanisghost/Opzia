// src/components/ui/Badge/Badge.jsx
// Pill badge used for order statuses (pending, confirmed, shipped, etc.)
// and general labels. Color variant is driven by `variant` prop.
// Variants map directly to the order status values from the backend model.

import React from 'react';
import styles from './Badge.module.css';

/**
 * @param {'pending'|'confirmed'|'shipped'|'delivered'|'cancelled'|'success'|'info'|'warning'|'neutral'} variant
 */
function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
}

export default Badge;
