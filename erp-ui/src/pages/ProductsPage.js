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
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPackage, FiAlertTriangle, FiGlobe } from 'react-icons/fi';
import '../styles/ProductsPage.css';

export default function ProductsPage({ token }) {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en'); // 'en' or 'ar'

  // Translations
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
      noSupplier: '-- No supplier --',
      nameRequired: 'Name is required',
      valuesCannotBeNegative: 'Values cannot be negative',
      updateProduct: 'Update Product',
      addProduct: 'Add Product',
      cancel: 'Cancel',
      productList: 'Product List',
      actions: 'Actions',
      noProducts: 'No products found.',
      deleteConfirm: 'Delete this product?',
      failedToDelete: 'Failed to delete product',
      errorSavingProduct: 'Error saving product',
      enterQuantityToAdd: 'Enter quantity to add:',
      enterQuantityToRemove: 'Enter quantity to remove:',
      enterPositiveNumber: 'Please enter a positive number',
      insufficientStock: 'Insufficient stock',
      lowStock: 'Low stock',
      stock: 'Stock',
      threshold: 'Threshold',
      loading: 'Loading products…'
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
      noSupplier: '-- لا يوجد مورد --',
      nameRequired: 'الاسم مطلوب',
      valuesCannotBeNegative: 'القيم لا يمكن أن تكون سالبة',
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
      loading: 'جاري تحميل المنتجات…'
    }
  };

  const currentLang = t[language];

  // Form state
  const [form, setForm] = useState({
    _id: null,
    name: '',
    price: '',
    initialQuantity: '',
    stock: '',
    threshold: '',
    supplierId: ''
  });

  // Load data
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

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'supplierId' ? value : (value === '' ? '' : Number(value))
    }));
  };

  const resetForm = () => setForm({
    _id: null,
    name: '',
    price: '',
    initialQuantity: '',
    stock: '',
    threshold: '',
    supplierId: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError(currentLang.nameRequired); return; }
    if (form.price < 0 || form.initialQuantity < 0 || form.threshold < 0) {
      setError(currentLang.valuesCannotBeNegative); 
      return;
    }

    try {
      const payload = {
        name: form.name,
        price: form.price,
        initialQuantity: form.initialQuantity || 0,
        stock: form.stock !== '' ? form.stock : form.initialQuantity || 0,
        threshold: form.threshold || 0,
        supplierId: form.supplierId || undefined
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
      setError(err.response?.data?.message || err.message || currentLang.errorSavingProduct);
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm(currentLang.deleteConfirm)) return;
    try {
      await deleteProduct(id, token);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || currentLang.failedToDelete);
    }
  };

  // Stock adjustment
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

  if (loading) return <div className="products-page" dir={language === 'ar' ? 'rtl' : 'ltr'}><div className="loading">{currentLang.loading}</div></div>;

  return (
    <div className="products-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <div>
          <h1>{currentLang.products}</h1>
          <p>{currentLang.manageProducts}</p>
        </div>
      </div>

      {/* Language Toggle Button - FLOATING */}
      <button 
        className="btn-language-floating" 
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      >
        <FiGlobe size={18} /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {/* Form Card */}
      <div className="form-card">
        <h3><FiPackage /> {form._id ? currentLang.editProduct : currentLang.addNewProduct}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>{currentLang.name} *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={currentLang.name}
                required
              />
            </div>
            <div className="input-group">
              <label>{currentLang.price}</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="input-group">
              <label>{currentLang.initialQuantity}</label>
              <input
                type="number"
                name="initialQuantity"
                value={form.initialQuantity}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label>{currentLang.currentStock}</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label>{currentLang.alertThreshold}</label>
              <input
                type="number"
                name="threshold"
                value={form.threshold}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label>{currentLang.supplier}</label>
              <select name="supplierId" value={form.supplierId} onChange={handleChange}>
                <option value="">{currentLang.noSupplier}</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
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

      {/* Products Table */}
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
                        <button className="icon-btn" onClick={() => handleEdit(p)} title={currentLang.editProduct}>
                          <FiEdit2 />
                        </button>
                        <button className="icon-btn delete-btn" onClick={() => handleDelete(p._id)} title={currentLang.deleteConfirm}>
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