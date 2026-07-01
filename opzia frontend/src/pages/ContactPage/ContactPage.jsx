// src/pages/ContactPage/ContactPage.jsx
// Contact page — two sections:
//   1. Philosophy grid (Our Mission, Purity, Precision, Community)
//   2. Contact form + store info

import React, { useState } from 'react';
import { useLanguage } from '@hooks/useLanguage';
import SectionHeader from '@components/common/SectionHeader/SectionHeader';
import Input from '@components/ui/Input/Input';
import Select from '@components/ui/Select/Select';
import Button from '@components/ui/Button/Button';
import styles from './ContactPage.module.css';

// ─── Policies data ─────────────────────────────────────────────────────────
const POLICIES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    titleKey: 'contact.shippingTitle',
    bodyKey: 'contact.shippingBody',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
    titleKey: 'contact.exchangeTitle',
    bodyKey: 'contact.exchangeBody',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    titleKey: 'contact.resellerTitle',
    bodyKey: 'contact.resellerBody',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    titleKey: 'contact.brokenTitle',
    bodyKey: 'contact.brokenBody',
  },
];

const SUBJECT_OPTIONS = [
  { value: 'general',    labelKey: 'contact.subjects.general' },
  { value: 'order',      labelKey: 'contact.subjects.order' },
  { value: 'product',    labelKey: 'contact.subjects.product' },
  { value: 'wholesale',  labelKey: 'contact.subjects.wholesale' },
  { value: 'press',      labelKey: 'contact.subjects.press' },
  { value: 'other',      labelKey: 'contact.subjects.other' },
];

// ─── Contact form ─────────────────────────────────────────────────────────
function ContactForm() {
  const { t } = useLanguage();
  const [form, setForm]       = useState({ fullName: '', email: '', subject: '', message: '' });
  const [errors, setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => { const n = {...p}; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = t('contact.form.errorName');
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('contact.form.errorEmail');
    if (!form.subject)         e.subject  = t('contact.form.errorSubject');
    if (!form.message.trim())  e.message  = t('contact.form.errorMessage');
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    // simulate network
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setSubmitted(true);
  };

  const translatedSubjectOptions = SUBJECT_OPTIONS.map(opt => ({
    value: opt.value,
    label: t(opt.labelKey)
  }));

  if (submitted) {
    return (
      <div className={styles.formSuccess}>
        <p className={styles.successTitle}>{t('contact.form.successTitle')}</p>
        <p className={styles.successBody}>
          {t('contact.form.successBody')}
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input label={t('contact.form.fullName')} value={form.fullName} onChange={setField('fullName')} error={errors.fullName} required disabled={isLoading} />
      <Input label={t('contact.form.email')} type="email" value={form.email} onChange={setField('email')} error={errors.email} required disabled={isLoading} />
      <Select label={t('contact.form.subject')} value={form.subject} onChange={setField('subject')} options={translatedSubjectOptions} placeholder={t('contact.form.subjectPlaceholder')} error={errors.subject} required disabled={isLoading} />
      <div className={styles.textareaField}>
        <label className={styles.textareaLabel}>{t('contact.form.message')}</label>
        <textarea
          className={[styles.textarea, errors.message ? styles.textareaError : ''].filter(Boolean).join(' ')}
          value={form.message}
          onChange={setField('message')}
          rows={5}
          disabled={isLoading}
          aria-invalid={!!errors.message}
          placeholder={t('contact.form.messagePlaceholder')}
        />
        {errors.message && <span className={styles.fieldError} role="alert">{errors.message}</span>}
      </div>
      <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
        {t('contact.form.submit')}
      </Button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
function ContactPage() {
  const { t } = useLanguage();
  return (
    <div className={styles.page}>
      {/* ── Policies section ── */}
      <section className={styles.policiesSection}>
        <SectionHeader eyebrow={t('contact.eyebrow')} title={t('contact.title')} />
        <div className={styles.policiesGrid}>
          {POLICIES.map((item) => (
            <div key={item.titleKey} className={styles.policyCard}>
              <span className={styles.policyIcon}>{item.icon}</span>
              <h3 className={styles.policyTitle}>{t(item.titleKey)}</h3>
              <p className={styles.policyBody}>{t(item.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact section ── */}
      <section className={styles.contactSection}>
        <div className={styles.contactLeft}>
          <p className={styles.connectEyebrow}>{t('contact.connect')}</p>
          <h2 className={styles.connectTitle}>{t('contact.connectTitle')}</h2>
          <p className={styles.connectBody}>
            {t('contact.connectBody')}
          </p>

          <div className={styles.infoGrid}>
            <div>
              <p className={styles.infoLabel}>{t('contact.visitUs')}</p>
              <p className={styles.infoText}>742 Luminary Ave,<br />Beverly Hills, CA 90210</p>
            </div>
            <div>
              <p className={styles.infoLabel}>{t('contact.enquiries')}</p>
              <p className={styles.infoText}>hello@lumina-beauty.com<br />+1 (555) 890 2345</p>
            </div>
            <div>
              <p className={styles.infoLabel}>{t('contact.hours')}</p>
              <p className={styles.infoText}>Mon–Fri: 9am – 6pm<br />Sat: 10am – 4pm</p>
            </div>
            <div>
              <p className={styles.infoLabel}>{t('contact.follow')}</p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialBtn} aria-label="Share">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </a>
                <a href="#" className={styles.socialBtn} aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" className={styles.socialBtn} aria-label="Pinterest">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.03-2.83.19-.77 1.27-5.35 1.27-5.35s-.32-.65-.32-1.61c0-1.51.88-2.64 1.97-2.64.93 0 1.38.7 1.38 1.54 0 .94-.6 2.34-.91 3.64-.26 1.08.54 1.96 1.6 1.96 1.92 0 3.4-2.02 3.4-4.95 0-2.59-1.86-4.4-4.51-4.4-3.07 0-4.87 2.3-4.87 4.68 0 .93.36 1.92.8 2.46.09.11.1.2.07.31-.08.33-.26 1.08-.3 1.23-.05.2-.16.24-.37.14-1.39-.65-2.26-2.68-2.26-4.32 0-3.51 2.55-6.74 7.36-6.74 3.86 0 6.86 2.75 6.86 6.42 0 3.83-2.41 6.91-5.76 6.91-1.13 0-2.19-.59-2.55-1.28l-.69 2.59c-.25.97-.93 2.18-1.39 2.92.05.02.1.03.15.04.71.13 1.44.2 2.19.2 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contactRight}>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
