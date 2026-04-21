import React, { useState, useEffect, useCallback } from 'react';
import { 
  getOrders, createOrder, updateOrder, deleteOrder, getTotalOrderAmount 
} from '../api/ordersService';
import { getProducts } from '../api/productsService';
import { getCustomers } from '../api/customersService';
import { 
  FiPackage, FiUser, FiShoppingCart, FiPlus, FiTrash2, FiX, 
  FiDollarSign, FiEdit2, FiDownload, FiCheckCircle, FiGlobe
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
  const [language, setLanguage] = useState('en');

  // Translations
  const t = {
    en: {
      orders: 'Orders',
      manageOrders: 'Manage customer orders',
      totalOrders: 'Total Orders',
      totalRevenue: 'Total Revenue',
      newOrder: 'New Order',
      editOrder: 'Edit Order',
      customer: 'Customer',
      products: 'Products',
      selectCustomer: 'Select a customer',
      selectProduct: 'Select product',
      quantity: 'Quantity',
      addProduct: 'Add Product',
      createOrder: 'Create Order',
      updateOrder: 'Update Order',
      cancel: 'Cancel',
      orderList: 'Order List',
      customerName: 'Customer',
      items: 'Items',
      total: 'Total',
      date: 'Date',
      actions: 'Actions',
      noOrders: 'No orders found.',
      success: 'Success!',
      orderUpdated: 'Order updated successfully!',
      invoiceSent: 'Invoice sent by email to the customer.',
      deleteConfirm: 'Delete this order?',
      loading: 'Loading orders…',
      orderId: 'Order ID',
      invoice: 'ORDER INVOICE',
      thankYou: 'Thank you for your business!',
      unitPrice: 'Unit Price',
      product: 'Product',
      email: 'Email',
      phone: 'Phone',
      pleaseSelectCustomer: 'Please select a customer',
      fillItemsCorrectly: 'Fill all items correctly',
      errorSavingOrder: 'Error saving order',
      failedToDelete: 'Failed to delete order',
      failedToGeneratePDF: 'Failed to generate PDF'
    },
    ar: {
      orders: 'الطلبات',
      manageOrders: 'إدارة طلبات العملاء',
      totalOrders: 'إجمالي الطلبات',
      totalRevenue: 'إجمالي الإيرادات',
      newOrder: 'طلب جديد',
      editOrder: 'تعديل طلب',
      customer: 'العميل',
      products: 'المنتجات',
      selectCustomer: 'اختر عميل',
      selectProduct: 'اختر منتج',
      quantity: 'الكمية',
      addProduct: 'إضافة منتج',
      createOrder: 'إنشاء طلب',
      updateOrder: 'تحديث الطلب',
      cancel: 'إلغاء',
      orderList: 'قائمة الطلبات',
      customerName: 'العميل',
      items: 'المنتجات',
      total: 'المجموع',
      date: 'التاريخ',
      actions: 'إجراءات',
      noOrders: 'لا توجد طلبات.',
      success: 'نجاح!',
      orderUpdated: 'تم تحديث الطلب بنجاح!',
      invoiceSent: 'تم إرسال الفاتورة بالبريد الإلكتروني إلى العميل.',
      deleteConfirm: 'هل تريد حذف هذا الطلب؟',
      loading: 'جاري تحميل الطلبات…',
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
      failedToGeneratePDF: 'فشل إنشاء PDF'
    }
  };

  const currentLang = t[language];
  const isRTL = language === 'ar';

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
      setError(currentLang.pleaseSelectCustomer);
      return;
    }
    if (form.items.some(item => !item.productId || item.quantity <= 0)) {
      setError(currentLang.fillItemsCorrectly);
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
        setPopupMessage(currentLang.orderUpdated);
      } else {
        await createOrder(payload, token);
        setPopupMessage(currentLang.invoiceSent);
      }
      
      resetForm();
      loadData();
      loadTotalAmount();
      setError('');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || currentLang.errorSavingOrder);
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
    if (!window.confirm(currentLang.deleteConfirm)) return;
    try {
      await deleteOrder(id, token);
      loadData();
      loadTotalAmount();
    } catch (err) {
      alert(err.response?.data?.message || err.message || currentLang.failedToDelete);
    }
  };

  // PDF Generation (bilingual)
  const generateInvoicePDF = (order) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      // Header - Bilingual
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 43, 78);
      doc.text('AL RUBAI UNITED AL CRISTAL', pageWidth / 2, y, { align: 'center' });
      
      y += 10;
      doc.setFontSize(14);
      doc.text('الكريستال الرباعي المتحدة', pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(16);
      doc.text(currentLang.invoice, pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`${currentLang.orderId}: ${order._id.slice(-8)}`, margin, y);
      doc.text(`${currentLang.date}: ${new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}`, margin, y + 6);
      
      // Customer info
      const customer = customers.find(c => c._id === (order.customerId?._id || order.customerId));
      if (customer) {
        doc.text(`${currentLang.customer}: ${customer.name}`, margin, y + 18);
        if (customer.email) doc.text(`${currentLang.email}: ${customer.email}`, margin, y + 24);
        if (customer.phone) doc.text(`${currentLang.phone}: ${customer.phone}`, margin, y + 30);
      }

      y += 45;
      
      // Items table
      const tableColumn = [currentLang.product, currentLang.quantity, currentLang.unitPrice, currentLang.total];
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
      doc.text(`${currentLang.total}: ${formatMoney(total)}`, pageWidth - margin, finalY, { align: 'right' });
      
      // Footer - Bilingual
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(currentLang.thankYou, pageWidth / 2, footerY, { align: 'center' });
      
      doc.save(`invoice_${order._id}_${language}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert(currentLang.failedToGeneratePDF);
    }
  };

  if (loading) return <div className="orders-page" dir={isRTL ? 'rtl' : 'ltr'}><div className="loading">{currentLang.loading}</div></div>;

  return (
    <div className="orders-page" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle Button - Floating */}
      <button 
        className="btn-language-floating" 
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      >
        <FiGlobe size={18} /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      <div className="page-header">
        <div>
          <h1>{currentLang.orders}</h1>
          <p>{currentLang.manageOrders}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Success Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <FiCheckCircle className="popup-icon" />
            <h3>{currentLang.success}</h3>
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
            <h3>{currentLang.totalOrders}</h3>
            <p>{orders.length}</p>
          </div>
        </div>
        <div className="kpi-card">
          <FiDollarSign className="kpi-icon" />
          <div>
            <h3>{currentLang.totalRevenue}</h3>
            <p>{formatMoney(totalOrderAmount)}</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <h3><FiShoppingCart /> {form._id ? currentLang.editOrder : currentLang.newOrder}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label><FiUser /> {currentLang.customer} *</label>
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
              >
                <option value="">{currentLang.selectCustomer}</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="items-section">
            <label><FiPackage /> {currentLang.products} *</label>
            <div className="item-row-header">
              <span>{currentLang.product}</span>
              <span>{currentLang.quantity}</span>
              <span></span>
            </div>
            {form.items.map((item, index) => (
              <div key={item.id} className="item-row">
                <select
                  value={item.productId}
                  onChange={e => handleItemChange(item.id, 'productId', e.target.value)}
                  required
                >
                  <option value="">{currentLang.selectProduct}</option>
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
              <FiPlus /> {currentLang.addProduct}
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {form._id ? <><FiEdit2 /> {currentLang.updateOrder}</> : <><FiPlus /> {currentLang.createOrder}</>}
            </button>
            {form._id && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FiX /> {currentLang.cancel}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Orders Table - Without ID column */}
      <div className="table-container">
        <h3><FiShoppingCart /> {currentLang.orderList}</h3>
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>{currentLang.customerName}</th>
                <th>{currentLang.items}</th>
                <th>{currentLang.total}</th>
                <th>{currentLang.date}</th>
                <th>{currentLang.actions}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-message">{currentLang.noOrders}</td>
                </tr>
              ) : (
                orders.map(order => {
                  const customer = customers.find(c => c._id === (order.customerId?._id || order.customerId));
                  const total = order.totalAmount || calculateOrderTotal(order.items, products);
                  return (
                    <tr key={order._id}>
                      <td data-label={currentLang.customerName}>
                        <div className="customer-info">
                          <strong>{customer?.name || '—'}</strong>
                          {customer?.email && <small>{customer.email}</small>}
                        </div>
                      </td>
                      <td data-label={currentLang.items}>
                        <div className="items-list">
                          {order.items.map((item, idx) => {
                            const product = products.find(p => p._id === (item.productId?._id || item.productId));
                            return (
                              <div key={idx} className="item-badge">
                                {product?.name} x{item.quantity}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td data-label={currentLang.total} className="total-cell">{formatMoney(total)}</td>
                      <td data-label={currentLang.date}>
                        {new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}
                      </td>
                      <td data-label={currentLang.actions} className="actions">
                        <button className="icon-btn edit-btn" onClick={() => handleEdit(order)} title={currentLang.editOrder}>
                          <FiEdit2 />
                        </button>
                        <button className="icon-btn delete-btn" onClick={() => handleDelete(order._id)} title={currentLang.deleteConfirm}>
                          <FiTrash2 />
                        </button>
                        <button className="icon-btn download-btn" onClick={() => generateInvoicePDF(order)} title="Download PDF">
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