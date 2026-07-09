// src/pages/ShopAllPage/ShopAllPage.jsx
// Full product catalog.
// Sections: category sidebar, price range, sort, search, product grid, pagination.

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "@services/productService";
import { categoryService } from "@services/categoryService";
import { packService } from "@services/packService";
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
  filterType,
  onTypeChange,
}) {
  const { t } = useLanguage();
  const maxPrice = priceRange[1];

  return (
    <aside className={styles.sidebar}>
      {/* Show Type Filter */}
      <div className={styles.filterGroup}>
        <p className={styles.filterLabel}>{t('shop.showType')}</p>
        <ul className={styles.categoryList}>
          <li>
            <button
              className={[
                styles.categoryBtn,
                filterType === "products" ? styles.categoryBtnActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onTypeChange("products")}
            >
              {t('shop.products')}
            </button>
          </li>
          <li>
            <button
              className={[
                styles.categoryBtn,
                filterType === "packs" ? styles.categoryBtnActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onTypeChange("packs")}
            >
              {t('shop.packs')}
            </button>
          </li>
        </ul>
      </div>

      {/* Category filter - only for products */}
      {filterType === "products" && (
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
      )}

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
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
function ShopAllPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL params (linkable filters)
  const [filterType, setFilterType] = useState(
    searchParams.get("type") === "packs" ? "packs" : "products",
  );
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

  // Mobile Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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
    const typeParam = searchParams.get("type") || "products";
    if (typeParam !== filterType) {
      setFilterType(typeParam);
    }
  }, [searchParams, searchQuery, selectedCategory, filterType]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (filterType === "packs") {
        const params = {};
        if (sort === "price") params.sort = "packPrice";
        else if (sort === "-price") params.sort = "-packPrice";
        
        if (priceRange[1] < 3000) params['packPrice[lte]'] = priceRange[1];

        const packs = await packService.getPacks(params);
        data = (packs || []).map((p) => ({
          ...p,
          isPack: true,
          price: p.packPrice,
        }));
      } else {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (sort !== "featured") params.sort = sort;
        if (priceRange[1] < 3000) params['price[lte]'] = priceRange[1];

        data = await productService.getProducts(params);
      }

      const products = Array.isArray(data) ? data : [];
      setAllProducts(products);
    } catch (err) {
      setError(err.message || t('shop.error'));
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, selectedCategory, sort, priceRange, t]);

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

  // Client-side pagination
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
      next.set("type", "products");
      if (catId) {
        next.set("category", catId);
      } else {
        next.delete("category");
      }
      return next;
    });
  };

  const handleTypeChange = (type) => {
    setFilterType(type);
    setSelectedCategory("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("type", type);
      next.delete("category");
      return next;
    });
  };

  const translatedSortOptions = React.useMemo(() => [
    { value: "featured", label: t('shop.featured') },
    { value: "-ratingsAverage", label: t('shop.topRated') },
    { value: "-ratingsQuantity", label: t('shop.bestSellers') },
    { value: "price", label: t('shop.priceLowHigh') },
    { value: "-price", label: t('shop.priceHighLow') },
  ], [t]);

  // Calculate active filters count for the mobile badge
  const activeFiltersCount =
    (filterType !== "products" ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (priceRange[1] < 3000 ? 1 : 0) +
    (sort !== "featured" ? 1 : 0);

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

      {/* ── Mobile Filters Toolbar ── */}
      <div className={styles.mobileFilterBar}>
        <button
          className={styles.mobileFilterBtn}
          onClick={() => setIsFilterDrawerOpen(true)}
          aria-label={t('shop.filters')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14" strokeWidth="2" />
            <line x1="4" y1="10" x2="4" y2="3" strokeWidth="2" />
            <line x1="12" y1="21" x2="12" y2="12" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="3" strokeWidth="2" />
            <line x1="20" y1="21" x2="20" y2="16" strokeWidth="2" />
            <line x1="20" y1="12" x2="20" y2="3" strokeWidth="2" />
            <line x1="1" y1="14" x2="7" y2="14" strokeWidth="2" />
            <line x1="9" y1="8" x2="15" y2="8" strokeWidth="2" />
            <line x1="17" y1="16" x2="23" y2="16" strokeWidth="2" />
          </svg>
          <span className={styles.mobileFilterBtnText}>{t('shop.filters')}</span>
          {activeFiltersCount > 0 && (
            <span className={styles.filterBadge}>{activeFiltersCount}</span>
          )}
        </button>

        <div className={styles.mobilePillsScroll}>
          <button
            className={[
              styles.pillBtn,
              filterType === "products" && !selectedCategory ? styles.pillBtnActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              setFilterType("products");
              handleCategoryChange("");
            }}
          >
            {t('shop.allProducts')}
          </button>

          <button
            className={[
              styles.pillBtn,
              filterType === "packs" ? styles.pillBtnActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handleTypeChange("packs")}
          >
            {t('shop.packs')}
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              className={[
                styles.pillBtn,
                filterType === "products" && selectedCategory === cat._id ? styles.pillBtnActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setFilterType("products");
                handleCategoryChange(cat._id);
              }}
            >
              {cat.name}
            </button>
          ))}
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
          filterType={filterType}
          onTypeChange={handleTypeChange}
        />

        {/* ── Main content ── */}
        <div className={styles.main}>
          {/* Sort bar (Desktop only) */}
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

      {/* ── Mobile Filters Bottom Drawer ── */}
      {isFilterDrawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsFilterDrawerOpen(false)}>
          <div className={styles.drawerSheet} onClick={(e) => e.stopPropagation()}>
            {/* Grabber Handle bar for sheet styling */}
            <div className={styles.drawerHandle}></div>

            {/* Header */}
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>{t('shop.filters')}</h2>
              <button
                className={styles.drawerCloseBtn}
                onClick={() => setIsFilterDrawerOpen(false)}
                aria-label="Close filters"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className={styles.drawerContent}>
              {/* Section 1: Show Type */}
              <div className={styles.drawerGroup}>
                <p className={styles.drawerLabel}>{t('shop.showType')}</p>
                <div className={styles.typeSelector}>
                  <button
                    type="button"
                    className={[
                      styles.typeSelectBtn,
                      filterType === "products" ? styles.typeSelectBtnActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setFilterType("products")}
                  >
                    {t('shop.products')}
                  </button>
                  <button
                    type="button"
                    className={[
                      styles.typeSelectBtn,
                      filterType === "packs" ? styles.typeSelectBtnActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setFilterType("packs")}
                  >
                    {t('shop.packs')}
                  </button>
                </div>
              </div>

              {/* Section 2: Categories (Only for products) */}
              {filterType === "products" && (
                <div className={styles.drawerGroup}>
                  <p className={styles.drawerLabel}>{t('shop.categories')}</p>
                  <div className={styles.drawerCategoriesList}>
                    <button
                      type="button"
                      className={[
                        styles.drawerCatBtn,
                        !selectedCategory ? styles.drawerCatBtnActive : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setSelectedCategory("")}
                    >
                      {t('shop.allProducts')}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        type="button"
                        className={[
                          styles.drawerCatBtn,
                          selectedCategory === cat._id ? styles.drawerCatBtnActive : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => setSelectedCategory(cat._id)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Price Range */}
              <div className={styles.drawerGroup}>
                <p className={styles.drawerLabel}>{t('shop.priceRange')}</p>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>0 DA</span>
                  <span className={styles.priceLabel}>
                    {priceRange[1] >= 3000 ? "3000 DA+" : `${priceRange[1]} DA`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className={styles.priceSlider}
                />
              </div>

              {/* Section 4: Sort By */}
              <div className={styles.drawerGroup}>
                <p className={styles.drawerLabel}>{t('shop.sortBy')}</p>
                <div className={styles.drawerSortList}>
                  {translatedSortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={[
                        styles.drawerSortBtn,
                        sort === opt.value ? styles.drawerSortBtnActive : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setSort(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={styles.drawerFooter}>
              <button
                type="button"
                className={styles.drawerClearBtn}
                onClick={() => {
                  setFilterType("products");
                  setSelectedCategory("");
                  setPriceRange([0, 3000]);
                  setSort("featured");
                }}
              >
                {t('shop.clearAll')}
              </button>
              <button
                type="button"
                className={styles.drawerApplyBtn}
                onClick={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("type", filterType);
                    if (selectedCategory && filterType === "products") {
                      next.set("category", selectedCategory);
                    } else {
                      next.delete("category");
                    }
                    return next;
                  });
                  setIsFilterDrawerOpen(false);
                }}
              >
                {t('shop.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopAllPage;

