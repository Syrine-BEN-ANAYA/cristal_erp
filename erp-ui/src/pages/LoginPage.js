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
  const [rememberMe, setRememberMe] = useState(false);

  // Helper function to safely set localStorage
  const safeSetLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to save to localStorage: ${key}`, err);
      return false;
    }
  };

  // Helper function to safely remove from localStorage
  const safeRemoveLocalStorage = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to remove from localStorage: ${key}`, err);
    }
  };

  // Helper function to check department access
  const checkDepartmentAccess = (selectedDeptType, userRole) => {
    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isAdmin = userRole === "ADMIN";
    const isUser = userRole === "USER";

    switch (selectedDeptType) {
      case 'admin':
        return isAdmin || isSuperAdmin;
      case 'user':
        return isUser || isSuperAdmin;
      case 'all':
        return true;
      default:
        return true;
    }
  };

  // Helper function to get access denied message
  const getAccessDeniedMessage = (selectedDeptType, selectedDeptName) => {
    if (selectedDeptType === 'admin') {
      return `⛔ Access Denied: "${selectedDeptName}" department is restricted to Administrators only.`;
    }
    if (selectedDeptType === 'user') {
      return `⛔ Access Denied: "${selectedDeptName}" department is restricted to regular users and Super Administrators only.`;
    }
    return `⛔ Access Denied: You don't have permission for "${selectedDeptName}" department.`;
  };

  // Helper function to get error message from response
  const getErrorMessage = (err) => {
    if (!err.response) {
      if (err.request) {
        return 'Network error. Please check your connection.';
      }
      return err.message || 'Login failed';
    }

    const status = err.response.status;
    const backendMessage = err.response?.data?.message || err.response?.data?.error || '';

    switch (status) {
      case 400:
        return 'Invalid request. Please check your credentials.';
      case 401:
      case 404:
        return 'User does not exist';
      case 403:
        return 'Access forbidden. Please contact your administrator.';
      case 429:
        return 'Too many attempts. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        // Check backend message for invalid credentials patterns
        if (backendMessage && /invalid|credentials|not found|exist|incorrect/i.test(backendMessage)) {
          return 'User does not exist';
        }
        return backendMessage || `Login failed (${status})`;
    }
  };

  // Helper function to clear department storage
  const clearDepartmentStorage = () => {
    const keysToRemove = [
      'selectedDepartment',
      'selectedDepartmentType',
      'selectedDepartmentPath',
      'selectedDepartmentName',
      'isUnderDevelopment'
    ];
    keysToRemove.forEach(key => safeRemoveLocalStorage(key));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const selectedDeptType = localStorage.getItem('selectedDepartmentType');
      const selectedDeptName = localStorage.getItem('selectedDepartmentName') || 'this department';
      
      const res = await login(username, password);
      const { user, access_token } = res;
      
      // Check department access
      const hasAccess = checkDepartmentAccess(selectedDeptType, user.role);
      if (!hasAccess) {
        const errorMsg = getAccessDeniedMessage(selectedDeptType, selectedDeptName);
        setError(errorMsg);
        setIsLoading(false);
        return;
      }
      
      // Save token with remember me option
      if (rememberMe) {
        safeSetLocalStorage('token', access_token);
      } else {
        safeSetLocalStorage('token', access_token);
        // For session-only storage, we could use sessionStorage
        // sessionStorage.setItem('token', access_token);
      }
      
      onLogin(user, access_token);
      clearDepartmentStorage();

      if (user.mustChangePassword) {
        navigate("/change-password");
        return;
      }

      // Redirection based on department
      const redirectPath = selectedDeptType === 'admin' ? "/admin" : "/user/reporting";
      navigate(redirectPath);
      
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved credentials if remember me was checked
  React.useEffect(() => {
    try {
      const savedUsername = localStorage.getItem('rememberedUsername');
      if (savedUsername) {
        setUsername(savedUsername);
        setRememberMe(true);
      }
    } catch (err) {
      // Silent fail for localStorage issues
    }
  }, []);

  // Save username if remember me is checked
  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    
    if (!isChecked) {
      try {
        localStorage.removeItem('rememberedUsername');
      } catch (err) {
        // Silent fail
      }
    } else if (username) {
      try {
        localStorage.setItem('rememberedUsername', username);
      } catch (err) {
        // Silent fail
      }
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
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    disabled={isLoading}
                  />
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