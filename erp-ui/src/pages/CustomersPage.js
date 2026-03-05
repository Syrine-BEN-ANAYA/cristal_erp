// src/pages/CustomersPage.js
import React, { useEffect, useState } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../api/customersService';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import '../styles/CustomersPage.css';

export default function CustomersPage({ token }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Editing mode
  const [editingId, setEditingId] = useState(null);

  // Chargement des clients – défini à l'intérieur de useEffect pour éviter les dépendances externes
  useEffect(() => {
    const loadCustomers = async () => {
      if (!token) return; // ne rien faire si pas de token
      try {
        setLoading(true);
        const data = await getCustomers(token);
        setCustomers(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [token]); // seul token est nécessaire, la fonction est recréée à chaque changement

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
        const updated = await updateCustomer(editingId, payload, token);
        setCustomers(customers.map(c => (c._id === updated._id ? updated : c)));
      } else {
        const created = await createCustomer(payload, token);
        setCustomers([...customers, created]);
      }
      resetForm();
      setError('');
    } catch (err) {
      setError(err.message || (editingId ? 'Update failed' : 'Creation failed'));
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setName(customer.name);
    setEmail(customer.email || '');
    setPhone(customer.phone || '');
    setAddress(customer.address || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await deleteCustomer(id, token);
      setCustomers(customers.filter(c => c._id !== id));
      setError('');
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h2 className="page-title">Customers</h2>
        <p className="page-subtitle">Manage your customers</p>
      </div>

      {/* Formulaire */}
      <div className="form-card">
        <h3 className="form-title">
          {editingId ? 'Edit Customer' : 'Add New Customer'}
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
                  placeholder="Customer name"
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
                  placeholder="customer@example.com"
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

      {/* Tableau des clients */}
      <div className="table-container">
        <h3 className="table-title">Customers List</h3>
        <table className="customers-table">
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
            {customers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email || '—'}</td>
                <td>{c.phone || '—'}</td>
                <td>{c.address || '—'}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleEdit(c)}
                    className="icon-btn edit-btn"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="icon-btn delete-btn"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-message">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}