// components/LowStockList.jsx
import React from 'react';

const LowStockList = ({ products }) => {
  if (products.length === 0) {
    return <p className="empty-message">No low stock products.</p>;
  }
  
  return (
    <ul className="low-stock-list">
      {products.map(p => (
        <li key={p._id || p.id}>
          <span>{p.name}</span>
          <span className="stock-value">{p.stock} units</span>
        </li>
      ))}
    </ul>
  );
};

export default LowStockList;