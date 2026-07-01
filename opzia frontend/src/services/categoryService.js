// src/services/categoryService.js
import apiClient from "./apiClient";

const BASE = "/categories";

export const categoryService = {
  async getCategories(params = {}) {
    const res = await apiClient.get(BASE, { params });
    const d = res.data;
    return Array.isArray(d?.data?.categories)
      ? d.data.categories
      : Array.isArray(d?.data?.docs)
        ? d.data.docs
        : Array.isArray(d?.categories)
          ? d.categories
          : Array.isArray(d?.docs)
            ? d.docs
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : [];
  },

  async getCategory(id) {
    const res = await apiClient.get(`${BASE}/${id}`);
    const d = res.data;
    return d?.data?.category ?? d?.category ?? d?.data ?? d;
  },

  async createCategory(data) {
    const isFormData = data instanceof FormData;
    const res = await apiClient.post(BASE, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    const d = res.data;
    return d?.data?.category ?? d?.category ?? d?.data ?? d;
  },

  async updateCategory(id, data) {
    const isFormData = data instanceof FormData;
    const res = await apiClient.patch(`${BASE}/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    const d = res.data;
    return d?.data?.category ?? d?.category ?? d?.data ?? d;
  },

  async deleteCategory(id) {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
