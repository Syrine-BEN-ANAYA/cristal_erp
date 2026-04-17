// LoginPage.js - Version corrigée pour Sales & Purchases
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { login } from '../api/authService';
import { FiMail, FiLock } from 'react-icons/fi';
import '../styles/LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const selectedDeptType = localStorage.getItem('selectedDepartmentType');
      const selectedDeptName = localStorage.getItem('selectedDepartmentName') || 'this department';
      
      const res = await login(username, password);
      const { user, access_token } = res;
      
      const isSuperAdmin = user.role === "SUPER_ADMIN";
      const isAdmin = user.role === "ADMIN";
      const isUser = user.role === "USER";
      
      console.log("Role:", user.role);
      console.log("selectedDeptType:", selectedDeptType);
      
      // === RÈGLES D'ACCÈS ===
      
      // 1. Département ADMIN : seulement ADMIN et SUPER_ADMIN
      if (selectedDeptType === 'admin' && !isAdmin && !isSuperAdmin) {
        setError(`⛔ Access Denied: "${selectedDeptName}" department is restricted to Administrators only.`);
        setIsLoading(false);
        return;
      }
      
      // 2. Département USER : USER et SUPER_ADMIN (pas ADMIN normal)
      if (selectedDeptType === 'user' && !isUser && !isSuperAdmin) {
        setError(`⛔ Access Denied: "${selectedDeptName}" department is restricted to regular users and Super Administrators only.`);
        setIsLoading(false);
        return;
      }
      
      // 3. Département ALL : tout le monde
      if (selectedDeptType === 'all') {
        // Tout le monde peut accéder
      }
      
      localStorage.setItem('token', access_token);
      onLogin(user, access_token);
      
      localStorage.removeItem('selectedDepartment');
      localStorage.removeItem('selectedDepartmentType');
      localStorage.removeItem('selectedDepartmentPath');
      localStorage.removeItem('selectedDepartmentName');
      localStorage.removeItem('isUnderDevelopment');

      if (user.mustChangePassword) {
        navigate("/change-password");
        return;
      }

      // Redirection
      if (selectedDeptType === 'admin') {
        navigate("/admin");
      } else {
        navigate("/user/reporting");
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        <div className="login-brand">
          <div className="brand-content">
            <h1 className="brand-title">
              AL RUBAI<span className="brand-separator"> | </span>UNITED CRISTAL
            </h1>
            <h1 className="brand-title-ar">الكريستال الرباعي المتحدة</h1>
            <div className="brand-divider"></div>
            <p className="brand-description">Enterprise Resource Planning</p>
            <div className="brand-decoration">
              <span className="olive-branch">🌿</span>
              <span className="olive-branch">✨</span>
              <span className="olive-branch">🌿</span>
            </div>
          </div>
        </div>

        <div className="login-form-container">
          <div className="login-card">
            <h3 className="form-title">Welcome back</h3>
            <p className="form-subtitle">Sign in to your account</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="username" className="input-label">Username</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    className="input-field"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-link">Forgot password?</a>
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Checking...' : 'Log in'}
              </button>
              {error && <div className="error-message">{error}</div>}
            </form>
            <p className="signup-prompt">Don't have an account? <a href="/contact">Contact support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;