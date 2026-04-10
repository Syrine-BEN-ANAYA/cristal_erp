import React, { useState } from "react";
import { changePassword } from "../api/authService";
import "../styles/ChangePasswordPage.css";
import logo from "../assets/logo.png";

export default function ChangePasswordPage({ user, token, onPasswordChanged, onLogout }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirm) {
      setError("All fields are required");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await changePassword(user.id || user._id, password, token);
      setSuccess("Password updated successfully!");
      onPasswordChanged({ ...updatedUser, mustChangePassword: false }, token);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <header className="topbar">
        <div className="topbar-logo">
          <img src={logo} alt="Al Rubai United Al Cristal" />
          <span className="company-name">AL RUBAI UNITED AL CRISTAL</span>
        </div>
        <div className="topbar-user">
          <span className="user-username">{user?.username}</span>
        </div>
      </header>

      <div className="change-password-container">
        <h1 className="page-title">Change password</h1>
        <p className="page-subtitle">
          Hello <strong>{user.username || user.username}</strong>, please set a new password to continue.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">New password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                className="input-field"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirm password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                className="input-field"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>

      <footer className="app-footer">
        <p>© 2026 AL RUBAI UNITED AL CRISTAL. All rights reserved.</p>
      </footer>
    </div>
  );
}