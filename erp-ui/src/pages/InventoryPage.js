import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllInventory, stockIn, stockOut, rebuildInventory } from '../api/inventoryService';
import { FiPackage, FiArrowDown, FiArrowUp, FiRefreshCw, FiLoader } from 'react-icons/fi';
import '../styles/InventoryPage.css';
const InventoryForm = ({ products, onSubmitStockIn, onSubmitStockOut, onRebuild, loading }) => {
  const [form, setForm] = useState({ productId: '', quantity: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm({ productId: '', quantity: '' });

  const handleStockIn = async () => {
    const quantity = Number(form.quantity);
    if (!form.productId || quantity <= 0 || !Number.isInteger(quantity)) {
      alert('Please select a product and enter a positive integer quantity.');
      return;
    }
    await onSubmitStockIn({ productId: form.productId, quantity });
    resetForm();
  };

  const handleStockOut = async () => {
    const quantity = Number(form.quantity);
    if (!form.productId || quantity <= 0 || !Number.isInteger(quantity)) {
      alert('Please select a product and enter a positive integer quantity.');
      return;
    }
    await onSubmitStockOut({ productId: form.productId, quantity });
    resetForm();
  };

  const handleRebuild = () => {
    if (window.confirm('Rebuilding will reset all stock levels. Are you sure?')) {
      onRebuild();
    }
  };

  return (
    <div className="form-card">
      <h3 className="form-title">
        <FiPackage className="title-icon" /> Adjust Stock
      </h3>
      <div className="form-grid">
        <div className="input-group">
          <label htmlFor="productId" className="input-label">Product</label>
          <div className="input-wrapper">
            <FiPackage className="input-icon" />
            <select
              id="productId"
              name="productId"
              value={form.productId}
              onChange={handleChange}
              className="input-field"
              disabled={loading}
            >
              <option value="">Select a product</option>
              {products.map(item => (
                <option key={item.productId} value={item.productId}>
                  {item.productName} (Stock: {Math.round(item.totalQuantity)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="quantity" className="input-label">Quantity</label>
          <div className="input-wrapper">
            <input
              type="number"
              id="quantity"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              className="input-field"
              min="1"
              step="1"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleStockIn}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? <FiLoader className="spin" /> : <FiArrowDown />}
          Stock In
        </button>
        <button
          onClick={handleStockOut}
          className="btn btn-secondary"
          disabled={loading}
        >
          {loading ? <FiLoader className="spin" /> : <FiArrowUp />}
          Stock Out
        </button>
        <button
          onClick={handleRebuild}
          className="btn btn-destructive"
          disabled={loading}
        >
          {loading ? <FiLoader className="spin" /> : <FiRefreshCw />}
          Rebuild
        </button>
      </div>
    </div>
  );
};

const InventoryTable = ({ inventory, loading }) => {
  return (
    <div className="table-container">
      <h3 className="table-title">
        <FiPackage className="title-icon" /> Current Stock
      </h3>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td colSpan="2" className="empty-message">
                {loading ? 'Loading...' : 'No stock data available.'}
              </td>
            </tr>
          ) : (
            inventory.map(item => (
              <tr key={item.productId}>
                <td>{item.productName}</td>
                <td className="quantity-cell">{Math.round(item.totalQuantity)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function InventoryPage({ token }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadInventory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await getAllInventory(token);
      setInventory(data);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const productOptions = useMemo(() => inventory, [inventory]);

  const handleStockIn = async (payload) => {
    setActionLoading(true);
    try {
      await stockIn(payload, token);
      await loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Stock in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockOut = async (payload) => {
    setActionLoading(true);
    try {
      await stockOut(payload, token);
      await loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Stock out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRebuild = async () => {
    setActionLoading(true);
    try {
      await rebuildInventory(token);
      await loadInventory();
      alert('Inventory rebuilt successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Rebuild failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="inventory-page">
        <div className="loading-spinner">
          <FiLoader className="spin" /> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h2 className="page-title">Inventory</h2>
        <p className="page-subtitle">Manage product stock levels</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="inventory-layout">
        <InventoryForm
          products={productOptions}
          onSubmitStockIn={handleStockIn}
          onSubmitStockOut={handleStockOut}
          onRebuild={handleRebuild}
          loading={actionLoading}
        />

        <InventoryTable inventory={inventory} loading={loading} />
      </div>
    </div>
  );
}