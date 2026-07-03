// src/services/orderService.js
import apiClient from './apiClient';

const BASE = '/orders';

function unwrapOrderResponse(d) {
  return (
    d?.data?.order ??
    d?.data?.doc ??
    d?.data?.data ??
    d?.order ??
    d?.doc ??
    d?.data ??
    d
  );
}

export const orderService = {
  async createOrder(orderData) {
    const res = await apiClient.post(BASE, orderData);
    return unwrapOrderResponse(res.data);
  },

  async checkPaymentStatus(orderId) {
    const res = await apiClient.get(`${BASE}/${orderId}/check-payment`);
    return res.data;
  },

  async getMyOrders(params = {}) {
    const res = await apiClient.get(`${BASE}/my-orders`, { params });
    const d = res.data;
    return d?.data?.orders ?? d?.orders ?? d?.data ?? (Array.isArray(d) ? d : []);
  },

  async getOrders(params = {}) {
    const res = await apiClient.get(BASE, { params });
    const d = res.data;
    return Array.isArray(d?.data?.orders)
      ? d.data.orders
      : Array.isArray(d?.data?.docs)
        ? d.data.docs
        : Array.isArray(d?.orders)
          ? d.orders
          : Array.isArray(d?.docs)
            ? d.docs
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : [];
  },

  async getOrder(id) {
    const res = await apiClient.get(`${BASE}/${id}`);
    return unwrapOrderResponse(res.data);
  },

  async updateOrder(id, data) {
    const res = await apiClient.patch(`${BASE}/${id}`, data);
    return unwrapOrderResponse(res.data);
  },

  async deleteOrder(id) {
    await apiClient.delete(`${BASE}/${id}`);
  },

  /**
   * Fetch Yalidine shipping fees for a given wilaya + commune.
   * Returns { home: number, stopdesk: number } in DZD.
   */
  async getShippingFee(wilaya, baladia) {
    const res = await apiClient.get(`${BASE}/shipping-fee`, {
      params: { wilaya, baladia },
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Admin-only: manually create a Yalidine parcel for an order.
   * Returns { tracking, labelUrl }.
   */
  async sendToYalidine(orderId, provider = 'yalidine') {
    const res = await apiClient.post(`${BASE}/${orderId}/send-to-yalidine`, { provider });
    return res.data?.data ?? res.data;
  },

  /**
   * Admin-only: cancel a Yalidine parcel for an order.
   */
  async cancelYalidine(orderId) {
    const res = await apiClient.post(`${BASE}/${orderId}/cancel-yalidine`);
    return res.data?.data ?? res.data;
  },

  /**
   * Admin-only: sync tracking details from carrier.
   */
  async syncShipping(orderId) {
    const res = await apiClient.post(`${BASE}/${orderId}/sync-shipping`);
    return res.data?.data?.order ?? res.data?.order ?? res.data;
  },

  /**
   * Track orders by phone number (public).
   */
  async trackByPhone(phone) {
    const res = await apiClient.get(`${BASE}/track-by-phone`, { params: { phone } });
    return res.data?.data?.orders ?? res.data?.orders ?? res.data;
  },

  /**
   * Track order details by ID (public).
   */
  async trackOrderById(id) {
    const res = await apiClient.get(`${BASE}/${id}/track`);
    return unwrapOrderResponse(res.data);
  },

  /**
   * Validate order coupon promo code.
   */
  async validateCoupon(code, subtotal) {
    const res = await apiClient.get('/coupons/validate', {
      params: { code, subtotal },
    });
    return res.data?.data ?? res.data;
  },
};



