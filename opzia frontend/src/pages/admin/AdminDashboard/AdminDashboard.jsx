// src/pages/admin/AdminDashboard/AdminDashboard.jsx
// Main admin landing page. Fetches all dashboard data in parallel.

import React, { useEffect, useState, useCallback } from 'react';
import { statisticsService } from '@services/statisticsService';
import { orderService } from '@services/orderService';
import { useLanguage } from '@hooks/useLanguage';
import { formatPrice } from '@utils/formatPrice';
import KPICard from '@components/admin/KPICard/KPICard';
import RecentOrdersTable from '@components/admin/RecentOrdersTable/RecentOrdersTable';
import TopProductsList from '@components/admin/TopProductsList/TopProductsList';
import LowStockAlerts from '@components/admin/LowStockAlerts/LowStockAlerts';
import DiscountImpactCard from '@components/admin/DiscountImpactCard/DiscountImpactCard';
import SalesTrendChart from '@components/admin/SalesTrendChart/SalesTrendChart';
import Spinner from '@components/ui/Spinner/Spinner';
import styles from './AdminDashboard.module.css';

// ─── Widget wrapper ────────────────────────────────────────────────────────
function Widget({ title, children, className = '' }) {
  return (
    <div className={[styles.widget, className].filter(Boolean).join(' ')}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      {children}
    </div>
  );
}

// ─── Order status bar chart ────────────────────────────────────────────────
function OrderStatusBars({ orders }) {
  const { t } = useLanguage();
  const total = orders.length || 1;
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const statuses = [
    { key: 'delivered', label: t('orders.status.delivered') },
    { key: 'shipped',   label: t('orders.status.shipped') },
    { key: 'confirmed', label: t('orders.status.confirmed') },
    { key: 'pending',   label: t('orders.status.pending') },
    { key: 'cancelled', label: t('orders.status.cancelled') },
  ];

  return (
    <ul className={styles.statusBars}>
      {statuses.map(({ key, label }) => {
        const count = counts[key] || 0;
        const pct   = Math.round((count / total) * 100);
        return (
          <li key={key} className={styles.statusBar}>
            <span className={styles.statusLabel}>{label}</span>
            <div className={styles.barTrack}>
              <div
                className={[styles.barFill, styles[key]].join(' ')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={styles.statusPct}>{pct}%</span>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { t } = useLanguage();
  const [salesStats,     setSalesStats]     = useState(null);
  const [topProducts,    setTopProducts]    = useState([]);
  const [discountImpact, setDiscountImpact] = useState([]);
  const [lowStock,       setLowStock]       = useState([]);
  const [trends,         setTrends]         = useState([]);
  const [recentOrders,   setRecentOrders]   = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sales, top, discount, stock, trendData, orders] = await Promise.allSettled([
        statisticsService.getSalesStats(),
        statisticsService.getTopProducts(),
        statisticsService.getDiscountImpact(),
        statisticsService.getLowInventory(),
        statisticsService.getSalesTrends(),
        orderService.getOrders({ limit: 5, sort: '-createdAt' }),
      ]);

      if (sales.status      === 'fulfilled') setSalesStats(sales.value);
      if (top.status        === 'fulfilled') setTopProducts(top.value?.slice(0, 3) || []);
      if (discount.status   === 'fulfilled') setDiscountImpact(discount.value || []);
      if (stock.status      === 'fulfilled') setLowStock(stock.value || []);
      if (trendData.status  === 'fulfilled') setTrends(trendData.value || []);
      if (orders.status     === 'fulfilled') setRecentOrders(orders.value?.slice(0, 5) || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.dashboard.overview')}</h1>
          <p className={styles.subtitle}>{t('admin.dashboard.greeting')}</p>
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <div className={styles.kpiGrid}>
        <KPICard
          label={t('admin.dashboard.revenue')}
          value={formatPrice(salesStats?.totalRevenue ?? 0)}
          trend={12.5}
        />
        <KPICard
          label={t('admin.dashboard.profit')}
          value={formatPrice(salesStats?.totalProfit ?? 0)}
          trend={8.2}
        />
        <KPICard
          label={t('admin.dashboard.totalOrders')}
          value={salesStats?.totalOrders ?? 0}
          trend={142}
          trendLabel={t('admin.dashboard.periodTrend', { count: salesStats?.totalOrders ?? 0 })}
        />
        <KPICard
          label={t('admin.dashboard.avgValue')}
          value={formatPrice(salesStats?.avgOrderValue ?? 0)}
          trend={-2.1}
        />
      </div>

      {/* ── Middle row: status bars | top products | discount impact ── */}
      <div className={styles.middleGrid}>
        <Widget title={t('admin.dashboard.ordersStatus')}>
          <OrderStatusBars orders={recentOrders} />
        </Widget>

        <Widget title={t('admin.dashboard.topProducts')}>
          <TopProductsList products={topProducts} />
        </Widget>

        <Widget title={t('admin.dashboard.discountImpact')}>
          <DiscountImpactCard data={discountImpact} />
        </Widget>
      </div>

      {/* ── Bottom row: recent orders | low stock ── */}
      <div className={styles.bottomGrid}>
        <Widget title={t('admin.dashboard.recentOrders')} className={styles.ordersWidget}>
          <div className={styles.widgetHeader}>
            <span />
            <a href="/admin/orders" className={styles.viewAllLink}>{t('admin.dashboard.viewAll')}</a>
          </div>
          <RecentOrdersTable
            orders={recentOrders}
            onStatusChange={fetchAll}
          />
        </Widget>

        <Widget title={t('admin.dashboard.lowStock')}>
          <LowStockAlerts items={lowStock} />
        </Widget>
      </div>

      {/* ── Sales trend ── */}
      {trends.length > 0 && (
        <Widget title={t('admin.dashboard.salesTrend')}>
          <SalesTrendChart data={trends} metric="revenue" />
        </Widget>
      )}
    </div>
  );
}

export default AdminDashboard;
