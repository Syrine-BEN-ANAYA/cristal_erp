import React, { useEffect, useState, useCallback } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliersService';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiX, FiGlobe } from 'react-icons/fi';
import '../styles/SuppliersPage.css';

export default function SuppliersPage({ token }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en'); // 'en' or 'ar'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Translations
  const t = {
    en: {
      suppliers: 'Suppliers',
      manageSuppliers: 'Manage your suppliers',
      addNewSupplier: 'Add New Supplier',
      editSupplier: 'Edit Supplier',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      nameRequired: 'Name is required',
      update: 'Update',
      add: 'Add',
      cancel: 'Cancel',
      suppliersList: 'Suppliers List',
      actions: 'Actions',
      noSuppliers: 'No suppliers found.',
      deleteConfirm: 'Are you sure you want to delete this supplier?',
      updateFailed: 'Update failed',
      creationFailed: 'Creation failed',
      deleteFailed: 'Delete failed',
      loading: 'Loading...',
      supplierName: 'Supplier name',
      emailPlaceholder: 'contact@supplier.com',
      phonePlaceholder: '+968 123 456 789',
      addressPlaceholder: 'Full address'
    },
    ar: {
      suppliers: 'الموردين',
      manageSuppliers: 'إدارة الموردين',
      addNewSupplier: 'إضافة مورد جديد',
      editSupplier: 'تعديل المورد',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      nameRequired: 'الاسم مطلوب',
      update: 'تحديث',
      add: 'إضافة',
      cancel: 'إلغاء',
      suppliersList: 'قائمة الموردين',
      actions: 'إجراءات',
      noSuppliers: 'لا يوجد موردين.',
      deleteConfirm: 'هل أنت متأكد من حذف هذا المورد؟',
      updateFailed: 'فشل التحديث',
      creationFailed: 'فشل الإنشاء',
      deleteFailed: 'فشل الحذف',
      loading: 'جاري التحميل...',
      supplierName: 'اسم المورد',
      emailPlaceholder: 'contact@supplier.com',
      phonePlaceholder: '+968 123 456 789',
      addressPlaceholder: 'العنوان الكامل'
    }
  };

  const currentLang = t[language];

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSuppliers(token);
      setSuppliers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadSuppliers();
  }, [token, loadSuppliers]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError(currentLang.nameRequired);
      return;
    }

    const payload = { name, email, phone, address };

    try {
      if (editingId) {
        const updated = await updateSupplier(editingId, payload, token);
        setSuppliers(suppliers.map(s => (s._id === updated._id ? updated : s)));
      } else {
        const created = await createSupplier(payload, token);
        setSuppliers([...suppliers, created]);
      }
      resetForm();
      setError('');
    } catch (err) {
      setError(err.message || (editingId ? currentLang.updateFailed : currentLang.creationFailed));
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier._id);
    setName(supplier.name);
    setEmail(supplier.email || '');
    setPhone(supplier.phone || '');
    setAddress(supplier.address || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm(currentLang.deleteConfirm)) return;
    try {
      await deleteSupplier(id, token);
      setSuppliers(suppliers.filter(s => s._id !== id));
      setError('');
    } catch (err) {
      setError(err.message || currentLang.deleteFailed);
    }
  };

  if (loading) {
    return (
      <div className="suppliers-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="loading-spinner">{currentLang.loading}</div>
      </div>
    );
  }

  return (
    <div className="suppliers-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <div>
          <h2 className="page-title">{currentLang.suppliers}</h2>
          <p className="page-subtitle">{currentLang.manageSuppliers}</p>
        </div>
      </div>

      {/* Language Toggle Button - FLOATING comme dans Orders */}
      <button 
        className="btn-language-floating" 
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      >
        <FiGlobe size={18} /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      <div className="form-card">
        <h3 className="form-title">
          {editingId ? currentLang.editSupplier : currentLang.addNewSupplier}
        </h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">{currentLang.name} *</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={currentLang.supplierName}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">{currentLang.email}</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentLang.emailPlaceholder}
                  className="input-field"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">{currentLang.phone}</label>
              <div className="input-wrapper">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={currentLang.phonePlaceholder}
                  className="input-field"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">{currentLang.address}</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={currentLang.addressPlaceholder}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? <FiEdit2 /> : <FiPlus />}
              {editingId ? currentLang.update : currentLang.add}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                <FiX /> {currentLang.cancel}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Suppliers table */}
      <div className="table-container">
        <h3 className="table-title">{currentLang.suppliersList}</h3>
        <div className="table-responsive">
          <table className="suppliers-table">
            <thead>
              <tr>
                <th>{currentLang.name}</th>
                <th>{currentLang.email}</th>
                <th>{currentLang.phone}</th>
                <th>{currentLang.address}</th>
                <th>{currentLang.actions}</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s._id}>
                  <td data-label={currentLang.name}>{s.name}</td>
                  <td data-label={currentLang.email}>{s.email || '—'}</td>
                  <td data-label={currentLang.phone}>{s.phone || '—'}</td>
                  <td data-label={currentLang.address}>{s.address || '—'}</td>
                  <td className="actions-cell" data-label={currentLang.actions}>
                    <button
                      onClick={() => handleEdit(s)}
                      className="icon-btn edit-btn"
                      title={currentLang.editSupplier}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="icon-btn delete-btn"
                      title={currentLang.deleteConfirm}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-message">
                    {currentLang.noSuppliers}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}