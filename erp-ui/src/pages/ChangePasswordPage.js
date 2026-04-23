// ChangePasswordPage.js - Version modernisée
import React, { useState } from "react";
import { changePassword } from "../api/authService";
import "../styles/ChangePasswordPage.css";
import logo from "../assets/logo.png";
import { FiLock, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

export default function ChangePasswordPage({ user, token, onPasswordChanged, onLogout }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]+/)) strength++;
    if (pass.match(/[A-Z]+/)) strength++;
    if (pass.match(/[0-9]+/)) strength++;
    if (pass.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const getStrengthText = () => {
    switch(passwordStrength) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      case 5: return "Very Strong";
      default: return "";
    }
  };

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return "#ef4444";
      case 1: return "#ef4444";
      case 2: return "#f59e0b";
      case 3: return "#10b981";
      case 4: return "#10b981";
      case 5: return "#06b6d4";
      default: return "#64748b";
    }
  };

  const getStrengthWidth = () => {
    return (passwordStrength / 5) * 100;
  };

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

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await changePassword(user.id || user._id, password, token);
      setSuccess("Password updated successfully!");
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        onPasswordChanged({ ...updatedUser, mustChangePassword: false }, token);
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    { label: "Contains special character", met: /[$@#&!]/.test(password) }
  ];

  return (
    <div className="change-password-page-modern">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
      </div>

      <header className="topbar-modern">
        <div className="topbar-content">
          <div className="topbar-logo-modern">
            <div className="logo-wrapper">
              <img src={logo} alt="Al Rubai United Al Cristal" />
            </div>
            <span className="company-name-modern">AL RUBAI UNITED AL CRISTAL</span>
          </div>
          <div className="topbar-user-modern">
            <div className="user-avatar-modern">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="user-username-modern">{user?.username}</span>
          </div>
        </div>
      </header>

      <div className="change-password-container-modern">
        <div className="password-card">
          <div className="card-header-modern">
            <div className="header-icon">
              <FiLock size={32} />
            </div>
            <h1 className="card-title">Change Password</h1>
            <p className="card-subtitle">
              Hello <strong>{user?.username}</strong>, please set a new password to continue
            </p>
          </div>

          {error && (
            <div className="alert-message error">
              <FiAlertCircle />
              <span>{error}</span>
              <button onClick={() => setError("")}>×</button>
            </div>
          )}
          
          {success && (
            <div className="alert-message success">
              <FiCheckCircle />
              <span>{success}</span>
              <div className="success-progress"></div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group-modern">
              <label className="input-label-modern">
                New Password
              </label>
              <div className="input-wrapper-modern">
                <span className="input-icon-modern">
                  <FiLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field-modern"
                  placeholder="Enter new password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${getStrengthWidth()}%`,
                        backgroundColor: getStrengthColor()
                      }}
                    ></div>
                  </div>
                  <div className="strength-text" style={{ color: getStrengthColor() }}>
                    {getStrengthText()}
                  </div>
                </div>
              )}
              
              {/* Password requirements */}
              {password && (
                <div className="password-requirements">
                  <p className="requirements-title">Password requirements:</p>
                  <ul>
                    {requirements.map((req, index) => (
                      <li key={index} className={req.met ? "met" : "unmet"}>
                        <span className="req-bullet">{req.met ? "✓" : "○"}</span>
                        <span>{req.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="input-group-modern">
              <label className="input-label-modern">
                Confirm Password
              </label>
              <div className="input-wrapper-modern">
                <span className="input-icon-modern">
                  <FiLock />
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  className="input-field-modern"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              
              {/* Match indicator */}
              {confirm && password && (
                <div className={`match-indicator ${password === confirm ? "match" : "mismatch"}`}>
                  {password === confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
                </div>
              )}
            </div>

            <div className="form-actions-modern">
              <button 
                type="submit" 
                className="btn-primary-modern" 
                disabled={loading || !password || !confirm || password !== confirm}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    Update Password
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="security-note">
            <p>🔒 Your password is encrypted and stored securely</p>
          </div>
        </div>
      </div>

      <footer className="app-footer-modern">
        <div className="footer-content">
          <p>© 2026 AL RUBAI UNITED AL CRISTAL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}