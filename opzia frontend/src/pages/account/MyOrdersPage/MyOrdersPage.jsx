// src/pages/account/MyOrdersPage/MyOrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { orderService } from '@services/orderService';
import Badge from '@components/ui/Badge/Badge';
import Spinner from '@components/ui/Spinner/Spinner';
import Button from '@components/ui/Button/Button';
import Input from '@components/ui/Input/Input';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import styles from './MyOrdersPage.module.css';

// ─── Single order card with tracking timeline ───────────────────────────────
function OrderCard({ order }) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    _id, id, createdAt, status, totalAmount,
    products = [], packs = [],
    shippingMethod, shippingFee,
    yalidineTracking, yalidineStatus, shipping
  } = order;

  const orderId = _id || id || '';

  const itemCount = products.reduce((s, p) => s + p.quantity, 0)
                  + packs.reduce((s, p) => s + p.quantity, 0);

  const trackingCode = shipping?.trackingNumber || yalidineTracking;
  const carrierName = shipping?.provider === 'nord_and_back' ? 'Nord & Back' : shipping?.provider === 'manual' ? 'Manual Delivery' : 'Yalidine';
  const latestShippingStatus = yalidineStatus || shipping?.status || 'En préparation';
  const history = shipping?.history || [];

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderCardInner}>
        <div className={styles.orderCardMain}>
          <div className={styles.orderTop}>
            <div>
              <p className={styles.orderId}>#{orderId ? orderId.slice(-8).toUpperCase() : ''}</p>
              <p className={styles.orderDate}>{formatDate(createdAt)}</p>
            </div>
            <Badge variant={status}>{t(`orders.status.${status}`) || status}</Badge>
          </div>

          <div className={styles.orderMeta}>
            <span className={styles.metaItem}>
              {t('orders.itemsLabel', { count: itemCount })}
            </span>
            <span className={styles.metaDot} aria-hidden="true">·</span>
            <span className={styles.metaItem}>{formatPrice(totalAmount)}</span>
          </div>

          {/* Items list */}
          <div className={styles.itemsListContainer}>
            {products.length > 0 && (
              <ul className={styles.itemNames}>
                {products.map((p, i) => (
                  <li key={i}>
                    {p.product?.name || t('orders.itemFallback')} × {p.quantity}
                  </li>
                ))}
              </ul>
            )}
            {packs.length > 0 && (
              <ul className={styles.itemNames}>
                {packs.map((p, i) => (
                  <li key={i}>
                    {p.pack?.name || t('orders.packFallback')} × {p.quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.orderCardQR}>
          <div className={styles.cardQRWrapper}>
            <QRCodeSVG value={`${window.location.origin}/orders/${orderId}`} size={64} />
          </div>
          <span className={styles.cardQRLabel}>Track Order</span>
        </div>
      </div>

      {/* Tracking / Shipping Section */}
      <div className={styles.trackingWrapper}>
        {trackingCode ? (
          <div className={styles.trackingHeader}>
            <div className={styles.carrierInfo}>
              <span className={styles.carrierLabel}>Carrier:</span>
              <strong className={styles.carrierVal}>{carrierName}</strong>
              <span className={styles.codeText}>({trackingCode})</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide Tracking' : 'Track Package 🚚'}
            </Button>
          </div>
        ) : (
          <p className={styles.noTrackingInfo}>
            📦 Processing shipment. Tracking info will be available shortly.
          </p>
        )}

        {/* Collapsible Tracking Timeline */}
        {isExpanded && trackingCode && (
          <div className={styles.timelineContainer}>
            <div className={styles.timelineHeader}>
              <span>Status: <strong>{latestShippingStatus}</strong></span>
            </div>

            <div className={styles.timelineContentWrapper}>
              <div className={styles.qrColumn}>
                <div className={styles.qrWrapper}>
                  <QRCodeSVG 
                    value={`${window.location.origin}/orders/${orderId}`} 
                    size={80} 
                  />
                </div>
                <span className={styles.qrLabel}>Scan to Track</span>
              </div>

              <div className={styles.timelineListColumn}>
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
                  <div className={styles.timelineEmpty}>
                    Parcel registered with carrier. Logistics steps will update once the shipment is processed.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────
function MyOrdersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Search state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOrders, setPhoneOrders] = useState([]);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Logged-in orders state
  const [myOrders, setMyOrders] = useState([]);
  const [isLoadingMyOrders, setIsLoadingMyOrders] = useState(false);
  const [myOrdersError, setMyOrdersError] = useState(null);

  // Load registered customer orders
  const loadMyOrders = useCallback(async () => {
    if (!user) return;
    setIsLoadingMyOrders(true);
    setMyOrdersError(null);
    try {
      const data = await orderService.getMyOrders({ sort: '-createdAt' });
      setMyOrders(data || []);
    } catch (err) {
      setMyOrdersError(err.message || 'Failed to load order history.');
    } finally {
      setIsLoadingMyOrders(false);
    }
  }, [user]);

  useEffect(() => {
    loadMyOrders();
  }, [loadMyOrders]);

  const handlePhoneSearch = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsSearchingPhone(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const res = await orderService.trackByPhone(phoneNumber.trim());
      setPhoneOrders(res || []);
    } catch (err) {
      setSearchError(err.message || 'Lookup failed.');
      setPhoneOrders([]);
    } finally {
      setIsSearchingPhone(false);
    }
  };

  const handleClearSearch = () => {
    setPhoneNumber('');
    setPhoneOrders([]);
    setHasSearched(false);
    setSearchError(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        
        {/* Banner header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Track Your Orders</h1>
          <p className={styles.sub}>Track shipment status updates, view order details, and search order history.</p>
        </header>

        {/* Lookup form card */}
        <div className={styles.lookupCard}>
          <h3 className={styles.lookupTitle}>Guest Order Lookup</h3>
          <p className={styles.lookupDesc}>
            Check-out as a guest? Enter the phone number used during checkout to view and track your shipments.
          </p>
          <form onSubmit={handlePhoneSearch} className={styles.lookupForm}>
            <Input
              type="tel"
              placeholder="e.g. 0542658958"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={styles.lookupInput}
              required
            />
            <div className={styles.formBtnGroup}>
              <Button type="submit" variant="primary" disabled={isSearchingPhone}>
                {isSearchingPhone ? 'Searching...' : 'Find & Track Orders'}
              </Button>
              {hasSearched && (
                <Button type="button" variant="secondary" onClick={handleClearSearch}>
                  Clear Search
                </Button>
              )}
            </div>
          </form>

          {/* Prompt login if not logged in */}
          {!user && (
            <p className={styles.loginPrompt}>
              Have an account? <Link to="/account/login" className={styles.loginLink}>Log in</Link> to view all your orders automatically.
            </p>
          )}
        </div>

        {/* --- Display results based on state --- */}

        {/* Case A: Phone Search Results */}
        {hasSearched ? (
          <div className={styles.resultsWrapper}>
            <h2 className={styles.sectionTitle}>
              Search Results ({phoneOrders.length})
            </h2>
            {isSearchingPhone ? (
              <div className={styles.stateWrap}><Spinner size="lg" /></div>
            ) : searchError ? (
              <div className={styles.stateWrap}><p className={styles.errorText}>{searchError}</p></div>
            ) : phoneOrders.length === 0 ? (
              <div className={styles.stateWrap}>
                <p className={styles.emptyText}>No orders found linked to this phone number.</p>
              </div>
            ) : (
              <div className={styles.orderList}>
                {phoneOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Case B: Logged-in Customer History */
          user && (
            <div className={styles.resultsWrapper}>
              <h2 className={styles.sectionTitle}>Registered Orders History</h2>
              {isLoadingMyOrders ? (
                <div className={styles.stateWrap}><Spinner size="lg" /></div>
              ) : myOrdersError ? (
                <div className={styles.stateWrap}><p className={styles.errorText}>{myOrdersError}</p></div>
              ) : myOrders.length === 0 ? (
                <div className={styles.stateWrap}>
                  <p className={styles.emptyText}>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className={styles.orderList}>
                  {myOrders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;
