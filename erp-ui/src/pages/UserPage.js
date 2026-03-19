import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardPage from './DashboardPage';
import OrdersPage from './OrdersPage';
import CategoriesPage from './CategoriesPage';
import CustomersPage from './CustomersPage';
import SuppliersPage from './SuppliersPage';
import ReportingPage from './ReportingPage';

const UserPage = ({ user, onLogout }) => {
  return (
    <Layout user={user} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="reporting" element={<ReportingPage />} />
      </Routes>
    </Layout>
  );
};

export default UserPage;