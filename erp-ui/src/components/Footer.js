// components/Footer.jsx
import React from 'react';

const Footer = ({ companyName = "AL RUBAI UNITED AL CRISTAL", year = "2026" }) => {
  return (
    <footer className="app-footer">
      <p>© {year} {companyName}. All rights reserved.</p>
    </footer>
  );
};

export default Footer;