// src/services/packService.js
import apiClient from './apiClient';

const BASE = '/packs';

export const packService = {
  async getPacks(params = {}) {
    const res = await apiClient.get(BASE, { params });
    const d = res.data;
    return Array.isArray(d?.data?.packs)
      ? d.data.packs
      : Array.isArray(d?.packs)
        ? d.packs
        : Array.isArray(d?.data?.docs)
          ? d.data.docs
          : Array.isArray(d?.docs)
            ? d.docs
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : [];
  },

  async getPack(id) {
    const res = await apiClient.get(`${BASE}/${id}`);
    const d = res.data;
    return d?.data?.doc ?? d?.doc ?? d?.data?.pack ?? d?.pack ?? d?.data ?? d;
  },

  async createPack(formData) {
    const res = await apiClient.post(BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const d = res.data;
    return d?.data?.pack ?? d?.pack ?? d?.data ?? d;
  },

  async updatePack(id, data) {
    const isFormData = data instanceof FormData;
    const res = await apiClient.patch(`${BASE}/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    const d = res.data;
    return d?.data?.pack ?? d?.pack ?? d?.data ?? d;
  },

  async deletePack(id) {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
