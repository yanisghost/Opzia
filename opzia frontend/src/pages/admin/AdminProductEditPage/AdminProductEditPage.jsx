// src/pages/admin/AdminProductEditPage/AdminProductEditPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productService } from "@services/productService";
import { categoryService } from "@services/categoryService";
import { useProduct } from "@hooks/useProducts";
import { useLanguage } from "@hooks/useLanguage";
import { productImageUrl } from "@utils/imageUrl";
import Button from "@components/ui/Button/Button";
import Input from "@components/ui/Input/Input";
import Select from "@components/ui/Select/Select";
import styles from "./AdminProductEditPage.module.css";

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

function getCategoryId(category) {
  if (!category) return "";
  if (typeof category === "string") return category;
  if (typeof category === "object") {
    return category._id || category.id || category.value || "";
  }
  return "";
}

function resolveCategoryId(productCategory, categories) {
  const directId = getCategoryId(productCategory);
  if (directId) return directId;

  if (!productCategory || typeof productCategory !== "object") return "";

  const matchedCategory = categories.find(
    (category) =>
      category?._id === productCategory?._id ||
      category?.id === productCategory?.id ||
      category?.name === productCategory?.name,
  );

  return getCategoryId(matchedCategory);
}

function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    product,
    isLoading: isLoadingProduct,
    error: loadError,
  } = useProduct(id);
  const [form, setForm] = useState(initialForm);
  const [imageList, setImageList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!product) return;

    const categoryId = getCategoryId(product.category);
    const linkedProductIds = Array.isArray(product.linkedProducts)
      ? product.linkedProducts.map((p) => (typeof p === "object" ? p._id || p.id : p))
      : [];

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price != null ? String(product.price) : "",
      costPrice: product.costPrice != null ? String(product.costPrice) : "",
      category: categoryId,
      stock: product.stock != null ? String(product.stock) : "",
      active: product.active ?? true,
      linkedProducts: linkedProductIds,
    });

    // Populate imageList from existing product cover and images
    const list = [];
    if (product.imageCover) {
      list.push({
        id: "server-cover",
        url: productImageUrl(product.imageCover),
        filename: product.imageCover,
        type: "server",
        originalField: "imageCover",
      });
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((img, idx) => {
        list.push({
          id: `server-img-${idx}`,
          url: productImageUrl(img),
          filename: img,
          type: "server",
          originalField: "images",
        });
      });
    }
    setImageList(list);
  }, [product]);

  useEffect(() => {
    if (!product || form.category) return;

    const categoryId = resolveCategoryId(product.category, categories);
    if (categoryId) {
      setForm((prev) => ({ ...prev, category: categoryId }));
    }
  }, [product, categories, form.category]);

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
        setError(err.message || "Unable to load products.");
      }
    }

    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const normalizedValue = name === "category" ? getCategoryId(value) : value;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : normalizedValue,
    }));
  };

  const handleAddLocalImage = (event) => {
    const files = Array.from(event.target.files || []);
    const newItems = files.map((file) => {
      const id = `local-${Date.now()}-${Math.random()}`;
      return {
        id,
        url: URL.createObjectURL(file),
        file,
        type: "local",
        originalField: "images",
      };
    });
    setImageList((prev) => [...prev, ...newItems]);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (sourceIndex === targetIndex) return;

    const newItems = [...imageList];
    const [removed] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    setImageList(newItems);
  };

  const handleDeleteImage = (id) => {
    setImageList((prev) => prev.filter((item) => item.id !== id));
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

    const imageOrder = [];
    let localImagesIndex = 0;

    imageList.forEach((item) => {
      if (item.type === "server") {
        imageOrder.push(`server:${item.filename}`);
      } else if (item.type === "local") {
        formData.append("images", item.file);
        imageOrder.push(`file:images:${localImagesIndex}`);
        localImagesIndex++;
      }
    });

    formData.append("imageOrder", JSON.stringify(imageOrder));

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
      !form.stock
    ) {
      setError(t("admin.productForm.errors.errorCompleteRequired"));
      return;
    }

    setIsSaving(true);

    try {
      const payload = buildFormData();
      await productService.updateProduct(id, payload);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || t("admin.productForm.unableUpdate"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProduct) {
    return <div className={styles.page}>{t("admin.productForm.loadingInfo")}</div>;
  }

  if (loadError) {
    return <div className={styles.page}>{loadError}</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("admin.productForm.editTitle")}</h1>
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
          <div className={styles.fullWidthField} style={{ gridColumn: "1 / -1", marginTop: "var(--space-2)" }}>
            <label className={styles.label}>
              Product Images Gallery (Drag to rearrange order, first image is the Cover)
            </label>
            <div className={styles.imageGrid}>
              {imageList.map((item, index) => (
                <div
                  key={item.id}
                  className={styles.imageCard}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.orderLabel}>
                      {index === 0 ? "1 - Cover" : `${index + 1} - Gallery`}
                    </span>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteImage(item.id)}
                      title="Remove image"
                    >
                      &times;
                    </button>
                  </div>
                  <div className={styles.imageBox}>
                    <img src={item.url} alt={`product-${index}`} className={styles.previewImage} />
                  </div>
                </div>
              ))}
              {imageList.length === 0 && (
                <div className={styles.noImagesBox}>
                  No images uploaded yet.
                </div>
              )}
            </div>

            <div className={styles.uploadBox}>
              <label htmlFor="upload-images-btn" className={styles.uploadLabelBtn}>
                Add Images
              </label>
              <input
                id="upload-images-btn"
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddLocalImage}
                style={{ display: "none" }}
              />
              <span className={styles.hint} style={{ marginLeft: "var(--space-3)" }}>
                Select files to add to the gallery. Drag cards above to rearrange.
              </span>
            </div>
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
            {allProducts
              .filter((p) => p._id !== id)
              .map((p) => (
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
            {allProducts.filter((p) => p._id !== id).length === 0 && (
              <p className={styles.noProductsText}>No other products found to link.</p>
            )}
          </div>
        </div>

        {error && <div className={styles.formError}>{error}</div>}

        <div className={styles.actions}>
          <Button type="submit" isLoading={isSaving}>
            {t("admin.productForm.saveChanges")}
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

export default AdminProductEditPage;
