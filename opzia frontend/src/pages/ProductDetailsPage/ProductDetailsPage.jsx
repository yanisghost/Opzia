// src/pages/ProductDetailsPage/ProductDetailsPage.jsx
// Single product view.
// Sections: Breadcrumb, ImageGallery, product info, add to cart,
//           wishlist (localStorage only), Ingredients/How To Use accordions,
//           RelatedProducts.

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "@hooks/useProducts";
import { useCart } from "@hooks/useCart";
import { useUI } from "@hooks/useUI";
import { useLanguage } from "@hooks/useLanguage";
import { formatPrice, calcDiscountPercent } from "@utils/formatPrice";
import ImageGallery from "@components/product/ImageGallery/ImageGallery";
import StarRating from "@components/product/StarRating/StarRating";
import QuantitySelector from "@components/product/QuantitySelector/QuantitySelector";
import Accordion from "@components/ui/Accordion/Accordion";
import Button from "@components/ui/Button/Button";
import Breadcrumb from "@components/common/Breadcrumb/Breadcrumb";
import RelatedProducts from "@components/product/RelatedProducts/RelatedProducts";
import Spinner from "@components/ui/Spinner/Spinner";
import styles from "./ProductDetailsPage.module.css";

// ─── Wishlist helpers (localStorage only — no backend) ───────────────────
const WISHLIST_KEY = "lumina_wishlist";

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
}
function toggleWishlistItem(id) {
  const list = getWishlist();
  const next = list.includes(id) ? list.filter((i) => i !== id) : [...list, id];
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  return next.includes(id);
}

// ─── Heart Icon ───────────────────────────────────────────────────────────
function HeartIcon({ filled }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "var(--color-brand)" : "none"}
      stroke="var(--color-brand)"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
function ProductDetailsPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useUI();

  const { product, isLoading, error } = useProduct(id);

  // eslint-disable-next-line no-console
  console.debug("ProductDetailsPage:", { id, product, isLoading, error });

  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  // Sync wishlist state from localStorage on mount / id change
  useEffect(() => {
    setWishlisted(getWishlist().includes(id));
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product._id,
      type: "product",
      name: product.name,
      price: displayPrice,
      originalPrice: price,
      imageCover: product.imageCover,
      quantity,
      discounts: product.discounts,
    });
    addToast(t('product.addedToBagToast', { name: product.name }), "success");
  };

  const handleWishlist = () => {
    const nowInList = toggleWishlistItem(id);
    setWishlisted(nowInList);
    addToast(
      nowInList ? t('product.addedToWishlistToast') : t('product.removedFromWishlistToast'),
      "info",
    );
  };

  // ── Loading / error states ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={styles.stateWrap}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.stateWrap}>
        <p className={styles.errorText}>{error || t('product.errorNotFound')}</p>
        <button className={styles.backLink} onClick={() => navigate("/shop")}>
          {t('product.backToShop')}
        </button>
      </div>
    );
  }

  const {
    name,
    description,
    price,
    finalPrice,
    ratingsAverage,
    ratingsQuantity,
    imageCover,
    images = [],
    category,
    ingredients,
    howToUse,
  } = product;

  const missingCoreFields = !name && !description && price == null;

  const categoryName = typeof category === "object" ? category?.name : category;
  const categoryId = typeof category === "object" ? category?._id : category;
  const hasDiscount = finalPrice != null && finalPrice < price;
  const displayPrice = finalPrice ?? price;
  const discountPct = hasDiscount ? calcDiscountPercent(price, finalPrice) : 0;

  const breadcrumbItems = [
    { label: t('navbar.home'), to: "/" },
    { label: t('navbar.shop'), to: "/shop" },
    { label: name }, // Product name remains in English
  ];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={breadcrumbItems} />

        <div className={styles.productLayout}>
          {/* ── Gallery ── */}
          <div className={styles.galleryCol}>
            <ImageGallery
              imageCover={imageCover}
              images={images}
              productName={name}
              isOutOfStock={product.stock != null && product.stock === 0}
            />
          </div>

          {/* ── Info ── */}
          <div className={styles.infoCol}>
            {/* Collection label */}
            <p className={styles.collectionLabel}>
              LUMINA BEAUTY • {categoryName?.toUpperCase() || "COLLECTION"}
            </p>

            <h1 className={styles.productName}>{name}</h1>

            {/* Ratings */}
            {ratingsQuantity > 0 && (
              <div className={styles.ratings}>
                <StarRating
                  rating={ratingsAverage}
                  count={ratingsQuantity}
                  size="md"
                />
              </div>
            )}

            {/* Pricing */}
            <div className={styles.pricing}>
              <span className={styles.price}>{formatPrice(displayPrice)}</span>
              {hasDiscount && (
                <>
                  <span className={styles.originalPrice}>
                    {formatPrice(price)}
                  </span>
                  <span className={styles.discountBadge}>−{discountPct}%</span>
                </>
              )}
            </div>

            {/* Description */}
            {description && <p className={styles.description}>{description}</p>}

            {/* Add to cart row */}
            <div className={styles.cartRow}>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={product.stock ?? 99}
                size="lg"
              />
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock != null && product.stock === 0}
                fullWidth
              >
                {product.stock === 0 ? t('product.outOfStock') : t('product.addToCart')}
              </Button>
            </div>

            {missingCoreFields && (
              <div
                style={{
                  background: "#fff4e6",
                  padding: 12,
                  borderRadius: 6,
                  marginBottom: 12,
                }}
              >
                <strong>Debug:</strong> product payload (backend shape
                unexpected):
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    overflowX: "auto",
                    marginTop: 8,
                  }}
                >
                  {JSON.stringify(product, null, 2)}
                </pre>
              </div>
            )}
            {/* Wishlist — localStorage only */}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleWishlist}
            >
              <HeartIcon filled={wishlisted} />
              {wishlisted ? t('product.wishlisted') : t('product.wishlist')}
            </Button>

            {/* Accordions */}
            <div className={styles.accordions}>
              {ingredients && (
                <Accordion title={t('product.ingredients')}>
                  <p>{ingredients}</p>
                </Accordion>
              )}
              {howToUse && (
                <Accordion title={t('product.howToUse')}>
                  <p>{howToUse}</p>
                </Accordion>
              )}
              {/* Fallback if backend doesn't yet return these fields */}
              {!ingredients && !howToUse && (
                <Accordion title={t('product.ingredients')}>
                  <p>
                    {t('product.fallbackIngredients')}
                  </p>
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      <div className={styles.relatedWrap}>
        <div className={styles.inner}>
          <RelatedProducts
            currentProductId={id}
            categoryId={categoryId}
            linkedProducts={product.linkedProducts}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
