// src/components/common/Breadcrumb/Breadcrumb.jsx
// Renders a breadcrumb trail from an array of { label, to? } items.
// Last item is current page (no link, aria-current="page").
// Used on: ProductDetailsPage (Home › Shop › Product Name)
//          Admin inner pages (Dashboard › Products › Edit)

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

/**
 * @param {{ label: string, to?: string }[]} items
 */
function Breadcrumb({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={styles.item}>
              {!isLast && item.to ? (
                <Link to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? styles.current : styles.link}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className={styles.separator} aria-hidden="true">›</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
