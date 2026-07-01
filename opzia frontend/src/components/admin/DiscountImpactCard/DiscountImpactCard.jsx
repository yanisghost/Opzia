// src/components/admin/DiscountImpactCard/DiscountImpactCard.jsx
// Shows the most-used active discount code and total savings given.
// Data from GET /api/v1/statistics/discounts/impact

import React from 'react';
import { formatPrice } from '@utils/formatPrice';
import { useLanguage } from '@hooks/useLanguage';
import styles from './DiscountImpactCard.module.css';

function DiscountImpactCard({ data }) {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return <p className={styles.empty}>{t('admin.discounts.noActiveDiscounts')}</p>;
  }

  // Find the most-used code
  const topCode = data.reduce((best, cur) =>
    (cur.ordersWithDiscount || 0) > (best.ordersWithDiscount || 0) ? cur : best
  , data[0]);

  const totalSavings = data.reduce((sum, d) => sum + (d.totalDiscountGiven || 0), 0);

  return (
    <div className={styles.card}>
      <div className={styles.section}>
        <p className={styles.label}>{t('admin.discounts.activeCodeUsage')}</p>
        <p className={styles.code}>{topCode.code || 'CODE'}</p>
        <p className={styles.usageCount}>
          {t('admin.discounts.usedTimes', { count: topCode.ordersWithDiscount ?? 0 })}
        </p>
      </div>
      <div className={styles.divider} />
      <div className={styles.section}>
        <p className={styles.label}>{t('admin.discounts.totalSavingsGiven')}</p>
        <p className={styles.savings}>{formatPrice(totalSavings)}</p>
        <p className={styles.period}>{t('admin.discounts.past30Days')}</p>
      </div>
    </div>
  );
}

export default DiscountImpactCard;
