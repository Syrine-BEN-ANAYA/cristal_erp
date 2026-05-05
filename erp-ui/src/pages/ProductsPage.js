// ProductsPage.js - Version avec support AR/EN et sans KPI
import React, { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../api/productsService';
import { getSuppliers } from '../api/suppliersService';
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, FiPackage, FiAlertTriangle, 
  FiAlertCircle, FiRefreshCw, FiCheckCircle, FiGlobe,
  FiDollarSign
} from 'react-icons/fi';
import '../styles/ProductsPage.css';

export default function ProductsPage({ token }) {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      products: 'Products Management',
      manageProducts: 'Manage your product catalog and inventory',
      addNewProduct: 'Add New Product',
      editProduct: 'Edit Product',
      name: 'Product Name',
      price: 'Price ($)',
      initialQuantity: 'Initial Quantity',
      currentStock: 'Current Stock',
      alertThreshold: 'Alert Threshold',
      supplier: 'Supplier',
      noSupplier: '-- Select a supplier --',
      nameRequired: 'Product name is required',
      nameMinLength: 'Product name must be at least 2 characters',
      nameMaxLength: 'Product name cannot exceed 100 characters',
      nameDuplicate: 'A product with this name already exists',
      priceRequired: 'Price is required',
      priceInvalid: 'Price must be a positive number',
      initialQuantityRequired: 'Initial quantity is required',
      quantityInvalid: 'Quantity must be a positive number',
      stockRequired: 'Current stock is required',
      thresholdRequired: 'Alert threshold is required',
      thresholdInvalid: 'Threshold must be a positive number',
      supplierRequired: 'Please select a supplier',
      updateProduct: 'Update Product',
      addProduct: 'Add Product',
      cancel: 'Cancel',
      productList: 'Product Catalog',
      actions: 'Actions',
      noProducts: 'No products found. Add your first product above.',
      deleteConfirm: 'Delete this product?',
      failedToDelete: 'Failed to delete product',
      errorSavingProduct: 'Error saving product',
      lowStock: 'Low stock alert',
      stock: 'Stock',
      threshold: 'Threshold',
      loading: 'Loading products...',
      refreshing: 'Refreshing...',
      pleaseFixErrors: 'Please fix the errors below before submitting',
      stockAutoFilled: 'Stock auto-filled from initial quantity',
      productCreated: 'Product created successfully!',
      productUpdated: 'Product updated successfully!',
      productDeleted: 'Product deleted successfully!',
      refresh: 'Refresh'
    },
    ar: {
      products: 'إدارة المنتجات',
      manageProducts: 'إدارة كتالوج المنتجات والمخزون',
      addNewProduct: 'إضافة منتج جديد',
      editProduct: 'تعديل المنتج',
      name: 'اسم المنتج',
      price: 'السعر ($)',
      initialQuantity: 'الكمية الأولية',
      currentStock: 'المخزون الحالي',
      alertThreshold: 'حد التنبيه',
      supplier: 'المورد',
      noSupplier: '-- اختر مورد --',
      nameRequired: 'اسم المنتج مطلوب',
      nameMinLength: 'يجب أن يكون اسم المنتج حرفين على الأقل',
      nameMaxLength: 'لا يمكن أن يتجاوز اسم المنتج 100 حرف',
      nameDuplicate: 'منتج بنفس الاسم موجود بالفعل',
      priceRequired: 'السعر مطلوب',
      priceInvalid: 'يجب أن يكون السعر رقماً موجباً',
      initialQuantityRequired: 'الكمية الأولية مطلوبة',
      quantityInvalid: 'يجب أن تكون الكمية رقماً موجباً',
      stockRequired: 'المخزون الحالي مطلوب',
      thresholdRequired: 'حد التنبيه مطلوب',
      thresholdInvalid: 'يجب أن يكون حد التنبيه رقماً موجباً',
      supplierRequired: 'الرجاء اختيار المورد',
      updateProduct: 'تحديث المنتج',
      addProduct: 'إضافة منتج',
      cancel: 'إلغاء',
      productList: 'قائمة المنتجات',
      actions: 'إجراءات',
      noProducts: 'لا توجد منتجات. قم بإضافة منتجك الأول أعلاه',
      deleteConfirm: 'حذف هذا المنتج؟',
      failedToDelete: 'فشل حذف المنتج',
      errorSavingProduct: 'خطأ في حفظ المنتج',
      lowStock: 'تنبيه المخزون المنخفض',
      stock: 'المخزون',
      threshold: 'الحد',
      loading: 'جاري تحميل المنتجات...',
      refreshing: 'جاري التحديث...',
      pleaseFixErrors: 'الرجاء إصلاح الأخطاء أدناه قبل الإرسال',
      stockAutoFilled: 'يتم تعبئة المخزون تلقائياً من الكمية الأولية',
      productCreated: 'تم إنشاء المنتج بنجاح!',
      productUpdated: 'تم تحديث المنتج بنجاح!',
      productDeleted: 'تم حذف المنتج بنجاح!',
      refresh: 'تحديث'
    }
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  const [form, setForm] = useState({
    _id: null,
    name: '',
    price: '',
    initialQuantity: '',
    stock: '',
    threshold: '',
    supplierId: ''
  });

  const loadData = useCallback(async (showRefresh = false) => {
    if (!token) return;
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      const [productsData, suppliersData] = await Promise.all([
        getProducts(token),
        getSuppliers(token)
      ]);
      setProducts(productsData || []);
      setSuppliers(suppliersData || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
  };

  const validateName = (name, excludeId = null) => {
    if (!name || name.trim() === '') return t.nameRequired;
    if (name.length < 2) return t.nameMinLength;
    if (name.length > 100) return t.nameMaxLength;
    const duplicate = products.some(p => 
      p.name.toLowerCase() === name.toLowerCase() && p._id !== excludeId
    );
    if (duplicate) return t.nameDuplicate;
    return '';
  };

  const validatePrice = (price) => {
    if (price === '' || price === null || price === undefined) return t.priceRequired;
    if (isNaN(price) || price < 0) return t.priceInvalid;
    return '';
  };

  const validateInitialQuantity = (quantity) => {
    if (quantity === '' || quantity === null || quantity === undefined) return t.initialQuantityRequired;
    if (isNaN(quantity) || quantity < 0) return t.quantityInvalid;
    return '';
  };

  const validateStock = (stock) => {
    if (stock === '' || stock === null || stock === undefined) return t.stockRequired;
    if (isNaN(stock) || stock < 0) return t.quantityInvalid;
    return '';
  };

  const validateThreshold = (threshold) => {
    if (threshold === '' || threshold === null || threshold === undefined) return t.thresholdRequired;
    if (isNaN(threshold) || threshold < 0) return t.thresholdInvalid;
    return '';
  };

  const validateSupplier = (supplierId) => {
    if (!supplierId || supplierId === '') return t.supplierRequired;
    return '';
  };

  const validateForm = () => {
    const errors = {
      name: validateName(form.name, form._id),
      price: validatePrice(form.price),
      initialQuantity: validateInitialQuantity(form.initialQuantity),
      stock: validateStock(form.stock),
      threshold: validateThreshold(form.threshold),
      supplierId: validateSupplier(form.supplierId)
    };
    
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldBlur = (field, value) => {
    let error = '';
    switch (field) {
      case 'name': error = validateName(value, form._id); break;
      case 'price': error = validatePrice(value); break;
      case 'initialQuantity': error = validateInitialQuantity(value); break;
      case 'stock': error = validateStock(value); break;
      case 'threshold': error = validateThreshold(value); break;
      case 'supplierId': error = validateSupplier(value); break;
      default: break;
    }
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'initialQuantity') {
      const newQuantity = value === '' ? '' : Number(value);
      setForm(prev => ({
        ...prev,
        initialQuantity: value,
        stock: newQuantity
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: name === 'name' || name === 'supplierId' ? value : (value === '' ? '' : Number(value))
      }));
    }
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const resetForm = () => {
    setForm({
      _id: null,
      name: '',
      price: '',
      initialQuantity: '',
      stock: '',
      threshold: '',
      supplierId: ''
    });
    setValidationErrors({});
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateForm();
    if (!isValid) {
      setError(`⚠️ ${t.pleaseFixErrors}`);
      setTimeout(() => setError(''), 4000);
      return;
    }
    
    try {
      const payload = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        initialQuantity: parseInt(form.initialQuantity),
        stock: parseInt(form.stock),
        threshold: parseInt(form.threshold),
        supplierId: form.supplierId
      };

      if (form._id) {
        await updateProduct(form._id, payload, token);
        showSuccessMessage(t.productUpdated);
      } else {
        await createProduct(payload, token);
        showSuccessMessage(t.productCreated);
      }
      resetForm();
      loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || t.errorSavingProduct;
      setError(errorMsg);
      setTimeout(() => setError(''), 4000);
      
      if (errorMsg.toLowerCase().includes('duplicate') || errorMsg.toLowerCase().includes('already exists')) {
        setValidationErrors(prev => ({ ...prev, name: t.nameDuplicate }));
      }
    }
  };

  const handleEdit = (p) => {
    setForm({
      _id: p._id,
      name: p.name || '',
      price: p.price || '',
      initialQuantity: p.initialQuantity || '',
      stock: p.stock || '',
      threshold: p.threshold || '',
      supplierId: p.supplierId || ''
    });
    setValidationErrors({});
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${t.deleteConfirm} "${name}"?`)) return;
    try {
      await deleteProduct(id, token);
      showSuccessMessage(`${t.productDeleted} "${name}"`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || t.failedToDelete);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className={`products-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`products-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <button className="language-toggle" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
        <FiGlobe /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <FiPackage size={28} />
          </div>
          <div>
            <h1>{t.products}</h1>
            <p>{t.manageProducts}</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => loadData(true)} disabled={refreshing}>
          <FiRefreshCw className={refreshing ? 'spinning' : ''} />
          {refreshing ? t.refreshing : t.refresh}
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
          <h3><FiPackage /> {form._id ? t.editProduct : t.addNewProduct}</h3>
          {form._id && (
            <button className="cancel-edit" onClick={resetForm}>
              <FiX /> {t.cancel}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="input-group">
              <label><FiPackage /> {t.name} <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('name', e.target.value)}
                placeholder={t.name}
                className={`form-input ${validationErrors.name ? 'input-error' : ''}`}
              />
              {validationErrors.name && <div className="field-error">{validationErrors.name}</div>}
            </div>
            
            <div className="input-group">
              <label><FiDollarSign /> {t.price} <span className="required">*</span></label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('price', e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`form-input ${validationErrors.price ? 'input-error' : ''}`}
              />
              {validationErrors.price && <div className="field-error">{validationErrors.price}</div>}
            </div>
            
            <div className="input-group">
              <label><FiPlus /> {t.initialQuantity} <span className="required">*</span></label>
              <input
                type="number"
                name="initialQuantity"
                value={form.initialQuantity}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('initialQuantity', e.target.value)}
                min="0"
                placeholder="0"
                className={`form-input ${validationErrors.initialQuantity ? 'input-error' : ''}`}
              />
              {validationErrors.initialQuantity && <div className="field-error">{validationErrors.initialQuantity}</div>}
              <small className="field-hint">{t.stockAutoFilled}</small>
            </div>
            
            <div className="input-group">
              <label><FiPackage /> {t.currentStock} <span className="required">*</span></label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('stock', e.target.value)}
                min="0"
                placeholder="0"
                className={`form-input ${validationErrors.stock ? 'input-error' : ''}`}
                readOnly={!form._id}
              />
              {validationErrors.stock && <div className="field-error">{validationErrors.stock}</div>}
            </div>
            
            <div className="input-group">
              <label><FiAlertTriangle /> {t.alertThreshold} <span className="required">*</span></label>
              <input
                type="number"
                name="threshold"
                value={form.threshold}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('threshold', e.target.value)}
                min="0"
                placeholder="0"
                className={`form-input ${validationErrors.threshold ? 'input-error' : ''}`}
              />
              {validationErrors.threshold && <div className="field-error">{validationErrors.threshold}</div>}
            </div>
            
            <div className="input-group">
              <label>🏭 {t.supplier} <span className="required">*</span></label>
              <select 
                name="supplierId" 
                value={form.supplierId} 
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('supplierId', e.target.value)}
                className={`form-select ${validationErrors.supplierId ? 'input-error' : ''}`}
              >
                <option value="">{t.supplierRequired}</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              {validationErrors.supplierId && <div className="field-error">{validationErrors.supplierId}</div>}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {form._id ? <><FiEdit2 /> {t.updateProduct}</> : <><FiPlus /> {t.addProduct}</>}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3><FiPackage /> {t.productList}</h3>
          <div className="table-stats">{products.length} {t.products.toLowerCase()}</div>
        </div>

        <div className="table-responsive">
          <table className="products-table">
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.price}</th>
                <th>{t.stock}</th>
                <th>{t.threshold}</th>
                <th>{t.supplier}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <FiPackage size={48} />
                    <p>{t.noProducts}</p>
                  </td>
                </tr>
              ) : (
                products.map(p => {
                  const supplier = suppliers.find(s => s._id === p.supplierId);
                  const isLowStock = (p.stock || 0) <= (p.threshold || 0);
                  
                  return (
                    <tr key={p._id} className="product-row">
                      <td data-label={t.name}>
                        <div className="product-cell">
                          <div className="product-avatar">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="product-name">{p.name}</div>
                        </div>
                      </td>
                      <td data-label={t.price} className="price-cell">
                        ${p.price?.toFixed(2) ?? '0.00'}
                      </td>
                      <td data-label={t.stock}>
                        <div className="stock-cell">
                          <div className="stock-value-wrapper">
                            <span className={`stock-value ${isLowStock ? 'low-stock-value' : ''}`}>
                              {p.stock ?? 0}
                            </span>
                            {isLowStock && (
                              <span className="low-stock-badge" title={t.lowStock}>
                                <FiAlertTriangle size={12} />
                              </span>
                            )}
                          </div>
                          <div className="stock-bar-container">
                            <div 
                              className={`stock-bar ${isLowStock ? 'low' : 'normal'}`}
                              style={{ width: `${Math.min((p.stock / 100) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td data-label={t.threshold}>
                        <span className="threshold-badge">{p.threshold ?? 0}</span>
                      </td>
                      <td data-label={t.supplier}>
                        {supplier?.name || '—'}
                      </td>
                      <td data-label={t.actions} className="actions-cell">
                        <button className="action-icon edit" onClick={() => handleEdit(p)} title={t.editProduct}>
                          <FiEdit2 />
                        </button>
                        <button className="action-icon delete" onClick={() => handleDelete(p._id, p.name)} title={t.deleteConfirm}>
                          <FiTrash2 />
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