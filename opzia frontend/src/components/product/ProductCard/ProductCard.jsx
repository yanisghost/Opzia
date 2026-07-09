// src/components/product/ProductCard/ProductCard.jsx
// Product tile used in: HomePage (Best Sellers), ShopAllPage grid, RelatedProducts.
//
// Displays: image, category label, name, price (with discount if active),
// and an "Add to Bag" quick-action on hover.
//
// The `finalPrice` virtual is computed by the backend. We display it
// alongside the original price when they differ.

import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "@hooks/useCart";
import { useUI } from "@hooks/useUI";
import { productImageUrl, packImageUrl } from "@utils/imageUrl";
import { formatPrice, calcDiscountPercent } from "@utils/formatPrice";
import styles from "./ProductCard.module.css";

function ProductCard({ product, categoriesMap = null }) {
  const { addItem } = useCart();
  const { addToast } = useUI();

  if (!product) return null;

  const isPack = product.packPrice !== undefined || product.isPack;

  const {
    _id,
    name,
    category, // populated object or string
    imageCover,
  } = product;

  const price = isPack ? product.packPrice : product.price;
  const finalPrice = product.finalPrice ?? price;
  const stock = isPack ? 999 : product.stock;

  const isObjectId = (val) =>
    typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);

  const categoryName = isPack
    ? "Pack"
    : typeof category === "object"
      ? category?.name
      : categoriesMap && categoriesMap[category]
        ? categoriesMap[category]
        : isObjectId(category)
          ? ""
          : category;

  const hasDiscount = finalPrice != null && finalPrice < price;
  const displayPrice = finalPrice ?? price;
  const isOutOfStock = stock != null && stock === 0;
  const discountPct = hasDiscount ? calcDiscountPercent(price, finalPrice) : 0;

  const handleAddToBag = (e) => {
    e.preventDefault(); // don't navigate
    e.stopPropagation();
    addItem({
      id: _id,
      type: isPack ? "pack" : "product",
      name,
      price: displayPrice,
      originalPrice: price,
      imageCover,
      quantity: 1,
      discounts: product.discounts,
    });
    addToast(`${name} added to your bag.`, "success");
  };

  return (
    <article className={[styles.card, isOutOfStock ? styles.outOfStock : ""].filter(Boolean).join(" ")}>
      <Link to={isPack ? `/packs/${_id}` : `/shop/${_id}`} className={styles.imageLink} aria-label={name}>
        <div className={styles.imageWrap}>
          <img
            src={isPack ? packImageUrl(imageCover) : productImageUrl(imageCover)}
            alt={name}
            className={styles.image}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              // Use an inline placeholder data URI to avoid repeated network retries
              e.currentTarget.src =
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            }}
          />
          {hasDiscount && (
            <span className={styles.discountBadge}>−{discountPct}%</span>
          )}
          {isOutOfStock && (
            <div className={styles.soldOutOverlay}>
              <span className={styles.soldOutText}>SOLD OUT</span>
            </div>
          )}
          {/* Quick Add — appears on hover via CSS */}
          {!isOutOfStock && (
            <button
              type="button"
              className={styles.quickAdd}
              onClick={handleAddToBag}
              aria-label={`Add ${name} to bag`}
            >
              ADD TO BAG
            </button>
          )}
        </div>
      </Link>

      <div className={styles.info}>
        {categoryName && <p className={styles.category}>{categoryName}</p>}
        <Link to={isPack ? `/packs/${_id}` : `/shop/${_id}`} className={styles.name}>
          {name}
        </Link>
        <div className={styles.pricing}>
          <span className={styles.price}>{formatPrice(displayPrice)}</span>
          {hasDiscount && (
            <span className={styles.originalPrice}>{formatPrice(price)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
