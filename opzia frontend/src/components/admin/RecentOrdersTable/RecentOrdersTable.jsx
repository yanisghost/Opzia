// src/components/admin/RecentOrdersTable/RecentOrdersTable.jsx
// Shows the 5 most recent orders with inline status update.
// Used on AdminDashboard. Full table lives on AdminOrdersPage.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';
import { orderService } from '@services/orderService';
import { useUI } from '@hooks/useUI';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import styles from './RecentOrdersTable.module.css';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function RecentOrdersTable({ orders = [], onStatusChange }) {
  const { addToast } = useUI();
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateOrder(orderId, { status: newStatus });
      addToast('Order status updated.', 'success');
      onStatusChange?.();
    } catch (err) {
      addToast(err.message || 'Could not update status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (orders.length === 0) {
    return <p className={styles.empty}>No recent orders.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Order ID</th>
            <th className={styles.th}>Customer</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Total</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className={styles.row}>
              <td className={styles.td}>
                <span className={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</span>
              </td>
              <td className={styles.td}>{order.customerName}</td>
              <td className={styles.td}>{formatDate(order.createdAt)}</td>
              <td className={styles.td}>{formatPrice(order.totalAmount)}</td>
              <td className={styles.td}>
                <StatusBadge status={order.status} />
              </td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <select
                    className={styles.statusSelect}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                    aria-label={`Change status for order ${order._id}`}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className={styles.viewBtn}
                    aria-label="View order"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentOrdersTable;
