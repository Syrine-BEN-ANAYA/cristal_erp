// src/pages/CustomersPage.js (version finale)
import React, { useEffect, useState } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../api/customersService';
import CustomerFormCard from '../components/CustomerFormCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ActionButtons from '../components/ActionButtons';
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
  const [editingId, setEditingId] = useState(null);

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      if (!token) return;
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
  }, [token]);

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
        <LoadingSpinner message="Loading customers..." />
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h2 className="page-title">Customers</h2>
        <p className="page-subtitle">Manage your customers</p>
      </div>

      <CustomerFormCard
        editingId={editingId}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
        address={address}
        setAddress={setAddress}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        error={error}
        setError={setError}
      />

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
                <ActionButtons
                  onEdit={() => handleEdit(c)}
                  onDelete={() => handleDelete(c._id)}
                  showPassword={false}
                />
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