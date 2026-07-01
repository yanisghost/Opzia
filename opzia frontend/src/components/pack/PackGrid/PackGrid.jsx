// src/components/pack/PackGrid/PackGrid.jsx
// Grid wrapper for PackCard tiles. Used on HomePage (Curated Rituals).

import React from 'react';
import PackCard from '../PackCard/PackCard';
import Spinner from '@components/ui/Spinner/Spinner';
import styles from './PackGrid.module.css';

function PackGrid({ packs = [], isLoading = false, error = null }) {
  if (isLoading) {
    return (
      <div className={styles.state}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.state}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (packs.length === 0) {
    return (
      <div className={styles.state}>
        <p className={styles.emptyText}>No collections available.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {packs.map((pack) => (
        <PackCard key={pack._id} pack={pack} />
      ))}
    </div>
  );
}

export default PackGrid;
