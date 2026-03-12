import React, { useEffect, useState, useCallback } from 'react';
import { getOrders, createOrder, deleteOrder, getTotalOrderAmount } from '../api/ordersService';
import { getProducts } from '../api/productsService';
import { getCustomers } from '../api/customersService';
import { FiPackage, FiUser, FiShoppingCart, FiPlus, FiTrash2, FiX, FiDownload, FiDollarSign } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';
import '../styles/OrdersPage.css';

export default function OrdersPage({ token }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ customerId: '', items: [{ productId: '', quantity: 1 }] });

  // --- Helpers ---
  const formatMoney = (value) => `$${(Number(value) || 0).toFixed(2)}`;
  const normalizeId = (objOrId) => (typeof objOrId === 'string' ? objOrId : objOrId?._id);

  const calculateTotal = (items) => {
    return items.reduce((acc, item) => {
      const productId = normalizeId(item.productId);
      const product = products.find(p => p._id === productId);
      return acc + (product?.price || 0) * (item.quantity || 0);
    }, 0);
  };

  // --- Load data ---
  const loadProducts = useCallback(async () => {
    try { setProducts(await getProducts(token)); } catch { }
  }, [token]);

  const loadCustomers = useCallback(async () => {
    try { setCustomers(await getCustomers(token)); } catch { }
  }, [token]);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders(token);
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadTotalAmount = useCallback(async () => {
    try {
      const data = await getTotalOrderAmount(token);
      setTotalOrderAmount(data.totalOrderAmount || 0);
    } catch (err) {
      console.error('Failed to load total order amount:', err.message);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadProducts();
    loadCustomers();
    loadOrders();
    loadTotalAmount();
  }, [token, loadProducts, loadCustomers, loadOrders, loadTotalAmount]);

  // --- Form handlers ---
  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = field === 'quantity' ? Number(value) : value;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1 }] });
  const removeItem = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => setForm({ customerId: '', items: [{ productId: '', quantity: 1 }] });

  const handleCreateOrder = async () => {
    if (!form.customerId) { setError('Please select a customer'); return; }
    if (form.items.some(i => !i.productId || i.quantity <= 0)) { setError('Fill all items correctly'); return; }
    setError('');

    const payload = {
      customerId: normalizeId(form.customerId),
      items: form.items.map(i => ({ productId: normalizeId(i.productId), quantity: i.quantity })),
    };

    try {
      await createOrder(payload, token);
      resetForm();
      await loadOrders();
      await loadProducts();
      await loadTotalAmount(); // recharger le total après création
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error creating order');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await deleteOrder(id, token);
      await loadOrders();
      await loadProducts();
      await loadTotalAmount(); // recharger le total après suppression
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete order');
    }
  };

  // --- Generate Invoice PDF (Redesigned) ---
  const generateInvoice = (order) => {
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

    // Company header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 43, 78);
    doc.text('UNITED AL RUBAI AL CRISTAL', pageWidth / 2, y + 10, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Muscat, Oman', pageWidth - margin, y + 18, { align: 'right' });
    doc.text('Email: info@cristal.om', pageWidth - margin, y + 23, { align: 'right' });

    y += 30;

    // Invoice title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER INVOICE', margin, y);

    y += 10;

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');

    const invoiceNumber = `ORD-${order._id.slice(-8)}`;
    doc.text(`Invoice #: ${invoiceNumber}`, margin, y);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-GB')}`, margin, y + 5);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, margin, y + 10);

    // Customer Info
    const customerObj = typeof order.customerId === 'object' ? order.customerId : customers.find(c => c._id === order.customerId);
    if (customerObj) {
      doc.text('Customer:', pageWidth - margin - 60, y);
      doc.setFont('helvetica', 'bold');
      doc.text(customerObj.name || 'N/A', pageWidth - margin - 60, y + 5);
      doc.setFont('helvetica', 'normal');
      if (customerObj.address) doc.text(customerObj.address, pageWidth - margin - 60, y + 10);
      if (customerObj.phone) doc.text(`Phone: ${customerObj.phone}`, pageWidth - margin - 60, y + 15);
      if (customerObj.email) doc.text(`Email: ${customerObj.email}`, pageWidth - margin - 60, y + 20);
    }

    y += 30; // space before table

    // Table columns
    const tableColumn = ['Product', 'Quantity', 'Unit Price (USD)', 'Total (USD)'];
    const tableRows = order.items.map(item => {
      const productId = normalizeId(item.productId);
      const product = products.find(p => p._id === productId);
      const productName = product?.name || 'Unknown';
      const quantity = item.quantity;
      const price = product?.price || 0;
      const total = price * quantity;
      return [productName, quantity, price.toFixed(2), total.toFixed(2)];
    });

    // Auto table
    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [10, 43, 78], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const total = order.total || tableRows.reduce((sum, row) => sum + parseFloat(row[3]), 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Amount: $${total.toFixed(2)}`, pageWidth - margin - 50, finalY);

    // Bank details
    const bankY = finalY + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Bank Muscat', margin, bankY + 5);
    doc.text('Account Number: 0123 4567 8901 2345', margin, bankY + 10);
    doc.text('IBAN: OM12 3456 7890 1234 5678 9012', margin, bankY + 15);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`order_invoice_${order._id}.pdf`);
  };

  if (loading) return <div className="orders-page"><div className="loading-spinner">Loading…</div></div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage customer orders</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
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
            <p>${totalOrderAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <h3><FiShoppingCart /> New Order</h3>

        <div className="form-grid">
          <div className="input-group">
            <label><FiUser /> Customer</label>
            <select name="customerId" value={normalizeId(form.customerId)} onChange={handleChange} required>
              <option value="">Select customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="items-section">
          <label><FiPackage /> Products</label>
          <div className="item-row-header">
            <span>Product</span>
            <span>Quantity</span>
            <span></span>
          </div>
          {form.items.map((item, index) => (
            <div key={index} className="item-row">
              <select
                value={normalizeId(item.productId)}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                required
              >
                <option value="">Select product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                required
              />
              {form.items.length > 1 && (
                <button type="button" className="icon-btn remove-btn" onClick={() => removeItem(index)}>
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
          <button className="btn btn-primary" onClick={handleCreateOrder}>
            <FiPlus /> Create Order
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <h3><FiShoppingCart /> Order List</h3>
        <table className="data-table">
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
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-message">No orders found.</td>
              </tr>
            )}
            {orders.map(o => {
              const customerObj = typeof o.customerId === 'object' ? o.customerId : customers.find(c => c._id === o.customerId);
              return (
                <tr key={o._id}>
                  <td>{o._id.slice(-6)}</td>
                  <td>{customerObj?.name || normalizeId(o.customerId)}</td>
                  <td>{o.items?.length || 0}</td>
                  <td>{formatMoney(o.total || calculateTotal(o.items))}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button className="icon-btn delete-btn" onClick={() => handleDeleteOrder(o._id)} aria-label="Delete">
                      <FiTrash2 />
                    </button>
                    <button className="icon-btn" onClick={() => generateInvoice(o)} aria-label="Invoice">
                      <FiDownload />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}