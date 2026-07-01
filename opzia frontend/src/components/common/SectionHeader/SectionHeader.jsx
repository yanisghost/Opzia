// src/components/common/SectionHeader/SectionHeader.jsx
// Reusable section heading pattern used across the site:
// small all-caps eyebrow label above a display-font title.
// Used on Home (Best Sellers, Curated Rituals), Contact (Philosophy), etc.
//
// align: 'left' | 'center' (default: center)

import React from 'react';
import styles from './SectionHeader.module.css';

function SectionHeader({ eyebrow, title, subtitle, align = 'center', className = '' }) {
  return (
    <div
      className={[styles.header, styles[align], className].filter(Boolean).join(' ')}
    >
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      {title && (
        <h2 className={styles.title}>{title}</h2>
      )}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>} 
    </div>
  );
}

export default SectionHeader;
