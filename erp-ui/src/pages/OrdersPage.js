// src/pages/OrdersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  getOrders, createOrder, updateOrder, deleteOrder, getTotalOrderAmount 
} from '../api/ordersService';
import { getProducts } from '../api/productsService';
import { getCustomers } from '../api/customersService';
import { 
  FiPackage, FiUser, FiShoppingCart, FiPlus, FiTrash2, FiX, 
  FiDollarSign, FiEdit2, FiDownload, FiCheckCircle 
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/OrdersPage.css';

// Helper functions
const normalizeId = (objOrId) => {
  if (!objOrId) return '';
  if (typeof objOrId === 'string') return objOrId;
  return objOrId?._id || '';
};

const formatMoney = (value) => {
  const numericValue = Number(value) || 0;
  return `$${numericValue.toFixed(2)}`;
};

const calculateOrderTotal = (items, products) => {
  if (!items || !products) return 0;
  return items.reduce((total, item) => {
    const productId = normalizeId(item.productId);
    const product = products.find(p => p._id === productId);
    const itemPrice = product?.price || 0;
    const itemQuantity = item.quantity || 0;
    return total + (itemPrice * itemQuantity);
  }, 0);
};

export default function OrdersPage({ token }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // Form state
  const [form, setForm] = useState({
    _id: null,
    customerId: '',
    items: [{ id: Date.now(), productId: '', quantity: 1 }]
  });

  // Load data
  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [ordersData, productsData, customersData] = await Promise.all([
        getOrders(token),
        getProducts(token),
        getCustomers(token)
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setCustomers(customersData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadTotalAmount = useCallback(async () => {
    try {
      const data = await getTotalOrderAmount(token);
      setTotalOrderAmount(data.totalOrderAmount || 0);
    } catch (err) {
      console.error('Failed to load total amount:', err);
    }
  }, [token]);

  useEffect(() => {
    loadData();
    loadTotalAmount();
  }, [loadData, loadTotalAmount]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (itemId, field, value) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), productId: '', quantity: 1 }]
    }));
  };

  const removeItem = (itemId) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const resetForm = () => {
    setForm({
      _id: null,
      customerId: '',
      items: [{ id: Date.now(), productId: '', quantity: 1 }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId) {
      setError('Please select a customer');
      return;
    }
    if (form.items.some(item => !item.productId || item.quantity <= 0)) {
      setError('Fill all items correctly');
      return;
    }

    try {
      const payload = {
        customerId: normalizeId(form.customerId),
        items: form.items.map(item => ({
          productId: normalizeId(item.productId),
          quantity: item.quantity
        }))
      };

      if (form._id) {
        await updateOrder(form._id, payload, token);
        setPopupMessage('Order updated successfully!');
      } else {
        await createOrder(payload, token);
        setPopupMessage('Order created successfully!');
      }
      
      resetForm();
      loadData();
      loadTotalAmount();
      setError('');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving order');
    }
  };

  const handleEdit = (order) => {
    setForm({
      _id: order._id,
      customerId: order.customerId?._id || order.customerId,
      items: order.items.map((item, idx) => ({
        id: Date.now() + idx,
        productId: item.productId?._id || item.productId,
        quantity: item.quantity
      }))
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await deleteOrder(id, token);
      loadData();
      loadTotalAmount();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete order');
    }
  };

  // PDF Generation
  const generateInvoicePDF = (order) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 43, 78);
      doc.text('UNITED AL RUBAI AL CRISTAL', pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(16);
      doc.text('ORDER INVOICE', pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Order ID: ${order._id.slice(-8)}`, margin, y);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, margin, y + 6);
      
      // Customer info
      const customer = customers.find(c => c._id === (order.customerId?._id || order.customerId));
      if (customer) {
        doc.text(`Customer: ${customer.name}`, margin, y + 18);
        if (customer.email) doc.text(`Email: ${customer.email}`, margin, y + 24);
        if (customer.phone) doc.text(`Phone: ${customer.phone}`, margin, y + 30);
      }

      y += 45;
      
      // Items table
      const tableColumn = ['Product', 'Quantity', 'Unit Price', 'Total'];
      const tableRows = order.items.map(item => {
        const product = products.find(p => p._id === (item.productId?._id || item.productId));
        const productName = product?.name || 'Unknown';
        const quantity = item.quantity;
        const unitPrice = product?.price || 0;
        const total = unitPrice * quantity;
        return [productName, quantity.toString(), formatMoney(unitPrice), formatMoney(total)];
      });
      
      autoTable(doc, {
        startY: y,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [10, 43, 78], textColor: 255 },
        margin: { left: margin, right: margin }
      });
      
      const finalY = doc.lastAutoTable.finalY + 10;
      const total = order.totalAmount || calculateOrderTotal(order.items, products);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount: ${formatMoney(total)}`, pageWidth - margin, finalY, { align: 'right' });
      
      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
      
      doc.save(`invoice_${order._id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    }
  };

  if (loading) return <div className="orders-page"><div className="loading">Loading orders…</div></div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage customer orders</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Success Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <FiCheckCircle className="popup-icon" />
            <h3>Success!</h3>
            <p>{popupMessage}</p>
            <button className="popup-close" onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <FiShoppingCart className="kpi-icon" />
          <div>
            <h3>Total Orders</h3>
            <p>{orders.length}</p>
          </div>
        </div>
        <div className="kpi-card">
          <FiDollarSign className="kpi-icon" />
          <div>
            <h3>Total Revenue</h3>
            <p>{formatMoney(totalOrderAmount)}</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <h3><FiShoppingCart /> {form._id ? 'Edit Order' : 'New Order'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label><FiUser /> Customer *</label>
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
              >
                <option value="">Select a customer</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="items-section">
            <label><FiPackage /> Products *</label>
            <div className="item-row-header">
              <span>Product</span>
              <span>Quantity</span>
              <span></span>
            </div>
            {form.items.map((item, index) => (
              <div key={item.id} className="item-row">
                <select
                  value={item.productId}
                  onChange={e => handleItemChange(item.id, 'productId', e.target.value)}
                  required
                >
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} - {formatMoney(p.price)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                  required
                />
                {form.items.length > 1 && (
                  <button type="button" className="remove-btn" onClick={() => removeItem(item.id)}>
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-item-btn" onClick={addItem}>
              <FiPlus /> Add Product
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {form._id ? <><FiEdit2 /> Update Order</> : <><FiPlus /> Create Order</>}
            </button>
            {form._id && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FiX /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <h3><FiShoppingCart /> Order List</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="6" className="empty-message">No orders found.</td></tr>
            ) : (
              orders.map(order => {
                const customer = customers.find(c => c._id === (order.customerId?._id || order.customerId));
                const total = order.totalAmount || calculateOrderTotal(order.items, products);
                return (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>{customer?.name || '—'}</td>
                    <td>{order.items?.length || 0}</td>
                    <td>{formatMoney(total)}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button className="icon-btn" onClick={() => handleEdit(order)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(order._id)} title="Delete">
                        <FiTrash2 />
                      </button>
                      <button className="icon-btn" onClick={() => generateInvoicePDF(order)} title="Download PDF">
                        <FiDownload />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}