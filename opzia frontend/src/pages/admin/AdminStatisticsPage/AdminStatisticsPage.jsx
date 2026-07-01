// src/pages/admin/AdminStatisticsPage/AdminStatisticsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { statisticsService } from '@services/statisticsService';
import { formatPrice } from '@utils/formatPrice';
import KPICard from '@components/admin/KPICard/KPICard';
import TopProductsList from '@components/admin/TopProductsList/TopProductsList';
import LowStockAlerts from '@components/admin/LowStockAlerts/LowStockAlerts';
import SalesTrendChart from '@components/admin/SalesTrendChart/SalesTrendChart';
import Select from '@components/ui/Select/Select';
import Spinner from '@components/ui/Spinner/Spinner';
import { useLanguage } from '@hooks/useLanguage';

import styles from './AdminStatisticsPage.module.css';

function AdminStatisticsPage() {
  const { t } = useLanguage();
  // Analytical Data States
  const [salesStats, setSalesStats] = useState(null);
  const [refundAnalytics, setRefundAnalytics] = useState(null);
  const [lossAnalytics, setLossAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [trends, setTrends] = useState([]);

  // Filter States
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'profit' | 'orders'
  const [interval, setInterval] = useState('month'); // 'day' | 'week' | 'month' | 'year'

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isTrendsLoading, setIsTrendsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load static / core reports
  const loadCoreStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sales, refund, loss, top, stock] = await Promise.all([
        statisticsService.getSalesStats(),
        statisticsService.getRefundAnalytics(),
        statisticsService.getLossAnalytics(),
        statisticsService.getTopProducts(),
        statisticsService.getLowInventory(),
      ]);

      setSalesStats(sales);
      setRefundAnalytics(refund);
      setLossAnalytics(loss);
      setTopProducts(Array.isArray(top) ? top : []);
      setLowStock(Array.isArray(stock) ? stock : []);
    } catch (err) {
      setError(err.message || 'Unable to load statistics reports.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch trend data based on interval filter
  const fetchTrends = useCallback(async () => {
    setIsTrendsLoading(true);
    try {
      const trendData = await statisticsService.getSalesTrends({ interval });
      setTrends(Array.isArray(trendData) ? trendData : []);
    } catch (err) {
      console.error('Failed to load trends:', err);
    } finally {
      setIsTrendsLoading(false);
    }
  }, [interval]);

  // Load initial datasets
  useEffect(() => {
    loadCoreStats();
  }, [loadCoreStats]);

  // Update trends whenever interval changes
  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="lg" />
        <p>{t('admin.stats.loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Page Header ── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.stats.title')}</h1>
          <p className={styles.subtitle}>
            {t('admin.stats.subtitle')}
          </p>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {/* ── Core KPI grid ── */}
      <div className={styles.kpiGrid}>
        <KPICard
          label={t('admin.stats.kpis.totalSalesRevenue')}
          value={formatPrice(salesStats?.totalRevenue ?? 0)}
        />
        <KPICard
          label={t('admin.stats.kpis.netStoreProfit')}
          value={formatPrice(salesStats?.totalProfit ?? 0)}
        />
        <KPICard
          label={t('admin.stats.kpis.completedOrders')}
          value={salesStats?.totalOrders ?? 0}
        />
        <KPICard
          label={t('admin.stats.kpis.avgOrderValue')}
          value={formatPrice(salesStats?.avgOrderValue ?? 0)}
        />
      </div>

      {/* ── Interactive Trend Visualization ── */}
      <div className={styles.chartWidget}>
        <div className={styles.chartHeader}>
          <div className={styles.chartControls}>
            <span className={styles.widgetTitle}>{t('admin.stats.chart.title')}</span>
            <div className={styles.metricTabs}>
              <button
                className={[styles.tab, activeMetric === 'revenue' ? styles.activeTab : ''].join(' ')}
                onClick={() => setActiveMetric('revenue')}
              >
                {t('admin.stats.chart.revenueTab')}
              </button>
              <button
                className={[styles.tab, activeMetric === 'profit' ? styles.activeTab : ''].join(' ')}
                onClick={() => setActiveMetric('profit')}
              >
                {t('admin.stats.chart.profitTab')}
              </button>
              <button
                className={[styles.tab, activeMetric === 'orders' ? styles.activeTab : ''].join(' ')}
                onClick={() => setActiveMetric('orders')}
              >
                {t('admin.stats.chart.ordersTab')}
              </button>
            </div>
          </div>

          <div className={styles.intervalDropdown}>
            <Select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              options={[
                { value: 'day', label: t('admin.stats.chart.daily') },
                { value: 'week', label: t('admin.stats.chart.weekly') },
                { value: 'month', label: t('admin.stats.chart.monthly') },
                { value: 'year', label: t('admin.stats.chart.yearly') },
              ]}
              placeholder=""
              className={styles.dropdownField}
            />
          </div>
        </div>

        <div className={styles.chartBody}>
          {isTrendsLoading ? (
            <div className={styles.chartLoading}>
              <Spinner size="md" />
              <span>{t('admin.stats.chart.fetching')}</span>
            </div>
          ) : (
            <SalesTrendChart data={trends} metric={activeMetric} />
          )}
        </div>
      </div>

      {/* ── Risk & Integrity Diagnostics ── */}
      <div className={styles.diagnosticsGrid}>
        {/* Refund Performance */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t('admin.stats.refund.title')}</h3>
          <div className={styles.largeMetricRow}>
            <span className={styles.largeMetricVal}>
              {((refundAnalytics?.refundRate ?? 0) * 100).toFixed(1)}%
            </span>
            <span className={styles.largeMetricLabel}>{t('admin.stats.refund.rateLabel')}</span>
          </div>
          <div className={styles.metricDetailsList}>
            <div className={styles.metricDetailItem}>
              <span className={styles.detailLabel}>{t('admin.stats.refund.totalOrders')}</span>
              <strong className={styles.detailVal}>{refundAnalytics?.totalRefundOrders ?? 0}</strong>
            </div>
            <div className={styles.metricDetailItem}>
              <span className={styles.detailLabel}>{t('admin.stats.refund.totalAmount')}</span>
              <strong className={styles.detailVal}>{formatPrice(refundAnalytics?.totalRefundAmount ?? 0)}</strong>
            </div>
            <div className={styles.metricDetailItem}>
              <span className={styles.detailLabel}>{t('admin.stats.refund.avgAmount')}</span>
              <strong className={styles.detailVal}>{formatPrice(refundAnalytics?.avgRefundAmount ?? 0)}</strong>
            </div>
          </div>
        </div>

        {/* Profit Loss Analysis */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t('admin.stats.loss.title')}</h3>
          <div className={styles.largeMetricRow}>
            <span className={[styles.largeMetricVal, styles.warningColor].join(' ')}>
              {((lossAnalytics?.lossRate ?? 0) * 100).toFixed(1)}%
            </span>
            <span className={styles.largeMetricLabel}>{t('admin.stats.loss.rateLabel')}</span>
          </div>
          <div className={styles.metricDetailsList}>
            <div className={styles.metricDetailItem}>
              <span className={styles.detailLabel}>{t('admin.stats.loss.totalOrders')}</span>
              <strong className={styles.detailVal}>{lossAnalytics?.totalLossOrders ?? 0}</strong>
            </div>
            <div className={styles.metricDetailItem}>
              <span className={styles.detailLabel}>{t('admin.stats.loss.totalAmount')}</span>
              <strong className={[styles.detailVal, styles.warningColor].join(' ')}>
                {formatPrice(Math.abs(lossAnalytics?.totalLossAmount ?? 0))}
              </strong>
            </div>
            <div className={styles.metricDetailItem}>
              <span className={styles.detailLabel}>{t('admin.stats.loss.avgAmount')}</span>
              <strong className={[styles.detailVal, styles.warningColor].join(' ')}>
                {formatPrice(Math.abs(lossAnalytics?.avgLossPerOrder ?? 0))}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Operational Warnings ── */}
      <div className={styles.diagnosticsGrid}>
        {/* Top 10 selling products */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t('admin.stats.topProductsTitle')}</h3>
          <div className={styles.rankListWrap}>
            <TopProductsList products={topProducts} />
          </div>
        </div>

        {/* Low inventory alerts */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t('admin.stats.lowStockAlertsTitle')}</h3>
          <div className={styles.alertsWrap}>
            <LowStockAlerts items={lowStock} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStatisticsPage;
