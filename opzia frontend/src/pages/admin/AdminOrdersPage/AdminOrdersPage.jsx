// src/pages/admin/AdminOrdersPage/AdminOrdersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '@services/orderService';
import { useUI } from '@hooks/useUI';
import { useLanguage } from '@hooks/useLanguage';
import Button from '@components/ui/Button/Button';
import Input from '@components/ui/Input/Input';
import Select from '@components/ui/Select/Select';
import Badge from '@components/ui/Badge/Badge';
import Spinner from '@components/ui/Spinner/Spinner';
import Modal from '@components/ui/Modal/Modal';
import OrderInvoice from '@components/admin/OrderInvoice/OrderInvoice';
import styles from './AdminOrdersPage.module.css';

function AdminOrdersPage() {
  const { addToast } = useUI();
  const { t, currentLanguage } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Invoice Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const statusFilterOptions = useMemo(() => [
    { value: '', label: t('admin.ordersList.statusAll') },
    { value: 'pending', label: t('orders.status.pending') },
    { value: 'confirmed', label: t('orders.status.confirmed') },
    { value: 'shipped', label: t('orders.status.shipped') },
    { value: 'delivered', label: t('orders.status.delivered') },
    { value: 'cancelled', label: t('orders.status.cancelled') },
  ], [t]);

  // Load Orders
  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch matching orders from the backend, sorted by newest first
      const params = {
        sort: '-createdAt',
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const data = await orderService.getOrders(params);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  // Client-side composite filtering (Search, Date ranges, Price range)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query filter (Customer name, phone, or ID)
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = order.customerName?.toLowerCase().includes(query);
        const phoneMatch = order.phoneNumber?.includes(query);
        const idMatch = order._id?.toLowerCase().includes(query) || order.id?.toLowerCase().includes(query);
        if (!nameMatch && !phoneMatch && !idMatch) return false;
      }

      // 2. Date Range filter
      if (startDate) {
        const orderDate = new Date(order.createdAt);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const orderDate = new Date(order.createdAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      // 3. Price Range filter
      if (minPrice) {
        if ((order.totalAmount || 0) < parseFloat(minPrice)) return false;
      }
      if (maxPrice) {
        if ((order.totalAmount || 0) > parseFloat(maxPrice)) return false;
      }

      return true;
    });
  }, [orders, searchQuery, startDate, endDate, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setMinPrice('');
    setMaxPrice('');
  };

  const handleOpenInvoice = (order) => {
    setSelectedOrder(order);
    setIsInvoiceModalOpen(true);
  };

  const handleCloseInvoice = () => {
    setSelectedOrder(null);
    setIsInvoiceModalOpen(false);
  };

  const handleStatusUpdated = (updatedOrder) => {
    // Update local state so status change is reflected immediately in the table
    setOrders((prev) =>
      prev.map((ord) => ((ord._id || ord.id) === (updatedOrder._id || updatedOrder.id) ? updatedOrder : ord))
    );
    // Also update selectedOrder in the modal so the detail view shows the update
    setSelectedOrder(updatedOrder);
  };

  const getProductsSummary = (order) => {
    const items = [];
    if (order.products) {
      order.products.forEach((p) => {
        items.push(`${p.quantity}x ${p.name || t('orders.itemFallback')}`);
      });
    }
    if (order.packs) {
      order.packs.forEach((p) => {
        items.push(`${p.quantity}x ${p.name || t('orders.packFallback')}`);
      });
    }
    return items.join(', ');
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{t('admin.ordersList.title')}</h1>
          <p className={styles.subtitle}>
            {t('admin.ordersList.subtitle')}
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className={styles.filtersCard}>
        <h3 className={styles.filterTitle}>{t('admin.ordersList.filterTitle')}</h3>
        <div className={styles.filterGrid}>
          <div className={styles.filterCol}>
            <Input
              label={t('admin.ordersList.searchLabel')}
              placeholder={t('admin.ordersList.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterCol}>
            <Select
              label={t('admin.ordersList.statusLabel')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusFilterOptions}
            />
          </div>

          <div className={styles.filterCol}>
            <label className={styles.label}>{t('admin.ordersList.dateRangeLabel')}</label>
            <div className={styles.dateInputs}>
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder={t('admin.ordersList.from')}
              />
              <span className={styles.dateSeparator}>{t('admin.ordersList.to').toLowerCase()}</span>
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder={t('admin.ordersList.to')}
              />
            </div>
          </div>

          <div className={styles.filterCol}>
            <label className={styles.label}>{t('admin.ordersList.priceRangeLabel')}</label>
            <div className={styles.priceInputs}>
              <input
                type="number"
                min="0"
                placeholder={t('admin.ordersList.min')}
                className={styles.priceInput}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className={styles.priceSeparator}>-</span>
              <input
                type="number"
                min="0"
                placeholder={t('admin.ordersList.max')}
                className={styles.priceInput}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.filterActions}>
          <Button variant="secondary" size="sm" onClick={handleResetFilters}>
            {t('admin.ordersList.resetFilters')}
          </Button>
          <span className={styles.resultsCount}>
            {t(filteredOrders.length === 1 ? 'admin.ordersList.foundOrders' : 'admin.ordersList.foundOrders_plural', { count: filteredOrders.length })}
          </span>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isLoading ? (
        <div className={styles.loadingWrap}>
          <Spinner size="lg" />
          <p>{t('admin.ordersList.loading')}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.empty}>
          {t('admin.ordersList.empty')}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('admin.ordersList.table.id')}</th>
                <th>{t('admin.ordersList.table.date')}</th>
                <th>{t('admin.ordersList.table.customer')}</th>
                <th>{t('admin.ordersList.table.itemsSummary')}</th>
                <th>{t('admin.ordersList.table.address')}</th>
                <th>{t('admin.ordersList.table.amount')}</th>
                <th>{t('admin.ordersList.table.status')}</th>
                <th>{t('admin.ordersList.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const orderId = order._id || order.id;
                const localeCode = currentLanguage === 'ar' ? 'ar-EG' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
                const formattedDate = new Date(order.createdAt).toLocaleDateString(localeCode, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr key={orderId} className={styles.orderRow}>
                    <td className={styles.idCell}>
                      <button className={styles.idButton} onClick={() => handleOpenInvoice(order)}>
                        {orderId.substring(orderId.length - 8).toUpperCase()}
                      </button>
                    </td>
                    <td className={styles.dateCell}>{formattedDate}</td>
                    <td>
                      <div className={styles.customerName}>{order.customerName}</div>
                      <div className={styles.customerPhone}>{order.phoneNumber}</div>
                    </td>
                    <td>
                      <span className={styles.summaryText} title={getProductsSummary(order)}>
                        {getProductsSummary(order) || '—'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.addressText}>
                        {order.homeAddress}, {order.baladia}, {order.wilaya}
                      </div>
                    </td>
                    <td className={styles.priceCell}>
                      ${order.totalAmount != null ? order.totalAmount.toFixed(2) : '0.00'}
                    </td>
                    <td>
                      <Badge variant={order.status}>{t(`orders.status.${order.status}`)}</Badge>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className={styles.actionButton}
                          onClick={() => handleOpenInvoice(order)}
                        >
                          {t('admin.ordersList.table.invoice')}
                        </Button>
                        <Link to={`/admin/orders/${orderId}`}>
                          <Button variant="neutral" size="sm" className={styles.actionButton}>
                            {t('admin.ordersList.table.detail')}
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Details Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoice}
        title=""
        size="lg"
      >
        {selectedOrder && (
          <OrderInvoice
            order={selectedOrder}
            onClose={handleCloseInvoice}
            onStatusUpdated={handleStatusUpdated}
          />
        )}
      </Modal>
    </div>
  );
}

export default AdminOrdersPage;
