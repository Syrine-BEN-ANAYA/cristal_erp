// src/pages/ProductsPage.js (version finale)
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
import ProductForm from '../components/ProductForm';
import ProductsTable from '../components/ProductsTable';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
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
    if (!form.name) { 
      setError('Name is required'); 
      return; 
    }
    if (form.price < 0 || form.initialQuantity < 0 || form.threshold < 0) {
      setError('Values cannot be negative'); 
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

  if (loading) return <LoadingSpinner message="Loading products…" />;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
        <p>Manage your product catalog</p>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <ProductForm
        form={form}
        suppliers={suppliers}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        isEditing={!!form._id}
      />

      <ProductsTable
        products={products}
        suppliers={suppliers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddStock={handleAddStock}
        onRemoveStock={handleRemoveStock}
      />
    </div>
  );
}