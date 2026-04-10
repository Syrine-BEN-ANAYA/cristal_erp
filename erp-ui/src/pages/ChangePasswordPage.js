// src/pages/ChangePasswordPage.js (version finale)
import React, { useState } from "react";
import { changePassword } from "../api/authService";
import FormInput from "../components/FormInput";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";
import { FiLock } from "react-icons/fi";
import "../styles/ChangePasswordPage.css";

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

  if (loading) {
    return <LoadingSpinner message="Updating password..." />;
  }

  return (
    <div className="change-password-page">
      <TopBar user={user} />

      <div className="change-password-container">
        <h1 className="page-title">Change password</h1>
        <p className="page-subtitle">
          Hello <strong>{user.username}</strong>, please set a new password to continue.
        </p>

        <ErrorMessage message={error} onDismiss={() => setError("")} />
        <SuccessMessage message={success} onDismiss={() => setSuccess("")} />

        <form onSubmit={handleSubmit}>
          <FormInput
            label="New password"
            icon={FiLock}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />

          <FormInput
            label="Confirm password"
            icon={FiLock}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
          />

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}