// components/PurchaseForm.jsx
import React from 'react';
import { FiPlus } from 'react-icons/fi';
import SelectInput from './SelectInput';
import PurchaseItems from './PurchaseItems';

const PurchaseForm = ({ 
  form, 
  suppliers, 
  products, 
  onSupplierChange, 
  onItemChange, 
  onAddItem, 
  onRemoveItem, 
  onSubmit, 
  calculateTotal 
}) => {
  return (
    <div className="form-card">
      <h3>Add New Purchase</h3>
      <div className="form-grid">
        <SelectInput
          label="Supplier"
          name="supplierId"
          value={form.supplierId}
          onChange={onSupplierChange}
          options={[
            { value: '', label: 'Select supplier' },
            ...suppliers.map(s => ({ value: s._id, label: s.name }))
          ]}
        />
      </div>

      <PurchaseItems
        items={form.items}
        products={products}
        onItemChange={onItemChange}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        calculateTotal={calculateTotal}
      />

      <div className="form-actions">
        <button onClick={onSubmit} className="btn btn-primary">
          <FiPlus /> Add Purchase
        </button>
      </div>
    </div>
  );
};

export default PurchaseForm;