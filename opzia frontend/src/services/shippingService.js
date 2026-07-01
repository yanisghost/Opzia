// src/services/shippingService.js
import apiClient from './apiClient';

const BASE = '/shipping';

export const shippingService = {
  async getShippingStats() {
    const res = await apiClient.get(`${BASE}/stats`);
    return res.data;
  },

  async getShippingParcels(params = {}) {
    const res = await apiClient.get(`${BASE}/parcels`, { params });
    return res.data;
  },
};
