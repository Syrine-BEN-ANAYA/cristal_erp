// components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="admin-container">
      <div className="loading-spinner">{message}</div>
    </div>
  );
};

export default LoadingSpinner;