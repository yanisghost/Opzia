// src/components/product/RelatedProducts/RelatedProducts.jsx
// "Complete the Ritual" section on ProductDetailsPage.
// Fetches products from the same category, excludes the current product.
// Architecture note: filters by category client-side from the fetched list
// since query param support is unconfirmed (see architecture doc §2.2).
// TODO: Switch to ?category=id query param once backend confirms support.

import React from 'react';
import { useProducts } from '@hooks/useProducts';
import ProductCard from '../ProductCard/ProductCard';
import SectionHeader from '@components/common/SectionHeader/SectionHeader';
import Spinner from '@components/ui/Spinner/Spinner';
import styles from './RelatedProducts.module.css';

function RelatedProducts({ currentProductId, categoryId, linkedProducts = [], limit = 4 }) {
  // Fetch products (needed for fallback category matching)
  const { products, isLoading } = useProducts();

  const isLinkedMode = Array.isArray(linkedProducts) && linkedProducts.length > 0;

  const related = isLinkedMode
    ? linkedProducts
        .filter((p) => p && p._id !== currentProductId)
        .slice(0, limit)
    : products
        .filter((p) => {
          const pCategoryId = typeof p.category === 'object' ? p.category?._id : p.category;
          const targetCatId = categoryId?.toString() || categoryId;
          const itemCatId = pCategoryId?.toString() || pCategoryId;
          return p._id !== currentProductId && itemCatId === targetCatId;
        })
        .slice(0, limit);

  if (isLoading && !isLinkedMode) {
    return (
      <div className={styles.loadingState}>
        <Spinner />
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <SectionHeader
          eyebrow={isLinkedMode ? "Recommended For You" : "Complete the Ritual"}
          title={isLinkedMode ? "Linked Products" : "Related Products"}
          align="left"
        />
        {/* View All link is static — navigates to shop */}
        <a href="/shop" className={styles.viewAll}>View All</a>
      </div>
      <div className={styles.grid}>
        {related.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default RelatedProducts;
