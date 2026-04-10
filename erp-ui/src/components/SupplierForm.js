// components/SupplierForm.jsx
import React from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiEdit2, FiX } from 'react-icons/fi';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';

const SupplierForm = ({ 
  editingId, 
  name, setName,
  email, setEmail,
  phone, setPhone,
  address, setAddress,
  onSubmit, 
  onCancel,
  error, 
  setError 
}) => {
  return (
    <div className="form-card">
      <h3 className="form-title">
        {editingId ? 'Edit Supplier' : 'Add New Supplier'}
      </h3>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <FormInput
            label="Name *"
            icon={FiUser}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Supplier name"
            required
          />

          <FormInput
            label="Email"
            icon={FiMail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@supplier.com"
          />

          <FormInput
            label="Phone"
            icon={FiPhone}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+968 123 456 789"
          />

          <FormInput
            label="Address"
            icon={FiMapPin}
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full address"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingId ? <FiEdit2 /> : <FiPlus />}
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              <FiX /> Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;