// src/components/admin/OrderInvoice/OrderInvoice.jsx
import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { orderService } from '@services/orderService';
import { useUI } from '@hooks/useUI';
import { useLanguage } from '@hooks/useLanguage';
import Badge from '@components/ui/Badge/Badge';
import Button from '@components/ui/Button/Button';
import Spinner from '@components/ui/Spinner/Spinner';
import styles from './OrderInvoice.module.css';

function OrderInvoice({ order: initialOrder, onStatusUpdated, onClose }) {
  const { t, currentLanguage } = useLanguage();
  const { addToast } = useUI();
  const [isUpdating, setIsUpdating]         = useState(false);
  const [isSendingToYalidine, setIsSending] = useState(false);
  const [isCancelingYalidine, setIsCanceling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(initialOrder.shipping?.provider || 'yalidine');
  // Allow local update of tracking data after sendToYalidine
  const [order, setOrder]                   = useState(initialOrder);

  const qrValue = useMemo(() => {
    const baseUrl = window.location.origin || 'https://opzia.com';
    return `${baseUrl}/orders/${order?._id || order?.id}`;
  }, [order]);

  const statusOptions = useMemo(() => {
    const isPaidOnline = ['cib', 'dahabia'].includes(order?.paymentMethod);
    const options = [];

    // Only allow 'pending' if it's not a confirmed/paid online order
    if (!isPaidOnline || order?.status === 'pending') {
      options.push({ value: 'pending', label: t('orders.status.pending') });
    }

    options.push(
      { value: 'confirmed', label: t('orders.status.confirmed') },
      { value: 'shipped', label: t('orders.status.shipped') },
      { value: 'delivered', label: t('orders.status.delivered') },
      { value: 'cancelled', label: t('orders.status.cancelled') }
    );

    return options;
  }, [t, order?.paymentMethod, order?.status]);

  if (!order) return null;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsUpdating(true);
    try {
      const updatedOrder = await orderService.updateOrder(order._id || order.id, { status: newStatus });
      setOrder(updatedOrder);
      addToast(t('admin.orderDetail.toastSuccess'), 'success');
      if (onStatusUpdated) {
        onStatusUpdated(updatedOrder);
      }
    } catch (err) {
      addToast(err.message || t('admin.orderDetail.toastError'), 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendToYalidine = async () => {
    setIsSending(true);
    try {
      const result = await orderService.sendToYalidine(order._id || order.id, selectedProvider);
      setOrder((prev) => ({
        ...prev,
        yalidineTracking: result.tracking,
        yalidineLabelUrl: result.labelUrl,
        yalidineStatus: 'En préparation',
        shipping: {
          provider: selectedProvider,
          trackingNumber: result.tracking,
          status: 'En préparation',
          labelUrl: result.labelUrl,
          history: [
            {
              status: 'En préparation',
              location: prev.wilaya,
              reason: '',
              timestamp: new Date(),
            },
          ],
        },
      }));
      addToast(`Parcel created: ${result.tracking}`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to send to shipping', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelYalidine = async () => {
    if (!window.confirm('Are you sure you want to cancel this shipment?')) return;
    setIsCanceling(true);
    try {
      await orderService.cancelYalidine(order._id || order.id);
      setOrder((prev) => ({
        ...prev,
        yalidineTracking: undefined,
        yalidineLabelUrl: undefined,
        yalidineStatus: undefined,
        shipping: {
          ...prev.shipping,
          trackingNumber: undefined,
          status: undefined,
          labelUrl: undefined,
          history: [],
        },
      }));
      addToast('Shipment cancelled successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to cancel shipment', 'error');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleSyncShipping = async () => {
    setIsSyncing(true);
    try {
      const updatedOrder = await orderService.syncShipping(order._id || order.id);
      setOrder(updatedOrder);
      if (onStatusUpdated) {
        onStatusUpdated(updatedOrder);
      }
      addToast('Shipment status updated from carrier', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to sync shipping status', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const localeCode = currentLanguage === 'ar' ? 'ar-EG' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
  const formattedDate = new Date(order.createdAt).toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.container} id="printable-invoice">
      {/* Action panel (hidden on print) */}
      <div className={`${styles.actionPanel} ${styles.noPrint}`}>
        <div className={styles.statusControl}>
          <label htmlFor="order-status-select" className={styles.statusLabel}>
            {t('admin.orderDetail.updateStatusLabel')}
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="order-status-select"
              value={order.status}
              onChange={handleStatusChange}
              disabled={isUpdating}
              className={styles.statusSelect}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {isUpdating && <Spinner size="sm" className={styles.updatingSpinner} />}
          </div>
        </div>

        <div className={styles.panelRight}>
            {/* Shipping action buttons */}
            {!order.yalidineTracking && !order.shipping?.trackingNumber && ['confirmed', 'shipped'].includes(order.status) && (
              <div className={styles.shippingActionsGroup}>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                >
                  <option value="yalidine">Yalidine (Guepex)</option>
                  <option value="nord_and_back">Nord & Back</option>
                  <option value="manual">Manual Delivery</option>
                </select>
                <Button
                  variant="secondary"
                  onClick={handleSendToYalidine}
                  disabled={isSendingToYalidine}
                >
                  {isSendingToYalidine ? 'Sending…' : '🚚 Send to Shipping'}
                </Button>
              </div>
            )}

            {(order.yalidineTracking || order.shipping?.trackingNumber) && (
              <Button
                variant="neutral"
                onClick={handleCancelYalidine}
                disabled={isCancelingYalidine}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: '#dc2626',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                }}
              >
                {isCancelingYalidine ? 'Canceling…' : '❌ Cancel Shipping'}
              </Button>
            )}

            {(order.yalidineLabelUrl || order.shipping?.labelUrl) && (
              <Button
                variant="secondary"
                onClick={() => window.open(order.yalidineLabelUrl || order.shipping?.labelUrl, '_blank')}
              >
                📋 Print Label
              </Button>
            )}

            <Button variant="secondary" onClick={handlePrint}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.btnIcon}
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              {t('admin.orderDetail.printOrder')}
            </Button>

            {onClose && (
              <Button variant="neutral" onClick={onClose}>
                {t('admin.orderDetail.closeBtn')}
              </Button>
            )}
          </div>
      </div>

      {/* Invoice Sheet */}
      <div className={`${styles.invoiceSheet} ${styles[order.status]}`}>
        {/* Invoice Header */}
        <div className={styles.header}>
          <div className={styles.storeInfo}>
            <img src="/opzia logo white.png?v=2" alt="Opzia Logo" className={styles.logoImg} />
            <h2 className={styles.storeName}>OPZIA STORE</h2>
            <p className={styles.storeText}>Beauty, Wellness & Care</p>
            <p className={styles.storeDetail}><strong>Email:</strong> contact@opzia.com</p>
            <p className={styles.storeDetail}><strong>{t('admin.orderDetail.phone')}</strong> +213 555 12 34 56</p>
            <p className={styles.storeDetail}><strong>{t('admin.orderDetail.address')}</strong> Algiers, Algeria</p>
          </div>

          <div className={styles.invoiceMeta}>
            <h1 className={styles.invoiceTitle}>{t('admin.orderDetail.invoiceNo').toUpperCase()}</h1>
            <p className={styles.metaRow}>
              <strong>{t('orders.idLabel')}:</strong> <span className={styles.idText}>#{order._id || order.id}</span>
            </p>
            <p className={styles.metaRow}>
              <strong>{t('orders.dateLabel')}:</strong> {formattedDate}
            </p>
            <p className={styles.metaRow}>
              <strong>{t('admin.orderDetail.status')}:</strong>{' '}
              <Badge variant={order.status} className={styles.badge}>
                {t(`orders.status.${order.status}`).toUpperCase()}
              </Badge>
            </p>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Customer Info */}
        <div className={styles.billingSection}>
          <div className={styles.billTo}>
            <h3 className={styles.sectionHeading}>{t('admin.orderDetail.billTo')}</h3>
            <p className={styles.customerName}>{order.customerName}</p>
            <p className={styles.customerText}><strong>{t('admin.orderDetail.phone')}</strong> {order.phoneNumber}</p>
            <p className={styles.customerText}><strong>{t('admin.orderDetail.address')}</strong> {order.homeAddress}</p>
            <p className={styles.customerText}>
              <strong>{t('admin.orderDetail.location')}</strong> {order.baladia}, {order.wilaya}
            </p>
            <p className={styles.customerText}><strong>{t('admin.orderDetail.country')}</strong> {t('admin.orderDetail.algeria')}</p>
          </div>

          <div className={styles.paymentInfo}>
            <h3 className={styles.sectionHeading}>{t('admin.orderDetail.paymentDetails')}</h3>
            <p className={styles.customerText}>
              <strong>{t('admin.orderDetail.paymentMethod')}:</strong> {order.paymentMethod ? order.paymentMethod.toUpperCase() : t('checkout.codLabel')}
            </p>
            <p className={styles.customerText}>
              <strong>{t('admin.orderDetail.currency')}</strong> USD ($)
            </p>
            {order.totalProfit !== undefined && (
              <p className={`${styles.customerText} ${styles.noPrint} ${styles.profitText}`}>
                <strong>{t('admin.orderDetail.totalProfitAdmin')}</strong> ${order.totalProfit.toFixed(2)}
              </p>
            )}

            {/* Shipping / Delivery Info */}
            <div className={styles.yalidineSection}>
              <h4 className={styles.yalidineTitle}>&#128666; Shipping & Logistics</h4>
              <p className={styles.customerText}>
                <strong>Method:</strong>{' '}
                {order.shippingMethod === 'stopdesk' ? '🏪 Stopdesk Pickup' : '🏠 Home Delivery'}
              </p>
              {order.shippingFee > 0 && (
                <p className={styles.customerText}>
                  <strong>Shipping Fee:</strong>{' '}
                  <span className={styles.yalidineHighlight}>{order.shippingFee} DZD</span>
                </p>
              )}
              {(order.yalidineTracking || order.shipping?.trackingNumber) ? (
                <>
                  <p className={styles.customerText}>
                    <strong>Carrier:</strong>{' '}
                    <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                      {order.shipping?.provider === 'nord_and_back' ? 'Nord & Back' : order.shipping?.provider === 'manual' ? 'Manual' : 'Yalidine'}
                    </span>
                  </p>
                  <p className={styles.customerText}>
                    <strong>Tracking:</strong>{' '}
                    <span className={styles.trackingCode}>{order.shipping?.trackingNumber || order.yalidineTracking}</span>
                  </p>
                  <p className={styles.customerText} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>Status:</strong>{' '}
                    <span className={styles.yalidineStatus}>{order.yalidineStatus || order.shipping?.status || 'En préparation'}</span>
                    {order.shipping?.provider !== 'manual' && (
                      <button
                        type="button"
                        onClick={handleSyncShipping}
                        disabled={isSyncing}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-brand)',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '11px',
                          textDecoration: 'underline',
                          fontFamily: 'inherit',
                        }}
                      >
                        {isSyncing ? 'Syncing...' : '🔄 Sync'}
                      </button>
                    )}
                  </p>

                  {/* Render Shipment history log details if present */}
                  {order.shipping?.history && order.shipping.history.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--color-border)' }}>
                      <h5 style={{ margin: '0 0 8px 0', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking History</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                        {order.shipping.history.map((log, idx) => (
                          <div key={idx} style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-primary)' }}>
                              <span style={{ fontWeight: '500' }}>{log.status}</span>
                              <span style={{ color: 'var(--color-text-muted)' }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                            {log.location && <span style={{ color: 'var(--color-text-secondary)' }}>📍 {log.location}</span>}
                            {log.reason && <span style={{ color: 'var(--color-danger-700)', fontStyle: 'italic' }}>⚠ {log.reason}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className={styles.customerText} style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  Not yet sent to shipping
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className={styles.tableWrap}>
          <table className={styles.invoiceTable}>
            <thead>
              <tr>
                <th>{t('admin.categories.table.description')}</th>
                <th className={styles.textCenter}>{t('admin.orderDetail.itemTable.qty')}</th>
                <th className={styles.textRight}>{t('admin.orderDetail.itemTable.price')}</th>
                <th className={styles.textRight}>{t('admin.orderDetail.itemTable.total')}</th>
              </tr>
            </thead>
            <tbody>
              {/* Individual Products */}
              {order.products &&
                order.products.map((item, index) => (
                  <tr key={`prod-${index}`}>
                    <td>
                      <span className={styles.itemName}>{item.name || t('orders.itemFallback')}</span>
                      <span className={styles.itemType}>{t('orders.itemFallback')}</span>
                    </td>
                    <td className={styles.textCenter}>{item.quantity}</td>
                    <td className={styles.textRight}>${item.finalPrice?.toFixed(2)}</td>
                    <td className={styles.textRight}>${(item.finalPrice * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}

              {/* Packs */}
              {order.packs &&
                order.packs.map((pack, index) => (
                  <tr key={`pack-${index}`} className={styles.packRow}>
                    <td>
                      <span className={styles.itemName}>{pack.name || t('orders.packFallback')}</span>
                      <span className={styles.itemType}>{t('orders.packFallback')}</span>
                      {pack.products && pack.products.length > 0 && (
                        <ul className={styles.packProductsList}>
                          {pack.products.map((subProd, subIndex) => (
                            <li key={subIndex} className={styles.packProductItem}>
                              • {subProd.quantity}x {subProd.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className={styles.textCenter}>{pack.quantity}</td>
                    <td className={styles.textRight}>${pack.finalPrice?.toFixed(2)}</td>
                    <td className={styles.textRight}>${(pack.finalPrice * pack.quantity).toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className={styles.totalsWrap}>
          <div className={styles.qrContainer}>
            <div className={styles.qrCodeBox}>
              <QRCodeSVG value={qrValue} size={80} />
            </div>
            <div className={styles.qrInfo}>
              <p className={styles.qrTitle}>Scan to Track</p>
              <p className={styles.qrText}>
                {order.yalidineTracking || order.shipping?.trackingNumber
                  ? 'Official Carrier Status'
                  : 'Opzia Store Status'}
              </p>
            </div>
          </div>
          <div className={styles.totalsContent}>
            {order.couponDiscount > 0 ? (
              <>
                <div className={styles.totalRow}>
                  <span>{t('admin.orderDetail.subtotal')}:</span>
                  <span>${((order.totalAmount || 0) - (order.shippingFee || 0) + (order.couponDiscount || 0)).toFixed(2)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span style={{ color: 'var(--color-success, #10b981)', fontWeight: 'bold' }}>
                    Coupon ({order.couponCode}):
                  </span>
                  <span style={{ color: 'var(--color-success, #10b981)', fontWeight: 'bold' }}>
                    -${(order.couponDiscount || 0).toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.totalRow}>
                <span>{t('admin.orderDetail.subtotal')}:</span>
                <span>${((order.totalAmount || 0) - (order.shippingFee || 0)).toFixed(2)}</span>
              </div>
            )}
            {order.shippingFee > 0 ? (
              <div className={styles.totalRow}>
                <span>{t('admin.orderDetail.shipping')} ({order.shippingMethod === 'stopdesk' ? 'Stopdesk' : 'Home'}):</span>
                <span className={styles.yalidineHighlight}>${(order.shippingFee || 0).toFixed(2)}</span>
              </div>
            ) : (
              <div className={styles.totalRow}>
                <span>{t('admin.orderDetail.shipping')}:</span>
                <span>$0.00 ({t('admin.orderDetail.free')})</span>
              </div>
            )}
            <hr className={styles.subDivider} />
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>{t('admin.orderDetail.totalSum')}:</span>
              <span>${(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer message */}
        <div className={styles.invoiceFooter}>
          <p>{t('admin.orderDetail.thankYouMessage')}</p>
          <p className={styles.footerNote}>
            {t('admin.orderDetail.invoiceDisclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderInvoice;
