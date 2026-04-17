// AdminPage.js - Version bilingue avec tous les rôles
import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../api/authService';
import { FiPlus, FiEdit2, FiTrash2, FiLock, FiUser, FiShield, FiSave, FiRefreshCw, FiGlobe } from 'react-icons/fi';
import '../styles/AdminPage.css';

const AdminPage = ({ user, token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [language, setLanguage] = useState('EN'); // 'EN' or 'AR'

  // Translations
  const translations = {
    EN: {
      title: 'User Management',
      subtitle: 'Manage system users and permissions',
      createUser: 'Create New User',
      userList: 'User List',
      username: 'Username',
      password: 'Password',
      role: 'Role',
      actions: 'Actions',
      edit: 'Edit user',
      changePassword: 'Change password',
      delete: 'Delete user',
      save: 'Save Changes',
      cancel: 'Cancel',
      updatePassword: 'Update Password',
      create: 'Create User',
      refresh: 'Refresh',
      confirmDelete: 'Delete user',
      deleteConfirm: 'This action cannot be undone.',
      allFieldsRequired: 'All fields required',
      passwordMinLength: 'Password must be at least 6 characters',
      passwordsDontMatch: "Passwords don't match",
      passwordUpdated: 'Password updated',
      userCreated: 'User created successfully',
      userUpdated: 'User updated successfully',
      userDeleted: 'User deleted successfully',
      noUsers: 'No users found. Create your first user above.',
      loading: 'Loading users...',
      userRole: 'User',
      adminRole: 'Admin',
      superAdminRole: 'Super Admin',
      editUser: 'Edit User',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password'
    },
    AR: {
      title: 'إدارة المستخدمين',
      subtitle: 'إدارة مستخدمي النظام والصلاحيات',
      createUser: 'إنشاء مستخدم جديد',
      userList: 'قائمة المستخدمين',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      role: 'الدور',
      actions: 'الإجراءات',
      edit: 'تعديل المستخدم',
      changePassword: 'تغيير كلمة المرور',
      delete: 'حذف المستخدم',
      save: 'حفظ التغييرات',
      cancel: 'إلغاء',
      updatePassword: 'تحديث كلمة المرور',
      create: 'إنشاء مستخدم',
      refresh: 'تحديث',
      confirmDelete: 'حذف المستخدم',
      deleteConfirm: 'لا يمكن التراجع عن هذا الإجراء',
      allFieldsRequired: 'جميع الحقول مطلوبة',
      passwordMinLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      passwordsDontMatch: 'كلمات المرور غير متطابقة',
      passwordUpdated: 'تم تحديث كلمة المرور',
      userCreated: 'تم إنشاء المستخدم بنجاح',
      userUpdated: 'تم تحديث المستخدم بنجاح',
      userDeleted: 'تم حذف المستخدم بنجاح',
      noUsers: 'لا يوجد مستخدمين. قم بإنشاء مستخدمك الأول أعلاه',
      loading: 'جاري تحميل المستخدمين...',
      userRole: 'مستخدم',
      adminRole: 'مدير',
      superAdminRole: 'مدير عام',
      editUser: 'تعديل المستخدم',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور'
    }
  };

  const t = translations[language];
  const isRTL = language === 'AR';

  // New user
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [newPassword, setNewPassword] = useState('');

  // Edit user
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', role: '' });

  // Change password
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  // Role options based on current user's role
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
  const handleDelete = async (id, username) => {
    if (!window.confirm(`${t.confirmDelete} "${username}"? ${t.deleteConfirm}`)) return;
    try {
      await deleteUser(id, token);
      setUsers(users.filter(u => u.id !== id));
      setSuccess(`${t.userDeleted}: "${username}"`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Edit
  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({ username: u.username, role: u.role });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    // Restriction: SUPER_ADMIN can edit anything, ADMIN can only create/edit USER role
    if (user.role === 'ADMIN' && editForm.role !== 'USER') {
      setError(t.adminRestricted || 'Admins can only assign USER role');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const updated = await updateUser(editingUser.id, editForm, token);
      setUsers(users.map(u => (u.id === editingUser.id ? { ...updated, id: updated._id } : u)));
      setEditingUser(null);
      setSuccess(`${t.userUpdated}: "${editForm.username}"`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
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
      setError(t.passwordsDontMatch);
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError(t.passwordMinLength);
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      await changePassword(changingPasswordUser.id, passwordForm.newPassword, token);
      setSuccess(`${t.passwordUpdated} for "${changingPasswordUser.username}"`);
      setChangingPasswordUser(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Create user
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setError(t.allFieldsRequired);
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (newPassword.length < 6) {
      setError(t.passwordMinLength);
      setTimeout(() => setError(''), 3000);
      return;
    }
    // Restriction: ADMIN can only create USER role
    if (user.role === 'ADMIN' && newRole !== 'USER') {
      setError('Admins can only create regular users');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const created = await createUser(
        { username: newUsername, password: newPassword, role: newRole },
        token
      );
      setUsers([...users, { ...created, id: created._id }]);
      setNewUsername('');
      setNewPassword('');
      setNewRole('USER');
      setSuccess(`${t.userCreated}: "${newUsername}"`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'AR' : 'EN');
  };

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'SUPER_ADMIN': return 'role-super-admin';
      case 'ADMIN': return 'role-admin';
      default: return 'role-user';
    }
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'SUPER_ADMIN': return t.superAdminRole;
      case 'ADMIN': return t.adminRole;
      default: return t.userRole;
    }
  };

  if (loading) {
    return (
      <div className="admin-container" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Language Switcher */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <div>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>
          </div>
          <div className="header-controls">
            <button className="btn-language-floating" onClick={toggleLanguage}>
              <FiGlobe size={18} /> {language === 'EN' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Create User Card */}
      <div className="form-card">
        <div className="card-header">
          <h3><FiPlus /> {t.createUser}</h3>
        </div>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">
                <FiUser /> {t.username}
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={t.username}
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">
                <FiLock /> {t.password}
              </label>
              <input
                type="password"
                className="input-field"
                placeholder={`${t.password} (min 6)`}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">
                <FiShield /> {t.role}
              </label>
              <select className="input-field" value={newRole} onChange={e => setNewRole(e.target.value)}>
                {getRoleOptions().map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <FiPlus /> {t.create}
            </button>
            <button type="button" className="btn-secondary" onClick={fetchUsers}>
              <FiRefreshCw /> {t.refresh}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="table-card">
        <div className="card-header">
          <h3>{t.userList}</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.username}</th>
                <th>{t.role}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-message">{t.noUsers}</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td className="username-cell">
                      <span>{u.username}</span>
                    </td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                        {getRoleDisplayName(u.role)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="icon-btn edit-btn" 
                        onClick={() => openEditModal(u)} 
                        title={t.edit}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="icon-btn password-btn" 
                        onClick={() => openPasswordModal(u)} 
                        title={t.changePassword}
                      >
                        <FiLock />
                      </button>
                      <button 
                        className="icon-btn delete-btn" 
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
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FiEdit2 /> {t.editUser}
              </div>
              <button className="close-modal" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="input-group">
                <label><FiUser /> {t.username}</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label><FiShield /> {t.role}</label>
                <select
                  className="input-field"
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                >
                  {getRoleOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <FiSave /> {t.save}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {changingPasswordUser && (
        <div className="modal-overlay" onClick={() => setChangingPasswordUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FiLock /> {t.changePassword}
              </div>
              <button className="close-modal" onClick={() => setChangingPasswordUser(null)}>×</button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="input-group">
                <label>{t.username}: <strong>{changingPasswordUser.username}</strong></label>
              </div>
              <div className="input-group">
                <label><FiLock /> {t.newPassword}</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder={t.newPassword}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label><FiLock /> {t.confirmPassword}</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder={t.confirmPassword}
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <FiSave /> {t.updatePassword}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setChangingPasswordUser(null)}>
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

export default AdminPage;