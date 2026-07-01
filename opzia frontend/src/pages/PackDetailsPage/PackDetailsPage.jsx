// src/pages/PackDetailsPage/PackDetailsPage.jsx
// Single pack view. Allows users to view details, savings, 
// individual products inside the pack, and add the pack to the bag.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { packService } from '@services/packService';
import { useCart } from '@hooks/useCart';
import { useUI } from '@hooks/useUI';
import { useLanguage } from '@hooks/useLanguage';
import { formatPrice } from '@utils/formatPrice';
import { packImageUrl, productImageUrl } from '@utils/imageUrl';
import QuantitySelector from '@components/product/QuantitySelector/QuantitySelector';
import Button from '@components/ui/Button/Button';
import Breadcrumb from '@components/common/Breadcrumb/Breadcrumb';
import Spinner from '@components/ui/Spinner/Spinner';
import styles from './PackDetailsPage.module.css';

function PackDetailsPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useUI();

  const [pack, setPack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Load single pack details on mount / ID change
  useEffect(() => {
    const fetchPack = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await packService.getPack(id);
        if (!data) throw new Error('Pack not found');
        setPack(data);
      } catch (err) {
        setError(err.message || 'Failed to load pack details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPack();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (isLoading) {
    return (
      <div className={styles.stateWrap}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className={styles.stateWrap}>
        <p className={styles.errorText}>{error || 'Pack details could not be found.'}</p>
        <button className={styles.backLink} onClick={() => navigate('/')}>
          {t('product.backToShop') || 'Back to homepage'}
        </button>
      </div>
    );
  }

  const { name, description, packPrice, originalPrice, imageCover, products = [] } = pack;

  // Active price after discounts or default packPrice
  const displayPrice = pack.finalPrice ?? packPrice;
  const hasDiscount = displayPrice < packPrice;

  // Total savings compared to individual prices
  const savingsAmount = originalPrice - displayPrice;
  const savingsPercent = pack.savingsPercent || (
    originalPrice && displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0
  );

  const handleAddToCart = () => {
    addItem({
      id: pack._id,
      type: 'pack',
      name,
      price: displayPrice,
      originalPrice: packPrice,
      imageCover,
      quantity,
      discounts: pack.discounts,
    });
    addToast(`${name} added to your bag.`, 'success');
  };

  // Breadcrumb items list
  const breadcrumbLinks = [
    { label: t('navbar.home'), path: '/' },
    { label: t('navbar.shop'), path: '/shop' },
    { label: name, active: true }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={breadcrumbLinks} />

        <div className={styles.packLayout}>
          {/* Left Column: Image with savings badge */}
          <div className={styles.galleryCol}>
            <div className={styles.imageContainer}>
              <img
                src={packImageUrl(imageCover)}
                alt={name}
                className={styles.image}
              />
              {savingsPercent > 0 && (
                <div className={styles.badge}>
                  Save {savingsPercent}%
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pack Info & Products Breakdown */}
          <div className={styles.infoCol}>
            <div>
              <span className={styles.eyebrow}>CURATED BEAUTY RITUAL</span>
              <h1 className={styles.packName}>{name}</h1>
            </div>

            {/* Price display */}
            <div className={styles.pricingSection}>
              <div className={styles.pricing}>
                <span className={styles.price}>{formatPrice(displayPrice)}</span>
                {originalPrice > displayPrice && (
                  <span className={styles.originalPrice}>
                    Value: {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              {savingsAmount > 0 && (
                <p className={styles.savingsTag}>
                  🎉 You save {formatPrice(savingsAmount)} ({savingsPercent}%) with this bundle!
                </p>
              )}
            </div>

            {/* Description */}
            <div className={styles.descriptionBlock}>
              <p className={styles.description}>{description}</p>
            </div>

            {/* Pack contents products list */}
            <div className={styles.contentsSection}>
              <h3 className={styles.sectionTitle}>What's Included:</h3>
              <div className={styles.productsList}>
                {products.map((p, idx) => (
                  <div key={idx} className={styles.productRow}>
                    <img
                      src={productImageUrl(p.imageCover)}
                      alt={p.name}
                      className={styles.productThumbnail}
                    />
                    <div className={styles.productDetails}>
                      <Link to={`/shop/${p.productId}`} className={styles.productLink}>
                        {p.name}
                      </Link>
                      <span className={styles.productQty}>Quantity: {p.quantity}x</span>
                    </div>
                    <div className={styles.productPriceCol}>
                      <span className={styles.individualPrice}>
                        {formatPrice(p.price)} each
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart checkout selectors */}
            <div className={styles.actionBlock}>
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>{t('product.quantity') || 'Quantity'}</span>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={20}
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                className={styles.submitBtn}
              >
                ADD RITUAL TO BAG
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackDetailsPage;
