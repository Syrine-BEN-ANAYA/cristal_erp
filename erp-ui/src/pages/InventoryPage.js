import React, { useState, useEffect, useCallback } from 'react';
import { getAllInventory, stockIn, stockOut, rebuildInventory } from '../api/inventoryService';
import { FiPackage, FiArrowDown, FiArrowUp, FiRefreshCw, FiHash } from 'react-icons/fi';
// Le CSS global est déjà importé ailleurs (ex: App.css ou index.css)

const InventoryForm = ({ products, onStockIn, onStockOut, onRebuild, loading }) => {
  const [form, setForm] = useState({ productId: '', quantity: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm({ productId: '', quantity: '' });

  const handleSubmitIn = async () => {
    const quantity = Number(form.quantity);
    if (!form.productId || quantity <= 0 || !Number.isInteger(quantity)) {
      alert('Select a product and enter a positive integer.');
      return;
    }
    await onStockIn(form.productId, quantity);
    resetForm();
  };

  const handleSubmitOut = async () => {
    const quantity = Number(form.quantity);
    if (!form.productId || quantity <= 0 || !Number.isInteger(quantity)) {
      alert('Select a product and enter a positive integer.');
      return;
    }
    await onStockOut(form.productId, quantity);
    resetForm();
  };

  const handleRebuildClick = () => {
    if (window.confirm('Rebuilding will reset all stock levels. Are you sure?')) {
      onRebuild();
    }
  };

  return (
    <div className="form-card">
      <h3 className="form-title">
        <FiPackage /> Adjust Stock
      </h3>
      <div className="form-grid">
        <div className="input-group">
          <label className="input-label">Product</label>
          <div className="input-wrapper">
            <span className="input-icon"><FiPackage /></span>
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              disabled={loading}
              className="input-field"
            >
              <option value="">Select a product</option>
              {products.map(p => (
                <option key={p.productId} value={p.productId}>
                  {p.productName} (Stock: {Math.round(p.totalQuantity)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Quantity</label>
          <div className="input-wrapper">
            <span className="input-icon"><FiHash /></span>
            <input
              type="number"
              name="quantity"
              min="1"
              step="1"
              value={form.quantity}
              onChange={handleChange}
              disabled={loading}
              className="input-field"
              placeholder="Enter quantity"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleSubmitIn}
          disabled={loading}
          className="btn btn-primary"
        >
          <FiArrowDown /> Stock In
        </button>
        <button
          onClick={handleSubmitOut}
          disabled={loading}
          className="btn btn-secondary"
        >
          <FiArrowUp /> Stock Out
        </button>
        <button
          onClick={handleRebuildClick}
          disabled={loading}
          className="btn btn-secondary"
        >
          <FiRefreshCw /> Rebuild
        </button>
      </div>
    </div>
  );
};

const InventoryTable = ({ inventory, loading }) => (
  <div className="table-container">
    <h3 className="table-title">
      <FiPackage /> Current Stock
    </h3>
    <table className="data-table">
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
              {loading ? 'Loading...' : 'No stock data'}
            </td>
          </tr>
        ) : (
          inventory.map(i => (
            <tr key={i.productId}>
              <td>{i.productName}</td>
              <td>{Math.round(i.totalQuantity)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllInventory();
      setInventory(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  const handleStockIn = async (productId, quantity) => {
    setLoading(true);
    try {
      await stockIn(productId, quantity);
      await loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Stock in failed');
    } finally { setLoading(false); }
  };

  const handleStockOut = async (productId, quantity) => {
    setLoading(true);
    try {
      await stockOut(productId, quantity);
      await loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Stock out failed');
    } finally { setLoading(false); }
  };

  const handleRebuild = async () => {
    setLoading(true);
    try {
      await rebuildInventory();
      await loadInventory();
      alert('Inventory rebuilt successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Rebuild failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-container">
        <div className="page-header">
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Adjust stock levels and view current inventory</p>
        </div>

        <InventoryForm
          products={inventory}
          onStockIn={handleStockIn}
          onStockOut={handleStockOut}
          onRebuild={handleRebuild}
          loading={loading}
        />

        <InventoryTable inventory={inventory} loading={loading} />
      </div>
    </div>
  );
}