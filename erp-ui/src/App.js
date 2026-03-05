import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import Layout from './components/Layout';
import ReportingPage from './pages/ReportingPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import CategoriesPage from './pages/CategoriesPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import AdminPage from './pages/AdminPage';
import AlertsPage from './pages/AlertsPage';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (loggedUser, accessToken) => {
    setUser(loggedUser);
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
  };

  const handlePasswordChanged = (updatedUser, accessToken) => {
    setUser(updatedUser);
    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken('');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.mustChangePassword) {
    return (
      <ChangePasswordPage
        user={user}
        token={token}
        onPasswordChanged={handlePasswordChanged}
        onLogout={handleLogout}
      />
    );
  }

  // ✅ Si ADMIN ou SUPER_ADMIN → afficher AdminPage sans Layout
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return <AdminPage user={user} token={token} />;
  }

  // Sinon (USER) → Layout classique avec les pages métier
  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/user/reporting-page" element={<ReportingPage token={token} />} />
        <Route path="/user/products" element={<ProductsPage token={token} />} />
        <Route path="/user/inventory" element={<InventoryPage token={token} />} />
        <Route path="/user/orders" element={<OrdersPage token={token} />} />
        <Route path="/user/categories" element={<CategoriesPage token={token} />} />
        <Route path="/user/customers" element={<CustomersPage token={token} />} />
        <Route path="/user/suppliers" element={<SuppliersPage token={token} />} />
        <Route path="/user/alerts" element={<AlertsPage token={token} />} />
        <Route path="*" element={<Navigate to="/user/reporting-page" />} />
      </Routes>
    </Layout>
  );
}

export default App;