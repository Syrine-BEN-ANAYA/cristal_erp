// components/SelectInput.jsx
import React from 'react';

const SelectInput = ({ label, icon: Icon, value, onChange, options, disabledOptions = [] }) => {
  return (
    <div className="input-group">
      <label className="input-label">
        {Icon && <Icon />} {label}
      </label>
      <div className="input-wrapper">
        <select className="input-field" value={value} onChange={onChange}>
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={disabledOptions.includes(option.value)}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectInput;