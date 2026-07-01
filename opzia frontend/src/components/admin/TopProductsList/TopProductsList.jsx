// src/components/admin/TopProductsList/TopProductsList.jsx
// Ranked list of top-selling products by quantity sold.
// Data from GET /api/v1/statistics/products/top

import React from 'react';
import { productImageUrl } from '@utils/imageUrl';
import { formatPrice } from '@utils/formatPrice';
import styles from './TopProductsList.module.css';

function TopProductsList({ products = [] }) {
  if (products.length === 0) {
    return <p className={styles.empty}>No data available.</p>;
  }

  return (
    <ol className={styles.list}>
      {products.map((item, i) => (
        <li key={item._id || i} className={styles.item}>
          <span className={styles.rank}>{i + 1}</span>
          {item.imageCover && (
            <img
              src={productImageUrl(item.imageCover)}
              alt={item.name}
              className={styles.image}
            />
          )}
          <div className={styles.info}>
            <p className={styles.name}>{item.name}</p>
            <p className={styles.category}>{item.category?.name || item.category}</p>
          </div>
          <div className={styles.stats}>
            <span className={styles.sold}>{item.totalQuantitySold ?? item.sold ?? '—'}</span>
            <span className={styles.soldLabel}>Sold</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default TopProductsList;
