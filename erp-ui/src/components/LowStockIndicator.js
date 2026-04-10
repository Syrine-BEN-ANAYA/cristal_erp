// components/LowStockIndicator.jsx
import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const LowStockIndicator = ({ stock, threshold }) => {
  const isLowStock = stock <= threshold && threshold > 0;
  if (!isLowStock) return null;
  
  return (
    <span className="low-stock-indicator" title="Low stock">
      <FiAlertTriangle color="#b91c1c" />
    </span>
  );
};

export default LowStockIndicator;