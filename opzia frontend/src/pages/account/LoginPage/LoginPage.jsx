// src/pages/account/LoginPage/LoginPage.jsx
// Login page. Handles unverified credentials redirection to verification step.

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { authService } from '@services/authService';
import Input from '@components/ui/Input/Input';
import Button from '@components/ui/Button/Button';
import styles from './LoginPage.module.css';

function LoginPage() {
  const { t } = useLanguage();
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || '/';

  // Login Form State
  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading]     = useState(false);

  // Verification Screen State (in case unverified logs in)
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => { const n={...p}; delete n[field]; return n; });
    setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = t('login.errors.emailRequired');
    if (!form.password.trim()) e.password = t('login.errors.passwordRequired');
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    setServerError('');
    try {
      const user = await login(form.email.trim(), form.password);
      const dest = user && ['admin','manager'].includes(user.role) ? '/admin/dashboard' : from;
      navigate(dest, { replace: true });
    } catch (err) {
      // Catch unverified email block
      const responseData = err.response?.data;
      if (responseData && responseData.error === 'unverified') {
        setVerifyEmail(responseData.email || form.email.trim());
        setIsVerifying(true);
      } else {
        setServerError(err.message || t('login.errors.invalid'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setVerifyError('Please enter a 6-digit confirmation code.');
      return;
    }
    setIsLoading(true);
    setVerifyError('');
    setResendSuccess('');
    try {
      const res = await authService.verifyEmail(verifyEmail, verificationCode.trim());
      const newToken = res.token ?? res.accessToken;
      if (newToken) {
        localStorage.setItem('lumina_token', newToken);
      }
      // Reload page to rehydrate context with the new token
      window.location.href = '/';
    } catch (err) {
      setVerifyError(err.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setVerifyError('');
    setResendSuccess('');
    try {
      await authService.resendVerificationCode(verifyEmail);
      setResendSuccess('Verification code resent successfully.');
    } catch (err) {
      setVerifyError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <img src="/opzia logo white.png?v=2" alt="Opzia Logo" className={styles.logoImg} />
          </div>
          <h1 className={styles.heading}>Verify Your Email</h1>
          <p className={styles.sub}>
            Your email address has not been verified yet. We've sent a 6-digit verification code to <strong>{verifyEmail}</strong>. Please enter the code below to activate your account.
          </p>

          <form className={styles.form} onSubmit={handleVerifyCode} noValidate>
            <Input
              label="Verification Code"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              required
              disabled={isLoading}
            />

            {verifyError && <p className={styles.serverError} role="alert">{verifyError}</p>}
            {resendSuccess && <p className={styles.resendSuccess} role="alert">{resendSuccess}</p>}

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              Confirm Code
            </Button>
          </form>

          <div className={styles.resendContainer}>
            <button
              type="button"
              className={styles.resendBtn}
              onClick={handleResendCode}
              disabled={isLoading}
            >
              Resend Verification Code
            </button>
          </div>

          <p className={styles.switchText}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setIsVerifying(false)}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo} aria-label="Opzia home">
          <img src="/opzia logo white.png?v=2" alt="Opzia Logo" className={styles.logoImg} />
        </Link>
        <h1 className={styles.heading}>{t('login.heading')}</h1>
        <p className={styles.sub}>{t('login.sub')}</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input label={t('login.emailLabel')} type="email" value={form.email} onChange={setField('email')} error={errors.email} required autoComplete="email" disabled={isLoading} />
          <Input label={t('login.passwordLabel')} type="password" value={form.password} onChange={setField('password')} error={errors.password} required autoComplete="current-password" disabled={isLoading} />

          <div className={styles.forgotRow}>
            <Link to="/account/forgot-password" className={styles.forgotLink}>{t('login.forgotPassword')}</Link>
          </div>

          {serverError && <p className={styles.serverError} role="alert">{serverError}</p>}

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            {t('login.submit')}
          </Button>
        </form>

        <p className={styles.switchText}>
          {t('login.newToOpzia')}{' '}
          <Link to="/account/signup" className={styles.switchLink}>{t('login.createAccount')}</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
