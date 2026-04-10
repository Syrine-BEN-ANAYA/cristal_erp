// components/PageHeader.jsx
import React from 'react';
import { FiLogOut } from 'react-icons/fi';

const PageHeader = ({ title, subtitle, onLogout, showLogout = true }) => {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {showLogout && onLogout && (
        <button className="btn btn-secondary" onClick={onLogout}>
          <FiLogOut /> Logout
        </button>
      )}
    </div>
  );
};

export default PageHeader;