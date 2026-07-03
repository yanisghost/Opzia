// src/services/couponService.js
import apiClient from './apiClient';

const BASE = '/coupons';

export const couponService = {
  async getCoupons() {
    const res = await apiClient.get(BASE);
    return res.data?.data?.docs ?? res.data?.data ?? res.data ?? [];
  },

  async createCoupon(data) {
    const res = await apiClient.post(BASE, data);
    return res.data?.data ?? res.data;
  },

  async updateCoupon(id, data) {
    const res = await apiClient.patch(`${BASE}/${id}`, data);
    return res.data?.data ?? res.data;
  },

  async deleteCoupon(id) {
    const res = await apiClient.delete(`${BASE}/${id}`);
    return res.data;
  },
};
