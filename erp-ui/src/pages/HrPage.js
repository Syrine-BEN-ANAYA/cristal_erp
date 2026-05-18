import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HrPage.css";

function HrPage({ user, onLogout }) {
  const navigate = useNavigate();

  const menuModules = [
    {
      id: "employees",
      title: "Employee Directory",
      description: "Manage workforce, profiles, and organizational data",
      path: "/user/hr/employees"
    },
    {
      id: "departments",
      title: "Departments",
      description: "Configure divisions, teams, and reporting lines",
      path: "/user/hr/departments"
    },
    {
      id: "contracts",
      title: "Contracts",
      description: "Oversee agreements, renewals, and compliance",
      path: "/user/hr/contracts"
    },
    {
      id: "payroll",
      title: "Payroll",
      description: "Manage employee salaries and payroll processing",
      path: "/user/hr/payroll"
    },
    {
      id: "attendance",
      title: "Attendance & Leaves",
      description: "Monitor presence, time tracking, and leave requests",
      path: "/user/hr/attendance"
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="hr-page">
      <div className="dashboard-container">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>HR Dashboard</h1>
            <p className="header-subtitle">Workforce management platform</p>
          </div>
          <div className="header-right">
            <div className="date-display">{formatDate()}</div>
          </div>
        </header>

        {/* Modules Grid */}
        <div className="modules-section">
          <div className="section-header">
            <h2>Management modules</h2>
            <p className="section-description">Access HR administration functions</p>
          </div>
          
          <div className="modules-grid">
            {menuModules.map((module, index) => (
              <div
                key={module.id}
                className="module-card"
                onClick={() => handleNavigation(module.path)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="module-content">
                  <h3 className="module-title">{module.title}</h3>
                  <p className="module-description">{module.description}</p>
                </div>
                <div className="module-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HrPage;