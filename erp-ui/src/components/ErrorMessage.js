// components/ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="error-message">
      {message}
      {onDismiss && <button onClick={onDismiss}>×</button>}
    </div>
  );
};

export default ErrorMessage;