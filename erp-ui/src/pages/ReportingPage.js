// src/pages/ReportingPage.js
import React, { useState, useEffect } from 'react';
import {
  getOrders,
} from '../api/ordersService';
import {
  getProducts,
  getLowStockProducts,
} from '../api/productsService';
import {
  getPurchases,
} from '../api/purchasesService';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FiPackage, FiShoppingCart, FiDollarSign, FiAlertTriangle,
  FiShoppingBag, FiTrendingUp, FiCalendar, FiBarChart2
} from 'react-icons/fi';
import '../styles/ReportingPage.css';

const ReportingPage = () => {
  const token = localStorage.getItem('token');

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('You must be logged in to view this data.');
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [ordersData, productsData, purchasesData, lowStockData] = await Promise.all([
          getOrders(token),
          getProducts(token),
          getPurchases(token),
          getLowStockProducts(token),
        ]);

        // Afficher les données pour déboguer
        console.log('Orders:', ordersData);
        console.log('Products:', productsData);
        console.log('Purchases:', purchasesData);
        console.log('Low stock:', lowStockData);

        setOrders(ordersData);
        setProducts(productsData);
        setPurchases(purchasesData);
        setLowStockProducts(lowStockData);
        setError(null);
      } catch (err) {
        console.error('Error loading reporting data', err);
        const errorMsg = err?.response?.data?.message || err?.message || 'Unable to load reporting data.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  // --- Calculs ---
  const totalOrders = orders.length;
  // Utilisez le bon nom de champ (ex: total, totalAmount, amount)
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || Number(order.total) || 0), 0);
  
  const totalProducts = products.length;
  const totalPurchases = purchases.length;
  const totalPurchaseAmount = purchases.reduce((sum, p) => sum + (Number(p.total) || Number(p.totalAmount) || 0), 0);
  
  const lowStockCount = lowStockProducts.length;
  
  // Profit = ventes - achats
  const profit = totalRevenue - totalPurchaseAmount;

  // Tendances mensuelles des commandes
  const ordersByMonth = orders.reduce((acc, order) => {
    if (!order.createdAt) return acc;
    const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    const amount = Number(order.totalAmount) || Number(order.total) || 0;
    if (existing) {
      existing.count += 1;
      existing.revenue += amount;
    } else {
      acc.push({ month, count: 1, revenue: amount });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month) - new Date(b.month));

  // Tendances mensuelles des achats
  const purchasesByMonth = purchases.reduce((acc, purchase) => {
    if (!purchase.date && !purchase.createdAt) return acc;
    const date = purchase.date || purchase.createdAt;
    const month = new Date(date).toLocaleString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    const amount = Number(purchase.total) || Number(purchase.totalAmount) || 0;
    if (existing) {
      existing.count += 1;
      existing.amount += amount;
    } else {
      acc.push({ month, count: 1, amount });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month) - new Date(b.month));

  if (loading) {
    return (
      <div className="reporting-page">
        <div className="loading-spinner">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reporting-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="reporting-page">
      <div className="reporting-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard & Reporting</h1>
            <p className="page-subtitle">Key business insights</p>
          </div>
        </div>

        {/* Cartes KPI */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <FiShoppingCart className="kpi-icon" />
            <div>
              <h3>Total Orders</h3>
              <p>{totalOrders}</p>
              <div className="kpi-sub"> ${totalRevenue.toFixed(2)}</div>
            </div>
          </div>
          <div className="kpi-card">
            <FiPackage className="kpi-icon" />
            <div>
              <h3>Products</h3>
              <p>{totalProducts}</p>
              <div className="kpi-sub">Low stock: {lowStockCount}</div>
            </div>
          </div>
          <div className="kpi-card">
            <FiShoppingBag className="kpi-icon" />
            <div>
              <h3> Total Purchases</h3>
              <p>{totalPurchases}</p>
              <div className="kpi-sub"> ${totalPurchaseAmount.toFixed(2)}</div>
            </div>
          </div>
        
          <div className="kpi-card">
            <FiBarChart2 className="kpi-icon" />
            <div>
              <h3>Profit</h3>
              <p>${profit.toFixed(2)}</p>
              <div className="kpi-sub"> </div>
            </div>
          </div>
        </div>

        {/* Grille des graphiques */}
        <div className="charts-grid">
          {/* Graphique des commandes mensuelles */}
          <div className="chart-container">
            <div className="chart-header">
              <h3><FiCalendar /> Monthly Order Trends</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ordersByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8884d8" name="Order count" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique des achats mensuels */}
          <div className="chart-container">
            <div className="chart-header">
              <h3><FiCalendar /> Monthly Purchases</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={purchasesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Purchase count" />
                <Bar yAxisId="right" dataKey="amount" fill="#82ca9d" name="Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Liste des produits en stock faible */}
          <div className="chart-container">
            <div className="chart-header">
              <h3><FiAlertTriangle /> Low Stock Products</h3>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="empty-message">No low stock products.</p>
            ) : (
              <ul className="low-stock-list">
                {lowStockProducts.map(product => (
                  <li key={product._id || product.id}>
                    <span>{product.name}</span>
                    <span className="stock-value">{product.stock} units</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tableau des dernières commandes */}
          <div className="table-container">
            <h3 className="table-title">Recent Orders</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order._id || order.id}>
                    <td>{order._id || order.id}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                    <td>${(Number(order.totalAmount) || Number(order.total) || 0).toFixed(2)}</td>
                    <td>{order.status || '-'}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-message">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingPage;