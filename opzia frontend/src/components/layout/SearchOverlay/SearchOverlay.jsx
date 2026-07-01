// src/components/layout/SearchOverlay/SearchOverlay.jsx
// Full-width luxury search overlay with live dynamic autocomplete suggestions.
// Pre-loads products on open for zero latency (0ms delay) search suggestions as the user types.

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "@hooks/useUI";
import { useLanguage } from "@hooks/useLanguage";
import { productService } from "@services/productService";
import { productImageUrl } from "@utils/imageUrl";
import { formatPrice } from "@utils/formatPrice";
import Spinner from "@components/ui/Spinner/Spinner";
import styles from "./SearchOverlay.module.css";

function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useUI();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const overlayRef = useRef(null);



  // Load products when search overlay opens
  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts();
        if (active) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load products for suggestions:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();

    return () => {
      active = false;
    };
  }, [isSearchOpen]);

  // Focus input automatically on open
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // Filter products client-side as user types
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setFiltered([]);
      setActiveIndex(-1);
      return;
    }
    const matches = products.filter((p) =>
      p?.name?.toLowerCase().includes(trimmed)
    );
    setFiltered(matches.slice(0, 6)); // limit to 6 suggestions
    setActiveIndex(-1);
  }, [query, products]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeSearch();
      return;
    }

    const suggestionsCount = filtered.length;
    // activeIndex can range from -1 (input field) to suggestionsCount (View All option at activeIndex = suggestionsCount)
    const totalOptions = suggestionsCount > 0 ? suggestionsCount + 1 : 0;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= totalOptions ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? totalOptions - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestionsCount) {
        // Go to product page
        const prod = filtered[activeIndex];
        navigate(`/shop/${prod._id}`);
        closeSearch();
      } else if (activeIndex === suggestionsCount || query.trim()) {
        // Go to shop query page
        navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
        closeSearch();
      }
    }
  };

  const handleSelectProduct = (id) => {
    navigate(`/shop/${id}`);
    closeSearch();
  };

  const handleViewAll = () => {
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    closeSearch();
  };

  // Close when clicking overlay backdrop
  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      closeSearch();
    }
  };

  // Return null if search overlay is closed
  if (!isSearchOpen) return null;

  return (
    <div
      className={styles.backdrop}
      ref={overlayRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.container}>
        {/* Close Button */}
        <button
          className={styles.closeBtn}
          onClick={closeSearch}
          aria-label="Close search"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Search Bar Input */}
        <div className={styles.searchBar}>
          <svg
            className={styles.searchIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search catalog"
          />
        </div>

        {/* Loading Spinner */}
        {loading && query && (
          <div className={styles.loadingWrap}>
            <Spinner size="md" />
          </div>
        )}

        {/* Suggestion List */}
        {!loading && query && (
          <div className={styles.dropdown}>
            {filtered.length > 0 ? (
              <>
                <p className={styles.sectionHeader}>{t("search.suggestions")}</p>
                <ul className={styles.list}>
                  {filtered.map((product, idx) => {
                    const hasDiscount = product.finalPrice < product.price;
                    const displayPrice = product.finalPrice ?? product.price;

                    return (
                      <li
                        key={product._id}
                        className={`${styles.item} ${
                          activeIndex === idx ? styles.activeItem : ""
                        }`}
                        onClick={() => handleSelectProduct(product._id)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <img
                          src={productImageUrl(product.imageCover)}
                          alt={product.name}
                          className={styles.thumbnail}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                          }}
                        />
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{product.name}</span>
                        </div>
                        <div className={styles.itemPrice}>
                          <span className={styles.price}>{formatPrice(displayPrice)}</span>
                          {hasDiscount && (
                            <span className={styles.originalPrice}>{formatPrice(product.price)}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* View All Results Button */}
                <button
                  className={`${styles.viewAllBtn} ${
                    activeIndex === filtered.length ? styles.activeItem : ""
                  }`}
                  onClick={handleViewAll}
                  onMouseEnter={() => setActiveIndex(filtered.length)}
                >
                  {t("search.viewAll", { query })}
                </button>
              </>
            ) : (
              <div className={styles.emptyState}>
                {t("search.noSuggestions", { query })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchOverlay;
