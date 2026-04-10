// components/Layout.jsx (version simple mais avec nos composants)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiShoppingCart, FiPackage, FiUsers, FiTruck, FiShoppingBag, FiBarChart2 
} from 'react-icons/fi';
import TopBar from './TopBar';
import Footer from './Footer';
import '../styles/Layout.css';

const menuItems = [
  { path: '/user/orders', label: 'Orders', icon: FiShoppingCart },
  { path: '/user/products', label: 'Products', icon: FiPackage },
  { path: '/user/customers', label: 'Customers', icon: FiUsers },
  { path: '/user/suppliers', label: 'Suppliers', icon: FiTruck },
  { path: '/user/purchases', label: 'Purchases', icon: FiShoppingBag },
  { path: '/user/reporting', label: 'Reporting', icon: FiBarChart2 },
];

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="layout">
      <TopBar user={user} onLogout={onLogout} />
      
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
        
        <main className="main-content">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;