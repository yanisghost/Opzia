// src/services/productService.js
import apiClient from "./apiClient";

const BASE = "/products";

function unwrapProductResponse(data) {
  return (
    data?.data?.product ??
    data?.data?.doc ??
    data?.data?.data ??
    data?.product ??
    data?.doc ??
    data?.data ??
    data
  );
}

export const productService = {
  async getProducts(params = {}) {
    const res = await apiClient.get(BASE, { params });
    const d = res.data;
    return Array.isArray(d?.data?.products)
      ? d.data.products
      : Array.isArray(d?.products)
        ? d.products
        : Array.isArray(d?.data?.products?.docs)
          ? d.data.products.docs
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

  async getProduct(id) {
    const res = await apiClient.get(`${BASE}/${id}`);
    return unwrapProductResponse(res.data);
  },

  async createProduct(formData) {
    const res = await apiClient.post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrapProductResponse(res.data);
  },

  async updateProduct(id, data) {
    const isFormData = data instanceof FormData;
    const res = await apiClient.patch(`${BASE}/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return unwrapProductResponse(res.data);
  },

  async deleteProduct(id) {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
