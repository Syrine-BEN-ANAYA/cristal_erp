import React, { useState } from 'react';
import { changePassword as changePasswordService } from '../api/authService';
import { FiLock, FiCheck, FiLogOut } from 'react-icons/fi';
import '../styles/ChangePasswordPage.css';

export default function ChangePasswordPage({ user, token, onPasswordChanged, onLogout }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await changePasswordService(user.id || user._id, newPassword, token);
      setSuccess('Password updated successfully!');
      onPasswordChanged({ ...updatedUser, mustChangePassword: false }, token);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <div className="card-header">
          <h2 className="card-title">Change Password</h2>
          <p className="card-subtitle">
            Hello <strong>{user.username || user.email}</strong>, you need to change your password to continue.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <div className="input-wrapper">
              <FiCheck className="input-icon" />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <button onClick={onLogout} className="btn btn-secondary logout-btn">
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}