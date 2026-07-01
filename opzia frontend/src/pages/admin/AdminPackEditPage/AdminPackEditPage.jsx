// src/pages/admin/AdminPackEditPage/AdminPackEditPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { packService } from "@services/packService";
import { productService } from "@services/productService";
import { useLanguage } from "@hooks/useLanguage";
import { packImageUrl, productImageUrl } from "@utils/imageUrl";
import Button from "@components/ui/Button/Button";
import Input from "@components/ui/Input/Input";
import Select from "@components/ui/Select/Select";
import styles from "./AdminPackEditPage.module.css";

const initialForm = {
  name: "",
  description: "",
  packPrice: "",
  profit: "",
  active: true,
};

function AdminPackEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState(initialForm);
  const [imageList, setImageList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productToAdd, setProductToAdd] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pack details
  useEffect(() => {
    async function loadPack() {
      setIsLoading(true);
      try {
        const pack = await packService.getPack(id);
        setForm({
          name: pack.name || "",
          description: pack.description || "",
          packPrice: pack.packPrice != null ? String(pack.packPrice) : "",
          profit: pack.profit != null ? String(pack.profit) : "",
          active: pack.active ?? true,
        });

        // Resolve products lists with DB mappings
        const packProducts = (pack.products || []).map((p) => ({
          productId: p.productId?._id || p.productId?.id || p.productId || "",
          name: p.name || "",
          price: p.price || 0,
          costPrice: p.costPrice || 0,
          imageCover: p.imageCover || "",
          quantity: p.quantity || 1,
        }));
        setSelectedProducts(packProducts);

        const list = [];
        if (pack.imageCover) {
          list.push({
            id: "server-cover",
            url: packImageUrl(pack.imageCover),
            filename: pack.imageCover,
            type: "server",
            originalField: "imageCover",
          });
        }
        if (Array.isArray(pack.images)) {
          pack.images.forEach((img, idx) => {
            list.push({
              id: `server-img-${idx}`,
              url: packImageUrl(img),
              filename: img,
              type: "server",
              originalField: "images",
            });
          });
        }
        setImageList(list);
      } catch (err) {
        setError(err.message || "Failed to load pack details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPack();
  }, [id]);

  // Fetch all available products
  useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true);
      try {
        const productList = await productService.getProducts({ limit: 1000 });
        setAllProducts(Array.isArray(productList) ? productList : []);
      } catch (err) {
        setError(err.message || "Failed to load catalog products.");
      } finally {
        setIsLoadingProducts(false);
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

  // Product Selector Handlers
  const handleAddProduct = () => {
    if (!productToAdd) return;
    const prod = allProducts.find((p) => p._id === productToAdd);
    if (!prod) return;

    if (selectedProducts.some((p) => p.productId === prod._id)) return;

    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: prod._id,
        name: prod.name,
        price: prod.price || 0,
        costPrice: prod.costPrice || 0,
        imageCover: prod.imageCover || "",
        quantity: 1,
      },
    ]);
    setProductToAdd("");
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  const handleQtyChange = (productId, qtyVal) => {
    const qty = parseInt(qtyVal, 10);
    if (isNaN(qty) || qty < 1) return;

    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, quantity: qty } : p))
    );
  };

  // Calculations
  const originalPrice = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const dealPriceVal = parseFloat(form.packPrice) || 0;
  const savings = originalPrice > dealPriceVal ? originalPrice - dealPriceVal : 0;
  const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  const availableProducts = allProducts.filter(
    (p) => !selectedProducts.some((sp) => sp.productId === p._id)
  );

  const buildFormData = () => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("packPrice", form.packPrice);
    formData.append("profit", form.profit);
    formData.append("active", String(form.active));
    formData.append("originalPrice", String(originalPrice));

    const apiProducts = selectedProducts.map((p) => ({
      productId: p.productId,
      name: p.name,
      price: p.price,
      costPrice: p.costPrice,
      imageCover: p.imageCover,
      quantity: p.quantity,
    }));
    formData.append("products", JSON.stringify(apiProducts));

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

    if (!form.name || !form.description || !form.packPrice || !form.profit) {
      setError("Please complete all required fields.");
      return;
    }

    if (selectedProducts.length === 0) {
      setError("Please add at least one product to this pack.");
      return;
    }

    if (imageList.length === 0) {
      setError("Please upload or preserve at least one cover image.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = buildFormData();
      await packService.updatePack(id, payload);
      navigate("/admin/packs");
    } catch (err) {
      setError(err.message || "Unable to update pack.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className={styles.page}>Loading pack info...</div>;
  }

  if (error && imageList.length === 0) {
    return <div className={styles.page}>{error}</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Edit Pack</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <Input
            label="Pack Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Deal Price"
            name="packPrice"
            type="number"
            step="0.01"
            value={form.packPrice}
            onChange={handleChange}
            required
          />
          <Input
            label="Profit"
            name="profit"
            type="number"
            step="0.01"
            value={form.profit}
            onChange={handleChange}
            required
          />
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="active">
              Active Status
            </label>
            <input
              id="active"
              name="active"
              type="checkbox"
              style={{ width: "20px", height: "20px", accentColor: "var(--color-brand)" }}
              checked={form.active}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fullWidthField} style={{ gridColumn: "1 / -1", marginTop: "var(--space-2)" }}>
            <label className={styles.label}>
              Pack Images Gallery (Drag to rearrange order, first image is the Cover)
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
                    <img src={item.url} alt={`pack-${index}`} className={styles.previewImage} />
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
              <label htmlFor="upload-pack-images-btn" className={styles.uploadLabelBtn}>
                Add Images
              </label>
              <input
                id="upload-pack-images-btn"
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

        {/* Product selector Manager */}
        <div className={styles.productSection}>
          <h2 className={styles.sectionTitle}>Products in this Pack</h2>
          
          {isLoadingProducts ? (
            <div>Loading catalog products...</div>
          ) : (
            <div className={styles.pickerRow}>
              <div className={styles.pickerSelect}>
                <Select
                  label="Select Product to Add"
                  value={productToAdd}
                  onChange={(e) => setProductToAdd(e.target.value)}
                  options={availableProducts.map((p) => ({
                    value: p._id,
                    label: `${p.name} (${p.price ? p.price.toFixed(2) : "0.00"} DA)`,
                  }))}
                  placeholder="-- Choose a product --"
                />
              </div>
              <Button type="button" onClick={handleAddProduct} disabled={!productToAdd}>
                Add Product
              </Button>
            </div>
          )}

          <div className={styles.productTableWrap}>
            {selectedProducts.length === 0 ? (
              <div className={styles.noProducts}>No products added to the pack yet.</div>
            ) : (
              <table className={styles.productTable}>
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((p) => (
                    <tr key={p.productId}>
                      <td className={styles.thumbnailCell}>
                        <img
                          src={productImageUrl(p.imageCover)}
                          alt={p.name}
                          className={styles.productThumb}
                        />
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>{(p.price || 0).toFixed(2)} DA</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className={styles.qtyInput}
                          value={p.quantity}
                          onChange={(e) => handleQtyChange(p.productId, e.target.value)}
                        />
                      </td>
                      <td>{((p.price || 0) * p.quantity).toFixed(2)} DA</td>
                      <td>
                        <button
                          type="button"
                          className={styles.removeTextBtn}
                          onClick={() => handleRemoveProduct(p.productId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pricing calculations details */}
          <div className={styles.calcSummary}>
            <div className={styles.calcCard}>
              <span className={styles.calcLabel}>Total Catalog Price</span>
              <span className={styles.calcVal}>{originalPrice.toFixed(2)} DA</span>
            </div>
            <div className={styles.calcCard}>
              <span className={styles.calcLabel}>Pack Promo Price</span>
              <span className={`${styles.calcVal} ${styles.calcValHighlight}`}>
                {dealPriceVal.toFixed(2)} DA
              </span>
            </div>
            <div className={styles.calcCard}>
              <span className={styles.calcLabel}>Customer Savings</span>
              <span className={styles.calcVal}>
                {savings.toFixed(2)} DA ({savingsPercent}%)
              </span>
            </div>
            <div className={styles.calcCard}>
              <span className={styles.calcLabel}>Declared Pack Profit</span>
              <span className={`${styles.calcVal} ${styles.calcValProfit}`}>
                {(parseFloat(form.profit) || 0).toFixed(2)} DA
              </span>
            </div>
          </div>
        </div>

        <div className={styles.fullWidthField}>
          <label htmlFor="description" className={styles.label}>
            Description
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

        {error && <div className={styles.formError}>{error}</div>}

        <div className={styles.actions}>
          <Button type="submit" isLoading={isSaving}>
            Save Changes
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/packs")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminPackEditPage;
