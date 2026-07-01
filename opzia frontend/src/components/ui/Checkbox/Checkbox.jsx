// src/components/ui/Checkbox/Checkbox.jsx
// Styled checkbox with label. Used in checkout (email opt-in) and filters.

import React, { useId } from 'react';
import styles from './Checkbox.module.css';

function Checkbox({ label, checked, onChange, name, disabled = false, className = '' }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={[styles.wrapper, disabled ? styles.disabled : '', className].filter(Boolean).join(' ')}
    >
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.box} aria-hidden="true" />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}

export default Checkbox;
