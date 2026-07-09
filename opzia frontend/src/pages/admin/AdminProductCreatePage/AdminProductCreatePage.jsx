// src/pages/admin/AdminProductCreatePage/AdminProductCreatePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "@services/productService";
import { categoryService } from "@services/categoryService";
import { useLanguage } from "@hooks/useLanguage";
import Button from "@components/ui/Button/Button";
import Input from "@components/ui/Input/Input";
import Select from "@components/ui/Select/Select";
import styles from "./AdminProductCreatePage.module.css";

const initialForm = {
  name: "",
  description: "",
  price: "",
  costPrice: "",
  category: "",
  stock: "",
  active: true,
  linkedProducts: [],
};

function AdminProductCreatePage() {
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [imageCover, setImageCover] = useState(null);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoryList = await categoryService.getCategories({
          limit: 100,
        });
        setCategories(categoryList);
      } catch (err) {
        setError(err.message || "Unable to load categories.");
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const productList = await productService.getProducts({ limit: 1000 });
        setAllProducts(productList);
      } catch (err) {
        console.error("Failed to load products for linking:", err);
      }
    }

    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCoverChange = (event) => {
    setImageCover(event.target.files?.[0] ?? null);
  };

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 8);
    setImages(files);
  };

  const buildFormData = () => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("costPrice", form.costPrice);
    formData.append("category", form.category);
    formData.append("stock", form.stock);
    formData.append("active", String(form.active));

    // Append linked products individually so multer parses them as an array
    form.linkedProducts.forEach((id) => {
      formData.append("linkedProducts", id);
    });

    if (imageCover) {
      formData.append("imageCover", imageCover);
    }

    images.forEach((file) => {
      formData.append("images", file);
    });

    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.costPrice ||
      !form.category ||
      !form.stock ||
      !imageCover
    ) {
      setError(t("admin.productForm.errors.errorRequiredFields"));
      return;
    }

    setIsSaving(true);

    try {
      const formData = buildFormData();
      await productService.createProduct(formData);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || t("admin.productForm.unableCreate"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("admin.productForm.createTitle")}</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <Input
            label={t("admin.productForm.nameLabel")}
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Select
            label={t("admin.productForm.categoryLabel")}
            name="category"
            value={form.category}
            onChange={handleChange}
            options={categories.map((category) => ({
              value: category._id || category.id || "",
              label:
                category.name ||
                category.title ||
                category._id ||
                category.id ||
                "Untitled",
            }))}
            placeholder={t("admin.productForm.selectCategory")}
            required
          />
          <Input
            label={t("admin.productForm.priceLabel")}
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />
          <Input
            label={t("admin.productForm.costPriceLabel")}
            name="costPrice"
            type="number"
            step="0.01"
            value={form.costPrice}
            onChange={handleChange}
            required
          />
          <Input
            label={t("admin.productForm.stockLabel")}
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            required
          />
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="active">
              {t("admin.productForm.activeLabel")}
            </label>
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={handleChange}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="imageCover">
              {t("admin.productForm.coverImageLabel")}
            </label>
            <input
              id="imageCover"
              name="imageCover"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="images">
              {t("admin.productForm.additionalImagesLabel")}
            </label>
            <input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
            />
            <p className={styles.hint}>
              {t("admin.productForm.additionalImagesHint")}
            </p>
          </div>
        </div>

        <div className={styles.fullWidthField}>
          <label htmlFor="description" className={styles.label}>
            {t("admin.productForm.descriptionLabel")}
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className={styles.textarea}
            rows="6"
            required
          />
        </div>

        <div className={styles.fullWidthField}>
          <label className={styles.label}>
            {t("admin.productForm.linkedProductsLabel") || "Linked Products (Optional)"}
          </label>
          <div className={styles.linkedProductsContainer}>
            {allProducts.map((p) => (
              <label key={p._id} className={styles.linkedProductCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={form.linkedProducts.includes(p._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm((prev) => {
                      const nextLinked = checked
                        ? [...prev.linkedProducts, p._id]
                        : prev.linkedProducts.filter((pid) => pid !== p._id);
                      return { ...prev, linkedProducts: nextLinked };
                    });
                  }}
                />
                <span className={styles.checkboxText}>{p.name}</span>
              </label>
            ))}
            {allProducts.length === 0 && (
              <p className={styles.noProductsText}>No other products found to link.</p>
            )}
          </div>
        </div>

        {error && <div className={styles.formError}>{error}</div>}

        <div className={styles.actions}>
          <Button type="submit" isLoading={isSaving}>
            {t("admin.productForm.createBtn")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/products")}
          >
            {t("admin.productForm.cancelBtn")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminProductCreatePage;
