// components/EditPurchaseModal.jsx
import React from 'react';
import Modal from './Modal';
import SelectInput from './SelectInput';
import PurchaseItems from './PurchaseItems';

const EditPurchaseModal = ({ 
  isOpen, 
  onClose, 
  editForm, 
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Purchase">
      <div className="modal-body">
        <div className="form-grid">
          <SelectInput
            label="Supplier"
            value={editForm.supplierId}
            onChange={onSupplierChange}
            options={[
              { value: '', label: 'Select supplier' },
              ...suppliers.map(s => ({ value: s._id, label: s.name }))
            ]}
          />
        </div>

        <PurchaseItems
          items={editForm.items}
          products={products}
          onItemChange={onItemChange}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          calculateTotal={calculateTotal}
        />
      </div>
      <div className="modal-footer">
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
        <button className="save-btn" onClick={onSubmit}>Update Purchase</button>
      </div>
    </Modal>
  );
};

export default EditPurchaseModal;