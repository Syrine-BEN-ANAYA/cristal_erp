// components/SuccessPopup.jsx
import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

const SuccessPopup = ({ show, message, onClose }) => {
  if (!show) return null;
  
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <FiCheckCircle className="popup-icon" />
        <h3>Success!</h3>
        <p>{message}</p>
        <button className="popup-close" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default SuccessPopup;