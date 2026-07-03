// src/pages/CheckoutPage/CheckoutPage.jsx
// Checkout page — wraps CheckoutForm and OrderSummaryPanel.
// On successful order creation the OrderConfirmationModal is shown,
// then user is redirected to home.
// Cart is cleared by CheckoutForm on success before onSuccess fires.

import React, { useState, useCallback } from 'react';
import CheckoutForm from '@components/checkout/CheckoutForm/CheckoutForm';
import OrderSummaryPanel from '@components/cart/OrderSummaryPanel/OrderSummaryPanel';
import OrderConfirmationModal from '@components/checkout/OrderConfirmationModal/OrderConfirmationModal';
import styles from './CheckoutPage.module.css';

function CheckoutPage() {
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showModal,      setShowModal]      = useState(false);
  // Shipping fee lifted up from CheckoutForm so OrderSummaryPanel can show it
  const [shippingFee,    setShippingFee]    = useState(0);

  const handleOrderSuccess = (order) => {
    setConfirmedOrder(order);
    setShowModal(true);
  };

  const handleShippingFeeChange = useCallback((fee) => {
    setShippingFee(fee ?? 0);
  }, []);

  return (
    <>
      <div className={styles.page}>
        {/* Minimal header — no full Navbar on checkout (design screen shows logo + SECURE CHECKOUT only) */}
        <div className={styles.checkoutBar}>
          <span className={styles.secureLabel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            SECURE CHECKOUT
          </span>
        </div>

        <div className={styles.inner}>
          {/* Left: form */}
          <div className={styles.formCol}>
            <CheckoutForm
              promoCode={promoCode}
              onSuccess={handleOrderSuccess}
              onShippingFeeChange={handleShippingFeeChange}
            />
          </div>

          {/* Right: order summary with items listed */}
          <div className={styles.summaryCol}>
            <OrderSummaryPanel
              showItems={true}
              promoCode={promoCode}
              discountAmount={discountAmount}
              onPromoApply={(code, discount) => {
                setPromoCode(code);
                setDiscountAmount(discount || 0);
              }}
              shipping={shippingFee}
            />
          </div>
        </div>
      </div>

      {/* Confirmation modal — shown after successful order */}
      <OrderConfirmationModal
        isOpen={showModal}
        order={confirmedOrder}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

export default CheckoutPage;
