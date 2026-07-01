// src/pages/ShopAllPage/ShopAllPage.jsx
// Full product catalog.
// Sections: category sidebar, price range, sort, search, product grid, pagination.

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "@services/productService";
import { categoryService } from "@services/categoryService";
import { useLanguage } from "@hooks/useLanguage";
import ProductGrid from "@components/product/ProductGrid/ProductGrid";
import Pagination from "@components/ui/Pagination/Pagination";
import Select from "@components/ui/Select/Select";
import Spinner from "@components/ui/Spinner/Spinner";
import styles from "./ShopAllPage.module.css";

const ITEMS_PER_PAGE = 6;

// ─── Sidebar ─────────────────────────────────────────────────────────────
function Sidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
}) {
  const { t } = useLanguage();
  const maxPrice = priceRange[1];

  return (
    <aside className={styles.sidebar}>
      {/* Category filter */}
      <div className={styles.filterGroup}>
        <p className={styles.filterLabel}>{t('shop.categories')}</p>
        <ul className={styles.categoryList}>
          <li>
            <button
              className={[
                styles.categoryBtn,
                !selectedCategory ? styles.categoryBtnActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onCategoryChange("")}
            >
              {t('shop.allProducts')}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat._id}>
              <button
                className={[
                  styles.categoryBtn,
                  selectedCategory === cat._id ? styles.categoryBtnActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onCategoryChange(cat._id)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div className={styles.filterGroup}>
        <p className={styles.filterLabel}>{t('shop.priceRange')}</p>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>0 DA</span>
          <span className={styles.priceLabel}>
            {maxPrice >= 3000 ? "3000 DA+" : `${maxPrice} DA`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={3000}
          step={100}
          value={maxPrice}
          onChange={(e) => onPriceChange([0, Number(e.target.value)])}
          className={styles.priceSlider}
          aria-label={t('shop.priceRange')}
        />
      </div>

      {/* Sort — also in sidebar for design fidelity */}
      <div className={styles.filterGroup}>
        <Select
          label={t('shop.sortBy')}
          value={""}
          onChange={() => {}}
          options={[]}
          className={styles.hiddenSort}
        />
      </div>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
function ShopAllPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL params (linkable filters)
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  // Data state
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories once
  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Map of categoryId -> name for quick lookup in ProductCard
  const categoriesMap = React.useMemo(() => {
    if (!Array.isArray(categories)) return {};
    return categories.reduce((acc, c) => {
      if (c && c._id) acc[c._id] = c.name || "";
      return acc;
    }, {});
  }, [categories]);

  // Sync searchQuery with debounced value after a delay
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync URL params when debounced search query changes
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const currentVal = next.get("search") || "";
      if (debouncedSearchQuery) {
        if (currentVal !== debouncedSearchQuery) {
          next.set("search", debouncedSearchQuery);
        }
      } else {
        next.delete("search");
      }
      return next;
    });
  }, [debouncedSearchQuery, setSearchParams]);

  // Sync state when URL params change (e.g. from navbar search)
  useEffect(() => {
    const q = searchParams.get("search") || "";
    if (q !== searchQuery) {
      setSearchQuery(q);
      setDebouncedSearchQuery(q);
    }
    const cat = searchParams.get("category") || "";
    if (cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams, searchQuery, selectedCategory]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (sort !== "featured") params.sort = sort;
      if (priceRange[1] < 3000) params['price[lte]'] = priceRange[1];

      const data = await productService.getProducts(params);
      const products = Array.isArray(data) ? data : [];
      setAllProducts(products);
    } catch (err) {
      setError(err.message || t('shop.error'));
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, sort, priceRange, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    const filtered = query
      ? allProducts.filter((product) =>
          product?.name?.toLowerCase().includes(query),
        )
      : allProducts;

    setFilteredProducts(filtered);
    setPage(1);
  }, [allProducts, debouncedSearchQuery]);

  // Client-side pagination (fallback until backend pagination is confirmed)
  const productsArray = Array.isArray(filteredProducts) ? filteredProducts : [];
  const totalPages = Math.ceil(productsArray.length / ITEMS_PER_PAGE);
  const paginatedProducts = productsArray.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (catId) {
        next.set("category", catId);
      } else {
        next.delete("category");
      }
      return next;
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const translatedSortOptions = React.useMemo(() => [
    { value: "featured", label: t('shop.featured') },
    { value: "-ratingsAverage", label: t('shop.topRated') },
    { value: "-ratingsQuantity", label: t('shop.bestSellers') },
    { value: "price", label: t('shop.priceLowHigh') },
    { value: "-price", label: t('shop.priceHighLow') },
  ], [t]);

  return (
    <div className={styles.page}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{t('shop.title')}</h1>
          <p className={styles.subtitle}>
            {t('shop.subtitle')}
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ── Sidebar ── */}
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
        />

        {/* ── Main content ── */}
        <div className={styles.main}>
          {/* Sort bar */}
          <div className={styles.sortBar}>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={translatedSortOptions}
              placeholder=""
              className={styles.sortSelect}
            />
          </div>

          <ProductGrid
            products={paginatedProducts}
            isLoading={isLoading}
            error={error}
            categoriesMap={categoriesMap}
            columns={3}
          />

          {!isLoading && !error && totalPages > 1 && (
            <div className={styles.paginationWrap}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopAllPage;
