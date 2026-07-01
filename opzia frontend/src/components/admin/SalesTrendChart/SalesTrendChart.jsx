// src/components/admin/SalesTrendChart/SalesTrendChart.jsx
// Lightweight pure-CSS bar chart for sales trends.
// Data from GET /api/v1/statistics/trends
// No charting library required — avoids bundle overhead.
// Each bar height is a CSS custom property percentage of the max value.

import React from 'react';
import { formatPrice } from '@utils/formatPrice';
import styles from './SalesTrendChart.module.css';

function SalesTrendChart({ data = [], metric = 'revenue' }) {
  if (data.length === 0) {
    return <div className={styles.empty}>No trend data available.</div>;
  }

  const values = data.map((d) =>
    metric === 'revenue'  ? (d.totalRevenue ?? d.revenue ?? 0) :
    metric === 'profit'   ? (d.totalProfit  ?? d.profit  ?? 0) :
    metric === 'orders'   ? (d.totalOrders  ?? d.orders  ?? 0) : 0
  );

  const max = Math.max(...values, 1);

  return (
    <div className={styles.chart}>
      <div className={styles.bars}>
        {data.map((d, i) => {
          const val = values[i];
          const pct = Math.round((val / max) * 100);
          const label = d._id ?? d.period ?? d.date ?? `P${i + 1}`;
          return (
            <div key={i} className={styles.barGroup}>
              <div
                className={styles.barWrap}
                title={metric === 'orders' ? `${val} orders` : formatPrice(val)}
              >
                <div
                  className={styles.bar}
                  style={{ '--bar-pct': `${pct}%` }}
                  role="img"
                  aria-label={`${label}: ${val}`}
                />
              </div>
              <span className={styles.barLabel}>{String(label).slice(-3)}</span>
            </div>
          );
        })}
      </div>
      <div className={styles.yAxis}>
        <span>{metric === 'orders' ? max : formatPrice(max)}</span>
        <span>{metric === 'orders' ? Math.round(max / 2) : formatPrice(max / 2)}</span>
        <span>0</span>
      </div>
    </div>
  );
}

export default SalesTrendChart;
