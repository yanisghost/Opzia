// src/pages/admin/AdminProductsPage/AdminProductsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useProducts } from "@hooks/useProducts";
import { productService } from "@services/productService";
import { categoryService } from "@services/categoryService";
import { useLanguage } from "@hooks/useLanguage";
import { useUI } from "@hooks/useUI";
import { productImageUrl } from "@utils/imageUrl";
import Button from "@components/ui/Button/Button";
import Input from "@components/ui/Input/Input";
import Select from "@components/ui/Select/Select";
import Modal from "@components/ui/Modal/Modal";
import styles from "./AdminProductsPage.module.css";

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
    return category._id || category.id || "";
  }
  return "";
}

function AdminProductsPage() {
  const { t } = useLanguage();
  const { addToast } = useUI();
  const { products, isLoading, error, refetch } = useProducts({
    sort: "-createdAt",
  });

  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [imageCoverFile, setImageCoverFile] = useState(null);
  const [previewCoverUrl, setPreviewCoverUrl] = useState(null);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [previewImagesUrls, setPreviewImagesUrls] = useState([]);

  const [allProducts, setAllProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

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
      addToast(t("admin.products.deletedSuccess") || "Product deleted successfully.", "success");
      await refetch();
    } catch (err) {
      setDeleteError(err.message || t("admin.products.deletedError"));
      addToast(err.message || t("admin.products.deletedError"), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Modal Handlers
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedProduct(null);
    setForm(initialForm);
    setImageCoverFile(null);
    setPreviewCoverUrl(null);
    setImagesFiles([]);
    setPreviewImagesUrls([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode("edit");
    setSelectedProduct(product);

    const linkedProductIds = Array.isArray(product.linkedProducts)
      ? product.linkedProducts.map((p) => (typeof p === "object" ? p._id || p.id : p))
      : [];

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price != null ? String(product.price) : "",
      costPrice: product.costPrice != null ? String(product.costPrice) : "",
      category: getCategoryId(product.category),
      stock: product.stock != null ? String(product.stock) : "",
      active: product.active ?? true,
      linkedProducts: linkedProductIds,
    });

    setImageCoverFile(null);
    setImagesFiles([]);
    setPreviewCoverUrl(product.imageCover ? productImageUrl(product.imageCover) : null);
    setPreviewImagesUrls(
      Array.isArray(product.images)
        ? product.images.map((img) => productImageUrl(img))
        : []
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  // Form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const normalizedValue = type === "number" && value !== "" ? Number(value) : value;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : normalizedValue,
    }));
  };

  // Image upload changes
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageCoverFile(file);
      setPreviewCoverUrl(URL.createObjectURL(file));
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setImagesFiles(files);
    setPreviewImagesUrls(files.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveCover = () => {
    setImageCoverFile(null);
    setPreviewCoverUrl(null);
  };

  const handleRemoveImages = () => {
    setImagesFiles([]);
    setPreviewImagesUrls([]);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name || !form.price || !form.costPrice || !form.category || form.stock === "") {
      setFormError(t("admin.productForm.errors.errorCompleteRequired") || "Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", String(form.price));
    formData.append("costPrice", String(form.costPrice));
    formData.append("category", form.category);
    formData.append("stock", String(form.stock));
    formData.append("active", String(form.active));

    form.linkedProducts.forEach((id) => {
      formData.append("linkedProducts", id);
    });

    if (imageCoverFile) {
      formData.append("imageCover", imageCoverFile);
    }

    imagesFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      if (modalMode === "create") {
        await productService.createProduct(formData);
        addToast(t("admin.products.createdSuccess") || "Product created successfully.", "success");
      } else {
        await productService.updateProduct(selectedProduct._id || selectedProduct.id, formData);
        addToast(t("admin.products.updatedSuccess") || "Product updated successfully.", "success");
      }
      setIsModalOpen(false);
      await refetch();
    } catch (err) {
      setFormError(err.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
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

        <Button variant="primary" onClick={handleOpenCreateModal}>
          {t("admin.products.addProduct")}
        </Button>
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

                const productId = product._id || product.id;

                return (
                  <tr key={productId}>
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
                        {product.slug || productId}
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
                        <Button
                          variant="secondary"
                          size="sm"
                          className={styles.actionButton}
                          onClick={() => handleOpenEditModal(product)}
                        >
                          {t("admin.products.table.edit")}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className={styles.actionButton}
                          onClick={() => handleDelete(productId)}
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

      {/* Product Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "create" ? (t("admin.products.addProduct") || "Add Product") : (t("admin.products.table.edit") || "Edit Product")}
        size="lg"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {formError && <div className={styles.formError}>{formError}</div>}

          <div className={styles.grid}>
            <Input
              label={t("admin.productForm.nameLabel") || "Product Name"}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Select
              label={t("admin.productForm.categoryLabel") || "Category"}
              name="category"
              value={form.category}
              onChange={handleChange}
              options={categories.map((category) => ({
                value: category._id || category.id || "",
                label: category.name || "Untitled",
              }))}
              placeholder={t("admin.productForm.selectCategory") || "Select Category"}
              required
            />
            <Input
              label={t("admin.productForm.priceLabel") || "Sale Price ($)"}
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
            <Input
              label={t("admin.productForm.costPriceLabel") || "Cost Price ($)"}
              name="costPrice"
              type="number"
              step="0.01"
              value={form.costPrice}
              onChange={handleChange}
              required
            />
            <Input
              label={t("admin.productForm.stockLabel") || "Stock Inventory"}
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              required
            />
            <div className={styles.checkboxFieldGroup}>
              <label className={styles.label}>
                <input
                  name="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={handleChange}
                />
                <span style={{ marginLeft: "8px" }}>
                  {t("admin.productForm.activeLabel") || "Active / Visible to customers"}
                </span>
              </label>
            </div>
          </div>

          <div className={styles.grid}>
            {/* Cover Image Upload */}
            <div className={styles.imageUploadSection}>
              <label className={styles.label}>
                {t("admin.productForm.coverImageLabel") || "Cover Image"}
              </label>
              {previewCoverUrl ? (
                <div className={styles.imagePreviewCard}>
                  <img src={previewCoverUrl} alt="Cover preview" className={styles.previewImage} />
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className={styles.removeImageOverlay}
                    title="Remove image"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <label className={styles.dropZone}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    style={{ display: 'none' }}
                  />
                  <svg className={styles.uploadIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className={styles.uploadText}>Upload Cover</span>
                  <span className={styles.uploadSubtext}>Click to select file</span>
                </label>
              )}
            </div>

            {/* Gallery Images Upload */}
            <div className={styles.imageUploadSection}>
              <label className={styles.label}>
                {t("admin.productForm.additionalImagesLabel") || "Gallery Images (Max 3)"}
              </label>
              {previewImagesUrls.length > 0 ? (
                <div className={styles.galleryPreviewSection}>
                  <div className={styles.galleryPreviewList}>
                    {previewImagesUrls.map((url, idx) => (
                      <div key={idx} className={styles.galleryPreviewCard}>
                        <img src={url} alt={`Gallery ${idx + 1}`} className={styles.previewImage} />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImages}
                    className={styles.removeImagesBtn}
                  >
                    Clear Gallery
                  </button>
                </div>
              ) : (
                <label className={styles.dropZone}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    style={{ display: 'none' }}
                  />
                  <svg className={styles.uploadIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className={styles.uploadText}>Upload Gallery</span>
                  <span className={styles.uploadSubtext}>Up to 3 images</span>
                </label>
              )}
            </div>
          </div>

          <div className={styles.fullWidthField}>
            <label className={styles.label}>
              {t("admin.productForm.descriptionLabel") || "Description"}
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={styles.textarea}
              required
            />
          </div>

          <div className={styles.fullWidthField}>
            <label className={styles.label}>
              {t("admin.productForm.linkedProductsLabel") || "Linked / Related Products"}
            </label>
            <p className={styles.hint}>
              {t("admin.productForm.linkedProductsHint") || "Select products that are frequently bought together or related."}
            </p>
            <div className={styles.linkedProductsContainer}>
              {allProducts
                .filter((p) => (selectedProduct ? p._id !== selectedProduct._id && p.id !== selectedProduct.id : true))
                .map((prod) => {
                  const isChecked = form.linkedProducts.includes(prod._id || prod.id);
                  return (
                    <label key={prod._id || prod.id} className={styles.linkedProductCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const prodId = prod._id || prod.id;
                          if (e.target.checked) {
                            setForm((prev) => ({
                              ...prev,
                              linkedProducts: [...prev.linkedProducts, prodId],
                            }));
                          } else {
                            setForm((prev) => ({
                              ...prev,
                              linkedProducts: prev.linkedProducts.filter((id) => id !== prodId),
                            }));
                          }
                        }}
                      />
                      <span>{prod.name}</span>
                    </label>
                  );
                })}
            </div>
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="neutral"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminProductsPage;
