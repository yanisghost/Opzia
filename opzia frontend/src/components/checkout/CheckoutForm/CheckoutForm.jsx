// src/components/checkout/CheckoutForm/CheckoutForm.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Input from "@components/ui/Input/Input";
import Checkbox from "@components/ui/Checkbox/Checkbox";
import Button from "@components/ui/Button/Button";
import AddressFields from "../AddressFields/AddressFields";
import { useCart } from "@hooks/useCart";
import { useLanguage } from "@hooks/useLanguage";
import { orderService } from "@services/orderService";
import styles from "./CheckoutForm.module.css";

const INITIAL_FORM = {
  customerName: "",
  phoneNumber: "",
  wilaya: "",
  baladia: "",
  homeAddress: "",
  emailOptIn: false,
  middleName: "", // Honeypot field
};

function CheckoutForm({ promoCode = "", onSuccess, onShippingFeeChange }) {
  const { t } = useLanguage();
  const { items, clearCart } = useCart();
  const [form, setForm] = useState(INITIAL_FORM);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Anti-spam robot check states
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [isVerifyingRobot, setIsVerifyingRobot] = useState(false);

  // ── Shipping fee state ──────────────────────────────────────────────────────
  const [shippingFees, setShippingFees] = useState(null); // { home, stopdesk }
  const [shippingMethod, setShippingMethod] = useState("home");
  const [isFetchingFee, setIsFetchingFee] = useState(false);
  const [feeError, setFeeError] = useState("");

  const selectedShippingFee =
    shippingFees != null
      ? shippingMethod === "home"
        ? shippingFees.home
        : shippingFees.stopdesk
      : 0;

  // Notify parent (CheckoutPage → OrderSummaryPanel) of the current fee
  useEffect(() => {
    onShippingFeeChange?.(selectedShippingFee);
  }, [selectedShippingFee, onShippingFeeChange]);

  // Fetch fees whenever both wilaya and baladia are set
  const fetchShippingFee = useCallback(async (wilaya, baladia) => {
    if (!wilaya || !baladia) return;
    setIsFetchingFee(true);
    setFeeError("");
    try {
      const data = await orderService.getShippingFee(wilaya, baladia);
      setShippingFees({ home: data.home, stopdesk: data.stopdesk });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Unable to fetch shipping fee. Please verify your address.";
      if (import.meta.env.DEV) console.error("[ShippingFee] Error:", err);
      setFeeError(msg);
      setShippingFees(null);
    } finally {
      setIsFetchingFee(false);
    }
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Re-fetch fee when address fields change
      if (field === "wilaya" || field === "baladia") {
        const w = field === "wilaya" ? value : next.wilaya;
        const b = field === "baladia" ? value : next.baladia;
        if (w && b) fetchShippingFee(w, b);
        else setShippingFees(null);
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
    }
  };

  const handleRobotCheck = () => {
    if (isRobotChecked || isVerifyingRobot) return;
    setIsVerifyingRobot(true);
    // Simulate a brief human verification delay
    setTimeout(() => {
      setIsRobotChecked(true);
      setIsVerifyingRobot(false);
      if (errors.robot) {
        setErrors((prev) => {
          const e = { ...prev };
          delete e.robot;
          return e;
        });
      }
    }, 600);
  };

  const validate = (formData) => {
    const errs = {};
    const phoneRegex = /^0[5-7]\d{8}$/;

    if (!formData.customerName.trim()) errs.customerName = t('checkout.errors.nameRequired');
    
    if (!formData.phoneNumber.trim()) {
      errs.phoneNumber = t('checkout.errors.phoneRequired');
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      errs.phoneNumber = t('checkout.errors.phoneInvalid');
    }

    if (!formData.wilaya) errs.wilaya = t('checkout.errors.wilayaRequired');
    if (!formData.baladia.trim()) errs.baladia = t('checkout.errors.baladiaRequired');
    if (!formData.homeAddress.trim()) errs.homeAddress = t('checkout.errors.addressRequired');
    
    if (!isRobotChecked) {
      errs.robot = t('checkout.errors.robotRequired');
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorEl = document.querySelector('[aria-invalid="true"]');
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Guard: cart must have items
    if (items.length === 0) {
      setServerError(t('checkout.errorCartEmpty'));
      return;
    }

    const cartArray = items.map((item) => ({
      type: item.type,
      id: item.id,
      quantity: item.quantity,
      enteredCode: item.enteredCode || promoCode || undefined,
    }));

    cartArray.forEach((item) => {
      if (item.enteredCode === undefined) {
        delete item.enteredCode;
      }
    });

    const orderPayload = {
      customerName: form.customerName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      wilaya: form.wilaya,
      baladia: form.baladia.trim(),
      homeAddress: form.homeAddress.trim(),
      paymentMethod: paymentMethod,
      shippingFee: selectedShippingFee,
      shippingMethod,
      cartData: JSON.stringify(cartArray),
      // Anti-spam verification fields
      middleName: form.middleName?.trim() || "",
      robotVerified: isRobotChecked,
      promoCode: promoCode || undefined,
    };

    if (import.meta.env.DEV) {
      console.log(
        "[CheckoutForm] Sending order payload:",
        JSON.stringify(orderPayload, null, 2),
      );
    }

    setIsLoading(true);
    try {
      const createdOrder = await orderService.createOrder(orderPayload);
      clearCart();
      if (createdOrder.paymentUrl) {
        window.location.href = createdOrder.paymentUrl;
      } else {
        onSuccess?.(createdOrder);
      }
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.message ||
        t('checkout.errorOrderFailed');
      setServerError(msg);
      console.error("[CheckoutForm] Order error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('checkout.title')}</h1>
        <Link to="/account/login" className={styles.loginLink}>
          {t('checkout.returningLogin')}
        </Link>
      </div>

      <div className={styles.fields}>
        <Input
          label={t('checkout.nameLabel')}
          name="customerName"
          value={form.customerName}
          onChange={(e) => handleChange("customerName", e.target.value)}
          placeholder={t('checkout.namePlaceholder')}
          error={errors.customerName}
          required
          autoComplete="name"
          disabled={isLoading}
        />
        <Input
          label={t('checkout.phoneLabel')}
          name="phoneNumber"
          type="tel"
          value={form.phoneNumber}
          onChange={(e) => handleChange("phoneNumber", e.target.value)}
          placeholder={t('checkout.phonePlaceholder')}
          error={errors.phoneNumber}
          required
          autoComplete="tel"
          disabled={isLoading}
        />

        {/* Honeypot field (hidden from humans, filled by spam bots) */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="middleName">Middle Name</label>
          <input
            id="middleName"
            type="text"
            name="middleName"
            value={form.middleName}
            onChange={(e) => handleChange("middleName", e.target.value)}
            tabIndex="-1"
            autoComplete="new-password"
          />
        </div>

        <AddressFields
          values={{
            wilaya: form.wilaya,
            baladia: form.baladia,
            homeAddress: form.homeAddress,
          }}
          errors={{
            wilaya: errors.wilaya,
            baladia: errors.baladia,
            homeAddress: errors.homeAddress,
          }}
          onChange={handleChange}
          disabled={isLoading}
        />

        {/* Delivery Method Selection */}
        <div className={styles.paymentSection}>
          <h3 className={styles.sectionTitle}>Delivery Method</h3>

          {isFetchingFee && (
            <p className={styles.feeLoading}>&#9203; Fetching shipping rates&hellip;</p>
          )}

          {feeError && (
            <p className={styles.feeError}>{feeError}</p>
          )}

          {!isFetchingFee && shippingFees && (
            <div className={styles.paymentOptions}>
              <label className={`${styles.paymentOption} ${shippingMethod === 'home' ? styles.activeOption : ''}`}>
                <div className={styles.optionMain}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="home"
                    checked={shippingMethod === 'home'}
                    onChange={() => setShippingMethod('home')}
                    disabled={isLoading}
                  />
                  <div className={styles.optionInfo}>
                    <span className={styles.optionLabel}>&#127968; Home Delivery</span>
                    <span className={styles.optionDesc}>Delivered to your door</span>
                  </div>
                </div>
                <span className={styles.shippingPrice}>{shippingFees.home} DZD</span>
              </label>

              <label className={`${styles.paymentOption} ${shippingMethod === 'stopdesk' ? styles.activeOption : ''}`}>
                <div className={styles.optionMain}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="stopdesk"
                    checked={shippingMethod === 'stopdesk'}
                    onChange={() => setShippingMethod('stopdesk')}
                    disabled={isLoading}
                  />
                  <div className={styles.optionInfo}>
                    <span className={styles.optionLabel}>&#127978; Agency Pickup (Stopdesk)</span>
                    <span className={styles.optionDesc}>Collect from the nearest agency</span>
                  </div>
                </div>
                <span className={styles.shippingPrice}>{shippingFees.stopdesk} DZD</span>
              </label>
            </div>
          )}

          {!isFetchingFee && !shippingFees && !feeError && (
            <p className={styles.feeHint}>
              Select your wilaya and commune to see delivery options.
            </p>
          )}
        </div>

        {/* Payment Method Selection */}
        <div className={styles.paymentSection}>
          <h3 className={styles.sectionTitle}>{t('checkout.paymentMethod')}</h3>
          <div className={styles.paymentOptions}>
            <label className={`${styles.paymentOption} ${paymentMethod === 'cash' ? styles.activeOption : ''}`}>
              <div className={styles.optionMain}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  disabled={isLoading}
                />
                <div className={styles.optionInfo}>
                  <span className={styles.optionLabel}>{t('checkout.codLabel')}</span>
                  <span className={styles.optionDesc}>{t('checkout.codDesc')}</span>
                </div>
              </div>
            </label>

            <label className={`${styles.paymentOption} ${paymentMethod === 'dahabia' ? styles.activeOption : ''}`}>
              <div className={styles.optionMain}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="dahabia"
                  checked={paymentMethod === 'dahabia'}
                  onChange={() => setPaymentMethod('dahabia')}
                  disabled={isLoading}
                />
                <div className={styles.optionInfo}>
                  <span className={styles.optionLabel}>{t('checkout.dahabiaLabel')}</span>
                  <span className={styles.optionDesc}>{t('checkout.dahabiaDesc')}</span>
                </div>
              </div>
              <img src="/dahabia_CIB.jpg" alt="Edahabia / CIB" className={styles.dahabiaCibLogo} style={{ height: '32px', objectFit: 'contain' }} />
            </label>
          </div>
        </div>

        <Checkbox
          name="emailOptIn"
          label={t('checkout.emailOptIn')}
          checked={form.emailOptIn}
          onChange={(e) => handleChange("emailOptIn", e.target.checked)}
          disabled={isLoading}
        />

        {/* Custom "I'm not a robot" Verification */}
        <div className={styles.robotVerificationContainer}>
          <button
            type="button"
            className={`${styles.robotCheckboxButton} ${isRobotChecked ? styles.checked : ""} ${isVerifyingRobot ? styles.verifying : ""}`}
            onClick={handleRobotCheck}
            disabled={isRobotChecked || isVerifyingRobot || isLoading}
            aria-invalid={!!errors.robot}
          >
            <span className={styles.checkboxBox}>
              {isVerifyingRobot && <span className={styles.spinner}></span>}
              {isRobotChecked && <span className={styles.checkmark}>✔</span>}
            </span>
            <span className={styles.checkboxLabel}>
              {t('checkout.robotLabel') || "I'm not a robot"}
            </span>
          </button>
          {errors.robot && (
            <p className={styles.robotError} role="alert">
              {errors.robot}
            </p>
          )}
        </div>
      </div>

      {serverError && (
        <div>
          <p className={styles.serverError} role="alert">
            {serverError}
          </p>
          {serverError.toLowerCase().includes("cart") && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#5C5C5C",
                marginTop: "0.5rem",
              }}
            >
              Try{" "}
              <button
                type="button"
                style={{
                  color: "#7B5C2E",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "inherit",
                }}
                onClick={() => {
                  localStorage.removeItem("lumina_cart");
                  window.location.href = "/shop";
                }}
              >
                clearing your cart
              </button>{" "}
              and adding items again.
            </p>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Link to="/bag" className={styles.backLink}>
          {t('checkout.returnCart')}
        </Link>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={items.length === 0}
        >
          {t('checkout.confirmOrder')}
        </Button>
      </div>
    </form>
  );
}

export default CheckoutForm;
