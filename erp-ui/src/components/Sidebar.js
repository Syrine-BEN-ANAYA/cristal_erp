// Ton Sidebar actuel (avec chemins complets pour la route)
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h2 className="brand-title">AL CRISTAL</h2>
        <p className="brand-sub">Inventory Manager</p>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/user/reporting" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Reporting
        </NavLink>
        <NavLink to="/user/purchases" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Purchases
        </NavLink>
        <NavLink to="/user/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Orders
        </NavLink>
        <NavLink to="/user/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Products
        </NavLink>
        <NavLink to="/user/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Customers
        </NavLink>
        <NavLink to="/user/suppliers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Suppliers
        </NavLink>
      </nav>
    </div>
  );
}