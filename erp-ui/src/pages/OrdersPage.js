import React, { useEffect, useState, useCallback } from 'react';
import { getProducts } from '../api/productsService';
import { getCustomers } from '../api/customersService';
import {
  FiPackage,
  FiUser,
  FiShoppingCart,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiDownload,
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';
import '../styles/OrdersPage.css';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../api/ordersService';

export default function OrdersPage({ token }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customerId: '', items: [{ productId: '', quantity: 1 }], _id: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatMoney = (value) => `$${(Number(value) || 0).toFixed(2)}`;

  const calculateTotal = (items) => {
    return items.reduce((acc, item) => {
      const product = products.find(p => p._id === item.productId);
      return acc + (product?.price || 0) * (item.quantity || 0);
    }, 0);
  };

  // Load data
  const loadProducts = useCallback(async () => {
    try {
      setProducts(await getProducts(token));
    } catch {
      // ignore error for now
    }
  }, [token]);

  const loadCustomers = useCallback(async () => {
    try {
      setCustomers(await getCustomers(token));
    } catch {
      // ignore error
    }
  }, [token]);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await getOrders(token));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadProducts();
      loadCustomers();
      loadOrders();
    }
  }, [token, loadProducts, loadCustomers, loadOrders]);

  // --- Form handlers ---
  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1 }] });
  const removeItem = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => setForm({ customerId: '', items: [{ productId: '', quantity: 1 }], _id: null });

  const handleSaveOrder = async () => {
    if (!form.customerId) {
      setError('Please select a customer');
      return;
    }
    if (form.items.some(item => !item.productId || item.quantity <= 0)) {
      setError('Please fill all items correctly');
      return;
    }
    setError('');

    const payload = {
      customerId: form.customerId,
      items: form.items.map(i => ({ productId: i.productId, quantity: Number(i.quantity) })),
    };

    try {
      if (form._id) {
        await updateOrder(form._id, payload, token);
        alert('Order updated successfully!');
      } else {
        await createOrder(payload, token);
        alert('Order created successfully!');
      }
      resetForm();
      loadOrders();
      loadProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error';
      setError(msg.includes('Stock insuffisant')
        ? msg.replace('Stock insuffisant. Disponible:', 'Insufficient stock. Available:')
        : msg);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await deleteOrder(id, token);
      loadOrders();
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete order');
    }
  };

  const handleEditOrder = (order) => {
    setForm({
      _id: order._id,
      customerId: order.customerId,
      items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    });
  };

  const generateInvoice = (order) => {
    const customer = customers.find(c => c._id === order.customerId);
    const doc = new jsPDF();
    doc.addImage(logo, 'PNG', 14, 10, 30, 15);
    doc.setTextColor(26, 75, 122);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AL RUBAI UNITED AL CRISTAL', 80, 18);
    doc.setTextColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);
    doc.setFontSize(20);
    doc.text('INVOICE', 14, 45);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 14, 55);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 61);

    doc.setFontSize(14);
    doc.text('Bill To:', 14, 75);
    doc.setFontSize(12);
    doc.text(`Name: ${customer?.name || order.customerId}`, 14, 83);
    if (customer?.email) doc.text(`Email: ${customer.email}`, 14, 89);
    if (customer?.phone) doc.text(`Phone: ${customer.phone}`, 14, 95);
    if (customer?.address) doc.text(`Address: ${customer.address}`, 14, 101);

    const tableColumn = ["Product", "Quantity", "Unit Price", "Total"];
    const tableRows = order.items.map(i => {
      const product = products.find(p => p._id === i.productId);
      const price = product?.price || 0;
      return [
        product?.name || i.productId,
        i.quantity,
        formatMoney(price),
        formatMoney(price * i.quantity),
      ];
    });

    autoTable(doc, {
      startY: 115,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [26, 75, 122] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: ${formatMoney(order.total || calculateTotal(order.items))}`, 14, finalY);
    doc.setFontSize(10);
    doc.text('Thank you for your business!', 14, finalY + 10);
    doc.text('AL RUBAI UNITED AL CRISTAL', 14, finalY + 16);
    doc.save(`invoice_${order._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-spinner">Loading orders…</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2 className="page-title">Orders</h2>
        <p className="page-subtitle">Manage customer orders</p>
      </div>

      {/* Formulaire */}
      <div className="form-card">
        <h3 className="form-title">{form._id ? 'Edit Order' : 'New Order'}</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); handleSaveOrder(); }}>
          {/* Sélection client */}
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Customer *</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <h4 style={{ marginBottom: '1rem', color: '#1a2b3c' }}>Order Items</h4>

          {/* Liste des produits */}
          {form.items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="item-product">
                <div className="input-wrapper">
                  <FiPackage className="input-icon" />
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Stock: {p.quantity ?? 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="item-quantity">
                <div className="input-wrapper">
                  <FiShoppingCart className="input-icon" />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="item-remove"
                disabled={form.items.length === 1}
                title="Remove item"
              >
                <FiX />
              </button>
            </div>
          ))}

          <div className="form-actions" style={{ justifyContent: 'space-between' }}>
            <button type="button" onClick={addItem} className="btn btn-secondary">
              <FiPlus /> Add Product
            </button>
            <div>
              <button type="submit" className="btn btn-primary">
                {form._id ? <FiEdit2 /> : <FiPlus />}
                {form._id ? 'Update Order' : 'Create Order'}
              </button>
              {form._id && (
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  <FiX /> Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Tableau des commandes */}
      <div className="table-container">
        <h3 className="table-title">Orders List</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(o => {
                const customer = customers.find(c => c._id === o.customerId);
                return (
                  <tr key={o._id}>
                    <td>{o._id.slice(-6)}</td>
                    <td>{customer?.name || o.customerId}</td>
                    <td>{o.items?.length || 0}</td>
                    <td>{formatMoney(o.total)}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEditOrder(o)}
                        className="icon-btn edit-btn"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(o._id)}
                        className="icon-btn delete-btn"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                      <button
                        onClick={() => generateInvoice(o)}
                        className="icon-btn invoice-btn"
                        title="Invoice"
                      >
                        <FiDownload />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-message">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}