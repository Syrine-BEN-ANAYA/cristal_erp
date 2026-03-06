/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getProducts } from '../api/productsService';
import { getAllInventory } from '../api/inventoryService';
import { getOrders, deleteOrdersByMonth } from '../api/ordersService';
import { getCustomers } from '../api/customersService';
import { getSuppliers } from '../api/suppliersService';
import { getAlerts } from '../api/alertsService';
import {
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiTruck,
  FiAlertCircle,
  FiDollarSign,
  FiDownload,
  FiRotateCcw,
  FiCalendar,
  FiBarChart2,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/ReportingPage.css';

// ----------------------------------------------------------------------
// Hook personnalisé pour charger toutes les données
// ----------------------------------------------------------------------
function useReportingData(token) {
  const [state, setState] = useState({
    products: [],
    inventory: [],
    orders: [],
    customers: [],
    suppliers: [],
    alerts: [],
    loading: true,
    error: '',
  });

  const fetchData = useCallback(async () => {
    if (!token) return;
    setState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const timeout = (ms) => new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), ms)
      );
      const withTimeout = (promise, ms = 8000) => Promise.race([promise, timeout(ms)]);

      const [products, inventory, orders, customers, suppliers, alerts] = await Promise.all([
        withTimeout(getProducts(token)),
        withTimeout(getAllInventory(token)),
        withTimeout(getOrders(token)),
        withTimeout(getCustomers(token)),
        withTimeout(getSuppliers(token)),
        withTimeout(getAlerts(token)),
      ]);

      setState({
        products,
        inventory,
        orders,
        customers,
        suppliers,
        alerts,
        loading: false,
        error: '',
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load reporting data',
      }));
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

