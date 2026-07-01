// src/components/admin/KPICard/KPICard.jsx
// Dashboard metric card. Shows a label, main value, and a trend indicator.
// trend: positive number = green ▲, negative = red ▼, zero = neutral.

import React from 'react';
import styles from './KPICard.module.css';

function KPICard({ label, value, trend, trendLabel, icon }) {
  const trendPositive = trend > 0;
  const trendNegative = trend < 0;
  const trendDisplay  = trend != null
    ? `${trendPositive ? '+' : ''}${typeof trend === 'number' ? trend.toFixed(1) : trend}%`
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <p className={styles.label}>{label}</p>
        {trendDisplay && (
          <span className={[
            styles.trend,
            trendPositive ? styles.positive : '',
            trendNegative ? styles.negative : '',
          ].filter(Boolean).join(' ')}>
            {trendPositive ? '▲' : trendNegative ? '▼' : '—'} {trendDisplay}
          </span>
        )}
      </div>
      <p className={styles.value}>{value}</p>
      {trendLabel && <p className={styles.trendLabel}>{trendLabel}</p>}
    </div>
  );
}

export default KPICard;
