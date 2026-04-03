// OrdersPage.js
import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
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

// --- Constants ---
const INITIAL_ITEM = { id: Date.now(), productId: '', quantity: 1 };
const POPUP_DURATION = 5000;
const INVOICE_NUMBER_LENGTH = 8;

// --- Helper Functions ---
const normalizeId = (objOrId) => {
  if (typeof objOrId === 'string') return objOrId;
  return objOrId?._id || '';
};

const formatMoney = (value) => {
  const numericValue = Number(value) || 0;
  return `$${numericValue.toFixed(2)}`;
};

const calculateOrderTotal = (items, products) => {
  return items.reduce((total, item) => {
    const productId = normalizeId(item.productId);
    const product = products.find(p => p._id === productId);
    const itemPrice = product?.price || 0;
    const itemQuantity = item.quantity || 0;
    return total + (itemPrice * itemQuantity);
  }, 0);
};

const validateOrderForm = (form) => {
  if (!form.customerId) {
    return { isValid: false, error: 'Please select a customer' };
  }
  
  const hasInvalidItem = form.items.some(item => !item.productId || item.quantity <= 0);
  if (hasInvalidItem) {
    return { isValid: false, error: 'Fill all items correctly' };
  }
  
  return { isValid: true, error: null };
};

// --- Subcomponents ---
const KPI = ({ icon: Icon, title, value }) => (
  <div className="kpi-card">
    <Icon className="kpi-icon" />
    <div>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  </div>
);

KPI.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const ItemRow = ({ item, index, products, onChange, onRemove, removable }) => (
  <div className="item-row">
    <select
      value={normalizeId(item.productId)}
      onChange={event => onChange(index, 'productId', event.target.value)}
      required
      aria-label="Product selection"
    >
      <option value="">Select product</option>
      {products.map(product => (
        <option key={product._id} value={product._id}>{product.name}</option>
      ))}
    </select>
    <input
      type="number"
      min="1"
      value={item.quantity}
      onChange={event => onChange(index, 'quantity', Number(event.target.value))}
      required
      aria-label="Quantity"
    />
    {removable && (
      <button 
        type="button" 
        className="icon-btn remove-btn" 
        onClick={() => onRemove(index)}
        aria-label="Remove item"
      >
        <FiX />
      </button>
    )}
  </div>
);

