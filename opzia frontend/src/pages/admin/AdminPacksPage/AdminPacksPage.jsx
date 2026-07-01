// src/pages/admin/AdminPacksPage/AdminPacksPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { packService } from "@services/packService";
import { useLanguage } from "@hooks/useLanguage";
import { packImageUrl } from "@utils/imageUrl";
import Button from "@components/ui/Button/Button";
import styles from "./AdminPacksPage.module.css";

function AdminPacksPage() {
  const { t } = useLanguage();
  const [packs, setPacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadPacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await packService.getPacks({ sort: "-createdAt" });
      setPacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load packs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const handleDelete = async (packId) => {
    const confirmMessage = t("admin.packs.deleteConfirm") || "Are you sure you want to delete this pack?";
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await packService.deletePack(packId);
      setPacks((prev) => prev.filter((p) => p._id !== packId && p.id !== packId));
    } catch (err) {
      setDeleteError(err.message || t("admin.packs.deletedError") || "Could not delete pack.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{t("admin.packs.title") || "Packs & Bundles"}</h1>
          <p className={styles.subtitle}>
            Manage promotional product bundles and discount sets.
          </p>
        </div>

        <Link to="/admin/packs/new">
          <Button variant="primary">{t("admin.packs.addPack") || "Add Pack"}</Button>
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {deleteError && <div className={styles.error}>{deleteError}</div>}

      {isLoading ? (
        <div className={styles.empty}>Loading packs...</div>
      ) : packs.length === 0 ? (
        <div className={styles.empty}>
          No packs found. Click the button above to create the first pack.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>{t("admin.packs.table.name") || "Pack Name"}</th>
                <th>{t("admin.packs.table.products") || "Included Products"}</th>
                <th>{t("admin.packs.table.price") || "Price"}</th>
                <th>Profit</th>
                <th>Status</th>
                <th>{t("admin.packs.table.actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {packs.map((pack) => {
                const packId = pack._id || pack.id;
                const itemsCount = pack.products?.reduce((sum, p) => sum + (p.quantity || 1), 0) || 0;

                return (
                  <tr key={packId}>
                    <td className={styles.coverCell}>
                      <img
                        src={packImageUrl(pack.imageCover)}
                        alt={pack.name}
                        className={styles.coverImage}
                      />
                    </td>
                    <td>
                      <strong>{pack.name}</strong>
                      <span className={styles.packMeta}>
                        {pack.slug || packId}
                      </span>
                    </td>
                    <td>
                      <div className={styles.productsList}>
                        {pack.products && pack.products.length > 0 ? (
                          pack.products.map((p, idx) => (
                            <div key={p.productId || idx} className={styles.productBadge}>
                              {p.name || "Unknown Product"}{" "}
                              <span className={styles.productQty}>x{p.quantity || 1}</span>
                            </div>
                          ))
                        ) : (
                          <span className={styles.packMeta}>No products included</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.priceCol}>
                      <span className={styles.originalPrice}>
                        {pack.originalPrice != null ? `${pack.originalPrice.toFixed(2)} DA` : "—"}
                      </span>
                      <span className={styles.dealPrice}>
                        {pack.packPrice != null ? `${pack.packPrice.toFixed(2)} DA` : "—"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.profitText}>
                        {pack.profit != null ? `${pack.profit.toFixed(2)} DA` : "—"}
                      </span>
                    </td>
                    <td>
                      <span className={pack.active ? styles.statusActive : styles.statusInactive}>
                        {pack.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionGroup}>
                        <Link to={`/admin/packs/${packId}/edit`} className={styles.actionLink}>
                          <Button variant="secondary" size="sm" className={styles.actionButton}>
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          className={styles.actionButton}
                          onClick={() => handleDelete(packId)}
                          disabled={isDeleting}
                        >
                          Delete
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

export default AdminPacksPage;
