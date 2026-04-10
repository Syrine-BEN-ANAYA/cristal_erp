// src/pages/LoginPage.js (version finale)
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { login } from '../api/authService';
import LoginBrand from '../components/LoginBrand';
import LoginForm from '../components/LoginForm';
import '../styles/LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      const { user, access_token } = res;

      localStorage.setItem('token', access_token);
      onLogin(user, access_token);

      // Redirection selon situation
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        <LoginBrand />
        <LoginForm
          onSubmit={handleSubmit}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default LoginPage;