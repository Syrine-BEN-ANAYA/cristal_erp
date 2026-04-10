// components/TopBar.jsx
import React from 'react';
import logo from "../assets/logo.png";

const TopBar = ({ user, showLogout = false, onLogout }) => {
  return (
    <header className="topbar">
      <div className="topbar-logo">
        <img src={logo} alt="Al Rubai United Al Cristal" />
        <span className="company-name">AL RUBAI UNITED AL CRISTAL</span>
      </div>
      <div className="topbar-user">
        <span className="user-username">{user?.username}</span>
        {showLogout && onLogout && (
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;