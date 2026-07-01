// src/pages/account/ForgotPasswordPage/ForgotPasswordPage.jsx
// Backend: POST /api/v1/users/forgotPassword
// Sends a reset link to the user's email.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@hooks/useLanguage';
import { authService } from '@services/authService';
import Input from '@components/ui/Input/Input';
import Button from '@components/ui/Button/Button';
import styles from './ForgotPasswordPage.module.css';

function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('forgot.errorEmailInvalid'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      // Show success regardless to prevent email enumeration
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo} aria-label="Opzia home">
          <img src="/opzia logo white.png?v=2" alt="Opzia Logo" className={styles.logoImg} />
        </Link>
        <h1 className={styles.heading}>{t('forgot.heading')}</h1>
        <p className={styles.hint}>
          {t('forgot.hint')}
        </p>

        {submitted ? (
          <div className={styles.successBox}>
            <p className={styles.successTitle}>{t('forgot.checkInbox')}</p>
            <p className={styles.successBody}>
              {t('forgot.checkInboxDetail', { email })}
            </p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label={t('forgot.errorEmailInvalid') ? t('login.emailLabel') : "Email Address"}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              error={error}
              required
              autoComplete="email"
              disabled={isLoading}
            />
            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              {t('forgot.submit')}
            </Button>
          </form>
        )}

        <Link to="/account/login" className={styles.backLink}>{t('forgot.backLogin')}</Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
