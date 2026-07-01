// src/components/ui/Accordion/Accordion.jsx
// Collapsible section panel. Used on ProductDetailsPage for
// Ingredients and How To Use sections.
// Supports controlled (isOpen/onToggle) and uncontrolled (defaultOpen) modes.

import React, { useState } from 'react';
import styles from './Accordion.module.css';

function Accordion({ title, children, defaultOpen = false, isOpen: controlledOpen, onToggle }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalOpen((v) => !v);
    }
  };

  return (
    <div className={[styles.accordion, isOpen ? styles.open : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={styles.trigger}
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <span className={styles.triggerLabel}>{title}</span>
        <span className={styles.chevron} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Content — rendered always, visibility toggled via CSS for smooth animation */}
      <div
        className={styles.content}
        style={{ display: isOpen ? 'block' : 'none' }}
        role="region"
        aria-hidden={!isOpen}
      >
        <div className={styles.inner}>{children}</div>
      </div>
    </div>
  );
}

export default Accordion;
