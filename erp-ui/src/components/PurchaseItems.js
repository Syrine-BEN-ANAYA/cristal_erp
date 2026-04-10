// components/PurchaseItems.jsx
import React from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

const PurchaseItems = ({ items, products, onItemChange, onAddItem, onRemoveItem, calculateTotal }) => {
  return (
    <div className="items-section">
      <label>Products</label>
      <div className="item-row-header">
        <span>Product</span>
        <span>Quantity</span>
        <span>Unit Price</span>
        <span></span>
      </div>
      {items.map((item, index) => (
        <div key={index} className="item-row">
          <select
            value={item.productId}
            onChange={(e) => onItemChange(index, 'productId', e.target.value)}
          >
            <option value="">Select product</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} (Stock: {p.stock ?? 0})
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={item.price}
            onChange={(e) => onItemChange(index, 'price', e.target.value)}
          />
          {items.length > 1 && (
            <button className="icon-btn remove-btn" onClick={() => onRemoveItem(index)}>
              <FiX />
            </button>
          )}
        </div>
      ))}
      <button type="button" className="add-item-btn" onClick={onAddItem}>
        <FiPlus /> Add Product
      </button>
      <div className="total-preview">
        Total: ${calculateTotal(items).toFixed(2)}
      </div>
    </div>
  );
};

export default PurchaseItems;