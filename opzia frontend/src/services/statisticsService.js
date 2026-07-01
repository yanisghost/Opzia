// src/services/statisticsService.js
// All statistics/analytics API calls.
// Maps directly to statisticsRoutes.js on the backend.
//
// Endpoint base: /api/v1/statistics
//
// All endpoints are READ-ONLY and ADMIN-only.
// Used exclusively by the Admin Dashboard and Statistics page.

import apiClient from './apiClient';

const BASE = '/stats';

export const statisticsService = {

  /**
   * Overall sales performance metrics.
   * Backend: GET /api/v1/statistics/sales
   *
   * @param {object} [params] — optional filters: { status, loss }
   * @returns {{
   *   totalRevenue: number,
   *   totalProfit: number,
   *   totalOrders: number,
   *   avgOrderValue: number
   * }}
   */
  async getSalesStats(params = {}) {
    const res = await apiClient.get(`${BASE}/sales`, { params });
    return res.data.data;
  },

  /**
   * Sales performance over time.
   * Backend: GET /api/v1/statistics/trends
   *
   * @param {{ interval?: 'day'|'week'|'month'|'year' }} [params]
   * @returns {object[]} trend data points with revenue, profit, orders, avgOrderValue
   */
  async getSalesTrends(params = {}) {
    const res = await apiClient.get(`${BASE}/trends`, { params });
    return res.data.data;
  },

  /**
   * Loss statistics (orders with negative profit).
   * Backend: GET /api/v1/statistics/loss
   *
   * @returns {{
   *   totalLossOrders: number,
   *   totalLossAmount: number,
   *   avgLossPerOrder: number
   * }}
   */
  async getLossStats() {
    const res = await apiClient.get(`${BASE}/loss`);
    return res.data.data;
  },

  /**
   * Refund statistics (cancelled orders).
   * Backend: GET /api/v1/statistics/refunds
   *
   * @returns {{
   *   totalRefundOrders: number,
   *   totalRefundAmount: number,
   *   avgRefundPerOrder: number
   * }}
   */
  async getRefundStats() {
    const res = await apiClient.get(`${BASE}/refunds`);
    return res.data.data;
  },

  /**
   * Top 10 products by quantity sold.
   * Backend: GET /api/v1/statistics/products/top
   *
   * @returns {object[]} top products with revenue and profit per product
   */
  async getTopProducts() {
    const res = await apiClient.get(`${BASE}/products/top`);
    return res.data.data;
  },

  /**
   * Products with stock below threshold.
   * Backend: GET /api/v1/statistics/inventory/low
   *
   * @param {{ threshold?: number }} [params] — default threshold = 10
   * @returns {object[]} low-stock products
   */
  async getLowInventory(params = {}) {
    const res = await apiClient.get(`${BASE}/inventory/low`, { params });
    return res.data.data;
  },

  /**
   * Discount code usage and impact.
   * Backend: GET /api/v1/statistics/discounts/impact
   *
   * @returns {object[]} per-code breakdown: totalDiscountGiven, totalRevenue, totalProfit, ordersWithDiscount
   */
  async getDiscountImpact() {
    const res = await apiClient.get(`${BASE}/discounts/impact`);
    return res.data.data;
  },

  /**
   * Refund analytics with refund rate.
   * Backend: GET /api/v1/statistics/refunds/analytics
   *
   * @returns {{ totalRefundOrders, totalRefundAmount, avgRefundPerOrder, refundRate }}
   */
  async getRefundAnalytics() {
    const res = await apiClient.get(`${BASE}/refunds/analytics`);
    return res.data.data;
  },

  /**
   * Loss analytics with loss rate.
   * Backend: GET /api/v1/statistics/loss/analytics
   *
   * @returns {{ totalLossOrders, totalLossAmount, avgLossPerOrder, lossRate }}
   */
  async getLossAnalytics() {
    const res = await apiClient.get(`${BASE}/loss/analytics`);
    return res.data.data;
  },
};
