import React, { useState, useEffect, useCallback } from 'react';
import { getAlerts, setAlert, deleteAlert } from '../api/alertsService';
import { getProducts } from '../api/productsService';
import { getAllInventory } from "../api/inventoryService";
import { FiBell, FiEdit2, FiPlus, FiX, FiTrash2 } from 'react-icons/fi';
import '../styles/AlertsPage.css';

// Minimum threshold value
const MIN_THRESHOLD = 1;

export default function AlertsPage({ token }) {
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: '', threshold: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Memoized data loader – prevents recreation on every render
  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');

      const [alertsData, productsData, inventoryData] = await Promise.all([
        getAlerts(token),
        getProducts(token),
        getAllInventory(token),
      ]);

      // Enrich alerts with current stock from inventory
      const enrichedAlerts = alertsData.map(alert => {
        const invItem = inventoryData.find(item => item.productId === alert.productId);
        return {
          ...alert,
          currentQuantity: invItem?.totalQuantity ?? 0,
        };
      });

      setAlerts(enrichedAlerts);
      setProducts(productsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load data on mount and token change
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ productId: '', threshold: '' });
    setEditingId(null);
  };

  const validateForm = () => {
    if (!form.productId) {
      setError('Please select a product');
      return false;
    }
    const thresholdNum = Number(form.threshold);
    if (!thresholdNum || thresholdNum < MIN_THRESHOLD) {
      setError(`Threshold must be at least ${MIN_THRESHOLD}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setError('');
      await setAlert(
        { productId: form.productId, threshold: Number(form.threshold) },
        token
      );
      resetForm();
      await loadData(); // refresh data after successful creation/update
    } catch (err) {
      setError(err.message || 'Failed to save alert');
    }
  };

  const handleEdit = (alert) => {
    setEditingId(alert.productId);
    setForm({ productId: alert.productId, threshold: alert.threshold });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      setError('');
      await deleteAlert(productId, token);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete alert');
    }
  };

  if (loading) {
    return (
      <div className="alerts-page" aria-busy="true">
        <div className="loading-spinner">Loading alerts…</div>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="page-header">
        <h2 className="page-title">Stock Alerts</h2>
        <p className="page-subtitle">Manage alert thresholds for products</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {/* Form card */}
      <div className="form-card">
        <h3 className="form-title">
          {editingId ? 'Edit Alert' : 'New Alert'}
        </h3>

        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="productId" className="input-label">
              Product
            </label>
            <div className="input-wrapper">
              <FiBell className="input-icon" aria-hidden="true" />
              <select
                id="productId"
                name="productId"
                value={form.productId}
                onChange={handleChange}
                className="input-field"
                disabled={!!editingId} // product cannot be changed when editing
                aria-required="true"
              >
                <option value="">Select a product</option>
                {products.map(({ _id, name }) => (
                  <option key={_id} value={_id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="threshold" className="input-label">
              Threshold
            </label>
            <div className="input-wrapper">
              <input
                type="number"
                id="threshold"
                name="threshold"
                placeholder={`Minimum quantity (≥${MIN_THRESHOLD})`}
                value={form.threshold}
                onChange={handleChange}
                className="input-field"
                min={MIN_THRESHOLD}
                step="1"
                aria-required="true"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            aria-label={editingId ? 'Update alert' : 'Create alert'}
          >
            {editingId ? <FiEdit2 aria-hidden="true" /> : <FiPlus aria-hidden="true" />}
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              className="btn btn-secondary"
              aria-label="Cancel editing"
            >
              <FiX aria-hidden="true" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Alerts table */}
      <div className="table-container">
        <h3 className="table-title">Active Alerts</h3>
        <table className="alerts-table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Threshold</th>
              <th scope="col">Current Stock</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length > 0 ? (
              alerts.map(alert => {
                const product = products.find(p => p._id === alert.productId);
                return (
                  <tr key={alert.productId}>
                    <td>{product?.name ?? alert.productId}</td>
                    <td>{alert.threshold}</td>
                    <td>{alert.currentQuantity}</td>
                    <td>
                      <span
                        className={`status-badge ${alert.active ? 'status-active' : 'status-inactive'}`}
                        aria-label={alert.active ? 'Alert triggered' : 'Stock OK'}
                      >
                        {alert.active ? '⚠️ Alert' : '✅ OK'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEdit(alert)}
                        className="icon-btn edit-btn"
                        title="Edit alert"
                        aria-label={`Edit alert for ${product?.name ?? alert.productId}`}
                      >
                        <FiEdit2 aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(alert.productId)}
                        className="icon-btn delete-btn"
                        title="Delete alert"
                        aria-label={`Delete alert for ${product?.name ?? alert.productId}`}
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="empty-message">
                  No alerts defined.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}