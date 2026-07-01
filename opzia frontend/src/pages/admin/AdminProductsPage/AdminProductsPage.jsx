// src/pages/admin/AdminProductsPage/AdminProductsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@hooks/useProducts";
import { productService } from "@services/productService";
import { categoryService } from "@services/categoryService";
import { useLanguage } from "@hooks/useLanguage";
import { productImageUrl } from "@utils/imageUrl";
import Button from "@components/ui/Button/Button";
import styles from "./AdminProductsPage.module.css";

function AdminProductsPage() {
  const { t } = useLanguage();
  const { products, isLoading, error, refetch } = useProducts({
    sort: "-createdAt",
  });
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoryList = await categoryService.getCategories({
          limit: 100,
        });
        setCategories(Array.isArray(categoryList) ? categoryList : []);
      } catch (err) {
        setCategoriesError(err.message || "Unable to load categories.");
      }
    }

    loadCategories();
  }, []);

  const categoriesMap = useMemo(
    () =>
      categories.reduce((acc, category) => {
        if (category?._id) acc[category._id] = category.name || category._id;
        return acc;
      }, {}),
    [categories],
  );

  const handleDelete = async (productId) => {
    if (!window.confirm(t("admin.products.deleteConfirm"))) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await productService.deleteProduct(productId);
      await refetch();
    } catch (err) {
      setDeleteError(err.message || t("admin.products.deletedError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{t("admin.products.title")}</h1>
          <p className={styles.subtitle}>
            {t("admin.products.subtitle")}
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button variant="primary">{t("admin.products.addProduct")}</Button>
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {categoriesError && <div className={styles.error}>{categoriesError}</div>}
      {deleteError && <div className={styles.error}>{deleteError}</div>}

      {isLoading ? (
        <div className={styles.empty}>{t("admin.products.loading")}</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          {t("admin.products.empty")}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("admin.products.table.image")}</th>
                <th>{t("admin.products.table.name")}</th>
                <th>{t("admin.products.table.category")}</th>
                <th>{t("admin.products.table.price")}</th>
                <th>{t("admin.products.table.stock")}</th>
                <th>{t("admin.products.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const rawCategory = product.category;
                const categoryName = rawCategory
                  ? typeof rawCategory === "object"
                    ? rawCategory.name || rawCategory._id
                    : categoriesMap[rawCategory] || rawCategory
                  : null;

                return (
                  <tr key={product._id ?? product.id}>
                    <td className={styles.coverCell}>
                      <img
                        src={productImageUrl(product.imageCover)}
                        alt={product.name}
                        className={styles.coverImage}
                      />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <div className={styles.productMeta}>
                        {product.slug || product._id}
                      </div>
                    </td>
                    <td>{categoryName || "—"}</td>
                    <td>
                      {product.price != null
                        ? `$${product.price.toFixed(2)}`
                        : "—"}
                    </td>
                    <td>{product.stock != null ? product.stock : "—"}</td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionGroup}>
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className={styles.actionLink}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className={styles.actionButton}
                          >
                            {t("admin.products.table.edit")}
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          className={styles.actionButton}
                          onClick={() => handleDelete(product._id)}
                          disabled={isDeleting}
                        >
                          {t("admin.products.table.delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;
