// src/pages/SuppliersPage.js (version finale)
import React, { useState, useEffect, useCallback } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliersService';
import SupplierForm from '../components/SupplierForm';
import SuppliersTable from '../components/SuppliersTable';
import LoadingSpinner from '../components/LoadingSpinner';
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
    return <LoadingSpinner message="Loading suppliers..." />;
  }

  return (
    <div className="suppliers-page">
      <div className="page-header">
        <h2 className="page-title">Suppliers</h2>
        <p className="page-subtitle">Manage your suppliers</p>
      </div>

      <SupplierForm
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

      <SuppliersTable
        suppliers={suppliers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}