// components/PageHeaderWithButton.jsx
import React from 'react';

const PageHeaderWithButton = ({ 
  title, 
  subtitle, 
  buttonText, 
  buttonIcon: ButtonIcon, 
  onButtonClick,
  secondaryButtonText,
  secondaryButtonIcon: SecondaryButtonIcon,
  onSecondaryButtonClick
}) => {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={onButtonClick}>
          <ButtonIcon /> {buttonText}
        </button>
        {secondaryButtonText && onSecondaryButtonClick && (
          <button className="btn btn-secondary" onClick={onSecondaryButtonClick}>
            <SecondaryButtonIcon /> {secondaryButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeaderWithButton;