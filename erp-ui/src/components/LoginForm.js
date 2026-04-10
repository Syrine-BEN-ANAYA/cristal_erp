// components/LoginForm.jsx
import React from 'react';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';
import { FiMail, FiLock } from 'react-icons/fi';

const LoginForm = ({ 
  onSubmit, 
  username, 
  setUsername, 
  password, 
  setPassword, 
  error, 
  loading 
}) => {
  return (
    <div className="login-form-container">
      <div className="login-card">
        <h3 className="form-title">Welcome back</h3>
        <p className="form-subtitle">Sign in to your account</p>

        <form onSubmit={onSubmit}>
          <FormInput
            label="Username"
            icon={FiMail}
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />

          <FormInput
            label="Password"
            icon={FiLock}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <ErrorMessage message={error} />
        </form>

        <p className="signup-prompt">
          Don't have an account? <a href="/contact">Contact support</a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;