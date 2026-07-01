// src/utils/formatDate.js
// Date formatting utilities for order dates, discount dates, etc.

/**
 * Format an ISO date string into a human-readable format.
 * @param {string|Date} date
 * @param {object} [options] — Intl.DateTimeFormat options
 * @returns {string} e.g. "Oct 24, 2023"
 */
export function formatDate(date, options = {}) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Format a date with time.
 * @param {string|Date} date
 * @returns {string} e.g. "Oct 24, 2023, 2:30 PM"
 */
export function formatDateTime(date) {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Return a relative time string.
 * @param {string|Date} date
 * @returns {string} e.g. "3 days ago"
 */
export function formatRelativeTime(date) {
  if (!date) return '—';
  const d       = new Date(date);
  const now     = new Date();
  const diffMs  = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60)  return 'just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  if (diffHr < 24)   return `${diffHr}h ago`;
  if (diffDay < 7)   return `${diffDay}d ago`;
  return formatDate(date);
}
