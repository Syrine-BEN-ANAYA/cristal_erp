// PurchasesPage.js - Version avec contexte global
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getTotalPurchaseAmount
} from '../api/purchasesService';
import { getProducts } from '../api/productsService';
import { getSuppliers } from '../api/suppliersService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FiTrash2, FiDownload, FiPlus, FiShoppingBag, 
  FiEdit2, FiCheckCircle, FiGlobe, FiAlertCircle, FiRefreshCw,
  FiPackage, FiTruck, FiCalendar
} from 'react-icons/fi';
import '../styles/PurchasesPage.css';

const normalizeId = (objOrId) => {
  if (!objOrId) return '';
  if (typeof objOrId === 'string') return objOrId;
  return objOrId?._id || '';
};

const formatMoney = (value) => {
  const numericValue = Number(value) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
};

export default function PurchasesPage({ token }) {
  const { t, isRTL, language, toggleLanguage } = useLanguage();

  // Traductions spécifiques à PurchasesPage
  const purchasesTranslations = {
    EN: {
      purchases: 'Purchases Management',
      managePurchases: 'Manage purchase orders and track expenses',
      newPurchase: 'Create New Purchase Order',
      editPurchase: 'Edit Purchase Order',
      supplier: 'Supplier',
      products: 'Products',
      product: 'Product',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      addProduct: 'Add Product',
      createPurchase: 'Create Purchase',
      updatePurchase: 'Update Purchase',
      cancel: 'Cancel',
      purchaseList: 'Purchase Orders',
      actions: 'Actions',
      noPurchases: 'No purchase orders found. Create your first purchase above.',
      success: 'Success!',
      purchaseCreated: 'Purchase order created successfully!',
      purchaseUpdated: 'Purchase order updated successfully!',
      invoiceSent: 'Invoice sent to supplier.',
      deleteConfirm: 'Delete this purchase order?',
      loading: 'Loading purchases...',
      refreshing: 'Refreshing...',
      purchaseInvoice: 'PURCHASE INVOICE',
      invoiceNumber: 'Invoice #',
      invoiceDate: 'Invoice Date',
      thankYou: 'Thank you for your business!',
      total: 'Total',
      stock: 'Stock',
      selectProduct: 'Select product',
      fillItemsCorrectly: 'Please fill all items correctly',
      errorSavingPurchase: 'Error saving purchase',
      failedToDelete: 'Failed to delete purchase',
      failedToGeneratePDF: 'Failed to generate PDF',
      multipleSuppliersWarning: 'Products from different suppliers cannot be mixed',
      supplierAutoFilled: 'Auto-filled from product',
      downloadInvoice: 'Download Invoice',
      date: 'Date',
      email: 'Email',
      phone: 'Phone',
      items: 'Items',
      subtotal: 'Subtotal'
    },
    AR: {
      purchases: 'إدارة المشتريات',
      managePurchases: 'إدارة أوامر الشراء وتتبع المصروفات',
      newPurchase: 'إنشاء أمر شراء جديد',
      editPurchase: 'تعديل أمر الشراء',
      supplier: 'المورد',
      products: 'المنتجات',
      product: 'المنتج',
      quantity: 'الكمية',
      unitPrice: 'سعر الوحدة',
      addProduct: 'إضافة منتج',
      createPurchase: 'إنشاء شراء',
      updatePurchase: 'تحديث الشراء',
      cancel: 'إلغاء',
      purchaseList: 'أوامر الشراء',
      actions: 'إجراءات',
      noPurchases: 'لا توجد أوامر شراء. قم بإنشاء أمر الشراء الأول أعلاه',
      success: 'نجاح!',
      purchaseCreated: 'تم إنشاء أمر الشراء بنجاح!',
      purchaseUpdated: 'تم تحديث أمر الشراء بنجاح!',
      invoiceSent: 'تم إرسال الفاتورة إلى المورد',
      deleteConfirm: 'هل تريد حذف أمر الشراء هذا؟',
      loading: 'جاري تحميل المشتريات...',
      refreshing: 'جاري التحديث...',
      purchaseInvoice: 'فاتورة الشراء',
      invoiceNumber: 'رقم الفاتورة',
      invoiceDate: 'تاريخ الفاتورة',
      thankYou: 'شكراً لتعاملك معنا!',
      total: 'المجموع',
      stock: 'المخزون',
      selectProduct: 'اختر منتج',
      fillItemsCorrectly: 'الرجاء تعبئة جميع العناصر بشكل صحيح',
      errorSavingPurchase: 'خطأ في حفظ عملية الشراء',
      failedToDelete: 'فشل حذف عملية الشراء',
      failedToGeneratePDF: 'فشل إنشاء PDF',
      multipleSuppliersWarning: 'لا يمكن خلط منتجات من موردين مختلفين',
      supplierAutoFilled: 'تم التعيين تلقائياً من المنتج',
      downloadInvoice: 'تحميل الفاتورة',
      date: 'التاريخ',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      items: 'المنتجات',
      subtotal: 'المجموع الفرعي'
    }
  };

  const localT = purchasesTranslations[language];

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [setTotalPurchaseAmount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    supplierId: '',
    items: [{ id: Date.now(), productId: '', quantity: 1, price: 0 }]
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [editForm, setEditForm] = useState({
    supplierId: '',
    items: [{ id: Date.now(), productId: '', quantity: 1, price: 0 }]
  });

  const getSupplierFromProduct = (productId) => {
    const product = products.find(p => p._id === productId);
    return product?.supplierId?._id || product?.supplierId || null;
  };

  const getUniqueSupplierFromItems = (items) => {
    const supplierIds = items
      .map(item => getSupplierFromProduct(item.productId))
      .filter(id => id && id !== '');
    
    if (supplierIds.length === 0) return null;
    const uniqueSuppliers = [...new Set(supplierIds)];
    return uniqueSuppliers.length === 1 ? uniqueSuppliers[0] : 'multiple';
  };

  const updateSupplierFromItems = (items, setFormFunc) => {
    const supplierId = getUniqueSupplierFromItems(items);
    
    if (supplierId === 'multiple') {
      setError(localT.multipleSuppliersWarning);
      setFormFunc(prev => ({ ...prev, supplierId: '' }));
      return false;
    } else if (supplierId) {
      setError('');
      setFormFunc(prev => ({ ...prev, supplierId }));
      return true;
    } else {
      setFormFunc(prev => ({ ...prev, supplierId: '' }));
      return false;
    }
  };

  const loadPurchases = useCallback(async () => {
    try {
      const data = await getPurchases(token);
      setPurchases(data || []);
    } catch (err) {
      console.error('Failed to load purchases:', err.message);
    }
  }, [token]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(token);
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err.message);
    }
  }, [token]);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getSuppliers(token);
      setSuppliers(data || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err.message);
    }
  }, [token]);

  const loadTotalAmount = useCallback(async () => {
    try {
      const data = await getTotalPurchaseAmount(token);
      setTotalPurchaseAmount(data.totalPurchaseAmount || 0);
    } catch (err) {
      console.error('Failed to load total purchase amount:', err.message);
    }
  }, [setTotalPurchaseAmount, token]);

  const loadAllData = useCallback(async (showRefresh = false) => {
    if (!token) return;
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      
      await Promise.all([
        loadPurchases(),
        loadProducts(),
        loadSuppliers(),
        loadTotalAmount()
      ]);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, loadPurchases, loadProducts, loadSuppliers, loadTotalAmount]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s._id === supplierId);
    return supplier?.name || '—';
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    if (field === 'quantity' || field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setForm(prev => ({ ...prev, items: newItems }));
    updateSupplierFromItems(newItems, setForm);
  };

  const addItem = () => {
    const newItems = [...form.items, { id: Date.now(), productId: '', quantity: 1, price: 0 }];
    setForm(prev => ({ ...prev, items: newItems }));
    updateSupplierFromItems(newItems, setForm);
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    const newItems = form.items.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, items: newItems }));
    updateSupplierFromItems(newItems, setForm);
  };

  const resetForm = () => {
    setForm({
      supplierId: '',
      items: [{ id: Date.now(), productId: '', quantity: 1, price: 0 }]
    });
    setError('');
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.supplierId) {
      setError(localT.multipleSuppliersWarning);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (form.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      setError(localT.fillItemsCorrectly);
      setTimeout(() => setError(''), 3000);
      return;
    }

    const payload = {
      supplierId: normalizeId(form.supplierId),
      items: form.items.map(item => ({
        productId: normalizeId(item.productId),
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
    };

    try {
      await createPurchase(payload, token);
      showSuccessMessage(`${localT.purchaseCreated} ${localT.invoiceSent}`);
      resetForm();
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || localT.errorSavingPurchase);
      setTimeout(() => setError(''), 4000);
    }
  };

  const openEditModal = (purchase) => {
    const supplierId = purchase.supplierId?._id || purchase.supplierId;
    const items = purchase.items.map((item, idx) => ({
      id: Date.now() + idx,
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    setEditForm({ supplierId, items });
    setEditingPurchaseId(purchase._id);
    setIsEditModalOpen(true);
    setError('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPurchaseId(null);
    setEditForm({ supplierId: '', items: [{ id: Date.now(), productId: '', quantity: 1, price: 0 }] });
    setError('');
  };

  const handleEditItemChange = (index, field, value) => {
    const newItems = [...editForm.items];
    if (field === 'quantity' || field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setEditForm(prev => ({ ...prev, items: newItems }));
    updateSupplierFromItems(newItems, setEditForm);
  };

  const addEditItem = () => {
    const newItems = [...editForm.items, { id: Date.now(), productId: '', quantity: 1, price: 0 }];
    setEditForm(prev => ({ ...prev, items: newItems }));
    updateSupplierFromItems(newItems, setEditForm);
  };

  const removeEditItem = (index) => {
    if (editForm.items.length <= 1) return;
    const newItems = editForm.items.filter((_, i) => i !== index);
    setEditForm(prev => ({ ...prev, items: newItems }));
    updateSupplierFromItems(newItems, setEditForm);
  };

  const handleUpdateSubmit = async () => {
    if (!editForm.supplierId) {
      setError(localT.multipleSuppliersWarning);
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (editForm.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      setError(localT.fillItemsCorrectly);
      setTimeout(() => setError(''), 3000);
      return;
    }

    const payload = {
      supplierId: normalizeId(editForm.supplierId),
      items: editForm.items.map(item => ({
        productId: normalizeId(item.productId),
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
    };

    try {
      await updatePurchase(editingPurchaseId, payload, token);
      setSuccess(localT.purchaseUpdated);
      setTimeout(() => setSuccess(''), 3000);
      closeEditModal();
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || localT.errorSavingPurchase);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(localT.deleteConfirm)) return;
    try {
      await deletePurchase(id, token);
      setSuccess('Purchase deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || localT.failedToDelete);
      setTimeout(() => setError(''), 3000);
    }
  };

  const generateInvoicePDF = (purchase) => {
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
      doc.text(localT.purchaseInvoice, pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${localT.invoiceNumber}: PUR-${purchase._id.slice(-8)}`, margin, y);
      doc.text(`${localT.date}: ${new Date(purchase.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}`, margin, y + 6);
      
      const supplier = suppliers.find(s => s._id === (purchase.supplierId?._id || purchase.supplierId));
      if (supplier) {
        y += 20;
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text(`${localT.supplier}: ${supplier.name}`, margin, y);
        if (supplier.email) doc.text(`${localT.email}: ${supplier.email}`, margin, y + 6);
        if (supplier.phone) doc.text(`${localT.phone}: ${supplier.phone}`, margin, y + 12);
        y += 25;
      } else {
        y += 20;
      }

      const tableColumn = [localT.product, localT.quantity, localT.unitPrice, localT.total];
      const tableRows = purchase.items.map(item => {
        const product = products.find(p => p._id === (item.productId?._id || item.productId));
        const productName = product?.name || 'Unknown';
        const quantity = item.quantity;
        const price = item.price;
        const total = price * quantity;
        return [productName, quantity.toString(), formatMoney(price), formatMoney(total)];
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
      const total = purchase.totalAmount || calculateTotal(purchase.items);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(212, 175, 55);
      doc.text(`${localT.total}: ${formatMoney(total)}`, pageWidth - margin, finalY, { align: 'right' });
      
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(localT.thankYou, pageWidth / 2, footerY, { align: 'center' });
      
      doc.save(`purchase_invoice_${purchase._id}_${language}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(localT.failedToGeneratePDF);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="purchases-page" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>{localT.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`purchases-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <button className="language-toggle" onClick={toggleLanguage}>
        <FiGlobe /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <FiShoppingBag size={28} />
          </div>
          <div>
            <h1>{localT.purchases}</h1>
            <p>{localT.managePurchases}</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => loadAllData(true)} disabled={refreshing}>
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
          <h3><FiPlus /> {localT.newPurchase}</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="items-section">
            <label><FiPackage /> {localT.products} <span className="required">*</span></label>
            <div className="items-header">
              <span>{localT.product}</span>
              <span>{localT.quantity}</span>
              <span>{localT.unitPrice}</span>
              <span>{localT.total}</span>
              <span></span>
            </div>
            
            {form.items.map((item, index) => {
              const itemTotal = (item.quantity || 0) * (item.price || 0);
              
              return (
                <div key={item.id} className="item-row">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">{localT.selectProduct}</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({localT.stock}: {p.stock ?? 0})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder={localT.quantity}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="form-input"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={localT.unitPrice}
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    className="form-input"
                    required
                  />
                  <div className="item-total">{formatMoney(itemTotal)}</div>
                  {form.items.length > 1 && (
                    <button type="button" className="remove-item" onClick={() => removeItem(index)}>
                      <FiTrash2 />
                    </button>
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
              <span>{formatMoney(calculateTotal(form.items))}</span>
            </div>
            <div className="summary-line total">
              <span>{localT.total}:</span>
              <span>{formatMoney(calculateTotal(form.items))}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <FiPlus /> {localT.createPurchase}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3><FiShoppingBag /> {localT.purchaseList}</h3>
          <div className="table-stats">{purchases.length} {localT.purchases}</div>
        </div>
        
        <div className="table-responsive">
          <table className="purchases-table">
            <thead>
              <tr>
                <th>{localT.supplier}</th>
                <th>{localT.items}</th>
                <th>{localT.total}</th>
                <th>{localT.date}</th>
                <th>{localT.actions}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <FiShoppingBag size={48} />
                    <p>{localT.noPurchases}</p>
                  </td>
                </tr>
              ) : (
                purchases.map(purchase => {
                  const supplier = suppliers.find(s => s._id === (purchase.supplierId?._id || purchase.supplierId));
                  const total = purchase.totalAmount || calculateTotal(purchase.items);
                  return (
                    <tr key={purchase._id} className="purchase-row">
                      <td data-label={localT.supplier}>
                        <div className="supplier-cell">
                          <div className="supplier-avatar">
                            {supplier?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="supplier-name">{supplier?.name || '—'}</div>
                            {supplier?.email && <div className="supplier-email">{supplier.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td data-label={localT.items}>
                        <div className="items-badges">
                          {purchase.items.slice(0, 3).map((item, idx) => {
                            const product = products.find(p => p._id === (item.productId?._id || item.productId));
                            return (
                              <span key={idx} className="item-badge">
                                {product?.name || '?'} ×{item.quantity}
                              </span>
                            );
                          })}
                          {purchase.items.length > 3 && (
                            <span className="more-badge">
                              +{purchase.items.length - 3} more
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
                          {new Date(purchase.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}
                        </div>
                      </td>
                      <td data-label={localT.actions} className="actions-cell">
                        <button className="action-icon edit" onClick={() => openEditModal(purchase)} title={localT.editPurchase}>
                          <FiEdit2 />
                        </button>
                        <button className="action-icon delete" onClick={() => handleDelete(purchase._id)} title={localT.deleteConfirm}>
                          <FiTrash2 />
                        </button>
                        <button className="action-icon download" onClick={() => generateInvoicePDF(purchase)} title={localT.downloadInvoice}>
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiEdit2 /> {localT.editPurchase}</h3>
              <button className="modal-close" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label><FiTruck /> {localT.supplier}</label>
                <div className="supplier-auto-field">
                  <input
                    type="text"
                    value={editForm.supplierId ? getSupplierName(editForm.supplierId) : localT.supplierAutoFilled}
                    readOnly
                    className="form-input auto-filled"
                  />
                  <span className="auto-badge">{localT.supplierAutoFilled}</span>
                </div>
              </div>

              <div className="items-section">
                <label><FiPackage /> {localT.products}</label>
                <div className="items-header">
                  <span>{localT.product}</span>
                  <span>{localT.quantity}</span>
                  <span>{localT.unitPrice}</span>
                  <span>{localT.total}</span>
                  <span></span>
                </div>
                
                {editForm.items.map((item, index) => {
                  const itemTotal = (item.quantity || 0) * (item.price || 0);
                  
                  return (
                    <div key={item.id} className="item-row">
                      <select
                        value={item.productId}
                        onChange={(e) => handleEditItemChange(index, 'productId', e.target.value)}
                        className="form-select"
                      >
                        <option value="">{localT.selectProduct}</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({localT.stock}: {p.stock ?? 0})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleEditItemChange(index, 'quantity', e.target.value)}
                        className="form-input"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleEditItemChange(index, 'price', e.target.value)}
                        className="form-input"
                      />
                      <div className="item-total">{formatMoney(itemTotal)}</div>
                      {editForm.items.length > 1 && (
                        <button type="button" className="remove-item" onClick={() => removeEditItem(index)}>
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  );
                })}
                
                <button type="button" className="add-item-btn" onClick={addEditItem}>
                  <FiPlus /> {localT.addProduct}
                </button>
              </div>

              <div className="order-summary">
                <div className="summary-line total">
                  <span>{localT.total}:</span>
                  <span>{formatMoney(calculateTotal(editForm.items))}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeEditModal}>{localT.cancel}</button>
              <button className="btn-primary" onClick={handleUpdateSubmit}>{localT.updatePurchase}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}