import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiPackage, FiShoppingCart, FiTag, FiUsers, FiTruck, FiBarChart, 
  FiLogOut, FiMenu, FiX, FiGrid, FiClipboard, FiGlobe
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Layout.css';
import logo from '../assets/logo.png';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, t, isRTL } = useLanguage();

  // ✅ Utiliser t pour tous les labels
  const adminMenuItems = [
    { path: '/admin', label: t.dashboardAdmin, icon: FiGrid },
    { path: '/admin/audit', label: t.logs, icon: FiClipboard },
    { path: '/admin/users', label: t.userManagement, icon: FiUsers },
  ];

  const menuItems = [
    { path: '/user/reporting', label: t.reporting, icon: FiBarChart },
    { path: '/user/orders', label: t.orders, icon: FiShoppingCart },
    { path: '/user/purchases', label: t.purchases, icon: FiTag },
    { path: '/user/customers', label: t.customers, icon: FiUsers },
    { path: '/user/suppliers', label: t.suppliers, icon: FiTruck },
    { path: '/user/products', label: t.products, icon: FiPackage },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getMenuItems = () => {
    if (location.pathname.startsWith('/admin')) {
      return adminMenuItems;
    }
    return menuItems;
  };

  const itemsToShow = getMenuItems();

  return (
    <div className={`layout-modern ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Topbar */}
      <header className="topbar-modern">
        <div className="topbar-container">
          <div className="topbar-left">
            <div className="topbar-logo-modern">
              <div className="logo-wrapper">
                <img src={logo} alt="Al Rubai United Al Cristal" />
              </div>
              <div className="logo-text">
                <span className="company-name-main">AL RUBAI</span>
                <span className="company-name-sub">UNITED CRISTAL</span>
                <span className="company-name-ar">الكريستال الرباعي المتحدة</span>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            <div className="user-info-modern">
              <div className="user-avatar-modern">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details-modern">
                <span className="user-email-modern">{user?.email}</span>
                <span className="user-role-modern">
                  {user?.role === 'SUPER_ADMIN' ? t.superAdmin : user?.role === 'ADMIN' ? t.admin : t.user}
                </span>
              </div>
              {/* ✅ Bouton langue ajouté */}
              <button onClick={toggleLanguage} className="lang-button-modern" title={language === 'EN' ? 'العربية' : 'English'}>
                <FiGlobe size={16} />
                <span>{language === 'EN' ? 'عربي' : 'EN'}</span>
              </button>
              <button onClick={onLogout} className="logout-button-modern" title={t.logout}>
                <FiLogOut size={18} />
                <span>{t.logout}</span>
              </button>
            </div>

            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="main-container-modern">
        <aside className={`sidebar-modern ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <FiGrid className="brand-icon" />
              <span>{location.pathname.startsWith('/admin') ? t.adminMenu : t.mainMenu}</span>
            </div>
          </div>
          <nav className="sidebar-nav-modern">
            <ul>
              {itemsToShow.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={closeMobileMenu}
                    >
                      <span className="menu-icon"><Icon size={20} /></span>
                      <span className="menu-label">{item.label}</span>
                      {isActive && <span className="active-indicator"></span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-credits"></div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
        )}

        <main className="main-content-modern">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>

      <footer className="app-footer-modern">
        <div className="footer-container">
          <div className="footer-info">
            <span>{t.copyright}</span>
            <span>{t.allRights}</span>
            <span className="footer-separator">•</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;