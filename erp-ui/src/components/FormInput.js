// components/FormInput.jsx
import React from 'react';

const FormInput = ({ 
  label, 
  icon: Icon, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  required = false,
  ...props 
}) => {
  return (
    <div className="input-group">
      <label className="input-label">
        {Icon && <Icon />} {label}
      </label>
      <div className="input-wrapper">
        <input
          type={type}
          className="input-field"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        />
      </div>
    </div>
  );
};

export default FormInput;