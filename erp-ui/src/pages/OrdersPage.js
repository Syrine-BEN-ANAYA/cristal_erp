import React, { useEffect, useState, useCallback } from 'react';
import { 
  getOrders, createOrder, updateOrder, deleteOrder, getTotalOrderAmount 
} from '../api/ordersService';
import { getProducts } from '../api/productsService';
import { getCustomers } from '../api/customersService';
import { FiPackage, FiUser, FiShoppingCart, FiPlus, FiTrash2, FiX, FiDollarSign, FiMail, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png'; // Assurez-vous que le chemin est correct
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
  const [showInvoicePopup, setShowInvoicePopup] = useState(false); // popup visibility

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
    try { setProducts(await getProducts(token)); } catch {} 
  }, [token]);

  const loadCustomers = useCallback(async () => {
    try { setCustomers(await getCustomers(token)); } catch {}
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

  // Auto-close popup after 5 seconds
  useEffect(() => {
    if (showInvoicePopup) {
      const timer = setTimeout(() => setShowInvoicePopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showInvoicePopup]);

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

  // --- Create / Update Order ---
  const handleCreateOrUpdateOrder = async () => {
    if (!form.customerId) { setError('Please select a customer'); return; }
    if (form.items.some(i => !i.productId || i.quantity <= 0)) { setError('Fill all items correctly'); return; }
    setError('');

    const payload = {
      customerId: normalizeId(form.customerId),
      items: form.items.map(i => ({ productId: normalizeId(i.productId), quantity: i.quantity })),
    };

    try {
      if (editingOrderId) {
        await updateOrder(editingOrderId, payload, token);
        setEditingOrderId(null);
      } else {
        await createOrder(payload, token);
        setShowInvoicePopup(true);
      }
      resetForm();
      await loadOrders();
      await loadProducts();
      await loadTotalAmount();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving order');
    }
  };

  const startEditOrder = (order) => {
    setEditingOrderId(order._id);
    setForm({
      customerId: order.customerId,
      items: order.items.map(i => ({ productId: normalizeId(i.productId), quantity: i.quantity })),
    });
  };
  const cancelEdit = () => { setEditingOrderId(null); resetForm(); };

  // --- Delete Order ---
  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await deleteOrder(id, token);
      await loadOrders();
      await loadProducts();
      await loadTotalAmount();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete order');
    }
  };

  // --- Generate Invoice PDF (similar to PurchasesPage) ---
  const generateInvoicePDF = (order) => {
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

    // En-tête
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

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SALES INVOICE', margin, y);

    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');

    const invoiceNumber = `ORD-${order._id.slice(-8)}`;
    doc.text(`Invoice #: ${invoiceNumber}`, margin, y);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-GB')}`, margin, y + 5);

    // Customer info
    const customer = customers.find(c => c._id === (order.customerId?._id || order.customerId));
    if (customer) {
      doc.text('Customer:', pageWidth - margin - 60, y);
      doc.setFont('helvetica', 'bold');
      doc.text(customer.name || 'N/A', pageWidth - margin - 60, y + 5);
      doc.setFont('helvetica', 'normal');
      if (customer.email) doc.text(`Email: ${customer.email}`, pageWidth - margin - 60, y + 10);
      if (customer.phone) doc.text(`Phone: ${customer.phone}`, pageWidth - margin - 60, y + 15);
    }

    y += 25;

    // Tableau des produits
    const tableColumn = ['Product', 'Quantity', 'Unit Price (USD)', 'Total (USD)'];
    const tableRows = order.items.map(item => {
      const product = products.find(p => p._id === (item.productId?._id || item.productId));
      const productName = product?.name || 'Unknown';
      const quantity = item.quantity;
      const price = product?.price || 0;
      const total = price * quantity;
      return [productName, quantity, price.toFixed(2), total.toFixed(2)];
    });

    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [10, 43, 78], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const total = order.totalAmount || tableRows.reduce((sum, row) => sum + parseFloat(row[3]), 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Amount: $${total.toFixed(2)}`, pageWidth - margin - 50, finalY);

    // Coordonnées bancaires
    const bankY = finalY + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Bank Muscat', margin, bankY + 5);
    doc.text('Account Number: 0123 4567 8901 2345', margin, bankY + 10);
    doc.text('IBAN: OM12 3456 7890 1234 5678 9012', margin, bankY + 15);

    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`order_invoice_${order._id}.pdf`);
  };

  if (loading) return <div className="orders-page"><div className="loading-spinner">Loading…</div></div>;

  return (
    <div className="orders-page">
      {/* Modal Popup for Invoice Sent */}
      {showInvoicePopup && (
        <div className="popup-overlay" onClick={() => setShowInvoicePopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-icon">
              <FiMail size={40} />
            </div>
            <h3>Order Created!</h3>
            <p>PDF Invoice sent by email to the customer.</p>
            <button className="popup-close-btn" onClick={() => setShowInvoicePopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

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
        <h3>{editingOrderId ? <>Edit Order</> : <>New Order</>}</h3>

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
          <button className="btn btn-primary" onClick={handleCreateOrUpdateOrder}>
            <FiPlus /> {editingOrderId ? 'Update Order' : 'Create Order'}
          </button>
          {editingOrderId && <button className="btn btn-secondary" onClick={cancelEdit}><FiX /> Cancel</button>}
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
                  <td>{formatMoney(o.totalAmount || calculateTotal(o.items))}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button className="icon-btn edit-btn" onClick={() => startEditOrder(o)} aria-label="Edit">✎</button>
                    <button className="icon-btn delete-btn" onClick={() => handleDeleteOrder(o._id)} aria-label="Delete"><FiTrash2 /></button>
                    <button className="icon-btn download-btn" onClick={() => generateInvoicePDF(o)} aria-label="Download PDF">
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