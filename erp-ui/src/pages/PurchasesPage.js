// PurchasesPage.js - Version modernisée avec thème bleu & doré
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import logo from '../assets/logo.png';
import { 
  FiTrash2, FiDownload, FiPlus, FiX, FiDollarSign, FiShoppingBag, 
  FiEdit, FiCheckCircle, FiGlobe, FiAlertCircle, FiRefreshCw,
  FiPackage, FiTruck, FiCalendar, FiTrendingUp
} from 'react-icons/fi';
import '../styles/PurchasesPage.css';

export default function PurchasesPage({ token }) {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const translations = {
    en: {
      purchases: 'Purchases Management',
      managePurchases: 'Manage purchase orders and track expenses',
      totalPurchases: 'Total Purchases',
      totalAmount: 'Total Amount',
      addNewPurchase: 'Create New Purchase Order',
      editPurchase: 'Edit Purchase Order',
      supplier: 'Supplier',
      selectSupplier: 'Select supplier',
      products: 'Products',
      product: 'Product',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      addProduct: 'Add Product',
      addPurchase: 'Create Purchase',
      updatePurchase: 'Update Purchase',
      cancel: 'Cancel',
      purchaseList: 'Purchase Orders',
      actions: 'Actions',
      noPurchases: 'No purchase orders found.',
      success: 'Purchase Created!',
      purchaseCreated: 'Purchase order created successfully!',
      purchaseUpdated: 'Purchase order updated successfully!',
      invoiceSent: 'Invoice sent to supplier.',
      deleteConfirm: 'Are you sure you want to delete this purchase?',
      loading: 'Loading purchases...',
      refreshing: 'Refreshing...',
      purchaseInvoice: 'PURCHASE INVOICE',
      invoiceNumber: 'Invoice #',
      invoiceDate: 'Invoice Date',
      bankMuscat: 'Bank Muscat',
      accountNumber: 'Account Number',
      iban: 'IBAN',
      thankYou: 'Thank you for your business!',
      total: 'Total',
      stock: 'Stock',
      selectProduct: 'Select product',
      pleaseSelectSupplier: 'Supplier is automatically set when you select a product',
      fillItemsCorrectly: 'All items must have a product, positive quantity, and non-negative price',
      errorSavingPurchase: 'Error saving purchase',
      failedToDelete: 'Failed to delete purchase',
      failedToGeneratePDF: 'Failed to generate PDF',
      supplierAutoFilled: 'Auto-filled from product',
      multipleSuppliersWarning: 'Products from different suppliers cannot be mixed',
      productNotFound: 'Product not found',
      avgPurchaseValue: 'Avg Purchase Value',
      thisMonth: 'This Month'
    },
    ar: {
      purchases: 'إدارة المشتريات',
      managePurchases: 'إدارة أوامر الشراء وتتبع المصروفات',
      totalPurchases: 'إجمالي المشتريات',
      totalAmount: 'المبلغ الإجمالي',
      addNewPurchase: 'إنشاء أمر شراء جديد',
      editPurchase: 'تعديل أمر الشراء',
      supplier: 'المورد',
      selectSupplier: 'اختر المورد',
      products: 'المنتجات',
      product: 'المنتج',
      quantity: 'الكمية',
      unitPrice: 'سعر الوحدة',
      addProduct: 'إضافة منتج',
      addPurchase: 'إنشاء شراء',
      updatePurchase: 'تحديث الشراء',
      cancel: 'إلغاء',
      purchaseList: 'أوامر الشراء',
      actions: 'إجراءات',
      noPurchases: 'لا توجد أوامر شراء',
      success: 'تم إنشاء عملية الشراء!',
      purchaseCreated: 'تم إنشاء أمر الشراء بنجاح!',
      purchaseUpdated: 'تم تحديث أمر الشراء بنجاح!',
      invoiceSent: 'تم إرسال الفاتورة إلى المورد',
      deleteConfirm: 'هل أنت متأكد من حذف عملية الشراء هذه؟',
      loading: 'جاري تحميل المشتريات...',
      refreshing: 'جاري التحديث...',
      purchaseInvoice: 'فاتورة الشراء',
      invoiceNumber: 'رقم الفاتورة',
      invoiceDate: 'تاريخ الفاتورة',
      bankMuscat: 'بنك مسقط',
      accountNumber: 'رقم الحساب',
      iban: 'الأيبان',
      thankYou: 'شكراً لتعاملك معنا!',
      total: 'المجموع',
      stock: 'المخزون',
      selectProduct: 'اختر منتج',
      pleaseSelectSupplier: 'يتم تعيين المورد تلقائياً عند اختيار المنتج',
      fillItemsCorrectly: 'يجب أن تحتوي جميع العناصر على منتج وكمية موجبة وسعر غير سالب',
      errorSavingPurchase: 'خطأ في حفظ عملية الشراء',
      failedToDelete: 'فشل حذف عملية الشراء',
      failedToGeneratePDF: 'فشل إنشاء PDF',
      supplierAutoFilled: 'تم التعيين تلقائياً من المنتج',
      multipleSuppliersWarning: 'لا يمكن خلط منتجات من موردين مختلفين',
      productNotFound: 'المنتج غير موجود',
      avgPurchaseValue: 'متوسط قيمة الشراء',
      thisMonth: 'هذا الشهر'
    }
  };

  const currentLang = translations[language];
  const isRTL = language === 'ar';

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

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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
      setError(currentLang.multipleSuppliersWarning);
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
  }, [token]);

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
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, loadPurchases, loadProducts, loadSuppliers, loadTotalAmount]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const metrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthPurchases = purchases.filter(purchase => {
      const date = new Date(purchase.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const thisMonthAmount = thisMonthPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const avgPurchaseValue = purchases.length > 0 ? totalPurchaseAmount / purchases.length : 0;
    
    return {
      totalPurchases: purchases.length,
      totalAmount: totalPurchaseAmount,
      avgPurchaseValue,
      thisMonthCount: thisMonthPurchases.length,
      thisMonthAmount
    };
  }, [purchases, totalPurchaseAmount]);

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

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const showSuccessMessage = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessPopup(true);
  };

  const handleSubmit = async () => {
    if (!form.supplierId) {
      setError(currentLang.multipleSuppliersWarning);
      return;
    }
    if (form.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      setError(currentLang.fillItemsCorrectly);
      return;
    }

    const payload = {
      supplierId: form.supplierId,
      items: form.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
    };

    try {
      await createPurchase(payload, token);
      showSuccessMessage(`${currentLang.purchaseCreated} ${currentLang.invoiceSent}`);
      resetForm();
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || currentLang.errorSavingPurchase);
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
      setError(currentLang.multipleSuppliersWarning);
      return;
    }
    if (editForm.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      setError(currentLang.fillItemsCorrectly);
      return;
    }

    const payload = {
      supplierId: editForm.supplierId,
      items: editForm.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
    };

    try {
      await updatePurchase(editingPurchaseId, payload, token);
      setSuccess(currentLang.purchaseUpdated);
      closeEditModal();
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || currentLang.errorSavingPurchase);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(currentLang.deleteConfirm)) return;
    try {
      await deletePurchase(id, token);
      setSuccess('Purchase deleted successfully');
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || currentLang.failedToDelete);
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s._id === supplierId);
    return supplier?.name || '—';
  };

  const generateInvoicePDF = (purchase) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      // Header with gradient
      doc.setFillColor(10, 43, 78);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('AL RUBAI UNITED AL CRISTAL', pageWidth / 2, y + 15, { align: 'center' });
      
      doc.setFontSize(12);
      
      y += 45;
      doc.setTextColor(10, 43, 78);
      doc.setFontSize(18);
      doc.text(currentLang.purchaseInvoice, pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const invoiceNumber = `PUR-${purchase._id.slice(-8)}`;
      doc.text(`${currentLang.invoiceNumber}: ${invoiceNumber}`, margin, y);
      doc.text(`${currentLang.invoiceDate}: ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}`, margin, y + 6);
      
      const supplier = suppliers.find(s => s._id === (purchase.supplierId?._id || purchase.supplierId));
      if (supplier) {
        y += 20;
        doc.setFontSize(11);
        doc.text(`${currentLang.supplier}: ${supplier.name}`, margin, y);
        if (supplier.email) doc.text(`Email: ${supplier.email}`, margin, y + 6);
        if (supplier.phone) doc.text(`Phone: ${supplier.phone}`, margin, y + 12);
        y += 20;
      } else {
        y += 15;
      }

      const tableColumn = [currentLang.product, currentLang.quantity, currentLang.unitPrice, currentLang.total];
      const tableRows = purchase.items.map(item => {
        const product = products.find(p => p._id === (item.productId?._id || item.productId));
        const productName = product?.name || 'Unknown';
        const quantity = item.quantity;
        const price = item.price;
        const total = price * quantity;
        return [productName, quantity.toString(), `$${price.toFixed(2)}`, `$${total.toFixed(2)}`];
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
      const total = purchase.totalAmount || tableRows.reduce((sum, row) => sum + parseFloat(row[3].replace('$', '')), 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 43, 78);
      doc.text(`${currentLang.total}: $${total.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
      
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(currentLang.thankYou, pageWidth / 2, footerY, { align: 'center' });
      
      doc.save(`purchase_invoice_${purchase._id}_${language}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(currentLang.failedToGeneratePDF);
    }
  };

  if (loading) {
    return (
      <div className="purchases-page-modern" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen-premium">
          <div className="premium-spinner"></div>
          <p>{currentLang.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`purchases-page-modern ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background */}
      <div className="purchases-bg-animation">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      {/* Language Toggle */}
      <button className="language-toggle-premium" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
        <FiGlobe /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="popup-overlay-premium" onClick={() => setShowSuccessPopup(false)}>
          <div className="popup-content-premium" onClick={e => e.stopPropagation()}>
            <div className="popup-icon-premium">
              <FiCheckCircle size={40} />
            </div>
            <h3>{currentLang.success}</h3>
            <p>{successMessage}</p>
            <button className="popup-close-premium" onClick={() => setShowSuccessPopup(false)}>OK</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header-premium">
        <div className="header-content">
          <div className="header-icon">
            <FiShoppingBag size={32} />
          </div>
          <div>
            <h1>{currentLang.purchases}</h1>
            <p>{currentLang.managePurchases}</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => loadAllData(true)} disabled={refreshing}>
          <FiRefreshCw className={refreshing ? 'spinning' : ''} />
          {refreshing ? currentLang.refreshing : 'Refresh'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert-premium error">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert-premium success">
          <FiCheckCircle />
          <span>{success}</span>
          <div className="progress-bar"></div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid-premium">
        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiShoppingBag />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.totalPurchases}</h3>
            <div className="kpi-value">{metrics.totalPurchases}</div>
            <div className="kpi-trend">
              <FiTrendingUp />
              <span>{metrics.thisMonthCount} {currentLang.thisMonth}</span>
            </div>
          </div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiDollarSign />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.totalAmount}</h3>
            <div className="kpi-value">${metrics.totalAmount.toFixed(2)}</div>
            <div className="kpi-sub">${metrics.thisMonthAmount.toFixed(2)} this month</div>
          </div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiTrendingUp />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.avgPurchaseValue}</h3>
            <div className="kpi-value">${metrics.avgPurchaseValue.toFixed(2)}</div>
            <div className="kpi-sub">per transaction</div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card-premium">
        <div className="form-card-header">
          <h3><FiPlus /> {currentLang.addNewPurchase}</h3>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="form-group-premium">
            <label><FiTruck /> {currentLang.supplier} <span className="required">*</span></label>
            <div className="supplier-auto-field-premium">
              <input
                type="text"
                value={form.supplierId ? getSupplierName(form.supplierId) : currentLang.supplierAutoFilled}
                readOnly
                className="premium-input auto-filled"
              />
              <span className="auto-badge">{currentLang.supplierAutoFilled}</span>
            </div>
          </div>

          <div className="items-section-premium">
            <label><FiPackage /> {currentLang.products} <span className="required">*</span></label>
            <div className="items-header">
              <span>{currentLang.product}</span>
              <span>{currentLang.quantity}</span>
              <span>{currentLang.unitPrice}</span>
              <span></span>
            </div>
            
            {form.items.map((item, index) => {
              const selectedProduct = products.find(p => p._id === item.productId);
              const itemTotal = (item.quantity || 0) * (item.price || 0);
              
              return (
                <div key={item.id} className="item-row-premium">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    className="premium-select"
                  >
                    <option value="">{currentLang.selectProduct}</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Stock: {p.stock ?? 0})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder={currentLang.quantity}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="premium-input"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={currentLang.unitPrice}
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    className="premium-input"
                  />
                  <div className="item-total-premium">${itemTotal.toFixed(2)}</div>
                  {form.items.length > 1 && (
                    <button type="button" className="remove-item-btn" onClick={() => removeItem(index)}>
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              );
            })}
            
            <button type="button" className="add-item-btn-premium" onClick={addItem}>
              <FiPlus /> {currentLang.addProduct}
            </button>
          </div>

          <div className="order-summary-premium">
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>${calculateTotal(form.items).toFixed(2)}</span>
            </div>
            <div className="summary-line total">
              <span>{currentLang.total}:</span>
              <span>${calculateTotal(form.items).toFixed(2)}</span>
            </div>
          </div>

          <div className="form-actions-premium">
            <button type="submit" className="btn-submit">
              <FiPlus /> {currentLang.addPurchase}
            </button>
          </div>
        </form>
      </div>

      {/* Purchases Table */}
      <div className="table-card-premium">
        <div className="table-header">
          <h3><FiShoppingBag /> {currentLang.purchaseList}</h3>
          <div className="table-stats">{purchases.length} total purchases</div>
        </div>
        
        <div className="table-responsive-premium">
          <table className="purchases-table-premium">
            <thead>
              <tr>
                <th>{currentLang.supplier}</th>
                <th>{currentLang.products}</th>
                <th>{currentLang.totalAmount}</th>
                <th>{currentLang.actions}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state-premium">
                    <FiShoppingBag size={48} />
                    <p>{currentLang.noPurchases}</p>
                  </td>
                </tr>
              ) : (
                purchases.map(purchase => {
                  const supplier = suppliers.find(s => s._id === (purchase.supplierId?._id || purchase.supplierId));
                  return (
                    <tr key={purchase._id} className="purchase-row">
                      <td data-label={currentLang.supplier}>
                        <div className="supplier-cell">
                          <div className="supplier-avatar">
                            {supplier?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="supplier-name">{supplier?.name || '—'}</div>
                        </div>
                       </td>
                      <td data-label={currentLang.products}>
                        <div className="products-badges">
                          {purchase.items.slice(0, 3).map((item, idx) => {
                            const product = products.find(p => p._id === (item.productId?._id || item.productId));
                            return (
                              <span key={idx} className="product-badge-premium">
                                {product?.name || '?'} ×{item.quantity}
                              </span>
                            );
                          })}
                          {purchase.items.length > 3 && (
                            <span className="more-badge">+{purchase.items.length - 3} more</span>
                          )}
                        </div>
                       </td>
                      <td data-label={currentLang.totalAmount} className="total-cell-premium">
                        ${(purchase.totalAmount || 0).toFixed(2)}
                       </td>
                      <td data-label={currentLang.actions} className="actions-cell-premium">
                        <button className="action-icon edit" onClick={() => openEditModal(purchase)} title={currentLang.editPurchase}>
                          <FiEdit />
                        </button>
                        <button className="action-icon delete" onClick={() => handleDelete(purchase._id)} title={currentLang.deleteConfirm}>
                          <FiTrash2 />
                        </button>
                        <button className="action-icon download" onClick={() => generateInvoicePDF(purchase)} title="Download PDF">
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
        <div className="modal-overlay-premium" onClick={closeEditModal}>
          <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
            <div className="modal-header-premium">
              <h3><FiEdit /> {currentLang.editPurchase}</h3>
              <button className="modal-close-premium" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body-premium">
              <div className="form-group-premium">
                <label><FiTruck /> {currentLang.supplier}</label>
                <div className="supplier-auto-field-premium">
                  <input
                    type="text"
                    value={editForm.supplierId ? getSupplierName(editForm.supplierId) : currentLang.supplierAutoFilled}
                    readOnly
                    className="premium-input auto-filled"
                  />
                  <span className="auto-badge">{currentLang.supplierAutoFilled}</span>
                </div>
              </div>

              <div className="items-section-premium">
                <label><FiPackage /> {currentLang.products}</label>
                <div className="items-header">
                  <span>{currentLang.product}</span>
                  <span>{currentLang.quantity}</span>
                  <span>{currentLang.unitPrice}</span>
                  <span></span>
                </div>
                
                {editForm.items.map((item, index) => {
                  const itemTotal = (item.quantity || 0) * (item.price || 0);
                  
                  return (
                    <div key={item.id} className="item-row-premium">
                      <select
                        value={item.productId}
                        onChange={(e) => handleEditItemChange(index, 'productId', e.target.value)}
                        className="premium-select"
                      >
                        <option value="">{currentLang.selectProduct}</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} (Stock: {p.stock ?? 0})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleEditItemChange(index, 'quantity', e.target.value)}
                        className="premium-input"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleEditItemChange(index, 'price', e.target.value)}
                        className="premium-input"
                      />
                      <div className="item-total-premium">${itemTotal.toFixed(2)}</div>
                      {editForm.items.length > 1 && (
                        <button type="button" className="remove-item-btn" onClick={() => removeEditItem(index)}>
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  );
                })}
                
                <button type="button" className="add-item-btn-premium" onClick={addEditItem}>
                  <FiPlus /> {currentLang.addProduct}
                </button>
              </div>

              <div className="order-summary-premium">
                <div className="summary-line total">
                  <span>{currentLang.total}:</span>
                  <span>${calculateTotal(editForm.items).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer-premium">
              <button className="btn-secondary-premium" onClick={closeEditModal}>{currentLang.cancel}</button>
              <button className="btn-primary-premium" onClick={handleUpdateSubmit}>{currentLang.updatePurchase}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}