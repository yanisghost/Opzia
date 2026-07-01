// src/context/CartContext.jsx
// Client-side shopping cart.
//
// Architecture decision (from approved architecture doc):
//   The backend has no cart storage endpoint. The cart lives entirely in
//   React state and is persisted to localStorage so it survives page refreshes.
//   On checkout, the entire cart is submitted as a single POST /api/v1/orders.
//
// Cart item shape:
//   {
//     id:         string  — product or pack MongoDB ObjectId
//     type:       'product' | 'pack'
//     name:       string
//     price:      number  — finalPrice from the backend virtual
//     imageCover: string  — filename, constructed into full URL in components
//     quantity:   number
//   }

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

// ─── Context ─────────────────────────────────────────────────────────────
export const CartContext = createContext(null);

// ─── Constants ───────────────────────────────────────────────────────────
const CART_KEY = 'lumina_cart';

// ─── Helpers ─────────────────────────────────────────────────────────────
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Storage quota exceeded — fail silently
  }
}

// ─── Provider ────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCartFromStorage());

  // Persist to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  // ── Actions ───────────────────────────────────────────────────────────

  /**
   * Add an item to the cart.
   * If the item (matched by id + type) already exists, increment quantity.
   * @param {{ id, type, name, price, imageCover, quantity }} item
   */
  const addItem = useCallback((item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, basePrice: item.price, quantity: item.quantity || 1 }];
    });
  }, []);

  /**
   * Remove an item from the cart entirely.
   * @param {string} id
   * @param {'product'|'pack'} type
   */
  const removeItem = useCallback((id, type) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  }, []);

  /**
   * Update the quantity of a specific cart item.
   * If quantity <= 0, the item is removed.
   * @param {string} id
   * @param {'product'|'pack'} type
   * @param {number} quantity
   */
  const updateQuantity = useCallback((id, type, quantity) => {
    if (quantity <= 0) {
      removeItem(id, type);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.type === type ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  /**
   * Update the promo code (enteredCode) of a specific cart item.
   * @param {string} id
   * @param {'product'|'pack'} type
   * @param {string|null} enteredCode
   */
  const updateItemPromoCode = useCallback((id, type, enteredCode) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id && i.type === type) {
          const basePrice = i.basePrice !== undefined ? i.basePrice : i.price;
          let newPrice = basePrice;
          if (enteredCode && i.discounts) {
            const trimmed = enteredCode.trim().toUpperCase();
            const d = i.discounts.find(
              (disc) =>
                disc.active &&
                disc.requiresCode &&
                disc.code.trim().toUpperCase() === trimmed &&
                (!disc.discountStart || Date.now() >= new Date(disc.discountStart).getTime()) &&
                (!disc.discountEnd || Date.now() <= new Date(disc.discountEnd).getTime())
            );
            if (d) {
              newPrice = d.discountPrice;
            }
          }
          return {
            ...i,
            basePrice,
            price: newPrice,
            enteredCode: enteredCode ? enteredCode.trim().toUpperCase() : null
          };
        }
        return i;
      })
    );
  }, []);

  /**
   * Clear all items from the cart.
   * Called after a successful order submission.
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // ── Derived Values ────────────────────────────────────────────────────
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  // ── Context Value ─────────────────────────────────────────────────────
  const value = {
    items,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    updateItemPromoCode,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
