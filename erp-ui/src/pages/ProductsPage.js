import React, { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addStock,
  removeStock
} from '../api/productsService';
import { getSuppliers } from '../api/suppliersService';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPackage, FiAlertTriangle, FiGlobe, FiAlertCircle } from 'react-icons/fi';
import '../styles/ProductsPage.css';

export default function ProductsPage({ token }) {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const [validationErrors, setValidationErrors] = useState({});

  const t = {
    en: {
      products: 'Products',
      manageProducts: 'Manage your product catalog',
      addNewProduct: 'Add New Product',
      editProduct: 'Edit Product',
      name: 'Name',
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
      productList: 'Product List',
      actions: 'Actions',
      noProducts: 'No products found.',
      deleteConfirm: 'Are you sure to delete this product?',
      failedToDelete: 'Failed to delete product',
      errorSavingProduct: 'Error saving product',
      enterQuantityToAdd: 'Enter quantity to add:',
      enterQuantityToRemove: 'Enter quantity to remove:',
      enterPositiveNumber: 'Please enter a positive number',
      insufficientStock: 'Insufficient stock',
      lowStock: 'Low stock',
      stock: 'Stock',
      threshold: 'Threshold',
      loading: 'Loading products…',
      pleaseFixErrors: 'Please fix the errors below before submitting',
      validationError: 'Validation Error',
      allFieldsRequired: 'All fields are required',
      stockAutoFilled: ''
    },
    ar: {
      products: 'المنتجات',
      manageProducts: 'إدارة كتالوج المنتجات',
      addNewProduct: 'إضافة منتج جديد',
      editProduct: 'تعديل المنتج',
      name: 'الاسم',
      price: 'السعر ($)',
      initialQuantity: 'الكمية الأولية',
      currentStock: 'المخزون الحالي',
      alertThreshold: 'حد التنبيه',
      supplier: 'المورد',
      noSupplier: '-- اختر مورد --',
      nameRequired: 'اسم المنتج مطلوب',
      nameMinLength: 'اسم المنتج يجب أن يكون حرفين على الأقل',
      nameMaxLength: 'اسم المنتج لا يمكن أن يتجاوز 100 حرف',
      nameDuplicate: 'يوجد منتج بنفس الاسم بالفعل',
      priceRequired: 'السعر مطلوب',
      priceInvalid: 'السعر يجب أن يكون رقماً موجباً',
      initialQuantityRequired: 'الكمية الأولية مطلوبة',
      quantityInvalid: 'الكمية يجب أن تكون رقماً موجباً',
      stockRequired: 'المخزون الحالي مطلوب',
      thresholdRequired: 'حد التنبيه مطلوب',
      thresholdInvalid: 'حد التنبيه يجب أن يكون رقماً موجباً',
      supplierRequired: 'الرجاء اختيار مورد',
      updateProduct: 'تحديث المنتج',
      addProduct: 'إضافة منتج',
      cancel: 'إلغاء',
      productList: 'قائمة المنتجات',
      actions: 'إجراءات',
      noProducts: 'لا توجد منتجات.',
      deleteConfirm: 'هل تريد حذف هذا المنتج؟',
      failedToDelete: 'فشل حذف المنتج',
      errorSavingProduct: 'خطأ في حفظ المنتج',
      enterQuantityToAdd: 'أدخل الكمية للإضافة:',
      enterQuantityToRemove: 'أدخل الكمية للإزالة:',
      enterPositiveNumber: 'الرجاء إدخال رقم موجب',
      insufficientStock: 'المخزون غير كاف',
      lowStock: 'مخزون منخفض',
      stock: 'المخزون',
      threshold: 'الحد الأدنى',
      loading: 'جاري تحميل المنتجات…',
      pleaseFixErrors: 'الرجاء إصلاح الأخطاء أدناه قبل الإرسال',
      validationError: 'خطأ في التحقق',
      allFieldsRequired: 'جميع الحقول مطلوبة',
      stockAutoFilled: 'تم تعيين المخزون الحالي تلقائياً ليطابق الكمية الأولية'
    }
  };

  const currentLang = t[language];
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

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [productsData, suppliersData] = await Promise.all([
        getProducts(token),
        getSuppliers(token)
      ]);
      setProducts(productsData);
      setSuppliers(suppliersData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Validation functions - ALL FIELDS REQUIRED
  const validateName = (name, excludeId = null) => {
    if (!name || name.trim() === '') {
      return currentLang.nameRequired;
    }
    if (name.length < 2) {
      return currentLang.nameMinLength;
    }
    if (name.length > 100) {
      return currentLang.nameMaxLength;
    }
    const duplicate = products.some(p => 
      p.name.toLowerCase() === name.toLowerCase() && p._id !== excludeId
    );
    if (duplicate) {
      return currentLang.nameDuplicate;
    }
    return '';
  };

  const validatePrice = (price) => {
    if (price === '' || price === null || price === undefined) {
      return currentLang.priceRequired;
    }
    if (isNaN(price) || price < 0) {
      return currentLang.priceInvalid;
    }
    return '';
  };

  const validateInitialQuantity = (quantity) => {
    if (quantity === '' || quantity === null || quantity === undefined) {
      return currentLang.initialQuantityRequired;
    }
    if (isNaN(quantity) || quantity < 0) {
      return currentLang.quantityInvalid;
    }
    return '';
  };

  const validateStock = (stock) => {
    if (stock === '' || stock === null || stock === undefined) {
      return currentLang.stockRequired;
    }
    if (isNaN(stock) || stock < 0) {
      return currentLang.quantityInvalid;
    }
    return '';
  };

  const validateThreshold = (threshold) => {
    if (threshold === '' || threshold === null || threshold === undefined) {
      return currentLang.thresholdRequired;
    }
    if (isNaN(threshold) || threshold < 0) {
      return currentLang.thresholdInvalid;
    }
    return '';
  };

  const validateSupplier = (supplierId) => {
    if (!supplierId || supplierId === '') {
      return currentLang.supplierRequired;
    }
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
      case 'name':
        error = validateName(value, form._id);
        break;
      case 'price':
        error = validatePrice(value);
        break;
      case 'initialQuantity':
        error = validateInitialQuantity(value);
        break;
      case 'stock':
        error = validateStock(value);
        break;
      case 'threshold':
        error = validateThreshold(value);
        break;
      case 'supplierId':
        error = validateSupplier(value);
        break;
      default:
        break;
    }
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si le champ modifié est initialQuantity, mettre à jour stock automatiquement
    if (name === 'initialQuantity') {
      const newQuantity = value === '' ? '' : Number(value);
      setForm(prev => ({
        ...prev,
        initialQuantity: value,
        stock: newQuantity  // Auto-fill stock with initialQuantity
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: name === 'name' || name === 'supplierId' ? value : (value === '' ? '' : Number(value))
      }));
    }
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
      setError(`⚠️ ${currentLang.validationError}: ${currentLang.pleaseFixErrors}`);
      setTimeout(() => setError(''), 5000);
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
      } else {
        await createProduct(payload, token);
      }
      resetForm();
      loadData();
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || currentLang.errorSavingProduct;
      setError(`❌ ${errorMsg}`);
      
      if (errorMsg.toLowerCase().includes('duplicate') || errorMsg.toLowerCase().includes('already exists')) {
        setValidationErrors(prev => ({
          ...prev,
          name: currentLang.nameDuplicate
        }));
      }
      
      setTimeout(() => setError(''), 5000);
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
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${currentLang.deleteConfirm} "${name}"?`)) return;
    try {
      await deleteProduct(id, token);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || currentLang.failedToDelete);
    }
  };

  const handleAddStock = async (id, currentStock) => {
    const qty = prompt(currentLang.enterQuantityToAdd, '1');
    if (!qty) return;
    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
      alert(currentLang.enterPositiveNumber);
      return;
    }
    try {
      await addStock(id, quantity, token);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to add stock');
    }
  };

  const handleRemoveStock = async (id, currentStock) => {
    const qty = prompt(currentLang.enterQuantityToRemove, '1');
    if (!qty) return;
    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
      alert(currentLang.enterPositiveNumber);
      return;
    }
    if (quantity > currentStock) {
      alert(currentLang.insufficientStock);
      return;
    }
    try {
      await removeStock(id, quantity, token);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to remove stock');
    }
  };

  if (loading) return <div className="products-page" dir={isRTL ? 'rtl' : 'ltr'}><div className="loading">{currentLang.loading}</div></div>;

  return (
    <div className="products-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <div>
          <h1>{currentLang.products}</h1>
          <p>{currentLang.manageProducts}</p>
        </div>
      </div>

      <button 
        className="btn-language-floating" 
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      >
        <FiGlobe size={18} /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      {error && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className="form-card">
        <h3><FiPackage /> {form._id ? currentLang.editProduct : currentLang.addNewProduct}</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="input-group">
              <label>{currentLang.name} <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('name', e.target.value)}
                placeholder={currentLang.name}
                className={validationErrors.name ? 'input-error' : ''}
              />
              {validationErrors.name && <div className="field-error">{validationErrors.name}</div>}
            </div>
            
            <div className="input-group">
              <label>{currentLang.price} <span className="required">*</span></label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('price', e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={validationErrors.price ? 'input-error' : ''}
              />
              {validationErrors.price && <div className="field-error">{validationErrors.price}</div>}
            </div>
            
            <div className="input-group">
              <label>{currentLang.initialQuantity} <span className="required">*</span></label>
              <input
                type="number"
                name="initialQuantity"
                value={form.initialQuantity}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('initialQuantity', e.target.value)}
                min="0"
                placeholder="0"
                className={validationErrors.initialQuantity ? 'input-error' : ''}
              />
              {validationErrors.initialQuantity && <div className="field-error">{validationErrors.initialQuantity}</div>}
              <small className="field-hint">{currentLang.stockAutoFilled}</small>
            </div>
            
            <div className="input-group">
              <label>{currentLang.currentStock} <span className="required">*</span></label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('stock', e.target.value)}
                min="0"
                placeholder="0"
                className={validationErrors.stock ? 'input-error' : ''}
                readOnly={!form._id} // Read-only during creation, editable during edit
              />
              {validationErrors.stock && <div className="field-error">{validationErrors.stock}</div>}
              {!form._id && <small className="field-hint"></small>}
            </div>
            
            <div className="input-group">
              <label>{currentLang.alertThreshold} <span className="required">*</span></label>
              <input
                type="number"
                name="threshold"
                value={form.threshold}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('threshold', e.target.value)}
                min="0"
                placeholder="0"
                className={validationErrors.threshold ? 'input-error' : ''}
              />
              {validationErrors.threshold && <div className="field-error">{validationErrors.threshold}</div>}
            </div>
            
            <div className="input-group">
              <label>{currentLang.supplier} <span className="required">*</span></label>
              <select 
                name="supplierId" 
                value={form.supplierId} 
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('supplierId', e.target.value)}
                className={validationErrors.supplierId ? 'input-error' : ''}
              >
                <option value="">-- {currentLang.supplierRequired} --</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              {validationErrors.supplierId && <div className="field-error">{validationErrors.supplierId}</div>}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {form._id ? <><FiEdit2 /> {currentLang.updateProduct}</> : <><FiPlus /> {currentLang.addProduct}</>}
            </button>
            {form._id && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FiX /> {currentLang.cancel}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container">
        <h3><FiPackage /> {currentLang.productList}</h3>
        <div className="table-responsive">
          <table className="products-table">
            <thead>
              <tr>
                <th>{currentLang.name}</th>
                <th>{currentLang.price}</th>
                <th>{currentLang.stock}</th>
                <th>{currentLang.threshold}</th>
                <th>{currentLang.supplier}</th>
                <th>{currentLang.actions}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="6" className="empty-message">{currentLang.noProducts}</td></tr>
              ) : (
                products.map(p => {
                  const supplier = suppliers.find(s => s._id === p.supplierId);
                  const isLowStock = p.stock <= p.threshold;
                  return (
                    <tr key={p._id}>
                      <td data-label={currentLang.name}>{p.name}</td>
                      <td data-label={currentLang.price}>${p.price?.toFixed(2) ?? '0.00'}</td>
                      <td data-label={currentLang.stock}>
                        <div className="stock-control">
                          <span className="stock-value">{p.stock ?? 0}</span>
                          {isLowStock && (
                            <span className="low-stock-indicator" title={currentLang.lowStock}>
                              <FiAlertTriangle color="#b91c1c" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label={currentLang.threshold}>{p.threshold ?? 0}</td>
                      <td data-label={currentLang.supplier}>{supplier?.name || '—'}</td>
                      <td className="actions" data-label={currentLang.actions}>
                        <button className="icon-btn edit-btn" onClick={() => handleEdit(p)} title={currentLang.editProduct}>
                          <FiEdit2 />
                        </button>
                        <button className="icon-btn delete-btn" onClick={() => handleDelete(p._id, p.name)} title={currentLang.deleteConfirm}>
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