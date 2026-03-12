// src/pages/PurchasesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getPurchases, createPurchase, deletePurchase } from '../api/purchasesService';
import { getProducts } from '../api/productsService';
import { getSuppliers } from '../api/suppliersService';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import '../styles/PurchasesPage.css';

export default function PurchasesPage({ token }) {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: 1, price: 0 }],
    _id: null,
  });

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(token);
      setProducts(data);
    } catch {}
  }, [token]);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getSuppliers(token);
      setSuppliers(data);
    } catch {}
  }, [token]);

  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPurchases(token);
      setPurchases(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadProducts();
      loadSuppliers();
      loadPurchases();
    }
  }, [token, loadProducts, loadSuppliers, loadPurchases]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = field === 'quantity' || field === 'price' ? Number(value) : value;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1, price: 0 }] });
  const removeItem = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  const handleSupplierChange = (e) => setForm({ ...form, supplierId: e.target.value });
  const resetForm = () => setForm({ supplierId: '', items: [{ productId: '', quantity: 1, price: 0 }], _id: null });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.supplierId) { setError('Select a supplier'); return; }
    if (form.items.some(i => !i.productId || i.quantity <= 0 || i.price < 0)) {
      setError('Fill all items correctly');
      return;
    }
    try {
      await createPurchase(form, token);
      resetForm();
      loadPurchases();
      loadProducts(); // mettre à jour stock affiché ailleurs si besoin
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving purchase');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase?')) return;
    try {
      await deletePurchase(id, token);
      loadPurchases();
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete purchase');
    }
  };

  const calculateTotal = (items) => items.reduce((sum, i) => sum + (i.quantity * i.price), 0);

  if (loading) return <div className="purchases-page"><div>Loading purchases…</div></div>;

  return (
    <div className="purchases-page">
      <h2>Purchases</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Formulaire */}
      <form onSubmit={handleSave} className="purchase-form">
        <select value={form.supplierId} onChange={handleSupplierChange} required>
          <option value="">Select supplier</option>
          {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        {form.items.map((item, idx) => (
          <div key={idx} className="item-row">
            <select value={item.productId} onChange={(e) => handleItemChange(idx, 'productId', e.target.value)} required>
              <option value="">Select product</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
            <input type="number" min="0" value={item.price} onChange={(e) => handleItemChange(idx, 'price', e.target.value)} />
            <button type="button" onClick={() => removeItem(idx)} disabled={form.items.length === 1}><FiX /></button>
          </div>
        ))}

        <button type="button" onClick={addItem}><FiPlus /> Add Item</button>
        <button type="submit">{form._id ? 'Update Purchase' : 'Create Purchase'}</button>
      </form>

      {/* Tableau */}
      <table className="purchases-table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.length === 0 && <tr><td colSpan="5">No purchases found</td></tr>}
          {purchases.map(p => (
            <tr key={p._id}>
              <td>{p.supplierId?.name || p.supplierId}</td>
              <td>{p.items?.length || 0}</td>
              <td>${p.totalAmount?.toFixed(2) ?? calculateTotal(p.items)}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
