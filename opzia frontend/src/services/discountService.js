// src/services/discountService.js
// All discount management API calls.
// Maps directly to discountRoutes.js on the backend.
//
// Endpoint base: /api/v1/discounts
//
// Discounts are embedded arrays within Product and Pack documents.
// All endpoints here are ADMIN-only.
//
// Two discount types (defined on the backend model):
//   requiresCode: false → automatic discount (applied to all customers)
//   requiresCode: true  → code-based discount (customer enters a code at checkout)
//
// Discount validation at checkout is handled by the backend's createOrder,
// NOT by a separate validation endpoint on the frontend.

import apiClient from './apiClient';

const BASE = '/discounts';

export const discountService = {

  // ── Product Discounts ─────────────────────────────────────────────────

  /**
   * Add a discount to a product. ADMIN only.
   * Backend: POST /api/v1/discounts/products/:productId
   *
   * @param {string} productId
   * @param {{
   *   code?: string,
   *   discountPrice: number,
   *   discountStart: string,
   *   discountEnd: string,
   *   requiresCode?: boolean,
   *   active?: boolean
   * }} discountData
   * @returns {object} updatedProduct (with discounts array)
   */
  async applyProductDiscount(productId, discountData) {
    const res = await apiClient.post(`${BASE}/products/${productId}`, discountData);
    // TODO: Confirm response envelope shape for discount operations
    return res.data.data;
  },

  /**
   * Update an existing product discount. ADMIN only.
   * Backend: PATCH /api/v1/discounts/products/:productId/:discountId
   *
   * @param {string} productId
   * @param {string} discountId
   * @param {object} updates
   * @returns {object} updatedProduct
   */
  async updateProductDiscount(productId, discountId, updates) {
    const res = await apiClient.patch(
      `${BASE}/products/${productId}/${discountId}`,
      updates
    );
    return res.data.data;
  },

  /**
   * Remove a discount from a product. ADMIN only.
   * Backend: DELETE /api/v1/discounts/products/:productId/:discountId
   *
   * @param {string} productId
   * @param {string} discountId
   * @returns {null} 204 No Content
   */
  async deleteProductDiscount(productId, discountId) {
    await apiClient.delete(`${BASE}/products/${productId}/${discountId}`);
  },

  // ── Pack Discounts ────────────────────────────────────────────────────

  /**
   * Add a discount to a pack. ADMIN only.
   * Backend: POST /api/v1/discounts/packs/:packId
   *
   * @param {string} packId
   * @param {{
   *   code?: string,
   *   discountPrice: number,
   *   discountStart: string,
   *   discountEnd: string,
   *   requiresCode?: boolean,
   *   active?: boolean
   * }} discountData
   * @returns {object} updatedPack
   */
  async applyPackDiscount(packId, discountData) {
    const res = await apiClient.post(`${BASE}/packs/${packId}`, discountData);
    return res.data.data;
  },

  /**
   * Update an existing pack discount. ADMIN only.
   * Backend: PATCH /api/v1/discounts/packs/:packId/:discountId
   *
   * @param {string} packId
   * @param {string} discountId
   * @param {object} updates
   * @returns {object} updatedPack
   */
  async updatePackDiscount(packId, discountId, updates) {
    const res = await apiClient.patch(
      `${BASE}/packs/${packId}/${discountId}`,
      updates
    );
    return res.data.data;
  },

  /**
   * Remove a discount from a pack. ADMIN only.
   * Backend: DELETE /api/v1/discounts/packs/:packId/:discountId
   *
   * @param {string} packId
   * @param {string} discountId
   * @returns {null} 204 No Content
   */
  async deletePackDiscount(packId, discountId) {
    await apiClient.delete(`${BASE}/packs/${packId}/${discountId}`);
  },
};
