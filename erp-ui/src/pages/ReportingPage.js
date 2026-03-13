// src/pages/ReportingPage.js
import React, { useState, useEffect } from 'react';
import { getOrders } from '../api/ordersService';
import { getProducts, getLowStockProducts } from '../api/productsService';
import { getPurchases } from '../api/purchasesService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  FiPackage,
  FiShoppingCart,
  FiAlertTriangle,
  FiShoppingBag,
  FiCalendar,
  FiBarChart2,
  FiDownload
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';
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
        const [ordersData, productsData, purchasesData, lowStockData] =
          await Promise.all([
            getOrders(token),
            getProducts(token),
            getPurchases(token),
            getLowStockProducts(token)
          ]);

        setOrders(ordersData || []);
        setProducts(productsData || []);
        setPurchases(purchasesData || []);
        setLowStockProducts(lowStockData || []);
        setError(null);
      } catch (err) {
        console.error('Error loading reporting data', err);
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load reporting data.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  // KPI calculations
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + (Number(order.totalAmount) || Number(order.total) || 0),
    0
  );
  const totalProducts = products.length;
  const totalPurchases = purchases.length;
  const totalPurchaseAmount = purchases.reduce(
    (sum, purchase) =>
      sum + (Number(purchase.total) || Number(purchase.totalAmount) || 0),
    0
  );
  const lowStockCount = lowStockProducts.length;
  const profit = totalRevenue - totalPurchaseAmount;

  // Orders grouped by month
  const ordersByMonth = orders.reduce((acc, order) => {
    if (!order.createdAt) return acc;
    const date = new Date(order.createdAt);
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === monthLabel);
    const amount = Number(order.totalAmount) || Number(order.total) || 0;
    if (existing) {
      existing.count += 1;
      existing.revenue += amount;
    } else {
      acc.push({
        month: monthLabel,
        sortDate: new Date(date.getFullYear(), date.getMonth(), 1),
        count: 1,
        revenue: amount
      });
    }
    return acc;
  }, []).sort((a, b) => a.sortDate - b.sortDate);

  // Purchases grouped by month
  const purchasesByMonth = purchases.reduce((acc, purchase) => {
    const dateValue = purchase.date || purchase.createdAt;
    if (!dateValue) return acc;
    const date = new Date(dateValue);
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === monthLabel);
    const amount = Number(purchase.total) || Number(purchase.totalAmount) || 0;
    if (existing) {
      existing.count += 1;
      existing.amount += amount;
    } else {
      acc.push({
        month: monthLabel,
        sortDate: new Date(date.getFullYear(), date.getMonth(), 1),
        count: 1,
        amount
      });
    }
    return acc;
  }, []).sort((a, b) => a.sortDate - b.sortDate);

  // PDF generation
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Logo
    try {
      doc.addImage(logo, 'PNG', margin, y, 40, 20);
    } catch (e) {
      console.warn('Logo could not be loaded', e);
    }

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 43, 78);
    doc.text('UNITED AL RUBAI AL CRISTAL', pageWidth / 2, y + 10, { align: 'center' });

    y += 25;
    doc.setFontSize(16);
    doc.text('Performance Report', margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 15;

    // KPIs table
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Key Metrics', margin, y);
    y += 8;

    const kpiData = [
      ['Orders', totalOrders.toString(), `$${totalRevenue.toFixed(2)}`],
      ['Products', totalProducts.toString(), `Low stock: ${lowStockCount}`],
      ['Purchases', totalPurchases.toString(), `$${totalPurchaseAmount.toFixed(2)}`],
      ['Profit', '', `$${profit.toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Count', 'Value']],
      body: kpiData,
      theme: 'striped',
      headStyles: { fillColor: [10, 43, 78], textColor: 255 },
      margin: { left: margin, right: margin }
    });

    y = doc.lastAutoTable.finalY + 15;

    // Monthly Orders
    doc.text('Monthly Order Trends', margin, y);
    y += 5;
    const orderRows = ordersByMonth.map(item => [
      item.month,
      item.count.toString(),
      `$${item.revenue.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Month', 'Order Count', 'Revenue']],
      body: orderRows,
      theme: 'striped',
      headStyles: { fillColor: [10, 43, 78], textColor: 255 },
      margin: { left: margin, right: margin }
    });

    y = doc.lastAutoTable.finalY + 15;

    // Monthly Purchases
    doc.text('Monthly Purchase Trends', margin, y);
    y += 5;
    const purchaseRows = purchasesByMonth.map(item => [
      item.month,
      item.count.toString(),
      `$${item.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Month', 'Purchase Count', 'Amount']],
      body: purchaseRows,
      theme: 'striped',
      headStyles: { fillColor: [10, 43, 78], textColor: 255 },
      margin: { left: margin, right: margin }
    });

    y = doc.lastAutoTable.finalY + 15;

    // Low Stock Products
    if (lowStockProducts.length > 0) {
      doc.text('Low Stock Products', margin, y);
      y += 5;
      const lowStockRows = lowStockProducts.map(p => [
        p.name,
        p.stock.toString()
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Product', 'Stock']],
        body: lowStockRows,
        theme: 'striped',
        headStyles: { fillColor: [10, 43, 78], textColor: 255 },
        margin: { left: margin, right: margin }
      });
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Confidential – For internal use only', pageWidth / 2, footerY, { align: 'center' });

    doc.save('performance_report.pdf');
  };

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
      <div className="page-header">
        <div>
          <h1>Dashboard & Reporting</h1>
          <p>Key business insights</p>
        </div>
        <button className="btn btn-primary" onClick={generatePDF}>
          <FiDownload /> Download PDF Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <FiShoppingCart className="kpi-icon" />
          <div>
            <h3>Total Orders</h3>
            <p>{totalOrders}</p>
            <div className="kpi-sub">${totalRevenue.toFixed(2)}</div>
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
            <h3>Total Purchases</h3>
            <p>{totalPurchases}</p>
            <div className="kpi-sub">${totalPurchaseAmount.toFixed(2)}</div>
          </div>
        </div>
        <div className="kpi-card">
          <FiBarChart2 className="kpi-icon" />
          <div>
            <h3>Profit</h3>
            <p>${profit.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
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
      </div>

      {/* Low Stock Products */}
      <div className="chart-container" style={{ marginTop: '1.5rem' }}>
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
    </div>
  );
};

export default ReportingPage;