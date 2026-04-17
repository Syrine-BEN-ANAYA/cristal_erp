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
import { FiPackage, FiShoppingCart, FiAlertTriangle, FiShoppingBag, FiCalendar, FiBarChart2, FiDownload } from 'react-icons/fi';
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
  const [language, setLanguage] = useState('en'); // 'en' or 'ar'

  // Translations
  const t = {
    en: {
      dashboard: 'Dashboard & Reporting',
      keyInsights: 'Key business insights',
      downloadPDF: 'Download PDF Report',
      totalOrders: 'Total Orders',
      products: 'Products',
      totalPurchases: 'Total Purchases',
      profit: 'Profit',
      lowStock: 'Low stock',
      monthlyOrders: 'Monthly Order Trends',
      monthlyPurchases: 'Monthly Purchases',
      lowStockProducts: 'Low Stock Products',
      noLowStock: 'No low stock products.',
      orderCount: 'Order count',
      revenue: 'Revenue ($)',
      purchaseCount: 'Purchase count',
      amount: 'Amount ($)',
      units: 'units',
      loading: 'Loading data...',
      error: 'Unable to load reporting data.',
      youMustLogin: 'You must be logged in to view this data.',
      generated: 'Generated',
      performanceReport: 'Performance Report',
      metric: 'Metric',
      count: 'Count',
      value: 'Value',
      month: 'Month',
      product: 'Product',
      stock: 'Stock',
      confidential: 'Confidential – For internal use only'
    },
    ar: {
      dashboard: 'لوحة المعلومات والتقارير',
      keyInsights: 'رؤى الأعمال الرئيسية',
      downloadPDF: 'تحميل تقرير PDF',
      totalOrders: 'إجمالي الطلبات',
      products: 'المنتجات',
      totalPurchases: 'إجمالي المشتريات',
      profit: 'الربح',
      lowStock: 'مخزون منخفض',
      monthlyOrders: 'اتجاهات الطلبات الشهرية',
      monthlyPurchases: 'المشتريات الشهرية',
      lowStockProducts: 'المنتجات منخفضة المخزون',
      noLowStock: 'لا توجد منتجات منخفضة المخزون.',
      orderCount: 'عدد الطلبات',
      revenue: 'الإيرادات ($)',
      purchaseCount: 'عدد المشتريات',
      amount: 'المبلغ ($)',
      units: 'وحدة',
      loading: 'جاري تحميل البيانات...',
      error: 'تعذر تحميل بيانات التقارير.',
      youMustLogin: 'يجب تسجيل الدخول لعرض هذه البيانات.',
      generated: 'تم الإنشاء',
      performanceReport: 'تقرير الأداء',
      metric: 'المقياس',
      count: 'العدد',
      value: 'القيمة',
      month: 'الشهر',
      product: 'المنتج',
      stock: 'المخزون',
      confidential: 'سري - للاستخدام الداخلي فقط'
    }
  };

  const currentLang = t[language];

  useEffect(() => {
    if (!token) {
      setError(currentLang.youMustLogin);
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
          getLowStockProducts(token)
        ]);

        setOrders(ordersData || []);
        setProducts(productsData || []);
        setPurchases(purchasesData || []);
        setLowStockProducts(lowStockData || []);
        setError(null);
      } catch (err) {
        console.error('Error loading reporting data', err);
        setError(err.message || currentLang.error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token, language]);

  // KPI calculations
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || Number(order.total) || 0), 0);
  const totalProducts = products.length;
  const totalPurchases = purchases.length;
  const totalPurchaseAmount = purchases.reduce((sum, purchase) => sum + (Number(purchase.total) || Number(purchase.totalAmount) || 0), 0);
  const lowStockCount = lowStockProducts.length;
  const profit = totalRevenue - totalPurchaseAmount;

  // Orders grouped by month
  const ordersByMonth = orders.reduce((acc, order) => {
    if (!order.createdAt) return acc;
    const date = new Date(order.createdAt);
    const monthLabel = date.toLocaleString(language === 'en' ? 'default' : 'ar-EG', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === monthLabel);
    const amount = Number(order.totalAmount) || Number(order.total) || 0;
    if (existing) {
      existing.count += 1;
      existing.revenue += amount;
    } else {
      acc.push({ month: monthLabel, sortDate: new Date(date.getFullYear(), date.getMonth(), 1), count: 1, revenue: amount });
    }
    return acc;
  }, []).sort((a, b) => a.sortDate - b.sortDate);

  // Purchases grouped by month
  const purchasesByMonth = purchases.reduce((acc, purchase) => {
    const dateValue = purchase.date || purchase.createdAt;
    if (!dateValue) return acc;
    const date = new Date(dateValue);
    const monthLabel = date.toLocaleString(language === 'en' ? 'default' : 'ar-EG', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === monthLabel);
    const amount = Number(purchase.total) || Number(purchase.totalAmount) || 0;
    if (existing) {
      existing.count += 1;
      existing.amount += amount;
    } else {
      acc.push({ month: monthLabel, sortDate: new Date(date.getFullYear(), date.getMonth(), 1), count: 1, amount });
    }
    return acc;
  }, []).sort((a, b) => a.sortDate - b.sortDate);

  // PDF generation (bilingual)
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    try { doc.addImage(logo, 'PNG', margin, y, 40, 20); } catch {}

    // Title in English & Arabic
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 43, 78);
    doc.text('AL RUBAI UNITED AL CRISTAL', pageWidth / 2, y + 8, { align: 'center' });
    doc.setFontSize(14);
    doc.text('الكريستال الرباعي المتحدة', pageWidth / 2, y + 18, { align: 'center' });

    y += 30;
    doc.setFontSize(16);
    doc.text(currentLang.performanceReport, margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${currentLang.generated}: ${new Date().toLocaleString(language === 'en' ? 'en-US' : 'ar-EG')}`, margin, y);
    y += 15;

    // KPIs
    const kpiData = [
      [currentLang.totalOrders, totalOrders.toString(), `$${totalRevenue.toFixed(2)}`],
      [currentLang.products, totalProducts.toString(), `${currentLang.lowStock}: ${lowStockCount}`],
      [currentLang.totalPurchases, totalPurchases.toString(), `$${totalPurchaseAmount.toFixed(2)}`],
      [currentLang.profit, '', `$${profit.toFixed(2)}`]
    ];
    autoTable(doc, { 
      startY: y, 
      head: [[currentLang.metric, currentLang.count, currentLang.value]], 
      body: kpiData, 
      theme: 'striped', 
      headStyles: { fillColor: [10, 43, 78], textColor: 255 }, 
      margin: { left: margin, right: margin } 
    });
    y = doc.lastAutoTable.finalY + 15;

    // Orders by month
    doc.text(currentLang.monthlyOrders, margin, y); y += 5;
    autoTable(doc, { 
      startY: y, 
      head: [[currentLang.month, currentLang.orderCount, currentLang.revenue]], 
      body: ordersByMonth.map(o => [o.month, o.count.toString(), `$${o.revenue.toFixed(2)}`]), 
      theme: 'striped', 
      headStyles: { fillColor: [10, 43, 78], textColor: 255 }, 
      margin: { left: margin, right: margin } 
    });
    y = doc.lastAutoTable.finalY + 15;

    // Purchases by month
    doc.text(currentLang.monthlyPurchases, margin, y); y += 5;
    autoTable(doc, { 
      startY: y, 
      head: [[currentLang.month, currentLang.purchaseCount, currentLang.amount]], 
      body: purchasesByMonth.map(p => [p.month, p.count.toString(), `$${p.amount.toFixed(2)}`]), 
      theme: 'striped', 
      headStyles: { fillColor: [10, 43, 78], textColor: 255 }, 
      margin: { left: margin, right: margin } 
    });
    y = doc.lastAutoTable.finalY + 15;

    // Low Stock
    if (lowStockProducts.length > 0) {
      doc.text(currentLang.lowStockProducts, margin, y); y += 5;
      autoTable(doc, { 
        startY: y, 
        head: [[currentLang.product, currentLang.stock]], 
        body: lowStockProducts.map(p => [p.name, `${p.stock} ${currentLang.units}`]), 
        theme: 'striped', 
        headStyles: { fillColor: [10, 43, 78], textColor: 255 }, 
        margin: { left: margin, right: margin } 
      });
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(currentLang.confidential, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    doc.save(`performance_report_${language}.pdf`);
  };

  if (loading) return <div className="reporting-page"><div className="loading-spinner">{currentLang.loading}</div></div>;
  if (error) return <div className="reporting-page"><div className="error-message">{error}</div></div>;

  return (
    <div className="reporting-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <div>
          <h1>{currentLang.dashboard}</h1>
          <p>{currentLang.keyInsights}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Language Toggle Button */}
          <button 
            className="btn btn-language" 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            style={{
              padding: '0.5rem 1rem',
              background: '#1a4b7a',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {language === 'en' ? 'العربية' : 'English'}
          </button>
          <button className="btn btn-primary" onClick={generatePDF}>
            <FiDownload /> {currentLang.downloadPDF}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <FiShoppingCart className="kpi-icon" />
          <div>
            <h3>{currentLang.totalOrders}</h3>
            <p>{totalOrders}</p>
            <div className="kpi-sub">${totalRevenue.toFixed(2)}</div>
          </div>
        </div>
        <div className="kpi-card">
          <FiPackage className="kpi-icon" />
          <div>
            <h3>{currentLang.products}</h3>
            <p>{totalProducts}</p>
            <div className="kpi-sub">{currentLang.lowStock}: {lowStockCount}</div>
          </div>
        </div>
        <div className="kpi-card">
          <FiShoppingBag className="kpi-icon" />
          <div>
            <h3>{currentLang.totalPurchases}</h3>
            <p>{totalPurchases}</p>
            <div className="kpi-sub">${totalPurchaseAmount.toFixed(2)}</div>
          </div>
        </div>
        <div className="kpi-card">
          <FiBarChart2 className="kpi-icon" />
          <div>
            <h3>{currentLang.profit}</h3>
            <p>${profit.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h3><FiCalendar /> {currentLang.monthlyOrders}</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8884d8" name={currentLang.orderCount} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name={currentLang.revenue} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3><FiCalendar /> {currentLang.monthlyPurchases}</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purchasesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#8884d8" name={currentLang.purchaseCount} />
              <Bar yAxisId="right" dataKey="amount" fill="#82ca9d" name={currentLang.amount} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="chart-container" style={{ marginTop: '1.5rem' }}>
        <div className="chart-header">
          <h3><FiAlertTriangle /> {currentLang.lowStockProducts}</h3>
        </div>
        {lowStockProducts.length === 0 ? (
          <p className="empty-message">{currentLang.noLowStock}</p>
        ) : (
          <ul className="low-stock-list">
            {lowStockProducts.map(p => (
              <li key={p._id || p.id}>
                <span>{p.name}</span>
                <span className="stock-value">{p.stock} {currentLang.units}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ReportingPage;