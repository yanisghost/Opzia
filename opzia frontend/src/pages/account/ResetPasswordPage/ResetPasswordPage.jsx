// src/pages/account/ResetPasswordPage/ResetPasswordPage.jsx
// Backend: PATCH /api/v1/users/resetPassword/:token

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { authService } from '@services/authService';
import Input from '@components/ui/Input/Input';
import Button from '@components/ui/Button/Button';
import styles from './ResetPasswordPage.module.css';

function ResetPasswordPage() {
  const { t } = useLanguage();
  const { token }  = useParams();
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [form, setForm]               = useState({ password: '', passwordConfirm: '' });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading]     = useState(false);

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    setServerError('');
  };

  const validate = () => {
    const e = {};
    if (form.password.length < 8)                 e.password        = t('reset.errors.passwordLength');
    if (form.password !== form.passwordConfirm)   e.passwordConfirm = t('reset.errors.passwordsMatch');
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    setServerError('');
    try {
      const res = await authService.resetPassword(token, form.password, form.passwordConfirm);
      const newToken = res.token ?? res.accessToken;
      if (newToken) localStorage.setItem('lumina_token', newToken);
      window.location.href = '/';
    } catch (err) {
      setServerError(err.message || t('reset.errors.invalidToken'));
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
        <h1 className={styles.heading}>{t('reset.heading')}</h1>
        <p className={styles.hint}>{t('reset.hint')}</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label={t('reset.newPassword')}
            type="password"
            value={form.password}
            onChange={setField('password')}
            error={errors.password}
            hint={t('signup.passwordHint')}
            required
            autoComplete="new-password"
            disabled={isLoading}
          />
          <Input
            label={t('reset.confirmNewPassword')}
            type="password"
            value={form.passwordConfirm}
            onChange={setField('passwordConfirm')}
            error={errors.passwordConfirm}
            required
            autoComplete="new-password"
            disabled={isLoading}
          />

          {serverError && (
            <p className={styles.serverError} role="alert">{serverError}</p>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            {t('reset.submit')}
          </Button>
        </form>

        <Link to="/account/forgot-password" className={styles.backLink}>
          {t('reset.requestNewLink')}
        </Link>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
