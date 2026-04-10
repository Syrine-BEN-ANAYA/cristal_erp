// components/LoginBrand.jsx
import React from 'react';

const LoginBrand = ({ 
  title = "AL RUBAI UNITED AL CRISTAL",
  titleAr = "الكريستال الرباعي المتحدة",
  description = "Premium Olive Oil · زيت زيتون فاخر"
}) => {
  return (
    <div className="login-brand">
      <div className="brand-content">
        <h1 className="brand-title">{title}</h1>
        <h1 className="brand-title-ar">{titleAr}</h1>
        <div className="brand-divider"></div>
        <p className="brand-description">{description}</p>
        <div className="brand-decoration">
          <span className="olive-branch">🌿</span>
          <span className="olive-branch">🌿</span>
        </div>
      </div>
    </div>
  );
};

export default LoginBrand;