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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await login(username, password);
      const { user, access_token } = res;
      localStorage.setItem('token', access_token);
      onLogin(user, access_token);

      if (user.mustChangePassword) {
        navigate("/change-password");
        return;
      }

      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        navigate("/admin");
      } else {
        navigate("/user/reporting");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        <div className="login-brand">
          <div className="brand-content">
            <h1 className="brand-title">AL RUBAI UNITED AL CRISTAL</h1>
            <h1 className="brand-title-ar">الكريستال الرباعي المتحدة</h1>
            <div className="brand-divider"></div>
            <p className="brand-description">Premium Olive Oil · زيت زيتون فاخر</p>
            <div className="brand-decoration">
              <span className="olive-branch">🌿</span>
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
                  />
                </div>
              </div>

              <button type="submit" className="login-button">Log in</button>
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