// ----------------------------------------------------------------------
// Sous-composants pour l'affichage
// ----------------------------------------------------------------------
const KPIStats = ({ products, orders, customers, suppliers, lowStockCount, revenue }) => {
  const stats = [
    { icon: FiPackage, label: 'Total Products', value: products.length },
    { icon: FiShoppingCart, label: 'Total Orders', value: orders.length },
    { icon: FiUsers, label: 'Customers', value: customers.length },
    { icon: FiTruck, label: 'Suppliers', value: suppliers.length },
    { icon: FiAlertCircle, label: 'Low Stock Items', value: lowStockCount, warning: true },
    { icon: FiDollarSign, label: 'Total Revenue', value: `$${revenue.toFixed(2)}` },
  ];

  return (
    <div className="stats-grid">
      {stats.map(({ icon: Icon, label, value, warning }) => (
        <div key={label} className={`stat-card ${warning ? 'warning' : ''}`}>
          <Icon className="stat-icon" />
          <div>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const DailyChart = ({ data, monthLabel, chartType, setChartType }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Daily Activity - {monthLabel}</h3>
        <div className="chart-toggle">
          <button
            className={`toggle-btn ${chartType === 'count' ? 'active' : ''}`}
            onClick={() => setChartType('count')}
          >
            <FiBarChart2 /> Orders
          </button>
          <button
            className={`toggle-btn ${chartType === 'revenue' ? 'active' : ''}`}
            onClick={() => setChartType('revenue')}
          >
            <FiDollarSign /> Revenue
          </button>
        </div>
      </div>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              tickFormatter={chartType === 'revenue' ? (v) => `$${v}` : undefined}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                return [value, 'Orders'];
              }}
            />
            {chartType === 'count' ? (
              <Line yAxisId="left" type="monotone" dataKey="count" stroke="#1a4b7a" strokeWidth={2} />
            ) : (
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="empty-message">No data for this month.</p>
      )}
    </div>
  );
};

const FilterBar = ({
  selectedMonth,
  onMonthChange,
  onApply,
  onReset,
  onExportPDF,
  onResetMonth,
}) => (
  <div className="filter-bar">
    <div className="filter-group">
      <FiCalendar className="filter-icon" />
      <input
        type="month"
        value={selectedMonth}
        onChange={onMonthChange}
        className="month-input"
      />
      <button onClick={onApply} className="btn btn-secondary">Apply</button>
      <button onClick={onReset} className="btn btn-secondary">Current Month</button>
    </div>
    <div className="action-group">
      <button onClick={onExportPDF} className="btn btn-secondary">
        <FiDownload /> PDF
      </button>
      <button onClick={onResetMonth} className="btn btn-destructive">
        <FiRotateCcw /> Reset Month
      </button>
    </div>
  </div>
);

const RecentOrdersTable = ({ orders, customers }) => {
  return (
    <div className="table-container">
      <h3 className="table-title">Recent Orders (Global)</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => {
              const customer = customers.find(c => c._id === order.customerId);
              return (
                <tr key={order._id}>
                  <td>{order._id?.slice(-6) || 'N/A'}</td>
                  <td>{customer?.name || order.customerId}</td>
                  <td>${(order.total || 0).toFixed(2)}</td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="empty-message">No recent orders</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const LowStockTable = ({ items }) => {
  return (
    <div className="table-container">
      <h3 className="table-title">Low Stock Alerts</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Current Stock</th>
            <th>Threshold</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.productId}>
                <td>{item.productName || 'Unknown'}</td>
                <td className="low-stock-value">{Math.round(item.totalQuantity)}</td>
                <td>{item.threshold}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="empty-message">All products above threshold</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ----------------------------------------------------------------------
// Composant principal
// ----------------------------------------------------------------------
export default function ReportingPage({ token }) {
  const {
    products,
    inventory,
    orders,
    customers,
    suppliers,
    alerts,
    loading,
    error,
    refetch,
  } = useReportingData(token);

  const [chartType, setChartType] = useState('count');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [displayMonth, setDisplayMonth] = useState(selectedMonth);

  // Calcul des KPIs à partir des données brutes et du mois affiché
  const {
    filteredOrders,
    totalRevenue,
    ordersByDay,
    recentOrders,
    lowStockProducts,
    lowStockCount,
  } = useMemo(() => {
    if (!orders.length) {
      return {
        filteredOrders: [],
        totalRevenue: 0,
        ordersByDay: [],
        recentOrders: [],
        lowStockProducts: [],
        lowStockCount: 0,
      };
    }

    // Filtrer les commandes par mois
    const [year, month] = displayMonth.split('-').map(Number);
    const filtered = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    // Chiffre d'affaires
    const revenue = filtered.reduce((acc, o) => acc + (o.total || 0), 0);

    // Agrégation par jour pour le graphique
    const days = {};
    filtered.forEach(o => {
      if (o.createdAt) {
        const date = new Date(o.createdAt).toISOString().split('T')[0];
        if (!days[date]) {
          days[date] = { count: 0, revenue: 0 };
        }
        days[date].count += 1;
        days[date].revenue += o.total || 0;
      }
    });
    const chartData = Object.keys(days)
      .sort()
      .map(key => ({
        date: key,
        count: days[key].count,
        revenue: days[key].revenue,
      }));

    // 5 dernières commandes (globales, pas seulement du mois)
    const sortedGlobal = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recent = sortedGlobal.slice(0, 5);

    // Produits en stock faible
    const lowStock = [];
    inventory.forEach(item => {
      const alert = alerts.find(a => a.productId === item.productId);
      if (alert && item.totalQuantity <= alert.threshold) {
        lowStock.push({
          ...item,
          threshold: alert.threshold,
          productName: products.find(p => p._id === item.productId)?.name || item.productId,
        });
      }
    });

    return {
      filteredOrders: filtered,
      totalRevenue: revenue,
      ordersByDay: chartData,
      recentOrders: recent,
      lowStockProducts: lowStock,
      lowStockCount: lowStock.length,
    };
  }, [orders, displayMonth, inventory, alerts, products]);

  // Libellé du mois pour l'affichage
  const monthLabel = useMemo(() => {
    const [year, month] = displayMonth.split('-').map(Number);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[month - 1]} ${year}`;
  }, [displayMonth]);

  // Gestionnaires d'événements
  const handleMonthChange = (e) => setSelectedMonth(e.target.value);
  const applyMonthFilter = () => setDisplayMonth(selectedMonth);
  const resetMonthFilter = () => {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(current);
    setDisplayMonth(current);
  };

  const handleResetMonth = async () => {
    if (!window.confirm(`Delete all orders for ${displayMonth}? This cannot be undone.`)) return;
    try {
      await deleteOrdersByMonth(displayMonth, token);
      alert(`Orders for ${displayMonth} deleted.`);
      refetch(); // Recharger les données
    } catch (err) {
      alert(err.message || 'Failed to reset month');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Reporting - ${monthLabel}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 32);
    doc.text(`Total Orders: ${filteredOrders.length}`, 14, 38);
    doc.text(`Low Stock Items: ${lowStockCount}`, 14, 44);

    autoTable(doc, {
      startY: 50,
      head: [['Order ID', 'Customer', 'Total', 'Date']],
      body: recentOrders.map(o => {
        const customer = customers.find(c => c._id === o.customerId);
        return [
          o._id.slice(-6),
          customer?.name || o.customerId,
          `$${(o.total || 0).toFixed(2)}`,
          new Date(o.createdAt).toLocaleDateString(),
        ];
      }),
    });
    doc.save(`reporting_${displayMonth}.pdf`);
  };

  if (loading) {
    return (
      <div className="reporting-page">
        <div className="loading-spinner">Loading...</div>
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
        <h2 className="page-title">Reporting & KPIs</h2>
        <p className="page-subtitle">Key performance indicators for your olive oil business</p>
      </div>

      <KPIStats
        products={products}
        orders={filteredOrders}
        customers={customers}
        suppliers={suppliers}
        lowStockCount={lowStockCount}
        revenue={totalRevenue}
      />

      <DailyChart
        data={ordersByDay}
        monthLabel={monthLabel}
        chartType={chartType}
        setChartType={setChartType}
      />

      <FilterBar
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onApply={applyMonthFilter}
        onReset={resetMonthFilter}
        onExportPDF={exportToPDF}
        onResetMonth={handleResetMonth}
      />

      <div className="tables-grid">
        <RecentOrdersTable orders={recentOrders} customers={customers} />
        <LowStockTable items={lowStockProducts} />
      </div>
    </div>
  );
}