// src/components/layout/Footer/Footer.jsx
// Four-column footer matching the LUMINA design screens.
// Columns: Brand + tagline | Company | Customer Care | Legal

import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@hooks/useLanguage';
import styles from './Footer.module.css';

function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>

        {/* ── Brand Column ── */}
        <div className={styles.brandCol}>
          <Link to="/" className={styles.logo} aria-label="Opzia home">
            <img src="/opzia logo white.png?v=2" alt="Opzia Logo" className={styles.logoImg} />
          </Link>
          <p className={styles.tagline}>
            {t('footer.tagline')}
          </p>
        </div>

        {/* ── Company Column ── */}
        <div className={styles.column}>
          <h3 className={styles.colHeading}>{t('footer.company')}</h3>
          <ul className={styles.linkList}>
            <li><Link to="/contact" className={styles.footerLink}>{t('footer.sustainability')}</Link></li>
            <li><Link to="/contact" className={styles.footerLink}>{t('footer.careers')}</Link></li>
          </ul>
        </div>

        {/* ── Customer Care Column ── */}
        <div className={styles.column}>
          <h3 className={styles.colHeading}>{t('footer.customerCare')}</h3>
          <ul className={styles.linkList}>
            {/* TODO: Create dedicated Shipping Info and Returns pages */}
            <li><Link to="/shop" className={styles.footerLink}>{t('footer.quickLinks')}</Link></li>
            <li><Link to="/contact" className={styles.footerLink}>{t('footer.shippingInfo')}</Link></li>
            <li><Link to="/contact" className={styles.footerLink}>{t('footer.returns')}</Link></li>
          </ul>
        </div>

        {/* ── Legal Column ── */}
        <div className={styles.column}>
          <h3 className={styles.colHeading}>{t('footer.legal')}</h3>
          <ul className={styles.linkList}>
            {/* TODO: Create dedicated policy pages */}
            <li><Link to="/" className={styles.footerLink}>{t('footer.privacy')}</Link></li>
            <li><Link to="/" className={styles.footerLink}>{t('footer.terms')}</Link></li>
            <li><Link to="/" className={styles.footerLink}>{t('footer.cookies')}</Link></li>
          </ul>
        </div>

      </div>

      {/* ── Copyright Bar ── */}
      <div className={styles.copyright}>
        <p>{t('footer.rightsReserved', { year })}</p>
      </div>
    </footer>
  );
}

export default Footer;
