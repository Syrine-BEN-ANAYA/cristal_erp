import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../api/authService';
import { FiPlus, FiEdit2, FiTrash2, FiLock, FiX, FiUser, FiMail, FiShield } from 'react-icons/fi';
import '../styles/AdminPage.css';

const AdminPage = ({ user, token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New user
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [newPassword, setNewPassword] = useState('');

  // Edit user
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });

  // Change password
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

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id, token);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit
  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({ username: u.username, email: u.email, role: u.role });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (user.role === 'ADMIN' && editForm.role !== 'USER') {
      setError('Admins cannot assign admin role');
      return;
    }
    try {
      const updated = await updateUser(editingUser.id, editForm, token);
      setUsers(users.map(u => (u.id === editingUser.id ? { ...updated, id: updated._id } : u)));
      setEditingUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Password
  const openPasswordModal = (u) => {
    setChangingPasswordUser(u);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await changePassword(changingPasswordUser.id, passwordForm.newPassword, token);
      alert('Password updated');
      setChangingPasswordUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Create user
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEmail || !newUsername || !newPassword) {
      setError('All fields required');
      return;
    }
    if (user.role === 'ADMIN' && newRole !== 'USER') {
      setError('Admins can only create users');
      return;
    }
    try {
      const created = await createUser(
        { username: newUsername, email: newEmail, password: newPassword, role: newRole },
        token
      );
      setUsers([...users, { ...created, id: created._id }]);
      setNewEmail('');
      setNewUsername('');
      setNewPassword('');
      setNewRole('USER');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="admin-container"><div className="loading-spinner">Loading users…</div></div>;

  return (
    <div className="admin-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Create User Card */}
      <div className="form-card">
        <h3 className="form-title"><FiPlus /> Create New User</h3>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label"><FiUser /> Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Username"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label"><FiMail /> Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label"><FiLock /> Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  className="input-field"
                  placeholder="Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label"><FiShield /> Role</label>
              <div className="input-wrapper">
                <select className="input-field" value={newRole} onChange={e => setNewRole(e.target.value)}>
                  <option value="USER">USER</option>
                  {user.role === 'SUPER_ADMIN' && <option value="ADMIN">ADMIN</option>}
                </select>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <FiPlus /> Create User
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <h3 className="table-title">User List</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="4" className="empty-message">No users found.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td className="actions-cell">
                    <button className="icon-btn edit-btn" onClick={() => openEditModal(u)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => handleDelete(u.id)} title="Delete">
                      <FiTrash2 />
                    </button>
                    <button className="icon-btn password-btn" onClick={() => openPasswordModal(u)} title="Change password">
                      <FiLock />
                    </button>
                   </td>
                 </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-btn" onClick={() => setEditingUser(null)}><FiX /></button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="input-group">
                <label><FiUser /> Username</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label><FiMail /> Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label><FiShield /> Role</label>
                <select
                  className="input-field"
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="USER">USER</option>
                  {user.role === 'SUPER_ADMIN' && <option value="ADMIN">ADMIN</option>}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {changingPasswordUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="close-btn" onClick={() => setChangingPasswordUser(null)}><FiX /></button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="input-group">
                <label><FiLock /> New Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label><FiLock /> Confirm Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Confirm password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Update Password</button>
                <button type="button" className="btn btn-secondary" onClick={() => setChangingPasswordUser(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;