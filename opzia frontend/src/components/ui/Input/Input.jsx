// src/components/ui/Input/Input.jsx
// Labeled text input with error state. Used in forms throughout the app.

import React, { useId } from 'react';
import styles from './Input.module.css';

function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required = false,
  disabled = false,
  name,
  autoComplete,
  className = '',
  inputClassName = '',
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
      <input
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={[styles.input, inputClassName].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">{error}</span>
      )}
      {hint && !error && (
        <span id={`${id}-hint`} className={styles.hint}>{hint}</span>
      )}
    </div>
  );
}

export default Input;
