// ReportingPage.js - Version modernisée
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FiPackage, FiShoppingCart, FiAlertTriangle, FiShoppingBag, 
  FiCalendar, FiBarChart2, FiDownload, FiGlobe, FiTrendingUp, 
  FiTrendingDown, FiDollarSign, FiPieChart, FiRefreshCw,
  FiCheckCircle, FiXCircle
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
  const [language, setLanguage] = useState('en');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState('line');

  const translations = {
    en: {
      dashboard: 'Analytics Dashboard',
      keyInsights: 'Real-time business intelligence & performance metrics',
      downloadPDF: 'Export Report',
      refresh: 'Refresh Data',
      totalOrders: 'Total Orders',
      products: 'Products',
      totalPurchases: 'Total Purchases',
      profit: 'Net Profit',
      lowStock: 'Low Stock',
      monthlyOrders: 'Order Trends',
      monthlyPurchases: 'Purchase Trends',
      lowStockProducts: 'Inventory Alerts',
      noLowStock: 'All products are well stocked ✓',
      orderCount: 'Orders',
      revenue: 'Revenue',
      purchaseCount: 'Purchases',
      amount: 'Amount',
      units: 'units',
      loading: 'Loading dashboard data...',
      error: 'Unable to load reporting data.',
      youMustLogin: 'Please login to view analytics',
      generated: 'Generated',
      performanceReport: 'Performance Report',
      metric: 'Metric',
      count: 'Count',
      value: 'Value',
      month: 'Month',
      product: 'Product',
      stock: 'Stock Level',
      confidential: 'Confidential – Internal Use Only',
      profitMargin: 'Profit Margin',
      avgOrderValue: 'Avg Order Value',
      topProducts: 'Top Products',
      revenueDistribution: 'Revenue Distribution',
      vsLastMonth: 'vs last month',
      increase: 'Increase',
      decrease: 'Decrease'
    },
    ar: {
      dashboard: 'لوحة التحليل',
      keyInsights: 'ذكاء الأعمال ومقاييس الأداء في الوقت الفعلي',
      downloadPDF: 'تصدير التقرير',
      refresh: 'تحديث البيانات',
      totalOrders: 'إجمالي الطلبات',
      products: 'المنتجات',
      totalPurchases: 'إجمالي المشتريات',
      profit: 'صافي الربح',
      lowStock: 'مخزون منخفض',
      monthlyOrders: 'اتجاهات الطلبات',
      monthlyPurchases: 'اتجاهات المشتريات',
      lowStockProducts: 'تنبيهات المخزون',
      noLowStock: 'جميع المنتجات متوفرة بشكل جيد ✓',
      orderCount: 'الطلبات',
      revenue: 'الإيرادات',
      purchaseCount: 'المشتريات',
      amount: 'المبلغ',
      units: 'وحدة',
      loading: 'جاري تحميل بيانات لوحة المعلومات...',
      error: 'تعذر تحميل بيانات التقارير',
      youMustLogin: 'الرجاء تسجيل الدخول لعرض التحليلات',
      generated: 'تم الإنشاء',
      performanceReport: 'تقرير الأداء',
      metric: 'المقياس',
      count: 'العدد',
      value: 'القيمة',
      month: 'الشهر',
      product: 'المنتج',
      stock: 'مستوى المخزون',
      confidential: 'سري - للاستخدام الداخلي فقط',
      profitMargin: 'هامش الربح',
      avgOrderValue: 'متوسط قيمة الطلب',
      topProducts: 'أفضل المنتجات',
      revenueDistribution: 'توزيع الإيرادات',
      vsLastMonth: 'مقارنة بالشهر الماضي',
      increase: 'زيادة',
      decrease: 'انخفاض'
    }
  };

  const currentLang = translations[language];
  const isRTL = language === 'ar';

  // Colors for charts
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

  // Fetch data with refresh capability
  const fetchAllData = useCallback(async (showRefresh = false) => {
    if (!token) {
      setError(currentLang.youMustLogin);
      setLoading(false);
      return;
    }

    if (showRefresh) setRefreshing(true);
    else setLoading(true);

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
      setRefreshing(false);
    }
  }, [token, currentLang.error, currentLang.youMustLogin]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Memoized calculations for performance
  const metrics = useMemo(() => {
    const totalOrdersCount = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || Number(order.total) || 0), 0);
    const totalProductsCount = products.length;
    const totalPurchasesCount = purchases.length;
    const totalPurchaseAmount = purchases.reduce((sum, purchase) => sum + (Number(purchase.total) || Number(purchase.totalAmount) || 0), 0);
    const lowStockCount = lowStockProducts.length;
    const profit = totalRevenue - totalPurchaseAmount;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    // Calculate previous month comparison
    const currentMonth = new Date().getMonth();
    const currentMonthOrders = orders.filter(order => {
      const date = new Date(order.createdAt);
      return date.getMonth() === currentMonth;
    }).length;
    const previousMonthOrders = orders.filter(order => {
      const date = new Date(order.createdAt);
      return date.getMonth() === currentMonth - 1;
    }).length;
    const orderTrend = previousMonthOrders > 0 
      ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100 
      : 0;

    return {
      totalOrders: totalOrdersCount,
      totalRevenue,
      totalProducts: totalProductsCount,
      totalPurchases: totalPurchasesCount,
      totalPurchaseAmount,
      lowStockCount,
      profit,
      profitMargin,
      avgOrderValue,
      orderTrend
    };
  }, [orders, products, purchases, lowStockProducts]);

  // Orders grouped by month
  const ordersByMonth = useMemo(() => {
    return orders.reduce((acc, order) => {
      if (!order.createdAt) return acc;
      const date = new Date(order.createdAt);
      const monthLabel = date.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG', { month: 'short', year: 'numeric' });
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
  }, [orders, language]);

  // Purchases grouped by month
  const purchasesByMonth = useMemo(() => {
    return purchases.reduce((acc, purchase) => {
      const dateValue = purchase.date || purchase.createdAt;
      if (!dateValue) return acc;
      const date = new Date(dateValue);
      const monthLabel = date.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG', { month: 'short', year: 'numeric' });
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
  }, [purchases, language]);

  // Top products by sales
  const topProducts = useMemo(() => {
    const productSales = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productName = item.product?.name || item.name;
          if (productName) {
            productSales[productName] = (productSales[productName] || 0) + (item.quantity || 1);
          }
        });
      }
    });
    return Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders]);

  // Revenue distribution data for pie chart
  const revenueDistribution = useMemo(() => {
    const categoryRevenue = {};
    orders.forEach(order => {
      const amount = Number(order.totalAmount) || Number(order.total) || 0;
      const category = order.category || 'Other';
      categoryRevenue[category] = (categoryRevenue[category] || 0) + amount;
    });
    return Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Add logo
    try { 
      doc.addImage(logo, 'PNG', margin, y, 40, 20); 
    } catch(e) {}

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 43, 78);
    doc.text('AL RUBAI UNITED AL CRISTAL', pageWidth / 2, y + 8, { align: 'center' });
    doc.setFontSize(14);

    y += 30;
    doc.setFontSize(16);
    doc.text(currentLang.performanceReport, margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${currentLang.generated}: ${new Date().toLocaleString(language === 'en' ? 'en-US' : 'ar-EG')}`, margin, y);
    y += 15;

    // KPIs Table
    const kpiData = [
      [currentLang.totalOrders, metrics.totalOrders.toString(), `$${metrics.totalRevenue.toFixed(2)}`],
      [currentLang.products, metrics.totalProducts.toString(), `${currentLang.lowStock}: ${metrics.lowStockCount}`],
      [currentLang.totalPurchases, metrics.totalPurchases.toString(), `$${metrics.totalPurchaseAmount.toFixed(2)}`],
      [currentLang.profit, `${metrics.profitMargin.toFixed(1)}%`, `$${metrics.profit.toFixed(2)}`],
      [currentLang.avgOrderValue, '', `$${metrics.avgOrderValue.toFixed(2)}`]
    ];
    
    autoTable(doc, { 
      startY: y, 
      head: [[currentLang.metric, currentLang.count, currentLang.value]], 
      body: kpiData, 
      theme: 'striped', 
      headStyles: { fillColor: [102, 126, 234], textColor: 255 }, 
      margin: { left: margin, right: margin } 
    });
    y = doc.lastAutoTable.finalY + 15;

    // Orders by month
    if (ordersByMonth.length > 0) {
      doc.text(currentLang.monthlyOrders, margin, y); 
      y += 5;
      autoTable(doc, { 
        startY: y, 
        head: [[currentLang.month, currentLang.orderCount, currentLang.revenue]], 
        body: ordersByMonth.map(o => [o.month, o.count.toString(), `$${o.revenue.toFixed(2)}`]), 
        theme: 'striped', 
        headStyles: { fillColor: [102, 126, 234], textColor: 255 }, 
        margin: { left: margin, right: margin } 
      });
      y = doc.lastAutoTable.finalY + 15;
    }

    // Low Stock
    if (lowStockProducts.length > 0) {
      doc.text(currentLang.lowStockProducts, margin, y); 
      y += 5;
      autoTable(doc, { 
        startY: y, 
        head: [[currentLang.product, currentLang.stock]], 
        body: lowStockProducts.map(p => [p.name, `${p.stock} ${currentLang.units}`]), 
        theme: 'striped', 
        headStyles: { fillColor: [102, 126, 234], textColor: 255 }, 
        margin: { left: margin, right: margin } 
      });
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(currentLang.confidential, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    doc.save(`performance_report_${language}.pdf`);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((p, index) => (
            <p key={index} className="tooltip-value" style={{ color: p.color }}>
              {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="reporting-page-modern">
        <div className="loading-screen-modern">
          <div className="loading-spinner-premium">
            <div className="spinner-ring-premium"></div>
          </div>
          <p>{currentLang.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reporting-page-modern">
        <div className="error-state">
          <FiXCircle size={48} />
          <h3>{currentLang.error}</h3>
          <p>{error}</p>
          <button onClick={() => fetchAllData()} className="btn-retry">
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`reporting-page-modern ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background */}
      <div className="reporting-bg-animation">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      {/* Header */}
      <div className="reporting-header">
        <div className="header-left">
          <div className="header-icon-wrapper">
            <FiBarChart2 size={32} />
          </div>
          <div>
            <h1>{currentLang.dashboard}</h1>
            <p>{currentLang.keyInsights}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-language" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
            <FiGlobe /> {language === 'en' ? 'العربية' : 'English'}
          </button>
          <button className="btn-refresh" onClick={() => fetchAllData(true)} disabled={refreshing}>
            <FiRefreshCw className={refreshing ? 'spinning' : ''} /> 
            {currentLang.refresh}
          </button>
          <button className="btn-export" onClick={generatePDF}>
            <FiDownload /> {currentLang.downloadPDF}
          </button>
        </div>
      </div>

        {/* KPI Cards avec couleurs harmonisées */}
      <div className="kpi-grid-modern">
        <div className="kpi-card-premium">
          <div className="kpi-icon-wrapper" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiShoppingCart />
          </div>
          <div className="kpi-content">
            <h3>{currentLang.totalOrders}</h3>
            <div className="kpi-value">{metrics.totalOrders}</div>
            <div className="kpi-trend positive">
              <FiTrendingUp />
              <span>{metrics.orderTrend.toFixed(1)}% {currentLang.vsLastMonth}</span>
            </div>
          </div>
          <div className="kpi-footer">${metrics.totalRevenue.toFixed(2)} revenue</div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-wrapper" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiPackage />
          </div>
          <div className="kpi-content">
            <h3>{currentLang.products}</h3>
            <div className="kpi-value">{metrics.totalProducts}</div>
            <div className="kpi-sub">{currentLang.lowStock}: {metrics.lowStockCount}</div>
          </div>
          <div className="kpi-footer">Active inventory items</div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-wrapper" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiShoppingBag />
          </div>
          <div className="kpi-content">
            <h3>{currentLang.totalPurchases}</h3>
            <div className="kpi-value">{metrics.totalPurchases}</div>
            <div className="kpi-sub">${metrics.totalPurchaseAmount.toFixed(2)} spent</div>
          </div>
          <div className="kpi-footer">Procurement total</div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-wrapper" style={{ background: 'linear-gradient(135deg, #d4af37, #c9a52c)' }}>
            <FiDollarSign />
          </div>
          <div className="kpi-content">
            <h3>{currentLang.profit}</h3>
            <div className="kpi-value">${metrics.profit.toFixed(2)}</div>
            <div className="kpi-sub">{currentLang.profitMargin}: {metrics.profitMargin.toFixed(1)}%</div>
          </div>
          <div className="kpi-footer">{currentLang.avgOrderValue}: ${metrics.avgOrderValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="chart-type-selector">
        <button className={selectedChart === 'line' ? 'active' : ''} onClick={() => setSelectedChart('line')}>
          <FiTrendingUp /> Line Chart
        </button>
        <button className={selectedChart === 'area' ? 'active' : ''} onClick={() => setSelectedChart('area')}>
          <FiPieChart /> Area Chart
        </button>
        <button className={selectedChart === 'bar' ? 'active' : ''} onClick={() => setSelectedChart('bar')}>
          <FiBarChart2 /> Bar Chart
        </button>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid-modern">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3><FiCalendar /> {currentLang.monthlyOrders}</h3>
            <span className="chart-badge">Orders vs Revenue</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            {selectedChart === 'line' && (
              <LineChart data={ordersByMonth}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#d4af37" strokeWidth={2} dot={{ r: 4 }} name={currentLang.orderCount} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2} dot={{ r: 4 }} name={currentLang.revenue} />
              </LineChart>
            )}
            {selectedChart === 'area' && (
              <AreaChart data={ordersByMonth}>
                <defs>
                  <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="revenueGradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Area yAxisId="left" type="monotone" dataKey="count" stroke="#d4af37" fill="url(#countGradient)" name={currentLang.orderCount} />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#667eea" fill="url(#revenueGradientArea)" name={currentLang.revenue} />
              </AreaChart>
            )}
            {selectedChart === 'bar' && (
              <BarChart data={ordersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Bar yAxisId="left" dataKey="count" fill="#d4af37" radius={[8, 8, 0, 0]} name={currentLang.orderCount} />
                <Bar yAxisId="right" dataKey="revenue" fill="#667eea" radius={[8, 8, 0, 0]} name={currentLang.revenue} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3><FiCalendar /> {currentLang.monthlyPurchases}</h3>
            <span className="chart-badge">Purchases vs Amount</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={purchasesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis yAxisId="left" stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar yAxisId="left" dataKey="count" fill="#4facfe" radius={[8, 8, 0, 0]} name={currentLang.purchaseCount} />
              <Bar yAxisId="right" dataKey="amount" fill="#43e97b" radius={[8, 8, 0, 0]} name={currentLang.amount} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="secondary-charts-grid">
        {topProducts.length > 0 && (
          <div className="chart-card">
            <div className="chart-card-header">
              <h3><FiTrendingUp /> {currentLang.topProducts}</h3>
            </div>
            <div className="top-products-list">
              {topProducts.map((product, index) => (
                <div key={index} className="top-product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <div className="product-sales-bar">
                      <div 
                        className="sales-fill" 
                        style={{ width: `${(product.sales / topProducts[0].sales) * 100}%`, background: COLORS[index % COLORS.length] }}
                      ></div>
                    </div>
                  </div>
                  <div className="product-sales">{product.sales} units</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {revenueDistribution.length > 0 && (
          <div className="chart-card">
            <div className="chart-card-header">
              <h3><FiPieChart /> {currentLang.revenueDistribution}</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={revenueDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {revenueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      <div className="alert-card">
        <div className="alert-header">
          <h3><FiAlertTriangle /> {currentLang.lowStockProducts}</h3>
          {lowStockProducts.length > 0 && <span className="alert-badge">{lowStockProducts.length} items</span>}
        </div>
        {lowStockProducts.length === 0 ? (
          <div className="alert-success">
            <FiCheckCircle size={24} />
            <span>{currentLang.noLowStock}</span>
          </div>
        ) : (
          <div className="low-stock-grid">
            {lowStockProducts.map(p => (
              <div key={p._id || p.id} className="low-stock-item">
                <div className="stock-icon">⚠️</div>
                <div className="stock-info">
                  <div className="stock-name">{p.name}</div>
                  <div className="stock-level">
                    <div className="stock-bar" style={{ width: `${Math.min((p.stock / 20) * 100, 100)}%`, background: '#ef4444' }}></div>
                    <span>{p.stock} {currentLang.units} remaining</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportingPage;