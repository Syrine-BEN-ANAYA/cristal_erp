// SuppliersPage.js - Version avec contexte global
import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliersService';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiEdit2, FiTrash2, 
  FiX, FiGlobe, FiRefreshCw, FiTruck, FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import '../styles/SuppliersPage.css';

export default function SuppliersPage({ token }) {
  const { t, isRTL, language, toggleLanguage } = useLanguage();

  // Traductions spécifiques à SuppliersPage
  const suppliersTranslations = {
    EN: {
      suppliers: 'Suppliers Management',
      manageSuppliers: 'Manage your supplier database',
      addNewSupplier: 'Add New Supplier',
      editSupplier: 'Edit Supplier',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      nameRequired: 'Name is required',
      update: 'Update Supplier',
      add: 'Add Supplier',
      cancel: 'Cancel',
      suppliersList: 'Suppliers List',
      actions: 'Actions',
      noSuppliers: 'No suppliers found. Add your first supplier above.',
      deleteConfirm: 'Delete this supplier?',
      updateFailed: 'Update failed',
      creationFailed: 'Creation failed',
      deleteFailed: 'Delete failed',
      loading: 'Loading suppliers...',
      refreshing: 'Refreshing...',
      supplierName: 'Supplier name',
      emailPlaceholder: 'contact@supplier.com',
      phonePlaceholder: '+968 123 456 789',
      addressPlaceholder: 'Full address',
      supplierCreated: 'Supplier created successfully!',
      supplierUpdated: 'Supplier updated successfully!',
      supplierDeleted: 'Supplier deleted successfully!',
      refresh: 'Refresh'
    },
    AR: {
      suppliers: 'إدارة الموردين',
      manageSuppliers: 'إدارة قاعدة بيانات الموردين',
      addNewSupplier: 'إضافة مورد جديد',
      editSupplier: 'تعديل المورد',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      nameRequired: 'الاسم مطلوب',
      update: 'تحديث المورد',
      add: 'إضافة مورد',
      cancel: 'إلغاء',
      suppliersList: 'قائمة الموردين',
      actions: 'إجراءات',
      noSuppliers: 'لا يوجد موردين. قم بإضافة موردك الأول أعلاه',
      deleteConfirm: 'حذف هذا المورد؟',
      updateFailed: 'فشل التحديث',
      creationFailed: 'فشل الإنشاء',
      deleteFailed: 'فشل الحذف',
      loading: 'جاري تحميل الموردين...',
      refreshing: 'جاري التحديث...',
      supplierName: 'اسم المورد',
      emailPlaceholder: 'contact@supplier.com',
      phonePlaceholder: '+968 123 456 789',
      addressPlaceholder: 'العنوان الكامل',
      supplierCreated: 'تم إنشاء المورد بنجاح!',
      supplierUpdated: 'تم تحديث المورد بنجاح!',
      supplierDeleted: 'تم حذف المورد بنجاح!',
      refresh: 'تحديث'
    }
  };

  const localT = suppliersTranslations[language];

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editingId, setEditingId] = useState(null);

  const loadSuppliers = useCallback(async (showRefresh = false) => {
    if (!token) return;
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await getSuppliers(token);
      setSuppliers(data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setEditingId(null);
    setError('');
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(localT.nameRequired);
      setTimeout(() => setError(''), 3000);
      return;
    }

    const payload = { 
      name: name.trim(), 
      email: email.trim() || undefined, 
      phone: phone.trim() || undefined, 
      address: address.trim() || undefined 
    };

    try {
      if (editingId) {
        const updated = await updateSupplier(editingId, payload, token);
        setSuppliers(suppliers.map(s => (s._id === updated._id ? updated : s)));
        showSuccessMessage(localT.supplierUpdated);
      } else {
        const created = await createSupplier(payload, token);
        setSuppliers([...suppliers, created]);
        showSuccessMessage(localT.supplierCreated);
      }
      resetForm();
    } catch (err) {
      setError(err.message || (editingId ? localT.updateFailed : localT.creationFailed));
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier._id);
    setName(supplier.name);
    setEmail(supplier.email || '');
    setPhone(supplier.phone || '');
    setAddress(supplier.address || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${localT.deleteConfirm} "${name}"?`)) return;
    try {
      await deleteSupplier(id, token);
      setSuppliers(suppliers.filter(s => s._id !== id));
      showSuccessMessage(`${localT.supplierDeleted} "${name}"`);
    } catch (err) {
      setError(err.message || localT.deleteFailed);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="suppliers-page" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>{localT.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`suppliers-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <button className="language-toggle" onClick={toggleLanguage}>
        <FiGlobe /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <FiTruck size={28} />
          </div>
          <div>
            <h1>{localT.suppliers}</h1>
            <p>{localT.manageSuppliers}</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => loadSuppliers(true)} disabled={refreshing}>
          <FiRefreshCw className={refreshing ? 'spinning' : ''} />
          {refreshing ? localT.refreshing : localT.refresh}
        </button>
      </div>

      {error && (
        <div className="alert error">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      
      {success && (
        <div className="alert success">
          <FiCheckCircle />
          <span>{success}</span>
          <div className="progress-bar"></div>
        </div>
      )}

      <div className="form-card">
        <div className="form-card-header">
          <h3><FiPlus /> {editingId ? localT.editSupplier : localT.addNewSupplier}</h3>
          {editingId && (
            <button className="cancel-edit" onClick={resetForm}>
              <FiX /> {localT.cancel}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label><FiUser /> {localT.name} <span className="required">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={localT.supplierName}
                className="form-input"
                required
              />
            </div>

            <div className="input-group">
              <label><FiMail /> {localT.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={localT.emailPlaceholder}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label><FiPhone /> {localT.phone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={localT.phonePlaceholder}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label><FiMapPin /> {localT.address}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={localT.addressPlaceholder}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? <FiEdit2 /> : <FiPlus />}
              {editingId ? localT.update : localT.add}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3><FiTruck /> {localT.suppliersList}</h3>
          <div className="table-stats">{suppliers.length} {localT.suppliers}</div>
        </div>

        <div className="table-responsive">
          <table className="suppliers-table">
            <thead>
              <tr>
                <th>{localT.name}</th>
                <th>{localT.email}</th>
                <th>{localT.phone}</th>
                <th>{localT.address}</th>
                <th>{localT.actions}</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <FiTruck size={48} />
                    <p>{localT.noSuppliers}</p>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id} className="supplier-row">
                    <td data-label={localT.name}>
                      <div className="supplier-cell">
                        <div className="supplier-avatar">
                          {supplier.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="supplier-name">{supplier.name}</div>
                      </div>
                    </td>
                    <td data-label={localT.email}>
                      {supplier.email ? (
                        <a href={`mailto:${supplier.email}`} className="email-link">
                          {supplier.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td data-label={localT.phone}>
                      {supplier.phone ? (
                        <a href={`tel:${supplier.phone}`} className="phone-link">
                          {supplier.phone}
                        </a>
                      ) : '—'}
                    </td>
                    <td data-label={localT.address}>
                      <div className="address-cell">
                        <FiMapPin size={12} />
                        <span>{supplier.address || '—'}</span>
                      </div>
                    </td>
                    <td data-label={localT.actions} className="actions-cell">
                      <button className="action-icon edit" onClick={() => handleEdit(supplier)} title={localT.editSupplier}>
                        <FiEdit2 />
                      </button>
                      <button className="action-icon delete" onClick={() => handleDelete(supplier._id, supplier.name)} title={localT.deleteConfirm}>
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
    </div>
  );
}