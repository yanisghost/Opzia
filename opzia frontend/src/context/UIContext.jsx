// src/context/UIContext.jsx
// Manages lightweight global UI state that multiple components need to share:
//   - Mobile cart drawer open/close
//   - Search overlay open/close
//   - Toast notification queue
//
// Intentionally kept minimal — does NOT hold business data.

import React, {
  createContext,
  useState,
  useCallback,
  useRef,
} from 'react';

// ─── Context ─────────────────────────────────────────────────────────────
export const UIContext = createContext(null);

// ─── Toast defaults ───────────────────────────────────────────────────────
const TOAST_DURATION = 4000; // ms

// ─── Provider ────────────────────────────────────────────────────────────
export function UIProvider({ children }) {
  const [isCartOpen, setIsCartOpen]     = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts]             = useState([]);

  const toastIdRef = useRef(0);

  // ── Cart Drawer ───────────────────────────────────────────────────────
  const openCart  = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((v) => !v), []);

  // ── Search Overlay ────────────────────────────────────────────────────
  const openSearch  = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchOpen((v) => !v), []);

  // ── Toast Notifications ───────────────────────────────────────────────
  /**
   * Add a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {number} [duration] — ms before auto-dismiss
   */
  const addToast = useCallback((message, type = 'info', duration = TOAST_DURATION) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after `duration` ms
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  /**
   * Manually dismiss a toast by ID.
   * @param {number} id
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Context Value ─────────────────────────────────────────────────────
  const value = {
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,

    isSearchOpen,
    openSearch,
    closeSearch,
    toggleSearch,

    toasts,
    addToast,
    removeToast,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}
