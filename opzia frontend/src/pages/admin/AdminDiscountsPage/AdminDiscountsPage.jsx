// src/pages/admin/AdminDiscountsPage/AdminDiscountsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useUI } from '@hooks/useUI';
import { useLanguage } from '@hooks/useLanguage';
import { productService } from '@services/productService';
import { packService } from '@services/packService';
import { discountService } from '@services/discountService';
import { couponService } from '@services/couponService';
import { statisticsService } from '@services/statisticsService';
import { productImageUrl, packImageUrl } from '@utils/imageUrl';
import { formatPrice } from '@utils/formatPrice';

import Button from '@components/ui/Button/Button';
import Input from '@components/ui/Input/Input';
import Select from '@components/ui/Select/Select';
import Checkbox from '@components/ui/Checkbox/Checkbox';
import Modal from '@components/ui/Modal/Modal';
import Badge from '@components/ui/Badge/Badge';
import Spinner from '@components/ui/Spinner/Spinner';
import KPICard from '@components/admin/KPICard/KPICard';
import DiscountImpactCard from '@components/admin/DiscountImpactCard/DiscountImpactCard';

import styles from './AdminDiscountsPage.module.css';

// Helper to format dates for datetime-local inputs
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

// Helper to check status of a discount
const getDiscountStatus = (disc) => {
  if (!disc.active) return 'inactive';
  const now = new Date();
  if (disc.discountStart && new Date(disc.discountStart) > now) return 'scheduled';
  if (disc.discountEnd && new Date(disc.discountEnd) < now) return 'expired';
  return 'active';
};

const getCouponStatus = (coupon) => {
  if (!coupon.active) return 'inactive';
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) return 'scheduled';
  if (coupon.endDate && new Date(coupon.endDate) < now) return 'expired';
  if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) return 'depleted';
  return 'active';
};

