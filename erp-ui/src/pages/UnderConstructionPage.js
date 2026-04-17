// UnderConstructionPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UnderConstructionPage.css';

export default function UnderConstructionPage() {
  const navigate = useNavigate();
  
  // Récupérer le nom du département depuis localStorage
  const departmentName = localStorage.getItem('selectedDepartmentName') || 'This department';
  
  // Debug
  useEffect(() => {
    console.log("UnderConstructionPage loaded");
    console.log("Department name:", departmentName);
    console.log("isUnderDevelopment:", localStorage.getItem('isUnderDevelopment'));
  }, []);
  
  const handleGoBack = () => {
    // Nettoyer localStorage
    localStorage.removeItem('selectedDepartment');
    localStorage.removeItem('selectedDepartmentType');
    localStorage.removeItem('selectedDepartmentPath');
    localStorage.removeItem('selectedDepartmentName');
    localStorage.removeItem('isUnderDevelopment');
    navigate('/');
  };
  
  return (
    <div className="under-construction-page">
      <div className="construction-card">
        <div className="construction-icon">🚧</div>
        <h1>Portal Under Development</h1>
        <h2>بوابة قيد التطوير</h2>
        <div className="construction-divider"></div>
        <p className="construction-message">
          The <strong>{departmentName}</strong> portal is currently under construction.
        </p>
        <p className="construction-message-ar">
          بوابة <strong>{departmentName}</strong> قيد التطوير حالياً
        </p>
        <div className="construction-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Coming Soon | قريباً</p>
        </div>
        <button onClick={handleGoBack} className="back-button">
          ← Back to Departments
        </button>
      </div>
    </div>
  );
}