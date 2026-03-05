import React, { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../api/productsService';
import { getCategories } from '../api/categoriesService';
import { getSuppliers } from '../api/suppliersService';
import {
  FiPackage,
  FiDollarSign,
  FiTag,
  FiTruck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX
} from 'react-icons/fi';
import '../styles/ProductsPage.css';

export default function ProductsPage({ token }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    supplierId: '',
    price: '',
    initialQuantity: ''
  });

  // --- Load products ---
  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err.message);
    }
  }, [token]);

  // --- Load categories ---
  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories(token);
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err.message);
    }
  }, [token]);

  // --- Load suppliers ---
  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getSuppliers(token);
      setSuppliers(data);
    } catch (err) {
      console.error('Failed to load suppliers:', err.message);
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSuppliers();
  }, [loadProducts, loadCategories, loadSuppliers]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: '',
      categoryId: '',
      supplierId: '',
      price: '',
      initialQuantity: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId || !form.price) {
      alert('Name, category and price are required');
      return;
    }

    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      supplierId: form.supplierId || undefined,
      price: Number(form.price),
      initialQuantity: form.initialQuantity
        ? Number(form.initialQuantity)
        : 0
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload, token);
      } else {
        await createProduct(payload, token);
      }

      resetForm();
      loadProducts();
    } catch (err) {
      console.error('Failed to save product:', err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      supplierId: product.supplierId || '',
      price: product.price,
      initialQuantity: product.initialQuantity || 0
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id, token);
      loadProducts();
    } catch (err) {
      console.error('Failed to delete product:', err.message);
    }
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h2 className="page-title">Products</h2>
        <p className="page-subtitle">Manage your product catalog</p>
      </div>

      <div className="form-card">
        <h3 className="form-title">
          {editingId ? 'Edit Product' : 'Add New Product'}
        </h3>

        <div className="form-grid">

          <div className="input-group">
            <label className="input-label">Product Name</label>
            <div className="input-wrapper">
              <FiPackage className="input-icon" />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <div className="input-wrapper">
              <FiTag className="input-icon" />
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Supplier</label>
            <div className="input-wrapper">
              <FiTruck className="input-icon" />
              <select
                name="supplierId"
                value={form.supplierId}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select supplier</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Price ($)</label>
            <div className="input-wrapper">
              <FiDollarSign className="input-icon" />
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Initial Quantity</label>
            <div className="input-wrapper">
              <input
                name="initialQuantity"
                type="number"
                value={form.initialQuantity}
                onChange={handleChange}
                className="input-field"
                style={{ paddingLeft: '1rem' }}
              />
            </div>
          </div>

        </div>

        <div className="form-actions">
          <button onClick={handleSubmit} className="btn btn-primary">
            {editingId ? <FiEdit2 /> : <FiPlus />}
            {editingId ? 'Update Product' : 'Add Product'}
          </button>

          {editingId && (
            <button onClick={resetForm} className="btn btn-secondary">
              <FiX /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <h3 className="table-title">Product List</h3>

        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Price</th>
              <th>Initial Qty</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map(p => {
              const category = categories.find(c => c._id === p.categoryId);
              const supplier = suppliers.find(s => s._id === p.supplierId);

              return (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{category?.category || 'Unknown'}</td>
                  <td>{supplier?.name || '—'}</td>
                  <td>${p.price?.toFixed(2)}</td>
                  <td>{p.initialQuantity}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEdit(p)}
                      className="icon-btn edit-btn"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="icon-btn delete-btn"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-message">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}