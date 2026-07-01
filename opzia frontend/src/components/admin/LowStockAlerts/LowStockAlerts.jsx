// src/components/admin/LowStockAlerts/LowStockAlerts.jsx
// Lists products where stock is below the threshold.
// Data from GET /api/v1/statistics/inventory/low

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LowStockAlerts.module.css';

function LowStockAlerts({ items = [] }) {
  if (items.length === 0) {
    return <p className={styles.allGood}>✓ All products are well-stocked.</p>;
  }

  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item._id} className={styles.item}>
            <div className={styles.info}>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.sku}>SKU: {item.sku || item._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className={styles.stockWrap}>
              <span className={[styles.stock, item.stock <= 3 ? styles.critical : styles.low].join(' ')}>
                {item.stock}
              </span>
              <span className={styles.stockLabel}>In Stock</span>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/admin/products" className={styles.manageLink}>
        Generate Restock Report →
      </Link>
    </div>
  );
}

export default LowStockAlerts;
