// src/pages/OrderStatusPage/OrderStatusPage.jsx
import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '@services/orderService';
import Button from '@components/ui/Button/Button';
import Spinner from '@components/ui/Spinner/Spinner';
import Badge from '@components/ui/Badge/Badge';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import styles from './OrderStatusPage.module.css';

function OrderStatusPage() {
  const { id } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'confirmed', 'failed', 'pending', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [order, setOrder] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchStatus = async () => {
    try {
      const response = await orderService.checkPaymentStatus(id);
      const { orderStatus, navioStatus } = response.data;

      if (orderStatus === 'confirmed') {
        const fullOrder = await orderService.trackOrderById(id);
        setOrder(fullOrder);
        setStatus('confirmed');
      } else if (orderStatus === 'cancelled') {
        setStatus('failed');
      } else if (navioStatus === 'PENDING') {
        setStatus('pending');
      } else {
        // Fallback for Cash on Delivery / pending orders
        try {
          const fullOrder = await orderService.trackOrderById(id);
          setOrder(fullOrder);
          setStatus('confirmed');
        } catch (err) {
          setStatus('pending');
        }
      }
    } catch (err) {
      console.error('Error fetching payment status:', err);
      // Fallback: try loading details directly (e.g. public link lookup)
      try {
        const fullOrder = await orderService.trackOrderById(id);
        setOrder(fullOrder);
        setStatus('confirmed');
      } catch (trackErr) {
        setErrorMsg(err.message || 'Failed to retrieve order status.');
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [id, retryCount]);

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

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.loadingState}>
            <Spinner size="lg" />
            <h2 className={styles.title}>Loading Order Details</h2>
            <p className={styles.text}>Retrieving order information and shipping logs. Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
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
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
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
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
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
        </div>
      </div>
    );
  }

  // --- Confirmed Order Details & Yalidine tracking timelines ---
  const trackingCode = order?.shipping?.trackingNumber || order?.yalidineTracking;
  const carrierName = order?.shipping?.provider === 'nord_and_back' ? 'Nord & Back' : order?.shipping?.provider === 'manual' ? 'Manual Delivery' : 'Yalidine';
  const latestShippingStatus = order?.yalidineStatus || order?.shipping?.status || 'En préparation';
  const history = order?.shipping?.history || [];
  const qrValue = `${window.location.origin}/orders/${id}`;

  return (
    <div className={styles.page}>
      <div className={styles.detailsCard}>
        <div className={styles.detailsHeader}>
          <div className={styles.successIcon}>✓</div>
          <div>
            <h1 className={styles.detailsTitle}>Order Status</h1>
            <p className={styles.orderIdLabel}>Order ID: #{id?.toUpperCase()}</p>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          {/* Left Column: Customer and Payment details */}
          <div className={styles.detailsCol}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Delivery Details</h3>
              <p className={styles.detailText}><strong>Name:</strong> {order?.customerName}</p>
              <p className={styles.detailText}><strong>Phone:</strong> {order?.phoneNumber}</p>
              <p className={styles.detailText}><strong>Address:</strong> {order?.homeAddress}</p>
              <p className={styles.detailText}><strong>Location:</strong> {order?.baladia}, {order?.wilaya}</p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Payment Details</h3>
              <p className={styles.detailText}>
                <strong>Method:</strong> {order?.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}
              </p>
              <p className={styles.detailText}>
                <strong>Total Amount:</strong> {formatPrice(order?.totalAmount)}
              </p>
            </div>

            <div className={styles.qrTrackingSection}>
              <div className={styles.qrCodeWrapper}>
                <QRCodeSVG value={qrValue} size={90} />
              </div>
              <div className={styles.qrInfo}>
                <h4 className={styles.qrTitle}>Scan to Track</h4>
                <p className={styles.qrDescription}>Open this page on your phone or scan to share the tracking link.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Ordered Items and tracking timeline */}
          <div className={styles.detailsCol}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Products Ordered</h3>
              <ul className={styles.itemsList}>
                {order?.products?.map((item, idx) => (
                  <li key={`prod-${idx}`} className={styles.itemRow}>
                    <span>{item.name || item.productId?.name} × {item.quantity}</span>
                    <strong>{formatPrice(item.finalPrice * item.quantity)}</strong>
                  </li>
                ))}
                {order?.packs?.map((pack, idx) => (
                  <li key={`pack-${idx}`} className={styles.itemRow}>
                    <span>{pack.name || pack.packId?.name} (Pack) × {pack.quantity}</span>
                    <strong>{formatPrice(pack.finalPrice * pack.quantity)}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📦 Logistics & Shipping</h3>
              {trackingCode ? (
                <div className={styles.shippingPanel}>
                  <div className={styles.shippingMeta}>
                    <p className={styles.detailText}><strong>Carrier:</strong> {carrierName}</p>
                    <p className={styles.detailText}><strong>Tracking Code:</strong> {trackingCode}</p>
                    <p className={styles.detailText}>
                      <strong>Current Status:</strong>{' '}
                      <Badge variant={order.status === 'confirmed' ? 'info' : order.status}>
                        {latestShippingStatus}
                      </Badge>
                    </p>
                  </div>

                  <div className={styles.timelineContainer}>
                    <h4 className={styles.timelineTitle}>Tracking History</h4>
                    {history.length > 0 ? (
                      <div className={styles.timelineList}>
                        {history.map((step, idx) => (
                          <div key={idx} className={styles.timelineItem}>
                            <div className={styles.timelineMarker}></div>
                            <div className={styles.timelineContent}>
                              <div className={styles.stepTitleRow}>
                                <span className={styles.stepStatus}>{step.status}</span>
                                <span className={styles.stepTime}>{new Date(step.timestamp).toLocaleDateString()}</span>
                              </div>
                              {step.location && <span className={styles.stepLoc}>📍 {step.location}</span>}
                              {step.reason && <span className={styles.stepReason}>⚠ {step.reason}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.timelineEmpty}>Parcel registered with carrier. Updates will post shortly.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.preparingBox}>
                  <p>⌛ <strong>Preparing Package</strong></p>
                  <p className={styles.preparingSub}>
                    We are preparing your items for delivery. A tracking code and timeline will appear here once shipped via Yalidine.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footerActions}>
          <Link to="/shop">
            <Button variant="primary" size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderStatusPage;
