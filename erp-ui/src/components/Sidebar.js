import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Import du fichier de style

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h2 className="brand-title">AL CRISTAL</h2>
        <p className="brand-sub">Inventory Manager</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/reporting" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Reporting
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Inventory
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Orders
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Categories
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Customers
        </NavLink>
        <NavLink to="/suppliers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Suppliers
        </NavLink>

      </nav>
    </div>
  );
}