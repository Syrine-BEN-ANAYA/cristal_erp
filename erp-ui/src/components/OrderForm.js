// components/OrderForm.jsx
import React from 'react';
import { FiPackage, FiUser, FiShoppingCart, FiPlus, FiX, FiEdit2 } from 'react-icons/fi';
import SelectInput from './SelectInput';

const OrderForm = ({ 
  form, 
  customers, 
  products, 
  onFormChange, 
  onItemChange, 
  onAddItem, 
  onRemoveItem, 
  onSubmit, 
  onCancel,
  formatMoney 
}) => {
  return (
    <div className="form-card">
      <h3><FiShoppingCart /> {form._id ? 'Edit Order' : 'New Order'}</h3>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <SelectInput
            label="Customer *"
            icon={FiUser}
            value={form.customerId}
            onChange={(e) => onFormChange({ target: { name: 'customerId', value: e.target.value } })}
            options={[
              { value: '', label: 'Select a customer' },
              ...customers.map(c => ({ value: c._id, label: c.name }))
            ]}
          />
        </div>

        <div className="items-section">
          <label><FiPackage /> Products *</label>
          <div className="item-row-header">
            <span>Product</span>
            <span>Quantity</span>
            <span></span>
          </div>
          {form.items.map((item) => (
            <div key={item.id} className="item-row">
              <select
                value={item.productId}
                onChange={e => onItemChange(item.id, 'productId', e.target.value)}
                required
              >
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} - {formatMoney(p.price)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => onItemChange(item.id, 'quantity', Number(e.target.value))}
                required
              />
              {form.items.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => onRemoveItem(item.id)}>
                  <FiX />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-item-btn" onClick={onAddItem}>
            <FiPlus /> Add Product
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {form._id ? <><FiEdit2 /> Update Order</> : <><FiPlus /> Create Order</>}
          </button>
          {form._id && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              <FiX /> Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OrderForm;