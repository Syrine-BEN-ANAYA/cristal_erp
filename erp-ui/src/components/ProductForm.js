// components/ProductForm.jsx
import React from 'react';
import { FiPlus, FiEdit2, FiX, FiPackage } from 'react-icons/fi';
import FormInput from './FormInput';
import SelectInput from './SelectInput';

const ProductForm = ({ 
  form, 
  suppliers, 
  onChange, 
  onSubmit, 
  onCancel,
  isEditing 
}) => {
  return (
    <div className="form-card">
      <h3><FiPackage /> {isEditing ? 'Edit Product' : 'Add New Product'}</h3>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <FormInput
            label="Name *"
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Product name"
            required
          />

          <FormInput
            label="Price ($)"
            type="number"
            name="price"
            value={form.price}
            onChange={onChange}
            min="0"
            step="0.01"
            placeholder="0.00"
          />

          <FormInput
            label="Initial Quantity"
            type="number"
            name="initialQuantity"
            value={form.initialQuantity}
            onChange={onChange}
            min="0"
            placeholder="0"
          />

          <FormInput
            label="Current Stock"
            type="number"
            name="stock"
            value={form.stock}
            onChange={onChange}
            min="0"
            placeholder="0"
          />

          <FormInput
            label="Alert Threshold"
            type="number"
            name="threshold"
            value={form.threshold}
            onChange={onChange}
            min="0"
            placeholder="0"
          />

          <SelectInput
            label="Supplier"
            name="supplierId"
            value={form.supplierId}
            onChange={onChange}
            options={[
              { value: '', label: '-- No supplier --' },
              ...suppliers.map(s => ({ value: s._id, label: s.name }))
            ]}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditing ? <><FiEdit2 /> Update Product</> : <><FiPlus /> Add Product</>}
          </button>
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              <FiX /> Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;