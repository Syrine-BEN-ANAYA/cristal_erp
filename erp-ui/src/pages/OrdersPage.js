// OrdersPage.js - Version avec contexte global
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  getOrders, createOrder, updateOrder, deleteOrder, getTotalOrderAmount 
} from '../api/ordersService';
import { getProducts } from '../api/productsService';
import { getCustomers } from '../api/customersService';
import { 
  FiPackage, FiUser, FiShoppingCart, FiPlus, FiTrash2, FiX, FiEdit2, FiDownload, FiCheckCircle, FiGlobe,
  FiCalendar, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/OrdersPage.css';

const normalizeId = (objOrId) => {
  if (!objOrId) return '';
  if (typeof objOrId === 'string') return objOrId;
  return objOrId?._id || '';
};

const formatMoney = (value) => {
  const numericValue = Number(value) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
};

const calculateOrderTotal = (items, products) => {
  if (!items?.length || !products?.length) return 0;
  return items.reduce((total, item) => {
    const productId = normalizeId(item.productId);
    const product = products.find(p => p._id === productId);
    return total + ((product?.price || 0) * (item.quantity || 0));
  }, 0);
};

const validateStockAvailability = (items, products) => {
  const errors = [];
  items.forEach(item => {
    if (!item.productId) return;
    const productId = normalizeId(item.productId);
    const product = products.find(p => p._id === productId);
    if (product && item.quantity > product.stock) {
      errors.push({
        productName: product.name,
        requested: item.quantity,
        available: product.stock,
        productId: productId,
        product: product
      });
    }
  });
  return errors;
};

export default function OrdersPage({ token }) {
  const { t, isRTL, language, toggleLanguage } = useLanguage();

  // Traductions spécifiques à OrdersPage
  const ordersTranslations = {
    EN: {
      orders: 'Orders Management',
      manageOrders: 'Manage customer orders and track revenue',
      newOrder: 'Create New Order',
      editOrder: 'Edit Order',
      selectCustomer: 'Select a customer',
      selectProduct: 'Select product',
      quantity: 'Quantity',
      addProduct: 'Add Product',
      createOrder: 'Create Order',
      updateOrder: 'Update Order',
      orderList: 'Recent Orders',
      customerName: 'Customer',
      items: 'Items',
      total: 'Total',
      date: 'Date',
      actions: 'Actions',
      noOrders: 'No orders found. Create your first order above.',
      orderCreated: 'Order created successfully!',
      orderUpdated: 'Order updated successfully!',
      invoiceSent: 'Invoice has been sent to the customer.',
      deleteConfirm: 'Delete this order?',
      loading: 'Loading orders...',
      refreshing: 'Refreshing...',
      orderId: 'Order ID',
      invoice: 'ORDER INVOICE',
      thankYou: 'Thank you for your business!',
      unitPrice: 'Unit Price',
      product: 'Product',
      email: 'Email',
      phone: 'Phone',
      pleaseSelectCustomer: 'Please select a customer',
      fillItemsCorrectly: 'Please fill all items correctly',
      errorSavingOrder: 'Error saving order',
      failedToDelete: 'Failed to delete order',
      failedToGeneratePDF: 'Failed to generate PDF',
      downloadInvoice: 'Download Invoice',
      stockError: 'Insufficient stock',
      stockInsufficient: 'Insufficient stock',
      available: 'available',
      requested: 'requested',
      stock: 'Stock',
      subtotal: 'Subtotal',
      customer: 'Customer',
      products: 'Products'
    },
    AR: {
      orders: 'إدارة الطلبات',
      manageOrders: 'إدارة طلبات العملاء وتتبع الإيرادات',
      newOrder: 'إنشاء طلب جديد',
      editOrder: 'تعديل طلب',
      selectCustomer: 'اختر عميل',
      selectProduct: 'اختر منتج',
      quantity: 'الكمية',
      addProduct: 'إضافة منتج',
      createOrder: 'إنشاء طلب',
      updateOrder: 'تحديث الطلب',
      orderList: 'الطلبات الأخيرة',
      customerName: 'العميل',
      items: 'المنتجات',
      total: 'المجموع',
      date: 'التاريخ',
      actions: 'إجراءات',
      noOrders: 'لا توجد طلبات. قم بإنشاء طلبك الأول أعلاه',
      orderCreated: 'تم إنشاء الطلب بنجاح!',
      orderUpdated: 'تم تحديث الطلب بنجاح!',
      invoiceSent: 'تم إرسال الفاتورة إلى العميل',
      deleteConfirm: 'هل تريد حذف هذا الطلب؟',
      loading: 'جاري تحميل الطلبات...',
      refreshing: 'جاري التحديث...',
      orderId: 'رقم الطلب',
      invoice: 'فاتورة الطلب',
      thankYou: 'شكراً لتعاملك معنا!',
      unitPrice: 'سعر الوحدة',
      product: 'المنتج',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      pleaseSelectCustomer: 'الرجاء اختيار عميل',
      fillItemsCorrectly: 'الرجاء تعبئة جميع العناصر بشكل صحيح',
      errorSavingOrder: 'خطأ في حفظ الطلب',
      failedToDelete: 'فشل حذف الطلب',
      failedToGeneratePDF: 'فشل إنشاء PDF',
      downloadInvoice: 'تحميل الفاتورة',
      stockError: 'الكمية غير متوفرة',
      stockInsufficient: 'الكمية غير كافية في المخزون',
      available: 'متوفر',
      requested: 'مطلوب',
      stock: 'المخزون',
      subtotal: 'المجموع الفرعي',
      customer: 'العميل',
      products: 'المنتجات'
    }
  };

  const localT = ordersTranslations[language];

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stockErrors, setStockErrors] = useState([]);

  const [form, setForm] = useState({
    _id: null,
    customerId: '',
    items: [{ id: Date.now(), productId: '', quantity: 1 }]
  });

  const checkStockInRealTime = useCallback((items) => {
    const errors = validateStockAvailability(items, products);
    setStockErrors(errors);
    return errors.length === 0;
  }, [products]);

  const loadData = useCallback(async (showRefresh = false) => {
    if (!token) return;
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      
      const [ordersData, productsData, customersData] = await Promise.all([
        getOrders(token),
        getProducts(token),
        getCustomers(token)
      ]);
      
      setOrders(ordersData || []);
      setProducts(productsData || []);
      setCustomers(customersData || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (itemId, field, value) => {
    setForm(prev => {
      const updatedItems = prev.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      );
      
      setTimeout(() => {
        checkStockInRealTime(updatedItems);
      }, 0);
      
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), productId: '', quantity: 1 }]
    }));
  };

  const removeItem = (itemId) => {
    if (form.items.length === 1) return;
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    setTimeout(() => {
      checkStockInRealTime(form.items.filter(item => item.id !== itemId));
    }, 0);
  };

  const resetForm = () => {
    setForm({
      _id: null,
      customerId: '',
      items: [{ id: Date.now(), productId: '', quantity: 1 }]
    });
    setStockErrors([]);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.customerId) {
      setError(localT.pleaseSelectCustomer);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (form.items.some(item => !item.productId || item.quantity <= 0)) {
      setError(localT.fillItemsCorrectly);
      setTimeout(() => setError(''), 3000);
      return;
    }

    const stockValidationErrors = validateStockAvailability(form.items, products);
    if (stockValidationErrors.length > 0) {
      const errorMessage = stockValidationErrors.map(err => 
        `${err.productName}: ${localT.requested} ${err.requested}, ${localT.available} ${err.available}`
      ).join('. ');
      setError(`${localT.stockInsufficient}: ${errorMessage}`);
      setStockErrors(stockValidationErrors);
      setTimeout(() => setError(''), 5000);
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
        showSuccess(localT.orderUpdated);
      } else {
        await createOrder(payload, token);
        showSuccess(`${localT.orderCreated} ${localT.invoiceSent}`);
      }
      
      resetForm();
      loadData();
      loadTotalAmount();
      setError('');
      setStockErrors([]);
    } catch (err) {
      if (err.response?.data?.message?.includes('stock') || err.response?.data?.message?.includes('Stock')) {
        setError(`${localT.stockInsufficient}. ${err.response?.data?.message || ''}`);
      } else {
        setError(err.response?.data?.message || err.message || localT.errorSavingOrder);
      }
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleEdit = (order) => {
    const editedForm = {
      _id: order._id,
      customerId: order.customerId?._id || order.customerId,
      items: order.items.map((item, idx) => ({
        id: Date.now() + idx,
        productId: item.productId?._id || item.productId,
        quantity: item.quantity
      }))
    };
    setForm(editedForm);
    
    setTimeout(() => {
      checkStockInRealTime(editedForm.items);
    }, 100);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`${localT.deleteConfirm}?`)) return;
    try {
      await deleteOrder(id, token);
      loadData();
      loadTotalAmount();
      showSuccess('Order deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || localT.failedToDelete);
      setTimeout(() => setError(''), 3000);
    }
  };

  const generateInvoicePDF = (order) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      doc.setFillColor(26, 75, 122);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('AL RUBAI UNITED AL CRISTAL', pageWidth / 2, y + 15, { align: 'center' });
      
      y += 50;
      doc.setTextColor(26, 75, 122);
      doc.setFontSize(18);
      doc.text(localT.invoice, pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${localT.orderId}: ${order._id.slice(-8)}`, margin, y);
      doc.text(`${localT.date}: ${new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}`, margin, y + 6);
      
      const customer = customers.find(c => c._id === (order.customerId?._id || order.customerId));
      if (customer) {
        y += 20;
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text(`${localT.customer}: ${customer.name}`, margin, y);
        if (customer.email) doc.text(`${localT.email}: ${customer.email}`, margin, y + 6);
        if (customer.phone) doc.text(`${localT.phone}: ${customer.phone}`, margin, y + 12);
        y += 25;
      } else {
        y += 20;
      }

      const tableColumn = [localT.product, localT.quantity, localT.unitPrice, localT.total];
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
        headStyles: { fillColor: [26, 75, 122], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });
      
      const finalY = doc.lastAutoTable.finalY + 10;
      const total = order.totalAmount || calculateOrderTotal(order.items, products);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(212, 175, 55);
      doc.text(`${localT.total}: ${formatMoney(total)}`, pageWidth - margin, finalY, { align: 'right' });
      
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(localT.thankYou, pageWidth / 2, footerY, { align: 'center' });
      
      doc.save(`invoice_${order._id}_${language}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(localT.failedToGeneratePDF);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="orders-page" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>{localT.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`orders-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <button className="language-toggle" onClick={toggleLanguage}>
        <FiGlobe /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <FiShoppingCart size={28} />
          </div>
          <div>
            <h1>{localT.orders}</h1>
            <p>{localT.manageOrders}</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => loadData(true)} disabled={refreshing}>
          <FiRefreshCw className={refreshing ? 'spinning' : ''} />
          {refreshing ? localT.refreshing : t.refresh}
        </button>
      </div>

      {error && (
        <div className="alert error">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      
      {success && (
        <div className="alert success">
          <FiCheckCircle />
          <span>{success}</span>
          <div className="progress-bar"></div>
        </div>
      )}

      <div className="form-card">
        <div className="form-card-header">
          <h3><FiPlus /> {form._id ? localT.editOrder : localT.newOrder}</h3>
          {form._id && (
            <button className="cancel-edit" onClick={resetForm}>
              <FiX /> {t.cancel}
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser /> {localT.customer} <span className="required">*</span></label>
            <select
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">{localT.selectCustomer}</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="items-section">
            <label><FiPackage /> {localT.products} <span className="required">*</span></label>
            <div className="items-header">
              <span>{localT.product}</span>
              <span>{localT.quantity}</span>
              <span>{localT.total}</span>
              <span></span>
            </div>
            
            {form.items.map((item) => {
              const selectedProduct = products.find(p => p._id === item.productId);
              const itemTotal = (selectedProduct?.price || 0) * (item.quantity || 0);
              const stockError = stockErrors.find(err => err.productId === item.productId);
              const isStockInsufficient = stockError && item.quantity > selectedProduct?.stock;
              
              return (
                <div key={item.id} className={`item-row ${isStockInsufficient ? 'stock-error' : ''}`}>
                  <select
                    value={item.productId}
                    onChange={e => handleItemChange(item.id, 'productId', e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="">{localT.selectProduct}</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} - {formatMoney(p.price)} ({localT.stock}: {p.stock})
                      </option>
                    ))}
                  </select>
                  
                  <div className="quantity-wrapper">
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct?.stock || 999}
                      value={item.quantity}
                      onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                      required
                      className={`form-input ${isStockInsufficient ? 'error-input' : ''}`}
                    />
                    {selectedProduct && (
                      <span className="stock-info">
                        {localT.stock}: {selectedProduct.stock}
                      </span>
                    )}
                  </div>
                  
                  <div className="item-total">{formatMoney(itemTotal)}</div>
                  
                  {form.items.length > 1 && (
                    <button type="button" className="remove-item" onClick={() => removeItem(item.id)}>
                      <FiTrash2 />
                    </button>
                  )}
                  
                  {isStockInsufficient && (
                    <div className="stock-warning">
                      <FiAlertCircle />
                      <span>{localT.stockInsufficient}! Max: {selectedProduct?.stock}</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            <button type="button" className="add-item-btn" onClick={addItem}>
              <FiPlus /> {localT.addProduct}
            </button>
          </div>

          <div className="order-summary">
            <div className="summary-line">
              <span>{localT.subtotal}:</span>
              <span>{formatMoney(calculateOrderTotal(form.items, products))}</span>
            </div>
            <div className="summary-line total">
              <span>{localT.total}:</span>
              <span>{formatMoney(calculateOrderTotal(form.items, products))}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={stockErrors.length > 0}>
              {form._id ? <><FiEdit2 /> {localT.updateOrder}</> : <><FiPlus /> {localT.createOrder}</>}
            </button>
            {stockErrors.length > 0 && (
              <div className="stock-error-summary">
                <FiAlertCircle />
                <span>{stockErrors.length} {localT.stockError}(s)</span>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3><FiShoppingCart /> {localT.orderList}</h3>
          <div className="table-stats">{orders.length} orders</div>
        </div>
        
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>{localT.customerName}</th>
                <th>{localT.items}</th>
                <th>{localT.total}</th>
                <th>{localT.date}</th>
                <th>{localT.actions}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <FiShoppingCart size={48} />
                    <p>{localT.noOrders}</p>
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const customer = customers.find(c => c._id === (order.customerId?._id || order.customerId));
                  const total = order.totalAmount || calculateOrderTotal(order.items, products);
                  return (
                    <tr key={order._id} className="order-row">
                      <td data-label={localT.customerName}>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {customer?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="customer-name">{customer?.name || '—'}</div>
                            {customer?.email && <div className="customer-email">{customer.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td data-label={localT.items}>
                        <div className="items-badges">
                          {order.items.slice(0, 3).map((item, idx) => {
                            const product = products.find(p => p._id === (item.productId?._id || item.productId));
                            return (
                              <span key={idx} className="item-badge">
                                {product?.name || '?'} ×{item.quantity}
                              </span>
                            );
                          })}
                          {order.items.length > 3 && (
                            <span className="more-badge">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label={localT.total} className="total-cell">
                        {formatMoney(total)}
                      </td>
                      <td data-label={localT.date}>
                        <div className="date-cell">
                          <FiCalendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}
                        </div>
                      </td>
                      <td data-label={localT.actions} className="actions-cell">
                        <button className="action-icon edit" onClick={() => handleEdit(order)} title={localT.editOrder}>
                          <FiEdit2 />
                        </button>
                        <button className="action-icon delete" onClick={() => handleDelete(order._id)} title={localT.deleteConfirm}>
                          <FiTrash2 />
                        </button>
                        <button className="action-icon download" onClick={() => generateInvoicePDF(order)} title={localT.downloadInvoice}>
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
    </div>
  );
}