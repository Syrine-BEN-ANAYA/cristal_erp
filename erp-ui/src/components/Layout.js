import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiShoppingCart, FiTag, FiUsers, FiTruck, FiBell } from 'react-icons/fi';
import '../styles/Layout.css';
import logo from '../assets/logo.png';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const menuItems = [
    { path: '/user/reporting', label: 'Reporting', icon: FiHome },
    { path: '/user/inventory', label: 'Inventory', icon: FiPackage },
    { path: '/user/orders', label: 'Orders', icon: FiShoppingCart },
    { path: '/user/categories', label: 'Categories', icon: FiTag },
    { path: '/user/customers', label: 'Customers', icon: FiUsers },
    { path: '/user/suppliers', label: 'Suppliers', icon: FiTruck },
    { path: '/user/products', label: 'Products', icon: FiPackage },
    { path: '/user/alerts', label: 'Stock Alerts', icon: FiBell }
  ];

  return (
    <div className="layout">
      {/* Topbar with logo and user info */}
      <header className="topbar">
        <div className="topbar-logo">
          <img src={logo} alt="Al Rubai United Al Cristal" />
          <span className="company-name">AL RUBAI UNITED AL CRISTAL</span>
        </div>
        <div className="topbar-user">
          <span className="user-email">{user?.email}</span>
          <button onClick={onLogout} className="logout-button">Log out</button>
        </div>
      </header>

      {/* Main container (sidebar + content) */}
      <div className={`main-container ${isAdminRoute ? 'no-sidebar' : ''}`}>
        {!isAdminRoute && (
          <aside className="sidebar">
            <nav className="sidebar-nav">
              <ul>
                {menuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={location.pathname === item.path ? 'active' : ''}
                      >
                        <span className="menu-icon"><Icon /></span>
                        <span className="menu-label">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        )}

        {/* Main content */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Global footer */}
      <footer className="app-footer">
        <p>© 2026 AL RUBAI UNITED AL CRISTAL. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;