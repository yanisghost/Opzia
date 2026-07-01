// src/utils/imageUrl.js
// Constructs full image URLs from filenames stored by the backend.
// Safe to call with either a raw filename OR an already-complete URL.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Derive the server origin (e.g. http://localhost:3000)
let API_ORIGIN = "http://localhost:3000";
try {
  API_ORIGIN = new URL(API_BASE_URL).origin;
} catch {
  // fallback to default
}

/**
 * Return a full URL for a product image filename.
 * Handles three cases:
 *   1. Already a full URL → return as-is
 *   2. Empty/null → return placeholder
 *   3. Raw filename → build full URL
 */
export function productImageUrl(filename) {
  if (!filename) return "/placeholder-product.jpg";
  if (filename.startsWith("http") || filename.startsWith("/")) return filename;
  return `${API_ORIGIN}/img/products/${filename}`;
}

/**
 * Return a full URL for a pack image filename.
 */
export function packImageUrl(filename) {
  if (!filename) return "/placeholder-product.jpg";
  if (filename.startsWith("http") || filename.startsWith("/")) return filename;
  return `${API_ORIGIN}/img/packs/${filename}`;
}

/**
 * Return a full URL for a category image filename.
 */
export function categoryImageUrl(filename) {
  if (!filename) return "/placeholder-product.jpg";
  if (filename.startsWith("http") || filename.startsWith("/")) return filename;
  return `${API_ORIGIN}/img/categories/${filename}`;
}
