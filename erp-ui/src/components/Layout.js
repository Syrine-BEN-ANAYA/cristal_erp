import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiShoppingCart, FiTag, FiUsers, FiTruck, FiBell } from 'react-icons/fi';
import '../styles/Layout.css';
import logo from '../assets/logo.png'; // Assurez-vous que le chemin est correct

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();

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
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-logo">
          <img src={logo} alt="Al Rubai United Al Cristal" />
          <span className="company-name">AL RUBAI UNITED AL CRISTAL</span>
        </div>
      </header>

      {/* Conteneur principal (sidebar + contenu) */}
      <div className="main-container">
        {/* Sidebar */}
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
          {/* Footer de la sidebar (utilisateur) */}
          <div className="sidebar-footer">
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <button onClick={onLogout} className="logout-button">Log out</button>
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Footer global de l'application */}
      <footer className="app-footer">
        <p>© 2026 AL RUBAI UNITED AL CRISTAL. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Layout;