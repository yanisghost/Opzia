// src/components/ui/Pagination/Pagination.jsx
// Page navigation for ShopAllPage and admin tables.
// Matches design: ‹  1 / 4  ›
//
// Props:
//   currentPage  — 1-indexed
//   totalPages   — total number of pages
//   onPageChange — (page: number) => void

import React from 'react';
import styles from './Pagination.module.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPrev}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <span className={styles.label}>
        <span className={styles.current}>{currentPage}</span>
        <span className={styles.separator}>/</span>
        <span className={styles.total}>{totalPages}</span>
      </span>

      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  );
}

export default Pagination;
