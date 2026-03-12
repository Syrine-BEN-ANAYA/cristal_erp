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
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import '../styles/ProductsPage.css';

export default function ProductsPage({ token }) {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    if (!form.name) { setError('Name is required'); return; }
    if (form.price < 0 || form.initialQuantity < 0 || form.threshold < 0) {
      setError('Values cannot be negative'); return;
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
      setError(err.response?.data?.message || err.message || 'Error saving product');
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
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id, token);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete product');
    }
  };

  // Stock adjustment
  const handleAddStock = async (id, currentStock) => {
    const qty = prompt('Enter quantity to add:', '1');
    if (!qty) return;
    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a positive number');
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
    const qty = prompt('Enter quantity to remove:', '1');
    if (!qty) return;
    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a positive number');
      return;
    }
    if (quantity > currentStock) {
      alert('Insufficient stock');
      return;
    }
    try {
      await removeStock(id, quantity, token);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to remove stock');
    }
  };

  if (loading) return <div className="products-page"><div className="loading">Loading products…</div></div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
        <p>Manage your product catalog</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Form Card */}
      <div className="form-card">
        <h3><FiPackage /> {form._id ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product name"
                required
              />
            </div>
            <div className="input-group">
              <label>Price ($)</label>
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
              <label>Initial Quantity</label>
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
              <label>Current Stock</label>
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
              <label>Alert Threshold</label>
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
              <label>Supplier</label>
              <select name="supplierId" value={form.supplierId} onChange={handleChange}>
                <option value="">-- No supplier --</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {form._id ? <><FiEdit2 /> Update Product</> : <><FiPlus /> Add Product</>}
            </button>
            {form._id && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <FiX /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <h3><FiPackage /> Product List</h3>
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="6" className="empty-message">No products found.</td></tr>
            ) : (
              products.map(p => {
                const supplier = suppliers.find(s => s._id === p.supplierId);
                const isLowStock = p.stock <= p.threshold;
                return (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>${p.price?.toFixed(2) ?? '0.00'}</td>
                    <td>
                      <div className="stock-control">
                        <button
                          className="stock-btn remove"
                          onClick={() => handleRemoveStock(p._id, p.stock)}
                          title="Remove stock"
                        >
                          -
                        </button>
                        <span className="stock-value">{p.stock ?? 0}</span>
                        <button
                          className="stock-btn"
                          onClick={() => handleAddStock(p._id, p.stock)}
                          title="Add stock"
                        >
                          +
                        </button>
                        {isLowStock && (
                          <span className="low-stock-indicator" title="Low stock">
                            <FiAlertTriangle color="#b91c1c" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{p.threshold ?? 0}</td>
                    <td>{supplier?.name || '—'}</td>
                    <td className="actions">
                      <button className="icon-btn" onClick={() => handleEdit(p)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(p._id)} title="Delete">
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
  );
}