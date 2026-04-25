// ProductsPage.js - Version sans stock controls et sans language toggle
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../api/productsService';
import { getSuppliers } from '../api/suppliersService';
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, FiPackage, FiAlertTriangle, 
  FiAlertCircle, FiRefreshCw, FiTrendingUp, FiCheckCircle,
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
      deleteConfirm: 'Are you sure to delete this product?',
      failedToDelete: 'Failed to delete product',
      errorSavingProduct: 'Error saving product',
      lowStock: 'Low stock alert',
      stock: 'Stock',
      threshold: 'Threshold',
      loading: 'Loading products...',
      refreshing: 'Refreshing...',
      pleaseFixErrors: 'Please fix the errors below before submitting',
      allFieldsRequired: 'All fields are required',
      stockAutoFilled: 'Stock auto-filled from initial quantity',
      totalProducts: 'Total Products',
      lowStockCount: 'Low Stock Items',
      totalValue: 'Inventory Value',
      productCreated: 'Product created successfully!',
      productUpdated: 'Product updated successfully!',
      productDeleted: 'Product deleted successfully!'
    }
  };

  const currentLang = translations.en;
  const isRTL = false;

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

  const metrics = useMemo(() => {
    const lowStockCount = products.filter(p => (p.stock || 0) <= (p.threshold || 0)).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
    const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;
    
    return {
      total: products.length,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      totalValue: totalInventoryValue,
      healthyStock: products.length - lowStockCount
    };
  }, [products]);

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
  };

  const validateName = (name, excludeId = null) => {
    if (!name || name.trim() === '') return currentLang.nameRequired;
    if (name.length < 2) return currentLang.nameMinLength;
    if (name.length > 100) return currentLang.nameMaxLength;
    const duplicate = products.some(p => 
      p.name.toLowerCase() === name.toLowerCase() && p._id !== excludeId
    );
    if (duplicate) return currentLang.nameDuplicate;
    return '';
  };

  const validatePrice = (price) => {
    if (price === '' || price === null || price === undefined) return currentLang.priceRequired;
    if (isNaN(price) || price < 0) return currentLang.priceInvalid;
    return '';
  };

  const validateInitialQuantity = (quantity) => {
    if (quantity === '' || quantity === null || quantity === undefined) return currentLang.initialQuantityRequired;
    if (isNaN(quantity) || quantity < 0) return currentLang.quantityInvalid;
    return '';
  };

  const validateStock = (stock) => {
    if (stock === '' || stock === null || stock === undefined) return currentLang.stockRequired;
    if (isNaN(stock) || stock < 0) return currentLang.quantityInvalid;
    return '';
  };

  const validateThreshold = (threshold) => {
    if (threshold === '' || threshold === null || threshold === undefined) return currentLang.thresholdRequired;
    if (isNaN(threshold) || threshold < 0) return currentLang.thresholdInvalid;
    return '';
  };

  const validateSupplier = (supplierId) => {
    if (!supplierId || supplierId === '') return currentLang.supplierRequired;
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
      setError(`⚠️ ${currentLang.pleaseFixErrors}`);
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
        showSuccessMessage(currentLang.productUpdated);
      } else {
        await createProduct(payload, token);
        showSuccessMessage(currentLang.productCreated);
      }
      resetForm();
      loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || currentLang.errorSavingProduct;
      setError(errorMsg);
      
      if (errorMsg.toLowerCase().includes('duplicate') || errorMsg.toLowerCase().includes('already exists')) {
        setValidationErrors(prev => ({ ...prev, name: currentLang.nameDuplicate }));
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
    if (!window.confirm(`${currentLang.deleteConfirm} "${name}"?`)) return;
    try {
      await deleteProduct(id, token);
      showSuccessMessage(`${currentLang.productDeleted} "${name}"`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || currentLang.failedToDelete);
    }
  };

  if (loading) {
    return (
      <div className="products-page-modern" dir="ltr">
        <div className="loading-screen-premium">
          <div className="premium-spinner"></div>
          <p>{currentLang.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page-modern ltr" dir="ltr">
      {/* Animated Background */}
      <div className="products-bg-animation">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      {/* Header */}
      <div className="page-header-premium">
        <div className="header-content">
          <div className="header-icon">
            <FiPackage size={32} />
          </div>
          <div>
            <h1>{currentLang.products}</h1>
            <p>{currentLang.manageProducts}</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => loadData(true)} disabled={refreshing}>
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
            <FiPackage />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.totalProducts}</h3>
            <div className="kpi-value">{metrics.total}</div>
            <div className="kpi-trend">
              <FiTrendingUp />
              <span>Active products</span>
            </div>
          </div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiAlertTriangle />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.lowStockCount}</h3>
            <div className="kpi-value">{metrics.lowStock}</div>
            <div className="kpi-sub">{metrics.healthyStock} healthy stock</div>
          </div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiDollarSign />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.totalValue}</h3>
            <div className="kpi-value">${metrics.totalValue.toFixed(2)}</div>
            <div className="kpi-sub">Inventory value</div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card-premium">
        <div className="form-card-header">
          <h3><FiPackage /> {form._id ? currentLang.editProduct : currentLang.addNewProduct}</h3>
          {form._id && (
            <button className="cancel-edit" onClick={resetForm}>
              <FiX /> {currentLang.cancel}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid-premium">
            <div className="input-group-premium">
              <label><FiPackage /> {currentLang.name} <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('name', e.target.value)}
                placeholder={currentLang.name}
                className={`premium-input ${validationErrors.name ? 'input-error' : ''}`}
              />
              {validationErrors.name && <div className="field-error">{validationErrors.name}</div>}
            </div>
            
            <div className="input-group-premium">
              <label><FiDollarSign /> {currentLang.price} <span className="required">*</span></label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('price', e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`premium-input ${validationErrors.price ? 'input-error' : ''}`}
              />
              {validationErrors.price && <div className="field-error">{validationErrors.price}</div>}
            </div>
            
            <div className="input-group-premium">
              <label><FiPlus /> {currentLang.initialQuantity} <span className="required">*</span></label>
              <input
                type="number"
                name="initialQuantity"
                value={form.initialQuantity}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('initialQuantity', e.target.value)}
                min="0"
                placeholder="0"
                className={`premium-input ${validationErrors.initialQuantity ? 'input-error' : ''}`}
              />
              {validationErrors.initialQuantity && <div className="field-error">{validationErrors.initialQuantity}</div>}
              <small className="field-hint">{currentLang.stockAutoFilled}</small>
            </div>
            
            <div className="input-group-premium">
              <label><FiPackage /> {currentLang.currentStock} <span className="required">*</span></label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('stock', e.target.value)}
                min="0"
                placeholder="0"
                className={`premium-input ${validationErrors.stock ? 'input-error' : ''}`}
                readOnly={!form._id}
              />
              {validationErrors.stock && <div className="field-error">{validationErrors.stock}</div>}
            </div>
            
            <div className="input-group-premium">
              <label><FiAlertTriangle /> {currentLang.alertThreshold} <span className="required">*</span></label>
              <input
                type="number"
                name="threshold"
                value={form.threshold}
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('threshold', e.target.value)}
                min="0"
                placeholder="0"
                className={`premium-input ${validationErrors.threshold ? 'input-error' : ''}`}
              />
              {validationErrors.threshold && <div className="field-error">{validationErrors.threshold}</div>}
            </div>
            
            <div className="input-group-premium">
              <label>🏭 {currentLang.supplier} <span className="required">*</span></label>
              <select 
                name="supplierId" 
                value={form.supplierId} 
                onChange={handleChange}
                onBlur={(e) => handleFieldBlur('supplierId', e.target.value)}
                className={`premium-select ${validationErrors.supplierId ? 'input-error' : ''}`}
              >
                <option value="">{currentLang.supplierRequired}</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              {validationErrors.supplierId && <div className="field-error">{validationErrors.supplierId}</div>}
            </div>
          </div>
          
          <div className="form-actions-premium">
            <button type="submit" className="btn-submit">
              {form._id ? <><FiEdit2 /> {currentLang.updateProduct}</> : <><FiPlus /> {currentLang.addProduct}</>}
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="table-card-premium">
        <div className="table-header">
          <h3><FiPackage /> {currentLang.productList}</h3>
          <div className="table-stats">{products.length} products</div>
        </div>

        <div className="table-responsive-premium">
          <table className="products-table-premium">
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
                <tr>
                  <td colSpan="6" className="empty-state-premium">
                    <FiPackage size={48} />
                    <p>{currentLang.noProducts}</p>
                  </td>
                </tr>
              ) : (
                products.map(p => {
                  const supplier = suppliers.find(s => s._id === p.supplierId);
                  const isLowStock = (p.stock || 0) <= (p.threshold || 0);
                  
                  return (
                    <tr key={p._id} className="product-row">
                      <td data-label={currentLang.name}>
                        <div className="product-cell">
                          <div className="product-avatar">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="product-name">{p.name}</div>
                        </div>
                      </td>
                      <td data-label={currentLang.price} className="price-cell">
                        ${p.price?.toFixed(2) ?? '0.00'}
                      </td>
                      <td data-label={currentLang.stock}>
                        <div className="stock-cell">
                          <div className="stock-value-wrapper">
                            <span className={`stock-value ${isLowStock ? 'low-stock-value' : ''}`}>
                              {p.stock ?? 0}
                            </span>
                            {isLowStock && (
                              <span className="low-stock-badge" title={currentLang.lowStock}>
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
                      <td data-label={currentLang.threshold}>
                        <span className="threshold-badge">{p.threshold ?? 0}</span>
                       </td>
                      <td data-label={currentLang.supplier}>
                        {supplier?.name || '—'}
                       </td>
                      <td data-label={currentLang.actions} className="actions-cell-premium">
                        <button className="action-icon edit" onClick={() => handleEdit(p)} title={currentLang.editProduct}>
                          <FiEdit2 />
                        </button>
                        <button className="action-icon delete" onClick={() => handleDelete(p._id, p.name)} title={currentLang.deleteConfirm}>
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