// src/components/ui/Toast/Toast.jsx
// Toast notification system. Reads from UIContext.toasts and renders
// a fixed stack in the bottom-right corner.
// Mount <ToastContainer /> once in App.jsx (or Navbar level) to activate.

import React from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '@hooks/useUI';
import styles from './Toast.module.css';

// ─── Individual Toast ─────────────────────────────────────────────────────
function ToastItem({ id, message, type }) {
  const { removeToast } = useUI();

  return (
    <div className={[styles.toast, styles[type]].filter(Boolean).join(' ')} role="alert">
      <span className={styles.icon} aria-hidden="true">
        {type === 'success' && '✓'}
        {type === 'error'   && '✕'}
        {type === 'warning' && '!'}
        {type === 'info'    && 'i'}
      </span>
      <p className={styles.message}>{message}</p>
      <button
        className={styles.closeBtn}
        onClick={() => removeToast(id)}
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── Container — mount once at app root ──────────────────────────────────
export function ToastContainer() {
  const { toasts } = useUI();
  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.container} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>,
    document.body
  );
}

export default ToastItem;
