// AdminPage.js - Version avec gestion d'erreur "Username already exists"
import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../api/authService';
import { 
  FiPlus, FiEdit2, FiTrash2, FiLock, FiUser, FiShield, 
  FiSave, FiRefreshCw, FiGlobe, FiSearch, FiX, FiCheckCircle,
  FiAlertCircle, FiUsers, FiShieldOff, FiStar, FiUserCheck
} from 'react-icons/fi';
import '../styles/AdminPage.css';

const AdminPage = ({ user, token }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [language, setLanguage] = useState('EN');

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 4000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 4000);
  };

  const translations = {
    EN: {
      title: 'User Management',
      subtitle: 'Manage system users and permissions',
      createUser: 'Create New User',
      userList: 'User List',
      username: 'Username',
      passwordLabel: 'Password',
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
      deleteConfirm: 'This action cannot be undone',
      allFieldsRequired: 'All fields are required',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordsDontMatch: "Passwords don't match",
      passwordUpdated: 'Password updated successfully',
      userCreated: 'User created successfully',
      userUpdated: 'User updated successfully',
      userDeleted: 'User deleted successfully',
      usernameExists: 'Username already exists',
      noUsers: 'No users found',
      loading: 'Loading users...',
      userRole: 'User',
      adminRole: 'Admin',
      superAdminRole: 'Super Admin',
      editUser: 'Edit User',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      search: 'Search users...',
      searchPlaceholder: 'Search by username or role...',
      noSearchResults: 'No users match your search criteria',
      clearSearch: 'Clear search',
      adminRestricted: 'Admins can only assign USER role',
      stats: {
        totalUsers: 'Total Users',
        admins: 'Administrators',
        active: 'Active Users'
      }
    },
    AR: {
      title: 'إدارة المستخدمين',
      subtitle: 'إدارة مستخدمي النظام والصلاحيات',
      createUser: 'إنشاء مستخدم جديد',
      userList: 'قائمة المستخدمين',
      username: 'اسم المستخدم',
      passwordLabel: 'كلمة المرور',
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
      passwordMinLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      passwordsDontMatch: 'كلمات المرور غير متطابقة',
      passwordUpdated: 'تم تحديث كلمة المرور بنجاح',
      userCreated: 'تم إنشاء المستخدم بنجاح',
      userUpdated: 'تم تحديث المستخدم بنجاح',
      userDeleted: 'تم حذف المستخدم بنجاح',
      usernameExists: 'اسم المستخدم موجود بالفعل',
      noUsers: 'لا يوجد مستخدمين',
      loading: 'جاري تحميل المستخدمين...',
      userRole: 'مستخدم',
      adminRole: 'مدير',
      superAdminRole: 'مدير عام',
      editUser: 'تعديل المستخدم',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      search: 'البحث عن مستخدمين...',
      searchPlaceholder: 'البحث باسم المستخدم أو الدور...',
      noSearchResults: 'لا يوجد مستخدمون مطابقون لمعايير البحث',
      clearSearch: 'مسح البحث',
      adminRestricted: 'يمكن للمديرين تعيين دور مستخدم فقط',
      stats: {
        totalUsers: 'إجمالي المستخدمين',
        admins: 'المدراء',
        active: 'المستخدمين النشطين'
      }
    }
  };

  const t = translations[language];
  const isRTL = language === 'AR';

  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [newPassword, setNewPassword] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', role: '' });
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  // Vérifier si un username existe déjà
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
      setTimeout(() => setLoading(false), 500);
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

    // Vérifier si le nouveau username existe déjà (excluant l'utilisateur actuel)
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
      // Gestion spécifique pour l'erreur "username already exists" du backend
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
      showError('Admins can only create regular users');
      return;
    }

    // Vérifier si le username existe déjà
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
      // Gestion spécifique pour l'erreur "username already exists" du backend
      const errorMsg = err?.response?.data?.message || err?.message || 'Create failed';
      if (errorMsg.toLowerCase().includes('username') && errorMsg.toLowerCase().includes('exists')) {
        showError(t.usernameExists);
      } else {
        showError(errorMsg);
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'AR' : 'EN');
  };

  // Statistiques
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    users: users.filter(u => u.role === 'USER').length
  };

  if (loading) {
    return (
      <div className="admin-container" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen">
          <div className="loading-spinner-modern">
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="admin-header-modern">
        <div className="header-content-modern">
          <div className="header-title-section">
            <div className="title-icon">
              <FiUsers size={32} />
            </div>
            <div>
              <h1 className="admin-title">{t.title}</h1>
              <p className="admin-subtitle">{t.subtitle}</p>
            </div>
          </div>
          <button className="language-toggle-modern" onClick={toggleLanguage}>
            <FiGlobe size={18} />
            <span>{language === 'EN' ? 'العربية' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>{t.stats.totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FiShield />
          </div>
          <div className="stat-info">
            <h3>{stats.admins}</h3>
            <p>{t.stats.admins}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <FiUserCheck />
          </div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>{t.stats.active}</p>
          </div>
        </div>
      </div>

      {/* Messages Toast */}
      {error && (
        <div className="toast-message error">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError('')}><FiX /></button>
        </div>
      )}
      {success && (
        <div className="toast-message success">
          <FiCheckCircle />
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><FiX /></button>
        </div>
      )}

      {/* Dashboard iframe */}
      <div className="dashboard-card-modern">
        <div className="dashboard-header-modern">
          <h3>📈 System Metrics & Monitoring</h3>
          <span className="live-badge">LIVE</span>
        </div>
        <div className="dashboard-container-modern">
          <iframe
            src="http://localhost:3000/goto/afjshjythmg3ke?orgId=1&kiosk=1&refresh=10s&theme=dark"
            className="grafana-iframe-modern"
            title="Grafana Dashboard"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="fullscreen"
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Create User Card */}
      <div className="form-card-modern">
        <div className="card-header-modern">
          <h3><FiPlus /> {t.createUser}</h3>
        </div>
        <form onSubmit={handleCreate}>
          <div className="form-grid-modern">
            <div className="input-group-modern">
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
              {/* Indicateur visuel si le username existe déjà */}
              {newUsername && isUsernameExists(newUsername) && (
                <span className="field-error">
                  <FiAlertCircle size={12} /> {t.usernameExists}
                </span>
              )}
            </div>
            <div className="input-group-modern">
              <label>
                <FiLock /> {t.passwordLabel}
              </label>
              <input
                type="password"
                placeholder={`${t.passwordLabel} (min 8)`}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group-modern">
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
          <div className="form-actions-modern">
            <button 
              type="submit" 
              className="btn-primary-modern"
              disabled={newUsername && isUsernameExists(newUsername)}
            >
              <FiPlus /> {t.create}
            </button>
            <button type="button" className="btn-secondary-modern" onClick={fetchUsers}>
              <FiRefreshCw /> {t.refresh}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="table-card-modern">
        <div className="card-header-modern">
          <h3>{t.userList}</h3>
          <div className="search-wrapper-modern">
            <FiSearch className="search-icon-modern" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={clearSearch}>
                <FiX />
              </button>
            )}
          </div>
        </div>
        <div className="table-wrapper-modern">
          <table className="data-table-modern">
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
                  <td colSpan="3" className="empty-state">
                    <FiUsers size={48} />
                    <p>{searchTerm ? t.noSearchResults : t.noUsers}</p>
                    {searchTerm && (
                      <button onClick={clearSearch} className="btn-clear-search">
                        {t.clearSearch}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="user-row">
                    <td className="username-cell-modern">
                      <div className="user-avatar">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.username}</span>
                    </td>
                    <td>
                      <span 
                        className="role-badge-modern"
                        style={{ background: `${getRoleColor(u.role)}20`, color: getRoleColor(u.role) }}
                      >
                        {getRoleIcon(u.role)}
                        {getRoleDisplayName(u.role)}
                      </span>
                    </td>
                    <td className="actions-cell-modern">
                      <button 
                        className="action-btn edit" 
                        onClick={() => openEditModal(u)} 
                        title={t.edit}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="action-btn password" 
                        onClick={() => openPasswordModal(u)} 
                        title={t.changePassword}
                      >
                        <FiLock />
                      </button>
                      <button 
                        className="action-btn delete" 
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
        <div className="modal-overlay-modern" onClick={() => setEditingUser(null)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h3><FiEdit2 /> {t.editUser}</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="input-group-modern">
                <label><FiUser /> {t.username}</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
                {/* Indicateur visuel pour l'édition */}
                {editForm.username && isUsernameExists(editForm.username, editingUser.id) && (
                  <span className="field-error">
                    <FiAlertCircle size={12} /> {t.usernameExists}
                  </span>
                )}
              </div>
              <div className="input-group-modern">
                <label><FiShield /> {t.role}</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                >
                  {getRoleOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions-modern">
                <button 
                  type="submit" 
                  className="btn-primary-modern"
                  disabled={editForm.username && isUsernameExists(editForm.username, editingUser.id)}
                >
                  <FiSave /> {t.save}
                </button>
                <button type="button" className="btn-secondary-modern" onClick={() => setEditingUser(null)}>
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {changingPasswordUser && (
        <div className="modal-overlay-modern" onClick={() => setChangingPasswordUser(null)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h3><FiLock /> {t.changePassword}</h3>
              <button className="modal-close" onClick={() => setChangingPasswordUser(null)}>×</button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="user-info-modern">
                <strong>{changingPasswordUser.username}</strong>
              </div>
              <div className="input-group-modern">
                <label><FiLock /> {t.newPassword}</label>
                <input
                  type="password"
                  placeholder={t.newPassword}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="input-group-modern">
                <label><FiLock /> {t.confirmPassword}</label>
                <input
                  type="password"
                  placeholder={t.confirmPassword}
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions-modern">
                <button type="submit" className="btn-primary-modern">
                  <FiSave /> {t.updatePassword}
                </button>
                <button type="button" className="btn-secondary-modern" onClick={() => setChangingPasswordUser(null)}>
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