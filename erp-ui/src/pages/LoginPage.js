import React, { useState } from 'react';
import { login } from '../api/authService';
import { FiMail, FiLock } from 'react-icons/fi';
import '../styles/LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      onLogin(res.user, res.access_token);
      localStorage.setItem('token', res.access_token);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  // Optional: prefill email if previously remembered
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-page">
      <div className="login-grid">
        {/* Left side - Branding */}
        <div className="login-brand">
          <div className="brand-content">
            <h1 className="brand-title">AL RUBAI UNITED</h1>
            <h2 className="brand-subtitle">AL CRISTAL</h2>
            <p className="brand-description">
              Premium Olive Oil 
            </p>
            <div className="brand-decoration">
              <span className="olive-branch">🌿</span>
              <span className="olive-branch">🌿</span>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="login-form-container">
          <div className="login-card">
            <h3 className="form-title">Welcome back</h3>
            <p className="form-subtitle">Sign in to your account</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  Email
                </label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="input-field"
                    placeholder="username@cristal.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  Password
                </label>
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

              <button type="submit" className="login-button">
                Log in
              </button>

              {error && <div className="error-message">{error}</div>}
            </form>

            <p className="signup-prompt">
              Don’t have an account? <a href="/contact">Contact support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;