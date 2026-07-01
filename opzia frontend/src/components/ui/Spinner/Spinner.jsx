// src/components/ui/Spinner/Spinner.jsx
// Minimal CSS-only spinner. Used in loading states across the app.
// Sizes: sm, md, lg
// color: 'brand' (default) | 'inherit' | 'white'

import React from 'react';
import styles from './Spinner.module.css';

function Spinner({ size = 'md', color = 'brand', className = '' }) {
  return (
    <span
      className={[styles.spinner, styles[size], styles[color], className].filter(Boolean).join(' ')}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;
