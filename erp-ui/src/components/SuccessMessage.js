// components/SuccessMessage.jsx
import React from 'react';

const SuccessMessage = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="success-message">
      {message}
      {onDismiss && <button onClick={onDismiss} className="dismiss-btn">×</button>}
    </div>
  );
};

export default SuccessMessage;