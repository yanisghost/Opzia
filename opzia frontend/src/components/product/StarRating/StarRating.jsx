// src/components/product/StarRating/StarRating.jsx
// Display-only star rating. Renders filled, half, and empty stars.
// Review SUBMISSION is not supported (no backend endpoint).
// Backend stores ratingsAverage (e.g. 4.3) and ratingsQuantity on each product.

import React from 'react';
import styles from './StarRating.module.css';

function StarRating({ rating = 0, count, size = 'md', className = '' }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled   = i + 1 <= Math.floor(rating);
    const partial  = !filled && i < rating;
    const fillPct  = partial ? Math.round((rating - Math.floor(rating)) * 100) : 0;
    return { filled, partial, fillPct };
  });

  return (
    <div
      className={[styles.wrapper, styles[size], className].filter(Boolean).join(' ')}
      aria-label={`Rating: ${rating} out of 5${count != null ? `, ${count} reviews` : ''}`}
      role="img"
    >
      <span className={styles.stars}>
        {stars.map((s, i) => (
          <StarIcon key={i} filled={s.filled} partial={s.partial} fillPct={s.fillPct} />
        ))}
      </span>
      {count != null && (
        <span className={styles.count}>({count})</span>
      )}
    </div>
  );
}

function StarIcon({ filled, partial, fillPct }) {
  const id = React.useId();
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.star}
      aria-hidden="true"
    >
      {partial && (
        <defs>
          <linearGradient id={id}>
            <stop offset={`${fillPct}%`} stopColor="var(--color-brand)" />
            <stop offset={`${fillPct}%`} stopColor="var(--color-border)" />
          </linearGradient>
        </defs>
      )}
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={
          filled ? 'var(--color-brand)'
          : partial ? `url(#${id})`
          : 'var(--color-border)'
        }
        stroke="none"
      />
    </svg>
  );
}

export default StarRating;
