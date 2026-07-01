// src/components/ui/Select/Select.jsx
// Labeled select dropdown. Used for sort, wilaya, category filters.

import React, { useId } from 'react';
import styles from './Select.module.css';

function Select({
  label,
  value,
  onChange,
  options = [], // [{ value, label }] or ['string']
  placeholder = 'Select...',
  error,
  required = false,
  disabled = false,
  name,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const id = rest.id || generatedId;

  return (
    <div className={[styles.field, error ? styles.hasError : '', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={styles.selectWrap}>
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={styles.select}
          aria-invalid={!!error}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => {
            const val   = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>{label}</option>
            );
          })}
        </select>
        {/* Custom chevron */}
        <span className={styles.chevron} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  );
}

export default Select;
