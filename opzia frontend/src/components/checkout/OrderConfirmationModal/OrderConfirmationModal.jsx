// src/components/checkout/OrderConfirmationModal/OrderConfirmationModal.jsx
// Success modal shown after a successful order creation.
// Displays: order ID, customer name, and next-step instructions.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@hooks/useLanguage';
import Modal from '@components/ui/Modal/Modal';
import Button from '@components/ui/Button/Button';
import styles from './OrderConfirmationModal.module.css';

function OrderConfirmationModal({ isOpen, order, onClose }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleContinue = () => {
    onClose?.();
    navigate('/');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showCloseButton={false}
      closeOnBackdrop={false}
      size="sm"
    >
      <div className={styles.content}>
        {/* Icon */}
        <div className={styles.iconWrap} aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>

        <h2 className={styles.heading}>{t('confirmation.title')}</h2>
        <p className={styles.subheading}>
          {t('confirmation.subheading', { name: order?.customerName ? `, ${order.customerName}` : '' })}
        </p>

        {order?._id && (
          <div className={styles.orderRef}>
            <span className={styles.refLabel}>{t('confirmation.reference')}</span>
            <span className={styles.refValue}>
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>
        )}

        <p className={styles.note}>
          {t('confirmation.phoneNotice', { phone: order?.phoneNumber || '' })}{' '}
          {t('confirmation.dispatchNotice')}
        </p>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleContinue}
        >
          {t('confirmation.continueShopping')}
        </Button>
      </div>
    </Modal>
  );
}

export default OrderConfirmationModal;
