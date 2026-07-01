// src/components/layout/AdminTopbar/AdminTopbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import styles from './AdminTopbar.module.css';

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function AdminTopbar({ onMenuClick }) {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/account/login');
  };

  useEffect(() => {
    if (!langOpen) return;
    const handleClose = () => setLangOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [langOpen]);

  const toggleLang = (e) => {
    e.stopPropagation();
    setLangOpen((prev) => !prev);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open navigation menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <Link to="/admin/dashboard" className={styles.logoLink}>
          <img src="/opzia logo white.png?v=2" alt="Opzia Logo" className={styles.logoImg} />
        </Link>
        <span className={styles.brandName}>{t('admin.topbar.beautyAdmin')}</span>
      </div>

      <div className={styles.right}>
        {/* Language Selector Dropdown */}
        <div className={styles.langPickerContainer}>
          <button
            className={styles.langBtn}
            aria-label="Change language"
            aria-haspopup="true"
            aria-expanded={langOpen}
            onClick={toggleLang}
          >
            <GlobeIcon />
            <span className={styles.langCode}>{currentLanguage.toUpperCase()}</span>
          </button>
          {langOpen && (
            <ul className={styles.langDropdown}>
              <li>
                <button
                  className={`${styles.langOption} ${currentLanguage === 'en' ? styles.langOptionActive : ''}`}
                  onClick={() => changeLanguage('en')}
                >
                  English
                </button>
              </li>
              <li>
                <button
                  className={`${styles.langOption} ${currentLanguage === 'fr' ? styles.langOptionActive : ''}`}
                  onClick={() => changeLanguage('fr')}
                >
                  Français
                </button>
              </li>
              <li>
                <button
                  className={`${styles.langOption} ${currentLanguage === 'ar' ? styles.langOptionActive : ''}`}
                  onClick={() => changeLanguage('ar')}
                >
                  العربية
                </button>
              </li>
            </ul>
          )}
        </div>

        <Link to="/" className={styles.storefrontBtn} title={t('admin.sidebar.storefront')} target="_blank" rel="noopener noreferrer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className={styles.storefrontLabel}>{t('admin.topbar.store')}</span>
        </Link>

        {user && (
          <div className={styles.userContainer}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} aria-label={t('admin.sidebar.logout')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminTopbar;
