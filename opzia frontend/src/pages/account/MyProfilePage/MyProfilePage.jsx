// src/pages/account/MyProfilePage/MyProfilePage.jsx
// Protected. Lets the logged-in user update their name/email
// and change their password. Two separate forms — two separate endpoints.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useUI } from '@hooks/useUI';
import { useLanguage } from '@hooks/useLanguage';
import Input from '@components/ui/Input/Input';
import Button from '@components/ui/Button/Button';
import styles from './MyProfilePage.module.css';

// ─── Update profile form ───────────────────────────────────────────────────
function ProfileForm({ user }) {
  const { t } = useLanguage();
  const { updateMe }   = useAuth();
  const { addToast }   = useUI();
  const [form, setForm]           = useState({ name: user?.name || '', email: user?.email || '' });
  const [errors, setErrors]       = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('profile.errors.nameRequired');
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('profile.errors.emailRequired');
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    try {
      await updateMe({ name: form.name.trim(), email: form.email.trim() });
      addToast(t('profile.toastSuccess'), 'success');
    } catch (err) {
      addToast(err.message || t('profile.toastError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t('profile.infoHeading')}</h2>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.row}>
          <Input label={t('signup.nameLabel')} value={form.name} onChange={setField('name')} error={errors.name} required disabled={isLoading} />
          <Input label={t('login.emailLabel')} type="email" value={form.email} onChange={setField('email')} error={errors.email} required disabled={isLoading} />
        </div>
        <div className={styles.formFooter}>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            {t('profile.saveChanges')}
          </Button>
        </div>
      </form>
    </section>
  );
}

// ─── Change password form ──────────────────────────────────────────────────
function PasswordForm() {
  const { t } = useLanguage();
  const { updateMyPassword } = useAuth();
  const { addToast }         = useUI();
  const [form, setForm]           = useState({ passwordCurrent: '', password: '', passwordConfirm: '' });
  const [errors, setErrors]       = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.passwordCurrent.trim())             e.passwordCurrent = t('profile.errors.currentPasswordRequired');
    if (form.password.length < 8)                 e.password        = t('profile.errors.passwordLength');
    if (form.password !== form.passwordConfirm)   e.passwordConfirm = t('profile.errors.passwordsMatch');
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    try {
      await updateMyPassword(form);
      addToast(t('profile.toastPasswordSuccess'), 'success');
      setForm({ passwordCurrent: '', password: '', passwordConfirm: '' });
    } catch (err) {
      addToast(err.message || t('profile.toastPasswordError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t('profile.passwordHeading')}</h2>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input label={t('profile.currentPassword')} type="password" value={form.passwordCurrent} onChange={setField('passwordCurrent')} error={errors.passwordCurrent} required autoComplete="current-password" disabled={isLoading} />
        <div className={styles.row}>
          <Input label={t('profile.newPassword')} type="password" value={form.password} onChange={setField('password')} error={errors.password} hint={t('signup.passwordHint')} required autoComplete="new-password" disabled={isLoading} />
          <Input label={t('profile.confirmNewPassword')} type="password" value={form.passwordConfirm} onChange={setField('passwordConfirm')} error={errors.passwordConfirm} required autoComplete="new-password" disabled={isLoading} />
        </div>
        <div className={styles.formFooter}>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            {t('profile.updatePassword')}
          </Button>
        </div>
      </form>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
function MyProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className={styles.title}>{t('profile.myAccount')}</h1>
              {user && <p className={styles.welcome}>{t('profile.welcomeBack', { name: user.name })}</p>}
            </div>
            <Link to="/account/orders">
              <Button variant="secondary" size="md">
                📦 Track Orders & History
              </Button>
            </Link>
          </div>
        </header>
        <ProfileForm user={user} />
        <div className={styles.divider} />
        <PasswordForm />
      </div>
    </div>
  );
}

export default MyProfilePage;
