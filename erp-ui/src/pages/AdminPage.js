// AdminPage.js (version corrigée)
import React, { useState, useCallback, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../api/authService';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import UserFormCard from '../components/UserFormCard';
import UserTable from '../components/UserTable';
import { FiUser, FiMail, FiLock } from 'react-icons/fi'; // Enlevé FiShield qui n'est pas utilisé

const AdminPage = ({ user, token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [newPassword, setNewPassword] = useState('');
  
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });
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

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id, token);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit handlers
  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({ username: u.username, email: u.email, role: u.role });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUser(editingUser.id, editForm, token);
      setUsers(users.map(u => (u.id === editingUser.id ? { ...updated, id: updated._id } : u)));
      setEditingUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Password handlers
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

  // Create user handler
  const handleCreate = async (e) => {
    e.preventDefault();
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

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Role options
  const roleOptions = [
    { value: 'USER', label: 'USER' },
    ...(user.role === 'SUPER_ADMIN' ? [{ value: 'ADMIN', label: 'ADMIN' }] : [])
  ];

  if (loading) return <LoadingSpinner message="Loading users…" />;

  return (
    <div className="admin-container">
      <PageHeader
        title="User Management"
        subtitle="Manage system users and permissions"
        onLogout={handleLogout}
      />

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <UserFormCard
        onSubmit={handleCreate}
        username={newUsername}
        setUsername={setNewUsername}
        email={newEmail}
        setEmail={setNewEmail}
        password={newPassword}
        setPassword={setNewPassword}
        role={newRole}
        setRole={setNewRole}
        roleOptions={roleOptions}
        currentUserRole={user.role}
      />

      <UserTable
        users={users}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onPassword={openPasswordModal}
      />

      {/* Edit Modal */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User">
        <form onSubmit={handleUpdateSubmit}>
          <FormInput
            label="Username"
            icon={FiUser}
            value={editForm.username}
            onChange={e => setEditForm({ ...editForm, username: e.target.value })}
            required
          />
          <FormInput
            label="Email"
            icon={FiMail}
            type="email"
            value={editForm.email}
            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
            required
          />
          <select
            className="input-field"
            value={editForm.role}
            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
          >
            {roleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Password Modal */}
      <Modal isOpen={!!changingPasswordUser} onClose={() => setChangingPasswordUser(null)} title="Change Password">
        <form onSubmit={handlePasswordSubmit}>
          <FormInput
            label="New Password"
            icon={FiLock}
            type="password"
            value={passwordForm.newPassword}
            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            placeholder="New password"
            required
          />
          <FormInput
            label="Confirm Password"
            icon={FiLock}
            type="password"
            value={passwordForm.confirmPassword}
            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            placeholder="Confirm password"
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Update Password</button>
            <button type="button" className="btn btn-secondary" onClick={() => setChangingPasswordUser(null)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPage;