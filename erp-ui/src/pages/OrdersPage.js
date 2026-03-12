// src/pages/OrdersPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../api/ordersService';
import { getProducts } from '../api/productsService';
import { getCustomers } from '../api/customersService';
import { FiPackage, FiUser, FiShoppingCart, FiPlus, FiEdit2, FiTrash2, FiX, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';
import '../styles/OrdersPage.css';

export default function OrdersPage({ token }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ customerId: '', items: [{ productId: '', quantity: 1 }], _id: null });

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

  useEffect(() => {
    if (!token) return;
    loadProducts();
    loadCustomers();
    loadOrders();
  }, [token, loadProducts, loadCustomers, loadOrders]);

  // --- Form handlers ---
  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = field === 'quantity' ? Number(value) : value;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1 }] });
  const removeItem = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => setForm({ customerId: '', items: [{ productId: '', quantity: 1 }], _id: null });

  const handleSaveOrder = async () => {
    if (!form.customerId) { setError('Please select a customer'); return; }
    if (form.items.some(i => !i.productId || i.quantity <= 0)) { setError('Fill all items correctly'); return; }
    setError('');

    const payload = {
      customerId: normalizeId(form.customerId),
      items: form.items.map(i => ({ productId: normalizeId(i.productId), quantity: i.quantity })),
    };

    try {
      if (form._id) {
        await updateOrder(form._id, payload, token);
      } else {
        await createOrder(payload, token);
      }
      resetForm();
      loadOrders();
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving order');
    }
  };

  const handleEditOrder = (order) => {
    setForm({
      _id: order._id,
      customerId: order.customerId,
      items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    });
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

  // --- Invoice PDF ---
  const generateInvoice = (order) => {
    const customerObj = typeof order.customerId === 'object' ? order.customerId : customers.find(c => c._id === order.customerId);
    const doc = new jsPDF();
    doc.addImage(logo, 'PNG', 14, 10, 30, 15);
    doc.setFontSize(16); doc.text('AL CRISTAL', 80, 18);
    doc.setFontSize(12); doc.text(`Order ID: ${order._id}`, 14, 55);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 61);
    const tableColumn = ["Product", "Qty", "Unit Price", "Total"];
    const tableRows = order.items.map(i => {
      const productId = normalizeId(i.productId);
      const product = products.find(p => p._id === productId);
      return [
        product?.name || productId,
        i.quantity,
        formatMoney(product?.price || 0),
        formatMoney((product?.price || 0) * i.quantity),
      ];
    });
    autoTable(doc, { startY: 80, head: [tableColumn], body: tableRows });
    doc.save(`invoice_${order._id}.pdf`);
  };

  if (loading) return <div className="orders-page"><div className="loading-spinner">Loading…</div></div>;

  return (
    <div className="orders-page">
      <h2>Orders</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={e => { e.preventDefault(); handleSaveOrder(); }}>
        <select name="customerId" value={normalizeId(form.customerId)} onChange={handleChange} required>
          <option value="">Select customer</option>
          {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {form.items.map((i, idx) => (
          <div key={idx}>
            <select value={normalizeId(i.productId)} onChange={e => handleItemChange(idx, 'productId', e.target.value)} required>
              <option value="">Select product</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" value={i.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} />
            {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)}>X</button>}
          </div>
        ))}
        <button type="button" onClick={addItem}>Add Product</button>
        <button type="submit">{form._id ? 'Update' : 'Create'} Order</button>
        {form._id && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && <tr><td colSpan="6">No orders found.</td></tr>}
          {orders.map(o => {
            const customerObj = typeof o.customerId === 'object' ? o.customerId : customers.find(c => c._id === o.customerId);
            return (
              <tr key={o._id}>
                <td>{o._id.slice(-6)}</td>
                <td>{customerObj?.name || normalizeId(o.customerId)}</td>
                <td>{o.items?.length || 0}</td>
                <td>{formatMoney(o.total || calculateTotal(o.items))}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEditOrder(o)}>Edit</button>
                  <button onClick={() => handleDeleteOrder(o._id)}>Delete</button>
                  <button onClick={() => generateInvoice(o)}>Invoice</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
