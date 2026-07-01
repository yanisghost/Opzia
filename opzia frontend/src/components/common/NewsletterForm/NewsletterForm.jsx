// src/components/common/NewsletterForm/NewsletterForm.jsx
// Email capture form used in the Footer area on the Home page and
// the "Join the Inner Circle" section.
//
// ⚠️ Architecture note (from §10, Risk #6):
// No backend newsletter endpoint exists. This component is UI-only.
// For MVP, it simulates a success state. Wire to a third-party service
// (Mailchimp, Brevo, EmailJS) when integration is approved.
//
// Variants:
//   'inline'  — horizontal row (Home page hero / footer)
//   'stacked' — vertical (sidebar, narrow contexts)

import React, { useState } from 'react';
import styles from './NewsletterForm.module.css';

function NewsletterForm({ variant = 'inline', placeholder = 'Your email address', buttonLabel = 'Subscribe' }) {
  const [email, setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState('');

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    // TODO: Replace with actual service call (Brevo / Mailchimp API)
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className={styles.successMsg}>
        Thank you for joining the Inner Circle.
      </p>
    );
  }

  return (
    <form
      className={[styles.form, styles[variant]].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
      noValidate
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        aria-label="Email address for newsletter"
        required
      />
      <button type="submit" className={styles.btn} aria-label={buttonLabel}>
        {variant === 'inline' ? (
          // Arrow button for inline variant
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        ) : (
          buttonLabel
        )}
      </button>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </form>
  );
}

export default NewsletterForm;