function AdminDiscountsPage() {
  const { user } = useAuth();
  const { addToast } = useUI();
  const { t, currentLanguage } = useLanguage();

  if (user?.role !== 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Active Tab State
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'coupons'

  // Core Data State
  const [products, setProducts] = useState([]);
  const [packs, setPacks] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [discountImpact, setDiscountImpact] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Item Discount Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // Item Discount Form State
  const [formTargetType, setFormTargetType] = useState('product'); // 'product' | 'pack'
  const [formTargetId, setFormTargetId] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formRequiresCode, setFormRequiresCode] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formDiscountStart, setFormDiscountStart] = useState('');
  const [formDiscountEnd, setFormDiscountEnd] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Order Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponModalMode, setCouponModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Order Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState('percent'); // 'percent' | 'fixed'
  const [couponValue, setCouponValue] = useState('');
  const [couponMinOrderAmount, setCouponMinOrderAmount] = useState('');
  const [couponStartDate, setCouponStartDate] = useState('');
  const [couponEndDate, setCouponEndDate] = useState('');
  const [couponMaxUses, setCouponMaxUses] = useState('');
  const [couponActive, setCouponActive] = useState(true);
  const [couponIsSubmitting, setCouponIsSubmitting] = useState(false);
  const [couponFormError, setCouponFormError] = useState(null);

  // Load everything
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsData, packsData, couponsData, impactData] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        packService.getPacks({ limit: 100 }),
        couponService.getCoupons().catch(() => []),
        statisticsService.getDiscountImpact().catch(() => []), // gracefully handle fail
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setPacks(Array.isArray(packsData) ? packsData : []);
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
      setDiscountImpact(Array.isArray(impactData) ? impactData : []);
    } catch (err) {
      setError(err.message || 'Unable to load discounts data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregate discounts from both Products and Packs
  const allDiscounts = useMemo(() => {
    const list = [];

    products.forEach((prod) => {
      if (Array.isArray(prod.discounts)) {
        prod.discounts.forEach((disc) => {
          list.push({
            id: disc._id || disc.id,
            targetType: 'product',
            targetId: prod._id || prod.id,
            targetName: prod.name,
            targetImage: prod.imageCover,
            regularPrice: prod.price,
            code: disc.code,
            discountPrice: disc.discountPrice,
            discountStart: disc.discountStart,
            discountEnd: disc.discountEnd,
            active: disc.active,
            requiresCode: disc.requiresCode,
          });
        });
      }
    });

    packs.forEach((pk) => {
      if (Array.isArray(pk.discounts)) {
        pk.discounts.forEach((disc) => {
          list.push({
            id: disc._id || disc.id,
            targetType: 'pack',
            targetId: pk._id || pk.id,
            targetName: pk.name,
            targetImage: pk.imageCover,
            regularPrice: pk.packPrice,
            code: disc.code,
            discountPrice: disc.discountPrice,
            discountStart: disc.discountStart,
            discountEnd: disc.discountEnd,
            active: disc.active,
            requiresCode: disc.requiresCode,
          });
        });
      }
    });

    // Sort by active status, then start date descending
    return list.sort((a, b) => {
      const statusA = getDiscountStatus(a);
      const statusB = getDiscountStatus(b);
      if (statusA === 'active' && statusB !== 'active') return -1;
      if (statusA !== 'active' && statusB === 'active') return 1;
      return new Date(b.discountStart || 0) - new Date(a.discountStart || 0);
    });
  }, [products, packs]);

  // Statistics summaries
  const stats = useMemo(() => {
    let activeCouponsCount = 0;
    let activeAutoCount = 0;

    allDiscounts.forEach((disc) => {
      const status = getDiscountStatus(disc);
      if (status === 'active') {
        if (disc.requiresCode) {
          activeCouponsCount++;
        } else {
          activeAutoCount++;
        }
      }
    });

    // Add active order-wide coupons
    coupons.forEach((c) => {
      if (getCouponStatus(c) === 'active') {
        activeCouponsCount++;
      }
    });

    const totalSavings = discountImpact.reduce((sum, d) => sum + (d.totalDiscountGiven || 0), 0);

    return {
      activeCoupons: activeCouponsCount,
      activeAuto: activeAutoCount,
      totalDiscounts: activeCouponsCount + activeAutoCount,
      totalSavings,
    };
  }, [allDiscounts, coupons, discountImpact]);

  // Open modal for Create Item Discount
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedDiscount(null);
    setFormTargetType('product');
    setFormTargetId('');
    setFormDiscountPrice('');
    setFormRequiresCode(false);
    setFormCode('');
    setFormDiscountStart('');
    setFormDiscountEnd('');
    setFormActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit Item Discount
  const handleOpenEdit = (disc) => {
    setModalMode('edit');
    setSelectedDiscount(disc);
    setFormTargetType(disc.targetType);
    setFormTargetId(disc.targetId);
    setFormDiscountPrice(disc.discountPrice || '');
    setFormRequiresCode(disc.requiresCode !== false);
    setFormCode(disc.code || '');
    setFormDiscountStart(formatDateForInput(disc.discountStart));
    setFormDiscountEnd(formatDateForInput(disc.discountEnd));
    setFormActive(disc.active !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Delete Discount handler
  const handleDelete = async (disc) => {
    const confirmMsg = t('admin.discounts.form.errors.deleteConfirm', {
      type: disc.targetType === 'product' ? t('admin.discounts.table.product') : t('admin.discounts.table.pack'),
      name: disc.targetName
    });
    if (!window.confirm(confirmMsg)) return;

    try {
      if (disc.targetType === 'product') {
        await discountService.deleteProductDiscount(disc.targetId, disc.id);
      } else {
        await discountService.deletePackDiscount(disc.targetId, disc.id);
      }
      addToast(t('admin.discounts.form.errors.successDelete'), 'success');
      loadData();
    } catch (err) {
      addToast(err.message || t('admin.discounts.form.errors.errorDelete'), 'error');
    }
  };

  // Submit Handler for Item Discount
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formTargetId) {
      setFormError(t('admin.discounts.form.errors.selectTarget'));
      return;
    }

    const priceNum = parseFloat(formDiscountPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError(t('admin.discounts.form.errors.invalidPrice'));
      return;
    }

    // Validation against regular price
    let selectedItem = null;
    if (formTargetType === 'product') {
      selectedItem = products.find((p) => p._id === formTargetId || p.id === formTargetId);
    } else {
      selectedItem = packs.find((p) => p._id === formTargetId || p.id === formTargetId);
    }

    const maxPrice = formTargetType === 'product' ? selectedItem?.price : selectedItem?.packPrice;
    if (maxPrice && priceNum >= maxPrice) {
      setFormError(t('admin.discounts.form.errors.priceLess', { price: formatPrice(maxPrice) }));
      return;
    }

    if (formRequiresCode && !formCode.trim()) {
      setFormError(t('admin.discounts.form.errors.codeRequired'));
      return;
    }

    if (formDiscountStart && formDiscountEnd && new Date(formDiscountStart) >= new Date(formDiscountEnd)) {
      setFormError(t('admin.discounts.form.errors.dateOrder'));
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      discountPrice: priceNum,
      requiresCode: formRequiresCode,
      code: formRequiresCode ? formCode.trim() : null,
      discountStart: formDiscountStart || null,
      discountEnd: formDiscountEnd || null,
      active: formActive,
    };

    try {
      if (modalMode === 'create') {
        if (formTargetType === 'product') {
          await discountService.applyProductDiscount(formTargetId, payload);
        } else {
          await discountService.applyPackDiscount(formTargetId, payload);
        }
        addToast(t('admin.discounts.form.errors.successCreate'), 'success');
      } else {
        if (formTargetType === 'product') {
          await discountService.updateProductDiscount(formTargetId, selectedDiscount.id, payload);
        } else {
          await discountService.updatePackDiscount(formTargetId, selectedDiscount.id, payload);
        }
        addToast(t('admin.discounts.form.errors.successUpdate'), 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || t('admin.discounts.form.errors.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================== ORDER COUPONS HANDLERS ==================

  const handleOpenCreateCoupon = () => {
    setCouponModalMode('create');
    setSelectedCoupon(null);
    setCouponCode('');
    setCouponDiscountType('percent');
    setCouponValue('');
    setCouponMinOrderAmount('');
    setCouponStartDate('');
    setCouponEndDate('');
    setCouponMaxUses('');
    setCouponActive(true);
    setCouponFormError(null);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c) => {
    setCouponModalMode('edit');
    setSelectedCoupon(c);
    setCouponCode(c.code);
    setCouponDiscountType(c.discountType || 'percent');
    setCouponValue(c.value || '');
    setCouponMinOrderAmount(c.minOrderAmount || '');
    setCouponStartDate(formatDateForInput(c.startDate));
    setCouponEndDate(formatDateForInput(c.endDate));
    setCouponMaxUses(c.maxUses || '');
    setCouponActive(c.active !== false);
    setCouponFormError(null);
    setIsCouponModalOpen(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this order coupon?')) return;

    try {
      await couponService.deleteCoupon(couponId);
      addToast('Order coupon deleted successfully.', 'success');
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to delete coupon.', 'error');
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setCouponFormError('Coupon code is required.');
      return;
    }
    const valNum = parseFloat(couponValue);
    if (isNaN(valNum) || valNum <= 0) {
      setCouponFormError('Please enter a valid discount value.');
      return;
    }
    if (couponDiscountType === 'percent' && valNum > 100) {
      setCouponFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    setCouponIsSubmitting(true);
    setCouponFormError(null);

    const payload = {
      code: couponCode.trim().toUpperCase(),
      discountType: couponDiscountType,
      value: valNum,
      minOrderAmount: Number(couponMinOrderAmount) || 0,
      startDate: couponStartDate || new Date().toISOString(),
      endDate: couponEndDate || null,
      maxUses: couponMaxUses ? Number(couponMaxUses) : null,
      active: couponActive,
    };

    try {
      if (couponModalMode === 'create') {
        await couponService.createCoupon(payload);
        addToast('Order coupon created successfully.', 'success');
      } else {
        await couponService.updateCoupon(selectedCoupon._id || selectedCoupon.id, payload);
        addToast('Order coupon updated successfully.', 'success');
      }
      setIsCouponModalOpen(false);
      loadData();
    } catch (err) {
      setCouponFormError(err.message || 'Failed to save coupon.');
    } finally {
      setCouponIsSubmitting(false);
    }
  };

  // Dropdown list options for items
  const targetOptions = useMemo(() => {
    if (formTargetType === 'product') {
      return products.map((p) => ({
        value: p._id || p.id,
        label: `${p.name} (${formatPrice(p.price)})`,
      }));
    } else {
      return packs.map((p) => ({
        value: p._id || p.id,
        label: `${p.name} (${formatPrice(p.packPrice)})`,
      }));
    }
  }, [formTargetType, products, packs]);

  return (
    <div className={styles.page}>
      {/* ── Page Header ── */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{t('admin.discounts.title')}</h1>
          <p className={styles.subtitle}>
            {t('admin.discounts.subtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={activeTab === 'items' ? handleOpenCreate : handleOpenCreateCoupon}>
          {activeTab === 'items' ? t('admin.discounts.newDiscountBtn') : 'Add Coupon'}
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* ── Statistics Summary Cards ── */}
      {!isLoading && (
        <div className={styles.statsSection}>
          <div className={styles.kpiGrid}>
            <KPICard label={t('admin.discounts.kpis.activeDiscounts')} value={stats.totalDiscounts} />
            <KPICard label={t('admin.discounts.kpis.activeCoupons')} value={stats.activeCoupons} />
            <KPICard label={t('admin.discounts.kpis.autoPromotions')} value={stats.activeAuto} />
            <KPICard label={t('admin.discounts.kpis.totalSavings')} value={formatPrice(stats.totalSavings)} />
          </div>

          <div className={styles.impactCardContainer}>
            <div className={styles.impactTitle}>{t('admin.discounts.impactTitle')}</div>
            <DiscountImpactCard data={discountImpact} />
          </div>
        </div>
      )}

      {/* ── Tab Switcher ── */}
      <div className={styles.tabsContainer}>
        <button
          className={[styles.tabButton, activeTab === 'items' ? styles.activeTab : ''].join(' ')}
          onClick={() => setActiveTab('items')}
        >
          {t('admin.discounts.tabs.items') || 'Product & Pack Discounts'}
        </button>
        <button
          className={[styles.tabButton, activeTab === 'coupons' ? styles.activeTab : ''].join(' ')}
          onClick={() => setActiveTab('coupons')}
        >
          {t('admin.discounts.tabs.coupons') || 'Order Coupons'}
        </button>
      </div>

      {/* ── Main Listing ── */}
      {isLoading ? (
        <div className={styles.loadingWrap}>
          <Spinner size="lg" />
          <p>{t('admin.discounts.loading')}</p>
        </div>
      ) : activeTab === 'items' ? (
        allDiscounts.length === 0 ? (
          <div className={styles.empty}>
            {t('admin.discounts.empty')}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('admin.discounts.table.item')}</th>
                  <th>{t('admin.discounts.table.type')}</th>
                  <th>{t('admin.discounts.table.mechanism')}</th>
                  <th>{t('admin.discounts.table.priceDetails')}</th>
                  <th>{t('admin.discounts.table.code')}</th>
                  <th>{t('admin.discounts.table.duration')}</th>
                  <th>{t('admin.discounts.table.status')}</th>
                  <th className={styles.textCenter}>{t('admin.discounts.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {allDiscounts.map((disc) => {
                  const status = getDiscountStatus(disc);
                  const statusVariant =
                    status === 'active'
                      ? 'success'
                      : status === 'scheduled'
                      ? 'info'
                      : status === 'expired'
                      ? 'neutral'
                      : 'neutral';

                  const savingAmount = disc.regularPrice - disc.discountPrice;
                  const savingPct = Math.round((savingAmount / disc.regularPrice) * 100);

                  const itemImg = disc.targetType === 'product' ? productImageUrl(disc.targetImage) : packImageUrl(disc.targetImage);
                  const editLink = disc.targetType === 'product' ? `/admin/products/${disc.targetId}/edit` : `/admin/packs/${disc.targetId}/edit`;
                  const localeCode = currentLanguage === 'ar' ? 'ar-EG' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US';

                  return (
                    <tr key={disc.id}>
                      <td className={styles.itemCell}>
                        <img src={itemImg} alt={disc.targetName} className={styles.itemImage} />
                        <div className={styles.itemDetails}>
                          <span className={styles.itemName}>{disc.targetName}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant="neutral" className={styles.typeBadge}>
                          {disc.targetType === 'product' ? t('admin.discounts.table.product') : t('admin.discounts.table.pack')}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={disc.requiresCode ? 'info' : 'success'}>
                          {disc.requiresCode ? t('admin.discounts.table.couponCode') : t('admin.discounts.table.autoApplied')}
                        </Badge>
                      </td>
                      <td>
                        <div className={styles.priceRow}>
                          <span className={styles.originalPrice}>{formatPrice(disc.regularPrice)}</span>
                          <span className={styles.arrowIcon}>→</span>
                          <strong className={styles.discountPrice}>{formatPrice(disc.discountPrice)}</strong>
                        </div>
                        <div className={styles.savingsText}>
                          {t('admin.discounts.table.saveAmount', { amount: formatPrice(savingAmount), pct: savingPct })}
                        </div>
                      </td>
                      <td>
                        {disc.requiresCode ? (
                          <code className={styles.codeWrap}>{disc.code || 'N/A'}</code>
                        ) : (
                          <span className={styles.mutedText}>—</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.dateRange}>
                          <div>
                            <span className={styles.dateLabel}>{t('admin.discounts.table.start')}</span>{' '}
                            {disc.discountStart ? new Date(disc.discountStart).toLocaleDateString(localeCode) : t('admin.discounts.table.immediate')}
                          </div>
                          <div>
                            <span className={styles.dateLabel}>{t('admin.discounts.table.end')}</span>{' '}
                            {disc.discountEnd ? new Date(disc.discountEnd).toLocaleDateString(localeCode) : t('admin.discounts.table.never')}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant={statusVariant}>{t(`admin.discounts.status.${status}`)}</Badge>
                      </td>
                      <td className={styles.textCenter}>
                        <div className={styles.actionGroup}>
                          <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(disc)} className={styles.actionButton}>
                            {t('admin.discounts.table.edit')}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(disc)} className={styles.actionButton}>
                            {t('admin.discounts.table.delete')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : coupons.length === 0 ? (
        <div className={styles.empty}>
          No order coupons found. Click "Add Coupon" above to create one.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Type</th>
                <th>Value</th>
                <th>Min Spend</th>
                <th>Duration / Dates</th>
                <th>Uses / Limit</th>
                <th>Status</th>
                <th className={styles.textCenter}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                const statusVariant =
                  status === 'active'
                    ? 'success'
                    : status === 'scheduled'
                    ? 'info'
                    : 'neutral';

                return (
                  <tr key={coupon._id || coupon.id}>
                    <td>
                      <code className={styles.codeWrap}>{coupon.code}</code>
                    </td>
                    <td>
                      <Badge variant="neutral">
                        {coupon.discountType === 'percent' ? 'Percentage (%)' : 'Fixed Amount'}
                      </Badge>
                    </td>
                    <td>
                      <strong>
                        {coupon.discountType === 'percent' ? `${coupon.value}%` : `${coupon.value} USD`}
                      </strong>
                    </td>
                    <td>
                      {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : 'No Minimum'}
                    </td>
                    <td>
                      <div className={styles.dateRange}>
                        <div>
                          <span className={styles.dateLabel}>Start:</span>{' '}
                          {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'Immediate'}
                        </div>
                        <div>
                          <span className={styles.dateLabel}>End:</span>{' '}
                          {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </td>
                    <td>
                      {coupon.usesCount} / {coupon.maxUses || '∞'}
                    </td>
                    <td>
                      <Badge variant={statusVariant}>{status.toUpperCase()}</Badge>
                    </td>
                    <td className={styles.textCenter}>
                      <div className={styles.actionGroup} style={{ justifyContent: 'center' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEditCoupon(coupon)} className={styles.actionButton}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteCoupon(coupon._id || coupon.id)} className={styles.actionButton}>
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

      {/* ── Item Discount Modal ── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? t('admin.discounts.form.titleCreate') : t('admin.discounts.form.titleEdit')}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {formError && <div className={styles.formError}>{formError}</div>}

          {/* Targeted type (Product or Pack) */}
          {modalMode === 'create' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('admin.discounts.form.targetLabel')}</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="targetType"
                    value="product"
                    checked={formTargetType === 'product'}
                    onChange={() => {
                      setFormTargetType('product');
                      setFormTargetId('');
                    }}
                    disabled={isSubmitting}
                  />
                  <span>{t('admin.discounts.table.product')}</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="targetType"
                    value="pack"
                    checked={formTargetType === 'pack'}
                    onChange={() => {
                      setFormTargetType('pack');
                      setFormTargetId('');
                    }}
                    disabled={isSubmitting}
                  />
                  <span>{t('admin.discounts.table.pack')}</span>
                </label>
              </div>
            </div>
          )}

          {/* Edit mode target readonly info */}
          {modalMode === 'edit' && (
            <div className={styles.readonlyTarget}>
              <span className={styles.readonlyLabel}>{t('admin.discounts.form.readonlyTarget')}</span>
              <strong className={styles.readonlyValue}>
                {selectedDiscount?.targetName} ({selectedDiscount?.targetType === 'product' ? t('admin.discounts.table.product') : t('admin.discounts.table.pack')})
              </strong>
            </div>
          )}

          {/* Select dropdown for targeted item */}
          {modalMode === 'create' && (
            <Select
              label={formTargetType === 'product' ? t('admin.discounts.form.selectProductLabel') : t('admin.discounts.form.selectPackLabel')}
              value={formTargetId}
              onChange={(e) => setFormTargetId(e.target.value)}
              options={targetOptions}
              placeholder={formTargetType === 'product' ? t('admin.discounts.form.selectProductPlaceholder') : t('admin.discounts.form.selectPackPlaceholder')}
              disabled={isSubmitting}
              required
            />
          )}

          {/* Discount Price */}
          <Input
            label={t('admin.discounts.form.priceLabel')}
            type="number"
            step="0.01"
            placeholder={t('admin.discounts.form.pricePlaceholder')}
            value={formDiscountPrice}
            onChange={(e) => setFormDiscountPrice(e.target.value)}
            disabled={isSubmitting}
            required
            hint={t('admin.discounts.form.priceHint')}
          />

          {/* Requires Code toggle */}
          <div className={styles.checkboxGroup}>
            <Checkbox
              label={t('admin.discounts.form.requiresCodeLabel')}
              checked={formRequiresCode}
              onChange={(e) => setFormRequiresCode(e.target.checked)}
              disabled={isSubmitting}
            />
          </div>

          {/* Code Input (Visible only if checked) */}
          {formRequiresCode && (
            <Input
              label={t('admin.discounts.form.codeLabel')}
              placeholder={t('admin.discounts.form.codePlaceholder')}
              value={formCode}
              onChange={(e) => setFormCode(e.target.value.toUpperCase())}
              disabled={isSubmitting}
              required
            />
          )}

          {/* Dates */}
          <div className={styles.dateRow}>
            <Input
              label={t('admin.discounts.form.startDateLabel')}
              type="datetime-local"
              value={formDiscountStart}
              onChange={(e) => setFormDiscountStart(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              label={t('admin.discounts.form.endDateLabel')}
              type="datetime-local"
              value={formDiscountEnd}
              onChange={(e) => setFormDiscountEnd(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Active Status checkbox */}
          <div className={styles.checkboxGroup}>
            <Checkbox
              label={t('admin.discounts.form.activeLabel')}
              checked={formActive}
              onChange={(e) => setFormActive(e.target.checked)}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('admin.discounts.form.cancelBtn')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {modalMode === 'create' ? t('admin.discounts.form.submitCreate') : t('admin.discounts.form.submitEdit')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Order Coupon Modal ── */}
      <Modal isOpen={isCouponModalOpen} onClose={() => setIsCouponModalOpen(false)} title={couponModalMode === 'create' ? 'Create Order Coupon' : 'Edit Order Coupon'}>
        <form onSubmit={handleCouponSubmit} className={styles.form}>
          {couponFormError && <div className={styles.formError}>{couponFormError}</div>}

          {/* Coupon Code */}
          <Input
            label="Coupon Code"
            placeholder="e.g. SAVE20"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            disabled={couponIsSubmitting}
            required
            hint="The exact code customers will enter at checkout (e.g. WELCOME10)."
          />

          {/* Discount Type */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Discount Type</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="couponDiscountType"
                  value="percent"
                  checked={couponDiscountType === 'percent'}
                  onChange={() => setCouponDiscountType('percent')}
                  disabled={couponIsSubmitting}
                />
                <span>Percentage (%)</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="couponDiscountType"
                  value="fixed"
                  checked={couponDiscountType === 'fixed'}
                  onChange={() => setCouponDiscountType('fixed')}
                  disabled={couponIsSubmitting}
                />
                <span>Fixed Amount (USD)</span>
              </label>
            </div>
          </div>

          {/* Discount Value */}
          <Input
            label="Discount Value"
            type="number"
            step="0.01"
            placeholder={couponDiscountType === 'percent' ? 'e.g. 10 for 10%' : 'e.g. 5.00 for $5.00'}
            value={couponValue}
            onChange={(e) => setCouponValue(e.target.value)}
            disabled={couponIsSubmitting}
            required
          />

          {/* Min Spend */}
          <Input
            label="Minimum Spend ($)"
            type="number"
            step="0.01"
            placeholder="e.g. 50.00 (optional)"
            value={couponMinOrderAmount}
            onChange={(e) => setCouponMinOrderAmount(e.target.value)}
            disabled={couponIsSubmitting}
            hint="The minimum order subtotal required to apply this coupon."
          />

          {/* Max Uses */}
          <Input
            label="Maximum Uses"
            type="number"
            placeholder="e.g. 100 (optional)"
            value={couponMaxUses}
            onChange={(e) => setCouponMaxUses(e.target.value)}
            disabled={couponIsSubmitting}
            hint="Total number of times this coupon can be used across all orders."
          />

          {/* Dates */}
          <div className={styles.dateRow}>
            <Input
              label="Start Date"
              type="datetime-local"
              value={couponStartDate}
              onChange={(e) => setCouponStartDate(e.target.value)}
              disabled={couponIsSubmitting}
            />
            <Input
              label="End Date"
              type="datetime-local"
              value={couponEndDate}
              onChange={(e) => setCouponEndDate(e.target.value)}
              disabled={couponIsSubmitting}
            />
          </div>

          {/* Active Status checkbox */}
          <div className={styles.checkboxGroup}>
            <Checkbox
              label="Active (Visible and usable)"
              checked={couponActive}
              onChange={(e) => setCouponActive(e.target.checked)}
              disabled={couponIsSubmitting}
            />
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => setIsCouponModalOpen(false)}
              disabled={couponIsSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={couponIsSubmitting}>
              {couponModalMode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminDiscountsPage;
