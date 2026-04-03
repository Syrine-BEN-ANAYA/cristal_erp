import React, { useEffect, useState, useCallback } from 'react';
import {
  getOrders, createOrder, updateOrder, deleteOrder, getTotalOrderAmount
} from '../api/ordersService';
import { getProducts } from '../api/productsService';
import { getCustomers } from '../api/customersService';
import { FiPackage, FiUser, FiShoppingCart, FiPlus, FiTrash2, FiX, FiDollarSign, FiMail, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';
import '../styles/OrdersPage.css';

// --- Utilitaires ---
const normalizeId = (objOrId) => (typeof objOrId === 'string' ? objOrId : objOrId?._id);
const calculateTotal = (items, products) =>
  items.reduce((acc, item) => {
    const product = products.find(p => p._id === normalizeId(item.productId));
    return acc + (product?.price || 0) * (item.quantity || 0);
  }, 0);
const formatMoney = (value) => `$${(Number(value) || 0).toFixed(2)}`;

// --- Composants ---
const ItemRow = ({ item, index, products, onChange, onRemove, canRemove }) => (
  <div className="item-row">
    <select
      value={normalizeId(item.productId) || ''}
      onChange={(e) => onChange(index, 'productId', e.target.value)}
      required
    >
      <option value="">Select product</option>
      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
    </select>
    <input
      type="number"
      min="1"
      value={item.quantity}
      onChange={(e) => onChange(index, 'quantity', e.target.value)}
      required
    />
    {canRemove && (
      <button type="button" className="icon-btn remove-btn" onClick={() => onRemove(index)}>
        <FiX />
      </button>
    )}
  </div>
);

const KpiCard = ({ icon, title, value }) => (
  <div className="kpi-card">
    {icon}
    <div>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  </div>
);

// --- Page principale ---
export default function OrdersPage({ token }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ customerId: '', items: [{ productId: '', quantity: 1 }] });
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);

  // --- Load data ---
  const loadProducts = useCallback(async () => { try { setProducts(await getProducts(token)); } catch {} }, [token]);
  const loadCustomers = useCallback(async () => { try { setCustomers(await getCustomers(token)); } catch {} }, [token]);
  const loadOrders = useCallback(async () => {
    try { setOrders(await getOrders(token)); setError(''); }
    catch (err) { setError(err.message || 'Failed to load orders'); }
    finally { setLoading(false); }
  }, [token]);
  const loadTotalAmount = useCallback(async () => {
    try { const data = await getTotalOrderAmount(token); setTotalOrderAmount(data.totalOrderAmount || 0); }
    catch (err) { console.error(err.message); }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadProducts();
    loadCustomers();
    loadOrders();
    loadTotalAmount();
  }, [token, loadProducts, loadCustomers, loadOrders, loadTotalAmount]);

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

  // --- Create / Update ---
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

  // --- Delete ---
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

  // --- Generate PDF ---
  const generateInvoicePDF = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    try { doc.addImage(logo, 'PNG', 15, y, 40, 20); } catch {}

    doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.setTextColor(10,43,78);
    doc.text('UNITED AL RUBAI AL CRISTAL', pageWidth/2, y+10, {align:'center'});

    doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(60,60,60);
    doc.text('Muscat, Oman', pageWidth-15, y+18, {align:'right'});
    doc.text('Email: info@cristal.om', pageWidth-15, y+23, {align:'right'});

    y+=30;
    doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.text('SALES INVOICE', 15, y);
    y+=10;

    const invoiceNumber = `ORD-${order._id.slice(-8)}`;
    doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
    doc.text(`Invoice #: ${invoiceNumber}`, 15, y);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-GB')}`, 15, y+5);

    const customer = customers.find(c=>c._id===normalizeId(order.customerId));
    if(customer){
      doc.text('Customer:', pageWidth-75, y);
      doc.setFont('helvetica','bold'); doc.text(customer.name||'N/A', pageWidth-75, y+5);
      doc.setFont('helvetica','normal'); 
      if(customer.email) doc.text(`Email: ${customer.email}`, pageWidth-75, y+10);
      if(customer.phone) doc.text(`Phone: ${customer.phone}`, pageWidth-75, y+15);
    }

    y+=25;
    const tableColumn=['Product','Quantity','Unit Price (USD)','Total (USD)'];
    const tableRows = order.items.map(i=>{
      const product = products.find(p=>p._id===normalizeId(i.productId));
      const price = product?.price||0;
      return [product?.name||'Unknown', i.quantity, price.toFixed(2), (price*i.quantity).toFixed(2)];
    });

    autoTable(doc, { startY:y, head:[tableColumn], body:tableRows, theme:'striped', headStyles:{fillColor:[10,43,78],textColor:255,fontStyle:'bold'}, alternateRowStyles:{fillColor:[245,245,245]}, margin:{left:15,right:15}, columnStyles:{0:{cellWidth:'auto'},1:{halign:'center'},2:{halign:'right'},3:{halign:'right'}} });

    const finalY = doc.lastAutoTable.finalY+10;
    const total = order.totalAmount || tableRows.reduce((sum,row)=>sum+parseFloat(row[3]),0);
    doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(0,0,0);
    doc.text(`Total Amount: $${total.toFixed(2)}`, pageWidth-65, finalY);

    doc.save(`order_invoice_${order._id}.pdf`);
  };

  if (loading) return <div className="orders-page"><div className="loading-spinner">Loading…</div></div>;

  return (
    <div className="orders-page">
      {showInvoicePopup && (
        <div className="popup-overlay" onClick={()=>setShowInvoicePopup(false)}>
          <div className="popup-content" onClick={e=>e.stopPropagation()}>
            <div className="popup-icon"><FiMail size={40}/></div>
            <h3>Order Created!</h3>
            <p>PDF Invoice sent by email to the customer.</p>
            <button className="popup-close-btn" onClick={()=>setShowInvoicePopup(false)}>OK</button>
          </div>
        </div>
      )}

      <div className="page-header"><h1>Orders</h1><p>Manage customer orders</p></div>
      {error && <div className="error-message">{error}</div>}

      <div className="kpi-grid" style={{marginBottom:'2rem'}}>
        <KpiCard icon={<FiShoppingCart />} title="Total Orders" value={orders.length} />
        <KpiCard icon={<FiDollarSign />} title="Total Revenue" value={`$${totalOrderAmount.toFixed(2)}`} />
      </div>

      <div className="form-card">
        <h3>{editingOrderId?'Edit Order':'New Order'}</h3>
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
          {form.items.map((item,index)=>(
            <ItemRow key={index} item={item} index={index} products={products} onChange={handleItemChange} onRemove={removeItem} canRemove={form.items.length>1}/>
          ))}
          <button type="button" className="add-item-btn" onClick={addItem}><FiPlus /> Add Product</button>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleCreateOrUpdateOrder}><FiPlus /> {editingOrderId?'Update Order':'Create Order'}</button>
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
            {orders.length===0 && <tr><td colSpan="6" className="empty-message">No orders found.</td></tr>}
            {orders.map(o=>{
              const customerObj = typeof o.customerId==='object'?o.customerId:customers.find(c=>c._id===o.customerId);
              return (
                <tr key={o._id}>
                  <td>{o._id.slice(-6)}</td>
                  <td>{customerObj?.name||normalizeId(o.customerId)}</td>
                  <td>{o.items?.length||0}</td>
                  <td>{formatMoney(o.totalAmount||calculateTotal(o.items, products))}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button className="icon-btn edit-btn" onClick={()=>startEditOrder(o)} aria-label="Edit">✎</button>
                    <button className="icon-btn delete-btn" onClick={()=>handleDeleteOrder(o._id)} aria-label="Delete"><FiTrash2 /></button>
                    <button className="icon-btn download-btn" onClick={()=>generateInvoicePDF(o)} aria-label="Download PDF"><FiDownload /></button>
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