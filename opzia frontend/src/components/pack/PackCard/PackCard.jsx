import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@hooks/useCart';
import { useUI } from '@hooks/useUI';
import { packImageUrl } from '@utils/imageUrl';
import { formatPrice } from '@utils/formatPrice';
import styles from './PackCard.module.css';

function PackCard({ pack }) {
  const { addItem } = useCart();
  const { addToast } = useUI();

  if (!pack) return null;

  const { _id, name, description, price, finalPrice, imageCover } = pack;

  const hasDiscount  = finalPrice != null && finalPrice < price;
  const displayPrice = finalPrice ?? price;

  // Calculate savings percentage based on original product prices vs. final checkout price
  const savingsPercent = pack.savingsPercent || (
    pack.originalPrice && displayPrice
      ? Math.round(((pack.originalPrice - displayPrice) / pack.originalPrice) * 100)
      : 0
  );

  const handleAddToBag = () => {
    addItem({
      id:         _id,
      type:       'pack',
      name,
      price:      displayPrice,
      originalPrice: price,
      imageCover,
      quantity:   1,
      discounts: pack.discounts,
    });
    addToast(`${name} added to your bag.`, 'success');
  };

  return (
    <article className={styles.card}>
      {/* Image Link */}
      <Link to={`/packs/${_id}`} className={styles.imageLink}>
        <div className={styles.imageWrap}>
          <img
            src={packImageUrl(imageCover)}
            alt={name}
            className={styles.image}
            loading="lazy"
          />
          {savingsPercent > 0 && (
            <span className={styles.badge}>Save {savingsPercent}%</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className={styles.info}>
        <Link to={`/packs/${_id}`} className={styles.titleLink}>
          <h3 className={styles.name}>{name}</h3>
        </Link>
        {description && (
          <p className={styles.description}>{description}</p>
        )}

        <div className={styles.footer}>
          <div className={styles.pricing}>
            <span className={styles.price}>{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <span className={styles.originalPrice}>{formatPrice(price)}</span>
            )}
          </div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleAddToBag}
            aria-label={`Add ${name} to bag`}
          >
            ADD TO BAG
          </button>
        </div>
      </div>
    </article>
  );
}

export default PackCard;
