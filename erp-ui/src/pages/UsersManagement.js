import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../api/authService';
import { useLanguage } from '../context/LanguageContext';
import { 
  FiPlus, FiEdit2, FiTrash2, FiLock, FiUser, FiShield, 
  FiSave, FiRefreshCw, FiSearch, FiX, FiCheckCircle,
  FiAlertCircle, FiUsers, FiStar, FiUserCheck
} from 'react-icons/fi';
import '../styles/UsersManagement.css';

const UsersManagement = ({ user, token }) => {
  const { t, isRTL } = useLanguage();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [newPassword, setNewPassword] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', role: '' });
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 4000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 4000);
  };

  const isUsernameExists = (username, excludeUserId = null) => {
    return users.some(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.id !== excludeUserId
    );
  };

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'SUPER_ADMIN': return t.superAdminRole;
      case 'ADMIN': return t.adminRole;
      default: return t.userRole;
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'SUPER_ADMIN': return <FiStar />;
      case 'ADMIN': return <FiShield />;
      default: return <FiUserCheck />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'SUPER_ADMIN': return '#f59e0b';
      case 'ADMIN': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const matchesSearchTerm = (user, term) => {
    const lowercasedTerm = term.toLowerCase();
    return user.username.toLowerCase().includes(lowercasedTerm) ||
           getRoleDisplayName(user.role).toLowerCase().includes(lowercasedTerm) ||
           user.role.toLowerCase().includes(lowercasedTerm);
  };

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(user => matchesSearchTerm(user, term));
    setFilteredUsers(filtered);
  }, [users]);

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredUsers(users);
  };

  const getRoleOptions = () => {
    const options = [{ value: 'USER', label: t.userRole }];
    if (user.role === 'SUPER_ADMIN') {
      options.push({ value: 'ADMIN', label: t.adminRole });
      options.push({ value: 'SUPER_ADMIN', label: t.superAdminRole });
    } else if (user.role === 'ADMIN') {
      options.push({ value: 'ADMIN', label: t.adminRole });
    }
    return options;
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers(token);
      const usersWithId = data.map(u => ({ ...u, id: u._id }));
      setUsers(usersWithId);
      setFilteredUsers(usersWithId);
      setError('');
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to fetch users';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchTerm, handleSearch]);

  const handleDelete = async (id, username) => {
    const confirmed = window.confirm(`${t.confirmDelete} "${username}"? ${t.deleteConfirm}`);
    if (!confirmed) return;

    try {
      await deleteUser(id, token);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
      showSuccess(`${t.userDeleted}: "${username}"`);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Delete failed";
      showError(errorMsg);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({ username: u.username, role: u.role });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (user.role === 'ADMIN' && editForm.role !== 'USER') {
      showError(t.adminRestricted);
      return;
    }

    if (isUsernameExists(editForm.username, editingUser.id)) {
      showError(t.usernameExists);
      return;
    }

    try {
      const updated = await updateUser(editingUser.id, editForm, token);
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === editingUser.id ? { ...updated, id: updated._id } : u
      ));
      setEditingUser(null);
      showSuccess(`${t.userUpdated}: "${editForm.username}"`);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Update failed';
      if (errorMsg.toLowerCase().includes('username') && errorMsg.toLowerCase().includes('exists')) {
        showError(t.usernameExists);
      } else {
        showError(errorMsg);
      }
    }
  };

  const openPasswordModal = (u) => {
    setChangingPasswordUser(u);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError(t.passwordsDontMatch);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showError(t.passwordMinLength);
      return;
    }
    try {
      await changePassword(changingPasswordUser.id, passwordForm.newPassword, token);
      showSuccess(`${t.passwordUpdated} for "${changingPasswordUser.username}"`);
      setChangingPasswordUser(null);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Password change failed';
      showError(errorMsg);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!newUsername.trim() || !newPassword.trim() || !newRole) {
      showError(t.allFieldsRequired);
      return;
    }
    
    if (newPassword.length < 8) {
      showError(t.passwordMinLength);
      return;
    }
    
    if (user.role === 'ADMIN' && newRole !== 'USER') {
      showError(t.adminRestricted);
      return;
    }

    if (isUsernameExists(newUsername)) {
      showError(t.usernameExists);
      return;
    }

    try {
      const created = await createUser(
        { username: newUsername, password: newPassword, role: newRole },
        token
      );
      const newUser = { ...created, id: created._id };
      setUsers(prevUsers => [...prevUsers, newUser]);
      setNewUsername('');
      setNewPassword('');
      setNewRole('USER');
      showSuccess(`${t.userCreated}: "${newUsername}"`);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Create failed';
      if (errorMsg.toLowerCase().includes('username') && errorMsg.toLowerCase().includes('exists')) {
        showError(t.usernameExists);
      } else {
        showError(errorMsg);
      }
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    usersCount: users.filter(u => u.role === 'USER').length
  };

  if (loading) {
    return (
      <div className="users-container" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`users-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="users-header">
        <div className="users-header-left">
          <div className="users-header-icon">
            <FiUsers size={28} />
          </div>
          <div>
            <h1>{t.userManagement}</h1>
            <p>{t.manageUsers}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="users-stats">
        <div className="users-stat-card">
          <div className="users-stat-icon" style={{ background: '#667eea' }}>
            <FiUsers />
          </div>
          <div>
            <div className="users-stat-value">{stats.total}</div>
            <div className="users-stat-label">{t.totalUsers}</div>
          </div>
        </div>
        <div className="users-stat-card">
          <div className="users-stat-icon" style={{ background: '#f093fb' }}>
            <FiShield />
          </div>
          <div>
            <div className="users-stat-value">{stats.admins}</div>
            <div className="users-stat-label">{t.administrators}</div>
          </div>
        </div>
        <div className="users-stat-card">
          <div className="users-stat-icon" style={{ background: '#4facfe' }}>
            <FiUserCheck />
          </div>
          <div>
            <div className="users-stat-value">{stats.usersCount}</div>
            <div className="users-stat-label">{t.activeUsers}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="users-toast error">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <FiX />
          </button>
        </div>
      )}
      {success && (
        <div className="users-toast success">
          <FiCheckCircle />
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>
            <FiX />
          </button>
        </div>
      )}

      {/* Create User Form */}
      <div className="users-form-card">
        <div className="users-form-header">
          <h3>
            <FiPlus /> {t.createUser}
          </h3>
        </div>
        <form onSubmit={handleCreate}>
          <div className="users-form-grid">
            <div className="users-input-group">
              <label>
                <FiUser /> {t.username}
              </label>
              <input 
                type="text" 
                placeholder={t.username} 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)} 
                required 
              />
              {newUsername && isUsernameExists(newUsername) && (
                <span className="users-field-error">
                  <FiAlertCircle size={12} /> {t.usernameExists}
                </span>
              )}
            </div>
            <div className="users-input-group">
              <label>
                <FiLock /> {t.password}
              </label>
              <input 
                type="password" 
                placeholder={`${t.password} (min 8)`} 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="users-input-group">
              <label>
                <FiShield /> {t.role}
              </label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                {getRoleOptions().map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="users-form-actions">
            <button 
              type="submit" 
              className="users-btn-primary" 
              disabled={newUsername && isUsernameExists(newUsername)}
            >
              <FiPlus /> {t.create}
            </button>
            <button type="button" className="users-btn-secondary" onClick={fetchUsers}>
              <FiRefreshCw /> {t.refresh}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="users-table-card">
        <div className="users-table-header">
          <h3>{t.userList}</h3>
          <div className="users-search">
            <FiSearch />
            <input 
              type="text" 
              placeholder={t.search} 
              value={searchTerm} 
              onChange={(e) => handleSearch(e.target.value)} 
            />
            {searchTerm && (
              <button onClick={clearSearch}>
                <FiX />
              </button>
            )}
          </div>
        </div>
        <div className="users-table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t.username}</th>
                <th>{t.role}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="users-empty">
                    <FiUsers size={40} />
                    <p>{searchTerm ? t.noSearchResults : t.noUsers}</p>
                    {searchTerm && (
                      <button onClick={clearSearch}>{t.clearSearch}</button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="users-avatar">{u.username.charAt(0).toUpperCase()}</div>
                      <span>{u.username}</span>
                    </td>
                    <td>
                      <span 
                        className="users-role-badge" 
                        style={{ background: `${getRoleColor(u.role)}20`, color: getRoleColor(u.role) }}
                      >
                        {getRoleIcon(u.role)} {getRoleDisplayName(u.role)}
                      </span>
                    </td>
                    <td className="users-actions">
                      <button 
                        className="users-action-btn edit" 
                        onClick={() => openEditModal(u)} 
                        title={t.edit}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="users-action-btn password" 
                        onClick={() => openPasswordModal(u)} 
                        title={t.changePassword}
                      >
                        <FiLock />
                      </button>
                      <button 
                        className="users-action-btn delete" 
                        onClick={() => handleDelete(u.id, u.username)} 
                        title={t.delete}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="users-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="users-modal-header">
              <h3>
                <FiEdit2 /> {t.editUser}
              </h3>
              <button className="users-modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="users-input-group">
                <label>
                  <FiUser /> {t.username}
                </label>
                <input 
                  type="text" 
                  value={editForm.username} 
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })} 
                  required 
                />
                {editForm.username && isUsernameExists(editForm.username, editingUser.id) && (
                  <span className="users-field-error">
                    <FiAlertCircle size={12} /> {t.usernameExists}
                  </span>
                )}
              </div>
              <div className="users-input-group">
                <label>
                  <FiShield /> {t.role}
                </label>
                <select 
                  value={editForm.role} 
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                >
                  {getRoleOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="users-form-actions">
                <button 
                  type="submit" 
                  className="users-btn-primary" 
                  disabled={editForm.username && isUsernameExists(editForm.username, editingUser.id)}
                >
                  <FiSave /> {t.save}
                </button>
                <button type="button" className="users-btn-secondary" onClick={() => setEditingUser(null)}>
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {changingPasswordUser && (
        <div className="users-modal-overlay" onClick={() => setChangingPasswordUser(null)}>
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="users-modal-header">
              <h3>
                <FiLock /> {t.changePassword}
              </h3>
              <button className="users-modal-close" onClick={() => setChangingPasswordUser(null)}>×</button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="users-user-info">
                <strong>{changingPasswordUser.username}</strong>
              </div>
              <div className="users-input-group">
                <label>
                  <FiLock /> {t.newPassword}
                </label>
                <input 
                  type="password" 
                  placeholder={t.newPassword} 
                  value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                  required 
                />
              </div>
              <div className="users-input-group">
                <label>
                  <FiLock /> {t.confirmPassword}
                </label>
                <input 
                  type="password" 
                  placeholder={t.confirmPassword} 
                  value={passwordForm.confirmPassword} 
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                  required 
                />
              </div>
              <div className="users-form-actions">
                <button type="submit" className="users-btn-primary">
                  <FiSave /> {t.updatePassword}
                </button>
                <button type="button" className="users-btn-secondary" onClick={() => setChangingPasswordUser(null)}>
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;