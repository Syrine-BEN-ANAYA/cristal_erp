// src/pages/UserPage.js (refactorisée)
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardPage from './DashboardPage';
import OrdersPage from './OrdersPage';
import CategoriesPage from './CategoriesPage';
import CustomersPage from './CustomersPage';
import SuppliersPage from './SuppliersPage';
import ReportingPage from './ReportingPage';
import ProductsPage from './ProductsPage';
import PurchasesPage from './PurchasesPage';

// Configuration des routes pour une meilleure maintenabilité
const USER_ROUTES = [
  { path: "dashboard", element: DashboardPage, title: "Dashboard" },
  { path: "orders", element: OrdersPage, title: "Orders" },
  { path: "categories", element: CategoriesPage, title: "Categories" },
  { path: "products", element: ProductsPage, title: "Products" },
  { path: "customers", element: CustomersPage, title: "Customers" },
  { path: "suppliers", element: SuppliersPage, title: "Suppliers" },
  { path: "purchases", element: PurchasesPage, title: "Purchases" },
  { path: "reporting", element: ReportingPage, title: "Reporting" },
];

const UserPage = ({ user, token, onLogout }) => {
  return (
    <Layout user={user} token={token} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        {USER_ROUTES.map(({ path, element: Element }) => (
          <Route 
            key={path} 
            path={path} 
            element={<Element token={token} user={user} />} 
          />
        ))}
      </Routes>
    </Layout>
  );
};

export default UserPage;