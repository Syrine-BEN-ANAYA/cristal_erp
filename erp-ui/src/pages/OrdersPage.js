import React, { useEffect, useState, useCallback } from 'react';
import { 
  getOrders, createOrder, updateOrder, deleteOrder, getTotalOrderAmount 
} from '../api/ordersService';
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
  const [editingOrderId, setEditingOrderId] = useState(null);

  const formatMoney = (value) => `$${(Number(value) || 0).toFixed(2)}`;
  const normalizeId = (objOrId) => (typeof objOrId === 'string' ? objOrId : objOrId?._id);

  // --- Load Data ---
  const loadProducts = useCallback(async () => { try { setProducts(await getProducts(token)); } catch {} }, [token]);
  const loadCustomers = useCallback(async () => { try { setCustomers(await getCustomers(token)); } catch {} }, [token]);
  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders(token);
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally { setLoading(false); }
  }, [token]);

  const loadTotalAmount = useCallback(async () => {
    try {
      const data = await getTotalOrderAmount(token);
      // fallback au calcul manuel si totalOrderAmount n'est pas renvoyé
      if (typeof data.totalOrderAmount !== 'number') {
        const sum = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        setTotalOrderAmount(sum);
      } else {
        setTotalOrderAmount(data.totalOrderAmount);
      }
    } catch (err) {
      console.error('Failed to load total order amount:', err.message);
    }
  }, [token, orders]);

  useEffect(() => {
    if (!token) return;
    loadProducts();
    loadCustomers();
    loadOrders();
  }, [token, loadProducts, loadCustomers, loadOrders]);

  useEffect(() => {
    loadTotalAmount();
  }, [orders, loadTotalAmount]);

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
    if (!form.customerId || form.items.some(i => !i.productId || i.quantity <= 0)) { setError('Fill all items correctly'); return; }
    setError('');
    const payload = { customerId: normalizeId(form.customerId), items: form.items.map(i => ({ productId: normalizeId(i.productId), quantity: i.quantity })) };
    try { await createOrder(payload, token); resetForm(); await loadOrders(); } 
    catch (err) { setError(err.response?.data?.message || err.message || 'Error creating order'); }
  };

  const startEditOrder = (order) => {
    setEditingOrderId(order._id);
    setForm({ customerId: order.customerId, items: order.items.map(i => ({ productId: normalizeId(i.productId), quantity: i.quantity })) });
  };
  const cancelEdit = () => { setEditingOrderId(null); resetForm(); };
  const handleUpdateOrder = async () => {
    if (!editingOrderId || !form.customerId || form.items.some(i => !i.productId || i.quantity <= 0)) { setError('Fill all items correctly'); return; }
    setError('');
    const payload = { customerId: normalizeId(form.customerId), items: form.items.map(i => ({ productId: normalizeId(i.productId), quantity: i.quantity })) };
    try { await updateOrder(editingOrderId, payload, token); cancelEdit(); await loadOrders(); } 
    catch (err) { setError(err.response?.data?.message || err.message || 'Error updating order'); }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try { await deleteOrder(id, token); await loadOrders(); } 
    catch (err) { alert(err.response?.data?.message || err.message || 'Failed to delete order'); }
  };

  // --- Generate PDF Invoice ---
  const generateInvoice = (order) => {
    const doc = new jsPDF();
    doc.addImage(logo, 'PNG', 10, 10, 50, 15);
    doc.setFontSize(16);
    doc.text('Invoice', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    const customerObj = typeof order.customerId === 'object' ? order.customerId : customers.find(c => c._id === order.customerId);
    doc.text(`Customer: ${customerObj?.name || normalizeId(order.customerId)}`, 14, 50);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 57);
    autoTable(doc, {
      startY: 65,
      head: [['Product', 'Quantity', 'Price', 'Total']],
      body: order.items.map(i => {
        const product = products.find(p => p._id === normalizeId(i.productId));
        const price = product?.price || 0;
        return [product?.name || 'Unknown', i.quantity, formatMoney(price), formatMoney(price * i.quantity)];
      }),
    });
    const finalY = doc.lastAutoTable.finalY || 65;
    doc.text(`Total Amount: ${formatMoney(order.totalAmount || 0)}`, 14, finalY + 10);
    doc.save(`invoice_${order._id}.pdf`);
  };

  if (loading) return <div className="orders-page"><div className="loading-spinner">Loading…</div></div>;

  return (
    <div className="orders-page">
      <div className="page-header"><h1>Orders</h1><p>Manage customer orders</p></div>
      {error && <div className="error-message">{error}</div>}

      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card"><FiShoppingCart className="kpi-icon" /><div><h3>Total Orders</h3><p>{orders.length}</p></div></div>
        <div className="kpi-card"><FiDollarSign className="kpi-icon" /><div><h3>Total Revenue</h3><p>{formatMoney(totalOrderAmount)}</p></div></div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <h3>{editingOrderId ? <><FiShoppingCart /> Edit Order</> : <><FiShoppingCart /> New Order</>}</h3>
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
          <div className="item-row-header"><span>Product</span><span>Quantity</span><span></span></div>
          {form.items.map((item, index) => (
            <div key={index} className="item-row">
              <select value={normalizeId(item.productId)} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} required>
                <option value="">Select product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
              {form.items.length > 1 && <button type="button" className="icon-btn remove-btn" onClick={() => removeItem(index)}><FiX /></button>}
            </div>
          ))}
          <button type="button" className="add-item-btn" onClick={addItem}><FiPlus /> Add Product</button>
        </div>

        <div className="form-actions">
          {editingOrderId ? (
            <>
              <button className="btn btn-success" onClick={handleUpdateOrder}><FiPlus /> Update Order</button>
              <button className="btn btn-secondary" onClick={cancelEdit}><FiX /> Cancel</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleCreateOrder}><FiPlus /> Create Order</button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <h3><FiShoppingCart /> Order List</h3>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {orders.length === 0 ? <tr><td colSpan="6" className="empty-message">No orders found.</td></tr> :
              orders.map(o => {
                const customerObj = typeof o.customerId === 'object' ? o.customerId : customers.find(c => c._id === o.customerId);
                return (
                  <tr key={o._id}>
                    <td>{o._id.slice(-6)}</td>
                    <td>{customerObj?.name || normalizeId(o.customerId)}</td>
                    <td>{o.items?.length || 0}</td>
                    <td>{formatMoney(o.totalAmount || 0)}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button className="icon-btn edit-btn" onClick={() => startEditOrder(o)} aria-label="Edit">✎</button>
                      <button className="icon-btn delete-btn" onClick={() => handleDeleteOrder(o._id)} aria-label="Delete"><FiTrash2 /></button>
                      <button className="icon-btn" onClick={() => generateInvoice(o)} aria-label="Invoice"><FiDownload /></button>
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