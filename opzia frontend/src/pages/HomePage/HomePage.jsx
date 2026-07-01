// src/pages/HomePage/HomePage.jsx
// Primary landing page. Sections (in order):
//   1. HeroBanner         — static, editorial
//   2. Best Sellers       — GET /api/v1/products (sorted by ratingsQuantity, limit 4)
//   3. Shop by Category   — GET /api/v1/categories (grid view)
//   4. Products by Category — GET /api/v1/products?category=X (limit 4 per category)
//   5. Curated Rituals    — GET /api/v1/packs (limit 3)
//   6. Testimonial        — static quote
//   7. Join Inner Circle  — newsletter (no backend, UI-only)

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@hooks/useProducts";
import { usePacks } from "@hooks/usePacks";
import { useLanguage } from "@hooks/useLanguage";
import { categoryService } from "@services/categoryService";
import { productService } from "@services/productService";
import { categoryImageUrl } from "@utils/imageUrl";
import SectionHeader from "@components/common/SectionHeader/SectionHeader";
import ProductGrid from "@components/product/ProductGrid/ProductGrid";
import PackGrid from "@components/pack/PackGrid/PackGrid";
import NewsletterForm from "@components/common/NewsletterForm/NewsletterForm";
import Button from "@components/ui/Button/Button";
import styles from "./HomePage.module.css";

// ─── Hero Banner ─────────────────────────────────────────────────────────
function HeroBanner() {
  const { t } = useLanguage();
  return (
    <section className={styles.hero}>
      <div className={styles.heroBg} aria-hidden="true" />
      <div className={styles.heroContent}>
        <p className={styles.heroEyebrow}>{t('hero.eyebrow')}</p>
        <h1 className={styles.heroTitle}>
          {t('hero.title').split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < t('hero.title').split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <div className={styles.heroActions}>
          <Link to="/shop">
            <Button variant="primary" size="lg">
              {t('hero.shopCollection')}
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" size="lg">
              {t('hero.exploreStory')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Shop by Category ─────────────────────────────────────────────────────
function CategoryCard({ category }) {
  const { t } = useLanguage();
  const { name, _id, image } = category;
  
  const bgStyle = image
    ? { backgroundImage: `url(${categoryImageUrl(image)})` }
    : {};

  return (
    <Link
      to={`/shop?category=${_id}`}
      className={styles.categoryCard}
      style={bgStyle}
      aria-label={`Shop ${name}`}
    >
      <div className={styles.categoryInner}>
        <span className={styles.categoryName}>{name}</span>
        <span className={styles.categoryShop}>{t('home.shopNow')}</span>
      </div>
    </Link>
  );
}

function ShopByCategory() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => {}) // fail silently on home page
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !Array.isArray(categories) || categories.length === 0)
    return null;

  return (
    <section className={styles.section}>
      <SectionHeader title={t('home.shopByCategory')} />
      <div className={styles.categoryGrid}>
        {categories.slice(0, 4).map((cat) => (
          <CategoryCard key={cat._id} category={cat} />
        ))}
      </div>
    </section>
  );
}

// ─── Products by Category ───────────────────────────────────────────────────
function ProductsByCategory() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch categories using our API client service
        const categoriesResponse = await categoryService.getCategories();

        if (!Array.isArray(categoriesResponse) || categoriesResponse.length === 0) {
          setLoading(false);
          return;
        }

        setCategories(categoriesResponse);

        // Fetch products for each category
        const productsMap = {};

        for (const cat of categoriesResponse) {
          try {
            const productsResponse = await productService.getProducts({
              category: cat._id,
              limit: 4,
            });
            productsMap[cat._id] = Array.isArray(productsResponse) ? productsResponse : [];
          } catch (error) {
            console.error(`Error fetching products for ${cat.name}:`, error);
            productsMap[cat._id] = [];
          }
        }

        setCategoryProducts(productsMap);
      } catch (error) {
        console.error("Error in ProductsByCategory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <p>{t('home.loadingCategories')}</p>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      {categories.map((category) => (
        <section key={category._id} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <SectionHeader title={category.name} align="left" />
            </div>
            <Link to={`/shop?category=${category._id}`} className={styles.viewAll}>
              {t('home.viewAll')}
            </Link>
          </div>
          <ProductGrid
            products={categoryProducts[category._id] || []}
            isLoading={false}
            error={null}
            columns={4}
          />
        </section>
      ))}
    </>
  );
}

// ─── Testimonial ──────────────────────────────────────────────────────────
function Testimonial() {
  const { t } = useLanguage();
  return (
    <section className={styles.testimonial}>
      <div className={styles.testimonialInner}>
        <span className={styles.quoteIcon} aria-hidden="true">
          "
        </span>
        <blockquote className={styles.quote}>
          {t('home.testimonial.quote')}
        </blockquote>
        <cite className={styles.author}>{t('home.testimonial.author')}</cite>
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────
function JoinInnerCircle() {
  const { t } = useLanguage();
  return (
    <section className={styles.newsletter}>
      <SectionHeader
        title={t('home.newsletter.title')}
        subtitle={t('home.newsletter.subtitle')}
      />
      <div className={styles.newsletterForm}>
        <NewsletterForm
          variant="stacked"
          placeholder={t('home.newsletter.placeholder')}
          buttonLabel={t('home.newsletter.subscribe')}
        />
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────
function HomePage() {
  const { t } = useLanguage();
  // Best sellers: sort by ratingsQuantity desc, limit 4
  // TODO: replace sort param with ?isBestSeller=true once backend adds field
  const {
    products: bestSellers,
    isLoading: loadingProducts,
    error: productsError,
  } = useProducts({ sort: "-ratingsQuantity", limit: 4 });

  // Curated Rituals: first 3 packs
  const {
    packs,
    isLoading: loadingPacks,
    error: packsError,
  } = usePacks({ limit: 3 });

  return (
    <div className={styles.page}>
      <HeroBanner />

      {/* ── Best Sellers ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <SectionHeader
              eyebrow={t('home.bestSellersEyebrow')}
              title={t('home.bestSellers')}
              align="left"
            />
          </div>
          <Link to="/shop" className={styles.viewAll}>
            {t('home.viewAll')}
          </Link>
        </div>
        <ProductGrid
          products={bestSellers}
          isLoading={loadingProducts}
          error={productsError}
          columns={4}
        />
      </section>

      <ShopByCategory />

      <ProductsByCategory />

      {/* ── Curated Rituals ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <SectionHeader
          eyebrow={t('home.curatedRitualsEyebrow')}
          title={t('home.curatedRituals')}
        />
        <PackGrid packs={packs} isLoading={loadingPacks} error={packsError} />
      </section>

      <Testimonial />
      <JoinInnerCircle />
    </div>
  );
}

export default HomePage;
