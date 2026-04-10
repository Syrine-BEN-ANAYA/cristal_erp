// components/StockControl.jsx
import React from 'react';
import LowStockIndicator from './LowStockIndicator';

const StockControl = ({ stock, threshold, onAddStock, onRemoveStock, productId }) => {
  return (
    <div className="stock-control">
      <span className="stock-value">{stock ?? 0}</span>
      <button 
        className="stock-btn add-stock" 
        onClick={() => onAddStock(productId, stock)}
        title="Add stock"
      >
        +
      </button>
      <button 
        className="stock-btn remove-stock" 
        onClick={() => onRemoveStock(productId, stock)}
        title="Remove stock"
        disabled={stock <= 0}
      >
        -
      </button>
      <LowStockIndicator stock={stock} threshold={threshold} />
    </div>
  );
};

export default StockControl;