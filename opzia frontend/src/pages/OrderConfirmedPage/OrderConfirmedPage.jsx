// src/pages/OrderConfirmedPage/OrderConfirmedPage.jsx
// Static confirmation landing page at /order-confirmed.

import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@hooks/useLanguage';
import Button from '@components/ui/Button/Button';
import styles from './OrderConfirmedPage.module.css';

function OrderConfirmedPage() {
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap} aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>

        <h1 className={styles.heading}>{t('confirmation.thankYouFallback')}</h1>
        <p className={styles.subheading}>{t('confirmation.subheading', { name: '' })}</p>

        <p className={styles.body}>
          {t('confirmation.fallbackBody')}
        </p>

        <div className={styles.actions}>
          <Link to="/shop">
            <Button variant="primary" size="lg">{t('confirmation.continueShopping')}</Button>
          </Link>
          <Link to="/account/orders">
            <Button variant="secondary" size="lg">{t('confirmation.viewMyOrders')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmedPage;
