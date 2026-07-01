// src/pages/admin/AdminShippingPage/AdminShippingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { shippingService } from '@services/shippingService';
import { useUI } from '@hooks/useUI';
import KPICard from '@components/admin/KPICard/KPICard';
import Input from '@components/ui/Input/Input';
import Select from '@components/ui/Select/Select';
import Button from '@components/ui/Button/Button';
import Badge from '@components/ui/Badge/Badge';
import styles from './AdminShippingPage.module.css';

// Inline SVGs for lightweight bundling
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
);
const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const AlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const PrinterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
);
const RotateCwIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || ''}><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
);

function AdminShippingPage() {
  const { addToast } = useUI();

  // Stats State
  const [stats, setStats] = useState({
    totalParcels: 0,
    delivered: 0,
    shipped: 0,
    returned: 0,
    failed: 0,
  });

  // Parcels Data State
  const [parcels, setParcels] = useState([]);
  const [totalParcelsCount, setTotalParcelsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const loadStats = useCallback(async () => {
    try {
      const res = await shippingService.getShippingStats();
      if (res.status === 'success') {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load shipping stats:', err);
    }
  }, []);

  const loadParcels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        provider: providerFilter || undefined,
        status: statusFilter || undefined,
      };
      const res = await shippingService.getShippingParcels(params);
      if (res.status === 'success') {
        setParcels(res.data || []);
        setTotalParcelsCount(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load parcels.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, providerFilter, statusFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page on search
  };

  const handleProviderChange = (e) => {
    setProviderFilter(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'delivered':
      case 'Livré':
        return 'success';
      case 'shipped':
      case 'Sorti en livraison':
      case 'En transit':
        return 'info';
      case 'failed':
      case 'Tentative échouée':
      case 'Bloqué':
        return 'warning';
      case 'returned':
      case 'Retourné au vendeur':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getLatestStatusText = (item) => {
    if (item.shipping?.history && item.shipping.history.length > 0) {
      const latest = item.shipping.history[item.shipping.history.length - 1];
      return `${latest.status}${latest.location ? ` (${latest.location})` : ''}`;
    }
    return item.yalidineStatus || item.shipping?.status || 'En préparation';
  };

  const totalPages = Math.ceil(totalParcelsCount / limit);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Shipping & Logistics Control Panel</h1>
          <p className={styles.subtitle}>
            Monitor active shipments, track status histories, print bills of lading, and resolve delivery alerts.
          </p>
        </div>
        <Button onClick={() => { loadStats(); loadParcels(); addToast('Refreshed shipping database.', 'success'); }} variant="secondary" icon={<RotateCwIcon />}>
          Refresh Sync
        </Button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsSection}>
        <div className={styles.kpiGrid}>
          <KPICard title="Total Shipments" value={stats.totalParcels} icon={<TruckIcon />} trend={{ value: 'All carriers', isPositive: true }} />
          <KPICard title="Out for Delivery" value={stats.shipped} icon={<TruckIcon />} variant="info" />
          <KPICard title="Delivered Packages" value={stats.delivered} icon={<CheckCircleIcon />} variant="success" />
          <KPICard title="Returned / Alert" value={(stats.returned || 0) + (stats.failed || 0)} icon={<AlertTriangleIcon />} variant="danger" />
        </div>
      </div>

      {/* Toolbar filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search tracking #, name, phone..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.filterSelectors}>
          <Select
            className={styles.filterSelect}
            value={providerFilter}
            onChange={handleProviderChange}
            options={[
              { label: 'All Carriers', value: '' },
              { label: 'Yalidine (Guepex)', value: 'yalidine' },
              { label: 'Nord & Back', value: 'nord_and_back' },
              { label: 'Manual/Custom', value: 'manual' },
            ]}
          />

          <Select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={handleStatusChange}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'En préparation', value: 'draft' },
              { label: 'Shipped / In Transit', value: 'shipped' },
              { label: 'Delivered', value: 'delivered' },
              { label: 'Alert / Failed Attempt', value: 'failed' },
              { label: 'Returned to Seller', value: 'returned' },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      {error && <div className={styles.error}>{error}</div>}

      {isLoading ? (
        <div className={styles.loadingWrap}>
          <RotateCwIcon className="spinner" />
          <p>Syncing tracking histories...</p>
        </div>
      ) : parcels.length === 0 ? (
        <div className={styles.empty}>No shipments found matching filters.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer Details</th>
                <th>Destination</th>
                <th>Carrier</th>
                <th>Tracking Code</th>
                <th>Latest Courier Status</th>
                <th className={styles.textRight}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((item) => {
                const trackingNum = item.shipping?.trackingNumber || item.yalidineTracking;
                const labelUrl = item.shipping?.labelUrl || item.yalidineLabelUrl;
                const provider = item.shipping?.provider || 'yalidine';
                
                return (
                  <tr key={item._id}>
                    <td>
                      <Link to={`/admin/orders/${item._id}`} className={styles.orderLink}>
                        #{item._id.toString().slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td>
                      <div className={styles.customerName}>{item.customerName}</div>
                      <div className={styles.customerPhone}>{item.phoneNumber}</div>
                    </td>
                    <td>
                      <div className={styles.destination}>
                        {item.wilaya}, {item.baladia}
                      </div>
                    </td>
                    <td>
                      <Badge variant="neutral" className={styles.providerBadge}>
                        {provider === 'yalidine' ? 'Yalidine' : provider === 'nord_and_back' ? 'Nord & Back' : 'Manual'}
                      </Badge>
                    </td>
                    <td>
                      {trackingNum ? (
                        <span className={styles.trackingCode}>{trackingNum}</span>
                      ) : (
                        <span className={styles.noTracking}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(item.shipping?.status || item.yalidineStatus)}>
                        {getLatestStatusText(item)}
                      </Badge>
                    </td>
                    <td className={styles.textRight}>
                      <div className={styles.actionGroup}>
                        {labelUrl ? (
                          <a href={labelUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="secondary" icon={<PrinterIcon />} title="Print Bill of Lading" />
                          </a>
                        ) : (
                          <Button size="sm" variant="secondary" icon={<PrinterIcon />} disabled title="No label generated" />
                        )}
                        <Link to={`/admin/orders/${item._id}`}>
                          <Button size="sm" variant="primary">Details</Button>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            size="sm"
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <span className={styles.pageIndicator}>
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default AdminShippingPage;
