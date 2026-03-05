import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../api/authService';
import '../styles/AdminPage.css';

const AdminPage = ({ user, token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New user form state
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [newPassword, setNewPassword] = useState('');

  // Edit user modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });

  // Change password modal state
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers(token);
      setUsers(data.map(u => ({ ...u, id: u._id })));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId, token);
      setUsers(users.filter(u => u.id !== userId));
      setError('');
    } catch (err) {
      setError(err.message || 'Error deleting user');
    }
  };

  // Open edit modal with user data
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ username: user.username, email: user.email, role: user.role });
  };

  // Handle edit form submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updated = await updateUser(editingUser.id, editForm, token);
      setUsers(users.map(u => (u.id === editingUser.id ? { ...updated, id: updated._id } : u)));
      setEditingUser(null);
      setError('');
    } catch (err) {
      setError(err.message || 'Error updating user');
    }
  };

  // Open change password modal
  const openPasswordModal = (user) => {
    setChangingPasswordUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!changingPasswordUser) return;
    const { newPassword, confirmPassword } = passwordForm;
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await changePassword(changingPasswordUser.id, newPassword, token);
      alert('Password updated successfully!');
      setChangingPasswordUser(null);
      setError('');
    } catch (err) {
      setError(err.message || 'Error changing password');
    }
  };

  // Create user
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEmail || !newUsername || !newPassword) {
      setError('All fields are required');
      return;
    }
    try {
      const created = await createUser(
        { email: newEmail, username: newUsername, password: newPassword, role: newRole },
        token
      );
      setUsers([...users, { ...created, id: created._id }]);
      // Reset form
      setNewEmail('');
      setNewUsername('');
      setNewPassword('');
      setNewRole('USER');
      setError('');
    } catch (err) {
      setError(err.message || 'Error creating user');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  return (
    <div className="admin-container">
      {/* Header with logout */}
      <div className="admin-header">
        <div className="admin-welcome">
          Welcome, <strong>{user.email}</strong> (Admin)
        </div>
        <button onClick={handleLogout} className="admin-logout-button">
          Log out
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Create user section */}
      <section>
        <h2 className="admin-section-title">Create new user</h2>
        <div className="admin-form-card">
          <form onSubmit={handleCreate}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className="admin-input"
                  placeholder="user"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="admin-input"
                  placeholder="user@cristal.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="admin-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="role">Role</label>
                <select
                  id="role"
                  className="admin-select"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                >
                  <option value="USER">USER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <div className="admin-form-group">
                <button type="submit" className="admin-create-button">
                  Create user
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Users list */}
      <section>
        <h2 className="admin-section-title">User list</h2>
        <div className="admin-table-wrapper">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="admin-role-badge">{u.role}</span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-action-button"
                        onClick={() => openEditModal(u)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-action-button admin-delete-button"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="admin-action-button"
                        onClick={() => openPasswordModal(u)}
                      >
                        Change password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#5f6b7a' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit user</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">Username</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Email</label>
                <input
                  type="email"
                  className="admin-input"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Role</label>
                <select
                  className="admin-select"
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="USER">USER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="admin-create-button">Save</button>
                <button type="button" className="admin-logout-button" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changingPasswordUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Change password for {changingPasswordUser.username}</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">New password</label>
                <input
                  type="password"
                  className="admin-input"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Confirm new password</label>
                <input
                  type="password"
                  className="admin-input"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="admin-create-button">Change password</button>
                <button type="button" className="admin-logout-button" onClick={() => setChangingPasswordUser(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;