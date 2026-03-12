// src/pages/ProductsPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productsService';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import '../styles/ProductsPage.css';

export default function ProductsPage({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    _id: null,
    name: '',
    price: 0,
    stock: 0,
    threshold: 0,
  });

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts(token);
      setProducts(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadProducts();
  }, [token, loadProducts]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
  };

  const resetForm = () => setForm({ _id: null, name: '', price: 0, stock: 0, threshold: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Name is required'); return; }
    if (form.price < 0 || form.stock < 0 || form.threshold < 0) { setError('Values cannot be negative'); return; }
    try {
      if (form._id) {
        await updateProduct(form._id, form, token);
      } else {
        await createProduct(form, token);
      }
      resetForm();
      loadProducts();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving product');
    }
  };

  const handleEdit = (p) => {
    setForm({
      _id: p._id,
      name: p.name || '',
      price: p.price || 0,
      stock: p.stock || 0,
      threshold: p.threshold || 0,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id, token);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete product');
    }
  };

  if (loading) return <div className="products-page"><div>Loading products…</div></div>;

  return (
    <div className="products-page">
      <h2>Products</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" min="0" value={form.price} onChange={handleChange} />
        <input name="stock" type="number" placeholder="Stock" min="0" value={form.stock} onChange={handleChange} />
        <input name="threshold" type="number" placeholder="Threshold" min="0" value={form.threshold} onChange={handleChange} />
        <button type="submit">{form._id ? <><FiEdit2 /> Update</> : <><FiPlus /> Add</>}</button>
        {form._id && <button type="button" onClick={resetForm}><FiX /> Cancel</button>}
      </form>

      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th><th>Price</th><th>Stock</th><th>Threshold</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && <tr><td colSpan="5">No products found</td></tr>}
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>${p.price?.toFixed(2) ?? 0}</td>
              <td>{p.stock ?? 0}</td>
              <td>{p.threshold ?? 0}</td>
              <td>
                <button onClick={() => handleEdit(p)}><FiEdit2 /></button>
                <button onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
