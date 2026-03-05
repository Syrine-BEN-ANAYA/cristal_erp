import React, { useEffect, useState, useCallback } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliersService';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import '../styles/SuppliersPage.css';

export default function SuppliersPage({ token }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editingId, setEditingId] = useState(null);

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSuppliers(token);
      setSuppliers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadSuppliers();
  }, [token, loadSuppliers]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Name is required');
      return;
    }

    const payload = { name, email, phone, address };

    try {
      if (editingId) {
        const updated = await updateSupplier(editingId, payload, token);
        setSuppliers(suppliers.map(s => (s._id === updated._id ? updated : s)));
      } else {
        const created = await createSupplier(payload, token);
        setSuppliers([...suppliers, created]);
      }
      resetForm();
      setError('');
    } catch (err) {
      setError(err.message || (editingId ? 'Update failed' : 'Creation failed'));
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier._id);
    setName(supplier.name);
    setEmail(supplier.email || '');
    setPhone(supplier.phone || '');
    setAddress(supplier.address || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await deleteSupplier(id, token);
      setSuppliers(suppliers.filter(s => s._id !== id));
      setError('');
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="suppliers-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="suppliers-page">
      <div className="page-header">
        <h2 className="page-title">Suppliers</h2>
        <p className="page-subtitle">Manage your suppliers</p>
      </div>

      <div className="form-card">
        <h3 className="form-title">
          {editingId ? 'Edit Supplier' : 'Add New Supplier'}
        </h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Name *</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Supplier name"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@supplier.com"
                  className="input-field"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Phone</label>
              <div className="input-wrapper">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+968 123 456 789"
                  className="input-field"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Address</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? <FiEdit2 /> : <FiPlus />}
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                <FiX /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Suppliers table */}
      <div className="table-container">
        <h3 className="table-title">Suppliers List</h3>
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email || '—'}</td>
                <td>{s.phone || '—'}</td>
                <td>{s.address || '—'}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleEdit(s)}
                    className="icon-btn edit-btn"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="icon-btn delete-btn"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-message">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}