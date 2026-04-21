// src/pages/PurchasesPage.js
import React, { useState, useEffect, useCallback } from 'react';
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
import { FiTrash2, FiDownload, FiPlus, FiX, FiDollarSign, FiShoppingBag, FiEdit, FiCheckCircle, FiGlobe, FiAlertCircle } from 'react-icons/fi';
import '../styles/PurchasesPage.css';

export default function PurchasesPage({ token }) {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');

  // Translations
  const t = {
    en: {
      purchases: 'Purchases',
      managePurchases: 'Manage all purchases',
      totalPurchases: 'Total Purchases',
      totalAmount: 'Total Amount',
      addNewPurchase: 'Add New Purchase',
      editPurchase: 'Edit Purchase',
      supplier: 'Supplier',
      selectSupplier: 'Select supplier',
      products: 'Products',
      product: 'Product',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      addProduct: 'Add Product',
      addPurchase: 'Add Purchase',
      updatePurchase: 'Update Purchase',
      cancel: 'Cancel',
      purchaseList: 'Purchase List',
      actions: 'Actions',
      noPurchases: 'No purchases found.',
      success: 'Purchase Created!',
      invoiceSent: 'Invoice sent by email to the supplier.',
      deleteConfirm: 'Are you sure you want to delete this purchase?',
      loading: 'Loading purchases...',
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
      supplierAutoFilled: 'Automatically fullfiled',
      multipleSuppliersWarning: 'Products from different suppliers cannot be mixed in the same purchase',
      productNotFound: 'Product not found'
    },
    ar: {
      purchases: 'المشتريات',
      managePurchases: 'إدارة جميع المشتريات',
      totalPurchases: 'إجمالي المشتريات',
      totalAmount: 'المبلغ الإجمالي',
      addNewPurchase: 'إضافة عملية شراء جديدة',
      editPurchase: 'تعديل عملية الشراء',
      supplier: 'المورد',
      selectSupplier: 'اختر المورد',
      products: 'المنتجات',
      product: 'المنتج',
      quantity: 'الكمية',
      unitPrice: 'سعر الوحدة',
      addProduct: 'إضافة منتج',
      addPurchase: 'إضافة شراء',
      updatePurchase: 'تحديث الشراء',
      cancel: 'إلغاء',
      purchaseList: 'قائمة المشتريات',
      actions: 'إجراءات',
      noPurchases: 'لا توجد مشتريات.',
      success: 'تم إنشاء عملية الشراء!',
      invoiceSent: 'تم إرسال الفاتورة بالبريد الإلكتروني إلى المورد.',
      deleteConfirm: 'هل أنت متأكد من حذف عملية الشراء هذه؟',
      loading: 'جاري تحميل المشتريات...',
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
      supplierAutoFilled: 'تم تعيين المورد تلقائياً من المنتج',
      multipleSuppliersWarning: 'لا يمكن خلط منتجات من موردين مختلفين في نفس عملية الشراء',
      productNotFound: 'المنتج غير موجود'
    }
  };

  const currentLang = t[language];
  const isRTL = language === 'ar';

  // États pour le formulaire d'ajout
  const [form, setForm] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: 1, price: 0 }]
  });

  // États pour le modal d'édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [editForm, setEditForm] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: 1, price: 0 }]
  });

  // État pour le popup de succès
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Auto-fermeture du popup après 5 secondes
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  // Effacer l'erreur après 5 secondes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ---------------- Helper: Get supplier from product ----------------
  const getSupplierFromProduct = (productId) => {
    const product = products.find(p => p._id === productId);
    return product?.supplierId?._id || product?.supplierId || null;
  };

  // ---------------- Helper: Check if all products have same supplier ----------------
  const getUniqueSupplierFromItems = (items) => {
    const supplierIds = items
      .map(item => getSupplierFromProduct(item.productId))
      .filter(id => id && id !== '');
    
    if (supplierIds.length === 0) return null;
    
    const uniqueSuppliers = [...new Set(supplierIds)];
    return uniqueSuppliers.length === 1 ? uniqueSuppliers[0] : 'multiple';
  };

  // ---------------- Update supplier based on items ----------------
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

  // ---------------- Load Data ----------------
  const loadPurchases = useCallback(async () => {
    try {
      const data = await getPurchases(token);
      setPurchases(data);
    } catch (err) {
      console.error('Failed to load purchases:', err.message);
    }
  }, [token]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err.message);
    }
  }, [token]);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getSuppliers(token);
      setSuppliers(data);
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

  useEffect(() => {
    loadPurchases();
    loadProducts();
    loadSuppliers();
    loadTotalAmount();
  }, [loadPurchases, loadProducts, loadSuppliers, loadTotalAmount]);

  // ---------------- Form Handlers (Add) ----------------
  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    if (field === 'quantity' || field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setForm(prev => ({ ...prev, items: newItems }));
    
    // Update supplier based on new items
    updateSupplierFromItems(newItems, setForm);
  };

  const addItem = () => {
    const newItems = [...form.items, { productId: '', quantity: 1, price: 0 }];
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
      items: [{ productId: '', quantity: 1, price: 0 }]
    });
    setError('');
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = async () => {
    if (!form.supplierId) {
      alert(currentLang.multipleSuppliersWarning);
      return;
    }
    if (form.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      alert(currentLang.fillItemsCorrectly);
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
      setShowSuccessPopup(true);
      resetForm();
      loadPurchases();
      loadTotalAmount();
    } catch (err) {
      console.error('Failed to save purchase:', err.message);
      alert(err.response?.data?.message || err.message || currentLang.errorSavingPurchase);
    }
  };

  // ---------------- Update Handlers ----------------
  const openEditModal = (purchase) => {
    const supplierId = purchase.supplierId?._id || purchase.supplierId;
    const items = purchase.items.map(item => ({
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
    setEditForm({ supplierId: '', items: [{ productId: '', quantity: 1, price: 0 }] });
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
    const newItems = [...editForm.items, { productId: '', quantity: 1, price: 0 }];
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
      alert(currentLang.multipleSuppliersWarning);
      return;
    }
    if (editForm.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      alert(currentLang.fillItemsCorrectly);
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
      closeEditModal();
      loadPurchases();
      loadTotalAmount();
    } catch (err) {
      console.error('Failed to update purchase:', err.message);
      alert(err.response?.data?.message || err.message || currentLang.errorSavingPurchase);
    }
  };

  // ---------------- Delete ----------------
  const handleDelete = async (id) => {
    if (!window.confirm(currentLang.deleteConfirm)) return;
    try {
      await deletePurchase(id, token);
      loadPurchases();
      loadTotalAmount();
    } catch (err) {
      console.error('Failed to delete purchase:', err.message);
      alert(err.response?.data?.message || err.message || currentLang.failedToDelete);
    }
  };

  // ---------------- Generate Invoice PDF (Bilingual) ----------------
  const generateInvoicePDF = (purchase) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    try {
      doc.addImage(logo, 'PNG', margin, y, 40, 20);
    } catch (e) {
      console.warn('Logo could not be loaded', e);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 43, 78);
    doc.text('AL RUBAI UNITED AL CRISTAL', pageWidth / 2, y + 10, { align: 'center' });
    
    y += 8;
    doc.setFontSize(12);
    doc.text('الكريستال الرباعي المتحدة', pageWidth / 2, y + 10, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Muscat, Oman', pageWidth - margin, y + 18, { align: 'right' });
    doc.text('Email: info@cristal.om', pageWidth - margin, y + 23, { align: 'right' });

    y += 30;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(currentLang.purchaseInvoice, margin, y);

    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');

    const invoiceNumber = `PUR-${purchase._id.slice(-8)}`;
    doc.text(`${currentLang.invoiceNumber}: ${invoiceNumber}`, margin, y);
    doc.text(`${currentLang.invoiceDate}: ${new Date().toLocaleDateString(language === 'en' ? 'en-GB' : 'ar-EG')}`, margin, y + 5);

    const supplier = suppliers.find(s => s._id === (purchase.supplierId?._id || purchase.supplierId));
    if (supplier) {
      doc.text(`${currentLang.supplier}:`, pageWidth - margin - 60, y);
      doc.setFont('helvetica', 'bold');
      doc.text(supplier.name || 'N/A', pageWidth - margin - 60, y + 5);
      doc.setFont('helvetica', 'normal');
      if (supplier.address) doc.text(supplier.address, pageWidth - margin - 60, y + 10);
      if (supplier.phone) doc.text(`Phone: ${supplier.phone}`, pageWidth - margin - 60, y + 15);
    }

    y += 25;

    const tableColumn = [currentLang.product, currentLang.quantity, `${currentLang.unitPrice} (USD)`, `${currentLang.total} (USD)`];
    const tableRows = purchase.items.map(item => {
      const product = products.find(p => p._id === (item.productId?._id || item.productId));
      const productName = product?.name || 'Unknown';
      const quantity = item.quantity;
      const price = item.price;
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
    const total = purchase.totalAmount || tableRows.reduce((sum, row) => sum + parseFloat(row[3]), 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${currentLang.total}: $${total.toFixed(2)}`, pageWidth - margin - 50, finalY);

    const bankY = finalY + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(currentLang.bankMuscat, margin, bankY + 5);
    doc.text(`${currentLang.accountNumber}: 0123 4567 8901 2345`, margin, bankY + 10);
    doc.text(`${currentLang.iban}: OM12 3456 7890 1234 5678 9012`, margin, bankY + 15);

    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(currentLang.thankYou, pageWidth / 2, footerY, { align: 'center' });

    doc.save(`purchase_invoice_${purchase._id}_${language}.pdf`);
  };

  // Get supplier name for display
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s._id === supplierId);
    return supplier?.name || '—';
  };

  return (
    <div className="purchases-page" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Popup de succès après création */}
      {showSuccessPopup && (
        <div className="popup-overlay" onClick={() => setShowSuccessPopup(false)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <div className="popup-icon">
              <FiCheckCircle size={40} />
            </div>
            <h3>{currentLang.success}</h3>
            <p>{currentLang.invoiceSent}</p>
            <button className="popup-close-btn" onClick={() => setShowSuccessPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>{currentLang.purchases}</h1>
          <p>{currentLang.managePurchases}</p>
        </div>
      </div>

      {/* Language Toggle Button */}
      <button 
        className="btn-language-floating" 
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      >
        <FiGlobe size={18} /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* KPI */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card">
          <FiShoppingBag className="kpi-icon" />
          <div>
            <h3>{currentLang.totalPurchases}</h3>
            <p>{purchases.length}</p>
          </div>
        </div>
        <div className="kpi-card">
          <FiDollarSign className="kpi-icon" />
          <div>
            <h3>{currentLang.totalAmount}</h3>
            <p>${totalPurchaseAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      <div className="form-card">
        <h3>{currentLang.addNewPurchase}</h3>
        
        {/* Supplier field - Read only, auto-filled */}
        <div className="form-grid">
          <div className="input-group">
            <label>{currentLang.supplier} <span className="required">*</span></label>
            <input
              type="text"
              value={form.supplierId ? getSupplierName(form.supplierId) : currentLang.supplierAutoFilled}
              readOnly
              className="supplier-auto-field"
              placeholder={currentLang.supplierAutoFilled}
            />
            <small className="field-hint">{currentLang.supplierAutoFilled}</small>
          </div>
        </div>

        <div className="items-section">
          <label>{currentLang.products}</label>
          <div className="item-row-header">
            <span>{currentLang.product}</span>
            <span>{currentLang.quantity}</span>
            <span>{currentLang.unitPrice}</span>
            <span></span>
          </div>
          {form.items.map((item, index) => (
            <div key={index} className="item-row">
              <select
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
              >
                <option value="">{currentLang.selectProduct}</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({currentLang.stock}: {p.stock ?? 0})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder={currentLang.quantity}
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={currentLang.unitPrice}
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              />
              {form.items.length > 1 && (
                <button className="icon-btn remove-btn" onClick={() => removeItem(index)}>
                  <FiX />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-item-btn" onClick={addItem}>
            <FiPlus /> {currentLang.addProduct}
          </button>
          <div className="total-preview">
            {currentLang.total}: ${calculateTotal(form.items).toFixed(2)}
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleSubmit}>
            <FiPlus /> {currentLang.addPurchase}
          </button>
        </div>
      </div>

      {/* Tableau des achats */}
      <div className="table-container">
        <h3>{currentLang.purchaseList}</h3>
        <div className="table-responsive">
          <table className="purchases-table">
            <thead>
              <tr>
                <th>{currentLang.supplier}</th>
                <th>{currentLang.products}</th>
                <th>{currentLang.totalAmount}</th>
                <th>{currentLang.actions}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => {
                const supplier = suppliers.find(s => s._id === (p.supplierId?._id || p.supplierId));
                return (
                  <tr key={p._id}>
                    <td data-label={currentLang.supplier}>{supplier?.name || 'Unknown'}</td>
                    <td data-label={currentLang.products} className="products-cell">
                      {p.items.map(item => {
                        const product = products.find(pr => pr._id === (item.productId?._id || item.productId));
                        return (
                          <div key={item.productId?._id || item.productId} className="product-line">
                            • {product?.name} (x{item.quantity})
                          </div>
                        );
                      })}
                      {p.items.length === 0 && '—'}
                    </td>
                    <td data-label={currentLang.totalAmount}>${p.totalAmount?.toFixed(2) ?? '0.00'}</td>
                    <td data-label={currentLang.actions} className="actions">
                      <button className="icon-btn" onClick={() => openEditModal(p)} aria-label={currentLang.editPurchase}>
                        <FiEdit />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(p._id)} aria-label={currentLang.deleteConfirm}>
                        <FiTrash2 />
                      </button>
                      <button className="icon-btn" onClick={() => generateInvoicePDF(p)} aria-label={currentLang.failedToGeneratePDF}>
                        <FiDownload />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-message">{currentLang.noPurchases}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'édition */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{currentLang.editPurchase}</h2>
              <button className="close-btn" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="input-group">
                  <label>{currentLang.supplier}</label>
                  <input
                    type="text"
                    value={editForm.supplierId ? getSupplierName(editForm.supplierId) : currentLang.supplierAutoFilled}
                    readOnly
                    className="supplier-auto-field"
                  />
                  <small className="field-hint">{currentLang.supplierAutoFilled}</small>
                </div>
              </div>

              <div className="items-section">
                <label>{currentLang.products}</label>
                <div className="item-row-header">
                  <span>{currentLang.product}</span>
                  <span>{currentLang.quantity}</span>
                  <span>{currentLang.unitPrice}</span>
                  <span></span>
                </div>
                {editForm.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <select
                      value={item.productId}
                      onChange={(e) => handleEditItemChange(index, 'productId', e.target.value)}
                    >
                      <option value="">{currentLang.selectProduct}</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({currentLang.stock}: {p.stock ?? 0})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder={currentLang.quantity}
                      value={item.quantity}
                      onChange={(e) => handleEditItemChange(index, 'quantity', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={currentLang.unitPrice}
                      value={item.price}
                      onChange={(e) => handleEditItemChange(index, 'price', e.target.value)}
                    />
                    {editForm.items.length > 1 && (
                      <button className="icon-btn remove-btn" onClick={() => removeEditItem(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-item-btn" onClick={addEditItem}>
                  <FiPlus /> {currentLang.addProduct}
                </button>
                <div className="total-preview">
                  {currentLang.total}: ${calculateTotal(editForm.items).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeEditModal}>{currentLang.cancel}</button>
              <button className="save-btn" onClick={handleUpdateSubmit}>{currentLang.updatePurchase}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}