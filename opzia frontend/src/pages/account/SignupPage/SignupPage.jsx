// src/pages/account/SignupPage/SignupPage.jsx
// Registration page. Includes Algerian address fields on signup
// and triggers email confirmation code verification.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { authService } from '@services/authService';
import Input from '@components/ui/Input/Input';
import Button from '@components/ui/Button/Button';
import AddressFields from '@components/checkout/AddressFields/AddressFields';
import styles from './SignupPage.module.css';

const INITIAL = { name: '', email: '', password: '', passwordConfirm: '', phoneNumber: '', wilaya: '', baladia: '', homeAddress: '' };

function SignupPage() {
  const { t } = useLanguage();
  const { signup }  = useAuth();
  const navigate    = useNavigate();
  
  // Registration Form State
  const [form, setForm]           = useState(INITIAL);
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading]     = useState(false);

  // Email Verification State
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

  const handleAddressChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const n={...p}; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name          = t('signup.errors.nameRequired');
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('signup.errors.emailRequired');
    if (form.password.length < 8)   e.password      = t('signup.errors.passwordLength');
    if (form.password !== form.passwordConfirm) e.passwordConfirm = t('signup.errors.passwordsMatch');
    if (!form.phoneNumber.trim() || !/^0[5-7]\d{8}$/.test(form.phoneNumber.trim())) e.phoneNumber = t('signup.errors.phoneInvalid');
    if (!form.wilaya)               e.wilaya        = t('signup.errors.wilayaRequired');
    if (!form.baladia.trim())       e.baladia       = t('signup.errors.baladiaRequired');
    if (!form.homeAddress.trim())   e.homeAddress   = t('signup.errors.addressRequired');
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    setServerError('');
    try {
      await signup(form);
      setVerifyEmail(form.email.trim());
      setIsVerifying(true);
    } catch (err) {
      setServerError(err.message || t('signup.errors.serverFail'));
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
            We've sent a 6-digit verification code to <strong>{verifyEmail}</strong>. Please enter the code below to activate your account.
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
              Back to Registration
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
        <h1 className={styles.heading}>{t('signup.heading')}</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input label={t('signup.nameLabel')} value={form.name} onChange={setField('name')} error={errors.name} required autoComplete="name" disabled={isLoading} />
          <Input label={t('signup.emailLabel')} type="email" value={form.email} onChange={setField('email')} error={errors.email} required autoComplete="email" disabled={isLoading} />
          <Input label={t('signup.phoneLabel')} type="tel" value={form.phoneNumber} onChange={setField('phoneNumber')} error={errors.phoneNumber} placeholder="05XXXXXXXX" required autoComplete="tel" disabled={isLoading} />
          <Input label={t('signup.passwordLabel')} type="password" value={form.password} onChange={setField('password')} error={errors.password} hint={t('signup.passwordHint')} required autoComplete="new-password" disabled={isLoading} />
          <Input label={t('signup.passwordConfirmLabel')} type="password" value={form.passwordConfirm} onChange={setField('passwordConfirm')} error={errors.passwordConfirm} required autoComplete="new-password" disabled={isLoading} />

          <div className={styles.addressSection}>
            <p className={styles.addressHeading}>{t('signup.deliveryHeading')}</p>
            <AddressFields
              values={{ wilaya: form.wilaya, baladia: form.baladia, homeAddress: form.homeAddress }}
              errors={{ wilaya: errors.wilaya, baladia: errors.baladia, homeAddress: errors.homeAddress }}
              onChange={handleAddressChange}
              disabled={isLoading}
            />
          </div>

          {serverError && <p className={styles.serverError} role="alert">{serverError}</p>}

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            {t('signup.submit')}
          </Button>
        </form>

        <p className={styles.switchText}>
          {t('signup.alreadyAccount')}{' '}
          <Link to="/account/login" className={styles.switchLink}>{t('signup.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
