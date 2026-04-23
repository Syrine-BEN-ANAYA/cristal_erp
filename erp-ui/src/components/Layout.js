// Layout.js - Version modernisée avec thème bleu & doré
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiPackage, FiShoppingCart, FiTag, FiUsers, FiTruck, FiBarChart, 
  FiLogOut, FiMenu, FiX, FiGrid
} from 'react-icons/fi';
import '../styles/Layout.css';
import logo from '../assets/logo.png';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');

  const menuItems = [
    { path: '/user/reporting', label: 'Reporting', icon: FiBarChart },
    { path: '/user/orders', label: 'Orders', icon: FiShoppingCart },
    { path: '/user/purchases', label: 'Purchases', icon: FiTag },
    { path: '/user/customers', label: 'Customers', icon: FiUsers },
    { path: '/user/suppliers', label: 'Suppliers', icon: FiTruck },
    { path: '/user/products', label: 'Products', icon: FiPackage },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="layout-modern">
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
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'ADMIN' ? 'Admin' : 'User'}
                </span>
              </div>
              <button onClick={onLogout} className="logout-button-modern" title="Logout">
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`main-container-modern ${isAdminRoute ? 'no-sidebar' : ''}`}>
        {/* Sidebar */}
        {!isAdminRoute && (
          <>
            <aside className={`sidebar-modern ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <div className="sidebar-header">
                <div className="sidebar-brand">
                  <FiGrid className="brand-icon" />
                  <span> Main Menu </span>
                </div>
              </div>
              <nav className="sidebar-nav-modern">
                <ul>
                  {menuItems.map(item => {
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
                <div className="sidebar-credits">
                </div>
              </div>
            </aside>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
              <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
            )}
          </>
        )}

        {/* Main Content */}
        <main className="main-content-modern">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="app-footer-modern">
        <div className="footer-container">
          <div className="footer-info">
            <span>© 2026 AL RUBAI UNITED CRISTAL</span>
            <span>All rights reserved</span>
            <span className="footer-separator">•</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;