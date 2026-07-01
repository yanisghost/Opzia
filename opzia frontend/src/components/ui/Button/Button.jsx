// src/components/ui/Button/Button.jsx
// Reusable button with variants matching LUMINA design system.
// Variants: primary (dark fill), secondary (outline), ghost (text only), danger
// Sizes: sm, md (default), lg
// Supports loading state (shows spinner, disables click).

import React from 'react';
import Spinner from '../Spinner/Spinner';
import styles from './Button.module.css';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading && (
        <span className={styles.spinnerWrap}>
          <Spinner size="sm" color="inherit" />
        </span>
      )}
      <span className={isLoading ? styles.hiddenLabel : ''}>{children}</span>
    </button>
  );
}

export default Button;
