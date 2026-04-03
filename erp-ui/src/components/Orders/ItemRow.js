import React from 'react';
import { FiX } from 'react-icons/fi';

export default function ItemRow({ item, index, products, onChange, onRemove, canRemove }) {
  return (
    <div className="item-row">
      <select
        value={item.productId || ''}
        onChange={(e) => onChange(index, 'productId', e.target.value)}
        required
      >
        <option value="">Select product</option>
        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
      </select>
      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(e) => onChange(index, 'quantity', e.target.value)}
        required
      />
      {canRemove && (
        <button type="button" className="icon-btn remove-btn" onClick={() => onRemove(index)}>
          <FiX />
        </button>
      )}
    </div>
  );
}