ItemRow.propTypes = {
  item: PropTypes.shape({
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    quantity: PropTypes.number.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  products: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  removable: PropTypes.bool.isRequired,
};

const OrdersTable = ({ orders, customers, products, startEditOrder, handleDeleteOrder, generateInvoicePDF }) => (
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
        {orders.map(order => {
          const customer = getCustomerForOrder(order, customers);
          const total = order.totalAmount || calculateOrderTotal(order.items, products);
          
          return (
            <tr key={order._id}>
              <td>{order._id.slice(-6)}</td>
              <td>{customer?.name || normalizeId(order.customerId)}</td>
              <td>{order.items?.length || 0}</td>
              <td>{formatMoney(total)}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="actions">
                <button 
                  type="button" 
                  className="icon-btn edit-btn" 
                  onClick={() => startEditOrder(order)} 
                  aria-label="Edit"
                >
                  ✎
                </button>
                <button 
                  type="button" 
                  className="icon-btn delete-btn" 
                  onClick={() => handleDeleteOrder(order._id)} 
                  aria-label="Delete"
                >
                  <FiTrash2 />
                </button>
                <button 
                  type="button" 
                  className="icon-btn download-btn" 
                  onClick={() => generateInvoicePDF(order)} 
                  aria-label="Download PDF"
                >
                  <FiDownload />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

OrdersTable.propTypes = {
  orders: PropTypes.array.isRequired,
  customers: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
  startEditOrder: PropTypes.func.isRequired,
  handleDeleteOrder: PropTypes.func.isRequired,
  generateInvoicePDF: PropTypes.func.isRequired,
};

const getCustomerForOrder = (order, customers) => {
  if (typeof order.customerId === 'object') return order.customerId;
  return customers.find(customer => customer._id === order.customerId);
};

const SuccessPopup = ({ isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, POPUP_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content" role="dialog" aria-modal="true">
        <div className="popup-icon"><FiMail size={40} /></div>
        <h3>Order Created!</h3>
        <p>PDF Invoice sent by email to the customer.</p>
        <button className="popup-close-btn" type="button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

SuccessPopup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

// --- Main Component ---
export default function OrdersPage({ token }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ customerId: '', items: [{ ...INITIAL_ITEM }] });
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);

  // --- Data Loading ---
  const loadProducts = useCallback(async () => {
    try {
      const productsData = await getProducts(token);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }, [token]);

  const loadCustomers = useCallback(async () => {
    try {
      const customersData = await getCustomers(token);
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  }, [token]);

  const loadOrders = useCallback(async () => {
    try {
      const ordersData = await getOrders(token);
      setOrders(ordersData);
      setError('');
    } catch (error) {
      setError(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadTotalAmount = useCallback(async () => {
    try {
      const data = await getTotalOrderAmount(token);
      setTotalOrderAmount(data.totalOrderAmount || 0);
    } catch (error) {
      console.error('Failed to load total amount:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    
    const loadAllData = async () => {
      await Promise.all([
        loadProducts(),
        loadCustomers(),
        loadOrders(),
        loadTotalAmount()
      ]);
    };
    
    loadAllData();
  }, [token, loadProducts, loadCustomers, loadOrders, loadTotalAmount]);

  // --- Form Handlers ---
  const handleItemChange = (itemId, field, value) => {
    setForm(previousForm => ({
      ...previousForm,
      items: previousForm.items.map(item => 
        item.id === itemId ? { ...item, [field]: field === 'quantity' ? Number(value) : value } : item
      )
    }));
  };

  const addItem = () => {
    setForm(previousForm => ({
      ...previousForm,
      items: [...previousForm.items, { ...INITIAL_ITEM, id: Date.now() }]
    }));
  };

  const removeItem = (itemId) => {
    setForm(previousForm => ({
      ...previousForm,
      items: previousForm.items.filter(item => item.id !== itemId)
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(previousForm => ({ ...previousForm, [name]: value }));
  };

  const resetForm = () => {
    setForm({ customerId: '', items: [{ ...INITIAL_ITEM }] });
  };

  const handleCreateOrUpdateOrder = async () => {
    const validation = validateOrderForm(form);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    setError('');
    
    const payload = {
      customerId: normalizeId(form.customerId),
      items: form.items.map(item => ({
        productId: normalizeId(item.productId),
        quantity: item.quantity
      }))
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
      await Promise.all([loadOrders(), loadProducts(), loadTotalAmount()]);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error saving order';
      setError(errorMessage);
    }
  };

  const startEditOrder = (order) => {
    setEditingOrderId(order._id);
    setForm({
      customerId: order.customerId,
      items: order.items.map((item, index) => ({
        id: Date.now() + index,
        productId: normalizeId(item.productId),
        quantity: item.quantity
      }))
    });
  };

  const cancelEdit = () => {
    setEditingOrderId(null);
    resetForm();
  };

  const handleDeleteOrder = async (orderId) => {
    const isConfirmed = window.confirm('Delete this order?');
    if (!isConfirmed) return;
    
    try {
      await deleteOrder(orderId, token);
      await Promise.all([loadOrders(), loadProducts(), loadTotalAmount()]);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete order';
      alert(errorMessage);
    }
  };

  // --- PDF Generation ---
  const generateInvoicePDF = (order) => {
    const document = new jsPDF();
    const pageWidth = document.internal.pageSize.getWidth();
    const margin = 15;
    
    addInvoiceHeader(document, pageWidth, margin);
    addInvoiceBody(document, order, margin, pageWidth);
    addInvoiceFooter(document, pageWidth, margin);
    
    document.save(`order_invoice_${order._id}.pdf`);
  };

  const addInvoiceHeader = (document, pageWidth, margin) => {
    let yPosition = 20;
    
    try {
      document.addImage(logo, 'PNG', margin, yPosition, 40, 20);
    } catch (error) {
      console.warn('Logo not found:', error);
    }
    
    document.setFontSize(16);
    document.setFont('helvetica', 'bold');
    document.setTextColor(10, 43, 78);
    document.text('UNITED AL RUBAI AL CRISTAL', pageWidth / 2, yPosition + 10, { align: 'center' });
    
    document.setFontSize(9);
    document.setFont('helvetica', 'normal');
    document.setTextColor(60, 60, 60);
    document.text('Muscat, Oman', pageWidth - margin, yPosition + 18, { align: 'right' });
    document.text('Email: info@cristal.om', pageWidth - margin, yPosition + 23, { align: 'right' });
  };

  const addInvoiceBody = (document, order, margin, pageWidth) => {
    let yPosition = 50;
    
    document.setFontSize(16);
    document.setFont('helvetica', 'bold');
    document.text('SALES INVOICE', margin, yPosition);
    
    yPosition += 10;
    const invoiceNumber = `ORD-${order._id.slice(-INVOICE_NUMBER_LENGTH)}`;
    
    document.setFontSize(10);
    document.setFont('helvetica', 'normal');
    document.setTextColor(80, 80, 80);
    document.text(`Invoice #: ${invoiceNumber}`, margin, yPosition);
    document.text(`Invoice Date: ${new Date().toLocaleDateString('en-GB')}`, margin, yPosition + 5);
    
    const customer = getCustomerForOrder(order, customers);
    if (customer) {
      const rightMargin = pageWidth - margin - 60;
      document.text('Customer:', rightMargin, yPosition);
      document.setFont('helvetica', 'bold');
      document.text(customer.name || 'N/A', rightMargin, yPosition + 5);
      document.setFont('helvetica', 'normal');
      
      if (customer.email) {
        document.text(`Email: ${customer.email}`, rightMargin, yPosition + 10);
      }
      if (customer.phone) {
        document.text(`Phone: ${customer.phone}`, rightMargin, yPosition + 15);
      }
    }
    
    yPosition += 25;
    addInvoiceTable(document, order, margin, yPosition);
  };

  const addInvoiceTable = (document, order, margin, startY) => {
    const tableColumn = ['Product', 'Quantity', 'Unit Price (USD)', 'Total (USD)'];
    const tableRows = order.items.map(item => {
      const product = products.find(product => product._id === normalizeId(item.productId));
      const productName = product?.name || 'Unknown';
      const quantity = item.quantity;
      const unitPrice = product?.price || 0;
      const totalPrice = unitPrice * quantity;
      
      return [productName, quantity, unitPrice.toFixed(2), totalPrice.toFixed(2)];
    });
    
    autoTable(document, {
      startY,
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
    
    const finalYPosition = document.lastAutoTable.finalY + 10;
    const total = order.totalAmount || tableRows.reduce((sum, row) => sum + parseFloat(row[3]), 0);
    
    document.setFontSize(12);
    document.setFont('helvetica', 'bold');
    document.setTextColor(0, 0, 0);
    document.text(`Total Amount: $${total.toFixed(2)}`, document.internal.pageSize.getWidth() - margin - 50, finalYPosition);
  };

  const addInvoiceFooter = (document, pageWidth, margin) => {
    const bankYPosition = document.lastAutoTable.finalY + 20;
    
    document.setFontSize(9);
    document.setFont('helvetica', 'bold');
    document.setTextColor(60, 60, 60);
    document.text('Bank Muscat', margin, bankYPosition + 5);
    document.text('Account Number: 0123 4567 8901 2345', margin, bankYPosition + 10);
    document.text('IBAN: OM12 3456 7890 1234 5678 9012', margin, bankYPosition + 15);
    
    const footerYPosition = document.internal.pageSize.getHeight() - 20;
    document.setFontSize(9);
    document.setTextColor(150, 150, 150);
    document.text('Thank you for your business!', pageWidth / 2, footerYPosition, { align: 'center' });
  };

  const closePopup = () => {
    setShowInvoicePopup(false);
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-spinner">Loading…</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <SuccessPopup isVisible={showInvoicePopup} onClose={closePopup} />
      
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage customer orders</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <KPI icon={FiShoppingCart} title="Total Orders" value={orders.length} />
        <KPI icon={FiDollarSign} title="Total Revenue" value={formatMoney(totalOrderAmount)} />
      </div>
      
      <div className="form-card">
        <h3>{editingOrderId ? 'Edit Order' : 'New Order'}</h3>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="customer-select">
              <FiUser /> Customer
            </label>
            <select 
              id="customer-select" 
              name="customerId" 
              value={normalizeId(form.customerId)} 
              onChange={handleChange} 
              required
            >
              <option value="">Select customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>{customer.name}</option>
              ))}
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
            <ItemRow 
              key={item.id}
              item={item}
              index={index}
              products={products}
              onChange={handleItemChange}
              onRemove={removeItem}
              removable={form.items.length > 1}
            />
          ))}
          
          <button type="button" className="add-item-btn" onClick={addItem}>
            <FiPlus /> Add Product
          </button>
        </div>
        
        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={handleCreateOrUpdateOrder}>
            <FiPlus /> {editingOrderId ? 'Update Order' : 'Create Order'}
          </button>
          {editingOrderId && (
            <button className="btn btn-secondary" type="button" onClick={cancelEdit}>
              <FiX /> Cancel
            </button>
          )}
        </div>
      </div>
      
      <OrdersTable 
        orders={orders}
        customers={customers}
        products={products}
        startEditOrder={startEditOrder}
        handleDeleteOrder={handleDeleteOrder}
        generateInvoicePDF={generateInvoicePDF}
      />
    </div>
  );
}

OrdersPage.propTypes = {
  token: PropTypes.string.isRequired,
};