// src/pages/admin/AdminOrderDetailPage/AdminOrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '@services/orderService';
import { useLanguage } from '@hooks/useLanguage';
import Spinner from '@components/ui/Spinner/Spinner';
import Button from '@components/ui/Button/Button';
import OrderInvoice from '@components/admin/OrderInvoice/OrderInvoice';
import styles from './AdminOrderDetailPage.module.css';

function AdminOrderDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrder(id);
      if (data) {
        setOrder(data);
      } else {
        setError(t('admin.orderDetail.errorNotFound'));
      }
    } catch (err) {
      setError(err.message || t('admin.orderDetail.errorRetrieve'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleStatusUpdated = (updatedOrder) => {
    setOrder(updatedOrder);
  };

  return (
    <div className={styles.page}>
      {/* Back button (hidden during print) */}
      <div className={`${styles.headerRow} ${styles.noPrint}`}>
        <Link to="/admin/orders">
          <Button variant="secondary" size="sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.backIcon}
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {t('admin.orderDetail.backToOrders')}
          </Button>
        </Link>
        <h1 className={styles.pageTitle}>{t('admin.orderDetail.invoiceDetailTitle')}</h1>
      </div>

      {error && (
        <div className={`${styles.error} ${styles.noPrint}`}>
          <p>{error}</p>
          <Link to="/admin/orders" className={styles.errorLink}>
            {t('admin.orderDetail.returnBtn')}
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingWrap}>
          <Spinner size="lg" />
          <p>{t('admin.orderDetail.loading')}</p>
        </div>
      ) : order ? (
        <div className={styles.invoiceWrap}>
          <OrderInvoice order={order} onStatusUpdated={handleStatusUpdated} />
        </div>
      ) : (
        <div className={`${styles.empty} ${styles.noPrint}`}>{t('admin.orderDetail.empty')}</div>
      )}
    </div>
  );
}

export default AdminOrderDetailPage;
