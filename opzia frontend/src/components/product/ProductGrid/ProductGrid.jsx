// src/components/product/ProductGrid/ProductGrid.jsx
// Responsive CSS grid wrapper for ProductCard tiles.
// Used on: ShopAllPage, HomePage (best sellers), RelatedProducts.
// Accepts a `columns` hint but adapts fluidly via CSS auto-fill.

import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import Spinner from "@components/ui/Spinner/Spinner";
import styles from "./ProductGrid.module.css";

function ProductGrid({
  products = [],
  isLoading = false,
  error = null,
  columns = 4,
  categoriesMap = null,
}) {
  if (isLoading) {
    return (
      <div className={styles.centerState}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centerState}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.centerState}>
        <p className={styles.emptyText}>No products found.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid} style={{ "--grid-cols": columns }}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          categoriesMap={categoriesMap}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
