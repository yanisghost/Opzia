// src/components/layout/Navbar/Navbar.jsx
// Top navigation bar — present on all customer-facing pages.
// Reads cart item count from CartContext and auth state from AuthContext.
// Responsive: collapses to hamburger menu on mobile.

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@hooks/useAuth';
import { useUI } from '@hooks/useUI';
import { useLanguage } from '@hooks/useLanguage';
import styles from './Navbar.module.css';
import SearchOverlay from '../SearchOverlay/SearchOverlay';

// ─── SVG Icons (inline, no dependency) ───────────────────────────────────
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────
function Navbar() {
  const { itemCount }     = useCart();
  const { isAuthenticated } = useAuth();
  const { toggleCart, openSearch } = useUI();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const navigate          = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Add shadow when page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close language dropdown on clicking anywhere else
  useEffect(() => {
    if (!langOpen) return;
    const handleClose = () => setLangOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [langOpen]);

  // Close mobile menu on route change
  const closeMenu = () => setMenuOpen(false);

  const toggleLang = (e) => {
    e.stopPropagation();
    setLangOpen((prev) => !prev);
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`${styles.inner} container`}>

        {/* ── Logo ── */}
        <Link to="/" className={styles.logo} onClick={closeMenu} aria-label="Opzia home">
          <img src="/opzia logo white.png?v=2" alt="Opzia Logo" className={styles.logoImg} />
        </Link>

        {/* ── Desktop Nav Links ── */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <NavLink to="/"        className={navLinkClass}>{t('navbar.home')}</NavLink>
          <NavLink to="/shop"    className={navLinkClass}>{t('navbar.shop')}</NavLink>
          <NavLink to="/contact" className={navLinkClass}>{t('navbar.contact')}</NavLink>
          <NavLink to="/account/orders" className={navLinkClass}>{t('navbar.trackOrders')}</NavLink>
        </nav>

        {/* ── Icon Actions ── */}
        <div className={styles.actions}>
          {/* Search — TODO: wire to UIContext.toggleSearch when search overlay is built */}
          <button
            className={styles.iconBtn}
            aria-label={t('navbar.search')}
            onClick={openSearch}
          >
            <SearchIcon />
          </button>

          {/* Cart Bag */}
          <button
            className={styles.iconBtn}
            aria-label={t('navbar.bag', { count: itemCount })}
            onClick={() => navigate('/bag')}
          >
            <BagIcon />
            {itemCount > 0 && (
              <span className={styles.cartBadge} aria-hidden="true">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          {/* Account */}
          <button
            className={styles.iconBtn}
            aria-label={isAuthenticated ? t('navbar.myAccount') : t('navbar.login')}
            onClick={() => navigate(isAuthenticated ? '/account/me' : '/account/login')}
          >
            <UserIcon />
          </button>

          {/* Language Selector Dropdown */}
          <div className={styles.langPickerContainer}>
            <button
              className={styles.iconBtn}
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
                    onClick={() => { changeLanguage('en'); closeMenu(); }}
                  >
                    English
                  </button>
                </li>
                <li>
                  <button
                    className={`${styles.langOption} ${currentLanguage === 'fr' ? styles.langOptionActive : ''}`}
                    onClick={() => { changeLanguage('fr'); closeMenu(); }}
                  >
                    Français
                  </button>
                </li>
                <li>
                  <button
                    className={`${styles.langOption} ${currentLanguage === 'ar' ? styles.langOptionActive : ''}`}
                    onClick={() => { changeLanguage('ar'); closeMenu(); }}
                  >
                    العربية
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {menuOpen && (
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          <NavLink to="/"        className={navLinkClass} onClick={closeMenu}>{t('navbar.home')}</NavLink>
          <NavLink to="/shop"    className={navLinkClass} onClick={closeMenu}>{t('navbar.shop')}</NavLink>
          <NavLink to="/contact" className={navLinkClass} onClick={closeMenu}>{t('navbar.contact')}</NavLink>
          <NavLink to="/account/orders" className={navLinkClass} onClick={closeMenu}>{t('navbar.trackOrders')}</NavLink>
          <NavLink
            to={isAuthenticated ? '/account/me' : '/account/login'}
            className={navLinkClass}
            onClick={closeMenu}
          >
            {isAuthenticated ? t('navbar.myAccount') : t('navbar.login')}
          </NavLink>
          
          {/* Mobile Language Row */}
          <div className={styles.mobileLangPicker}>
            <button
              className={`${styles.mobileLangBtn} ${currentLanguage === 'en' ? styles.mobileLangBtnActive : ''}`}
              onClick={() => { changeLanguage('en'); closeMenu(); }}
            >
              EN
            </button>
            <button
              className={`${styles.mobileLangBtn} ${currentLanguage === 'fr' ? styles.mobileLangBtnActive : ''}`}
              onClick={() => { changeLanguage('fr'); closeMenu(); }}
            >
              FR
            </button>
            <button
              className={`${styles.mobileLangBtn} ${currentLanguage === 'ar' ? styles.mobileLangBtnActive : ''}`}
              onClick={() => { changeLanguage('ar'); closeMenu(); }}
            >
              AR
            </button>
          </div>
        </nav>
      )}
      <SearchOverlay />
    </header>
  );
}

export default Navbar;
