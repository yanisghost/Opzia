// src/pages/OrderStatusPage/OrderStatusPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '@services/orderService';
import Button from '@components/ui/Button/Button';
import Spinner from '@components/ui/Spinner/Spinner';
import styles from './OrderStatusPage.module.css';

function OrderStatusPage() {
  const { id } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'confirmed', 'failed', 'pending'
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchStatus = async () => {
    try {
      const response = await orderService.checkPaymentStatus(id);
      const { orderStatus, navioStatus } = response.data;

      if (orderStatus === 'confirmed') {
        setStatus('confirmed');
      } else if (orderStatus === 'cancelled') {
        setStatus('failed');
      } else if (navioStatus === 'PENDING') {
        setStatus('pending');
      } else {
        setStatus('pending');
      }
    } catch (err) {
      console.error('Error fetching payment status:', err);
      setErrorMsg(err.message || 'Failed to check payment status.');
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [id, retryCount]);

  // Optional: Auto-poll every 5 seconds if state is pending
  useEffect(() => {
    if (status !== 'pending') return;

    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [status, id]);

  const handleRetry = () => {
    setStatus('loading');
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {status === 'loading' && (
          <div className={styles.loadingState}>
            <Spinner size="lg" />
            <h2 className={styles.title}>Verifying Payment</h2>
            <p className={styles.text}>We are checking your transaction status with the secure payment server. Please do not close or reload this page.</p>
          </div>
        )}

        {status === 'confirmed' && (
          <div className={styles.successState}>
            <div className={styles.iconWrapSuccess}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <h2 className={styles.titleSuccess}>Payment Confirmed!</h2>
            <p className={styles.text}>Thank you! Your payment was successful and your order #{id} has been placed.</p>
            <div className={styles.actions}>
              <Link to="/shop">
                <Button variant="primary" size="lg">Continue Shopping</Button>
              </Link>
              <Link to="/account/orders">
                <Button variant="secondary" size="lg">View My Orders</Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className={styles.failedState}>
            <div className={styles.iconWrapFailed}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h2 className={styles.titleFailed}>Payment Failed</h2>
            <p className={styles.text}>The card transaction was declined, cancelled, or expired. No funds have been debited.</p>
            <div className={styles.actions}>
              <Link to="/checkout">
                <Button variant="primary" size="lg">Retry Checkout</Button>
              </Link>
              <Link to="/shop">
                <Button variant="secondary" size="lg">Return to Shop</Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className={styles.pendingState}>
            <div className={styles.iconWrapPending}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h2 className={styles.titlePending}>Payment Still Pending</h2>
            <p className={styles.text}>The secure server has not confirmed payment yet. If you have already completed the transaction, click the button below to update.</p>
            <div className={styles.actions}>
              <Button variant="primary" size="lg" onClick={handleRetry}>Check Status Now</Button>
              <Link to="/shop">
                <Button variant="secondary" size="lg">Back to Shop</Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.errorState}>
            <div className={styles.iconWrapFailed}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className={styles.titleFailed}>Status Check Error</h2>
            <p className={styles.text}>{errorMsg || 'We encountered a connection issue while querying payment status.'}</p>
            <div className={styles.actions}>
              <Button variant="primary" size="lg" onClick={handleRetry}>Retry Check</Button>
              <Link to="/shop">
                <Button variant="secondary" size="lg">Return to Shop</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderStatusPage;
