// src/utils/formatPrice.js
// Price formatting utilities.
// LUMINA prices are stored as Numbers in USD on the backend.

/**
 * Format a number as a USD price string.
 * @param {number} amount
 * @param {string} [currency='USD']
 * @returns {string} e.g. "$85.00"
 */
export function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return '—';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} DA`;
}

/**
 * Calculate the discount percentage between original and final price.
 * @param {number} originalPrice
 * @param {number} finalPrice
 * @returns {number} integer percentage e.g. 20
 */
export function calcDiscountPercent(originalPrice, finalPrice) {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
}
