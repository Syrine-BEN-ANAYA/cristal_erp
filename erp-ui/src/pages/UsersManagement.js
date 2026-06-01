import React, { useEffect, useState, useCallback } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getPendingEmployees,
  createUserFromEmployee
} from '../api/authService';

import { useLanguage } from '../context/LanguageContext';
import {
  FiEdit2, FiTrash2, FiLock, FiShield, FiStar, FiUserCheck, FiUsers
} from 'react-icons/fi';

import '../styles/UsersManagement.css';

const UsersManagement = ({ user, token }) => {
  const { t, isRTL } = useLanguage();

  const [users, setUsers] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [employeeForms, setEmployeeForms] = useState({});

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('PROD_USER'); // rôle par défaut
  const [newPassword, setNewPassword] = useState('');

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', role: '' });

  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 4000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 4000);
  };

  const isUsernameExists = (username, excludeUserId = null) => {
    return users.some(
      u =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.id !== excludeUserId
    );
  };

  // === Affichage des rôles ===
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Admin';
      case 'PROD_USER': return 'PROD User';
      case 'HR_USER': return 'HR User';
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return <FiStar />;
      case 'ADMIN': return <FiShield />;
      case 'PROD_USER': return <FiUserCheck />;
      case 'HR_USER': return <FiUsers />;
      default: return <FiUserCheck />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return '#f59e0b';
      case 'ADMIN': return '#3b82f6';
      case 'PROD_USER': return '#10b981';
      case 'HR_USER': return '#8b5cf6';
      default: return '#10b981';
    }
  };

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (!term.trim()) return setFilteredUsers(users);
    setFilteredUsers(
      users.filter(u =>
        u.username.toLowerCase().includes(term.toLowerCase())
      )
    );
  }, [users]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers(token);
      const usersWithId = data.map(u => ({ ...u, id: u._id }));
      setUsers(usersWithId);
      setFilteredUsers(usersWithId);
    } catch (err) {
      showError(err?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPendingEmployees = useCallback(async () => {
    try {
      const data = await getPendingEmployees(token);
      setPendingEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchPendingEmployees();
    }
  }, [token, fetchUsers, fetchPendingEmployees]);

  const updateEmployeeForm = (id, field, value) => {
    setEmployeeForms(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleCreateFromEmployee = async (employeeId) => {
    const form = employeeForms[employeeId];
    if (!form?.username || !form?.password) {
      return showError("Username et password requis");
    }

    try {
      await createUserFromEmployee(
        employeeId,
        {
          username: form.username,
          password: form.password,
          role: form.role || 'PROD_USER'
        },
        token
      );
      showSuccess("User créé depuis employee");
      setPendingEmployees(prev => prev.filter(e => e._id !== employeeId));
      setEmployeeForms(prev => {
        const copy = { ...prev };
        delete copy[employeeId];
        return copy;
      });
      fetchUsers();
    } catch (err) {
      showError(err?.message || "Error creating user from employee");
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`${t.confirmDelete} "${username}"?`)) return;
    try {
      await deleteUser(id, token);
      setUsers(prev => prev.filter(u => u.id !== id));
      showSuccess(t.userDeleted);
    } catch (err) {
      showError(err?.message || "Delete failed");
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({ username: u.username, role: u.role });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (isUsernameExists(editForm.username, editingUser.id)) {
      return showError(t.usernameExists);
    }
    try {
      const updated = await updateUser(editingUser.id, editForm, token);
      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id ? { ...updated, id: updated._id } : u
        )
      );
      setEditingUser(null);
      showSuccess(t.userUpdated);
    } catch (err) {
      showError(err?.message || "Update failed");
    }
  };

  const openPasswordModal = (u) => {
    setChangingPasswordUser(u);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showError(t.passwordsDontMatch);
    }
    try {
      await changePassword(changingPasswordUser.id, passwordForm.newPassword, token);
      setChangingPasswordUser(null);
      showSuccess(t.passwordUpdated);
    } catch (err) {
      showError(err?.message || "Password update failed");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      return showError(t.allFieldsRequired);
    }
    try {
      const created = await createUser(
        { username: newUsername, password: newPassword, role: newRole },
        token
      );
      setUsers(prev => [...prev, { ...created, id: created._id }]);
      setNewUsername('');
      setNewPassword('');
      setNewRole('PROD_USER');
      showSuccess(t.userCreated);
    } catch (err) {
      showError(err?.message || "Create failed");
    }
  };

  // Stats basées sur les nouveaux rôles
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    prodUsers: users.filter(u => u.role === 'PROD_USER').length,
    hrUsers: users.filter(u => u.role === 'HR_USER').length
  };

  if (loading) {
    return (
      <div className="users-container">
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div className={`users-container ${isRTL ? 'rtl' : 'ltr'}`}>

      {/* =========================
          EMPLOYEES REQUESTED
      ========================== */}
      <div className="users-form-card">
        <h3>Pending Employees</h3>
        {pendingEmployees.length === 0 ? (
          <p>No pending employees</p>
        ) : (
          pendingEmployees.map(emp => (
            <div key={emp._id} style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <strong>{emp.firstName} {emp.lastName}</strong>
              <div>{emp.email}</div>
              <div className="users-form-grid">
                <input
                  placeholder="username"
                  value={employeeForms[emp._id]?.username || ''}
                  onChange={(e) => updateEmployeeForm(emp._id, 'username', e.target.value)}
                />
                <input
                  type="password"
                  placeholder="password"
                  value={employeeForms[emp._id]?.password || ''}
                  onChange={(e) => updateEmployeeForm(emp._id, 'password', e.target.value)}
                />
                <select
                  value={employeeForms[emp._id]?.role || 'PROD_USER'}
                  onChange={(e) => updateEmployeeForm(emp._id, 'role', e.target.value)}
                >
                  <option value="PROD_USER">PROD_USER</option>
                  <option value="HR_USER">HR_USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button className="users-btn-primary" onClick={() => handleCreateFromEmployee(emp._id)}>
                  Create User
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =========================
          CREATE USER (manual)
      ========================== */}
      <div className="users-form-card">
        <h3>{t.createUser}</h3>
        <form onSubmit={handleCreate}>
          <input
            placeholder={t.username}
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder={t.password}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="PROD_USER">PROD_USER</option>
            <option value="HR_USER">HR_USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          <button type="submit" className="users-btn-primary">{t.create}</button>
        </form>
      </div>

      {/* =========================
          USERS TABLE
      ========================== */}
      <div className="users-table-card">
        <h3>{t.userList}</h3>
        <input
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <table className="users-table">
          <thead>
            <tr>
              <th>{t.username}</th>
              <th>{t.role}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td style={{ color: getRoleColor(u.role) }}>
                  {getRoleIcon(u.role)} {getRoleDisplayName(u.role)}
                </td>
                <td>
                  <button onClick={() => openEditModal(u)}><FiEdit2 /></button>
                  <button onClick={() => openPasswordModal(u)}><FiLock /></button>
                  <button onClick={() => handleDelete(u.id, u.username)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================
          EDIT MODAL
      ========================== */}
      {editingUser && (
        <div className="modal">
          <form onSubmit={handleUpdateSubmit}>
            <h3>Edit User</h3>
            <input
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            />
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            >
              <option value="PROD_USER">PROD_USER</option>
              <option value="HR_USER">HR_USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <button type="submit">{t.save}</button>
            <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
          </form>
        </div>
      )}

      {/* =========================
          PASSWORD MODAL
      ========================== */}
      {changingPasswordUser && (
        <div className="modal">
          <form onSubmit={handlePasswordSubmit}>
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="new password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <input
              type="password"
              placeholder="confirm password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
            <button type="submit">{t.save}</button>
            <button type="button" onClick={() => setChangingPasswordUser(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;