// SuppliersPage.js - Version modernisée avec thème bleu & doré
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliersService';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiEdit2, FiTrash2, 
  FiX, FiGlobe, FiRefreshCw, FiTruck, FiTrendingUp, FiCheckCircle,
  FiAlertCircle, FiPackage
} from 'react-icons/fi';
import '../styles/SuppliersPage.css';

export default function SuppliersPage({ token }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [language, setLanguage] = useState('en');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editingId, setEditingId] = useState(null);

  const translations = {
    en: {
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
      deleteConfirm: 'Are you sure you want to delete this supplier?',
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
      totalSuppliers: 'Total Suppliers',
      withContact: 'With Contact',
      activePartners: 'Active Partners',
      contactInfo: 'contact info'
    },
    ar: {
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
      deleteConfirm: 'هل أنت متأكد من حذف هذا المورد؟',
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
      totalSuppliers: 'إجمالي الموردين',
      withContact: 'مع معلومات الاتصال',
      activePartners: 'شركاء نشطون',
      contactInfo: 'معلومات الاتصال'
    }
  };

  const currentLang = translations[language];
  const isRTL = language === 'ar';

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

  const metrics = useMemo(() => {
    const withEmail = suppliers.filter(s => s.email && s.email.trim() !== '').length;
    const withPhone = suppliers.filter(s => s.phone && s.phone.trim() !== '').length;
    const withFullContact = suppliers.filter(s => s.email && s.email.trim() !== '' && s.phone && s.phone.trim() !== '').length;
    
    return {
      total: suppliers.length,
      withEmail,
      withPhone,
      withFullContact,
      contactRate: suppliers.length > 0 ? (withFullContact / suppliers.length) * 100 : 0
    };
  }, [suppliers]);

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
      setError(currentLang.nameRequired);
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
        showSuccessMessage(currentLang.supplierUpdated);
      } else {
        const created = await createSupplier(payload, token);
        setSuppliers([...suppliers, created]);
        showSuccessMessage(currentLang.supplierCreated);
      }
      resetForm();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${currentLang.deleteConfirm} "${name}"?`)) return;
    try {
      await deleteSupplier(id, token);
      setSuppliers(suppliers.filter(s => s._id !== id));
      showSuccessMessage(`${currentLang.supplierDeleted} "${name}"`);
    } catch (err) {
      setError(err.message || currentLang.deleteFailed);
    }
  };

  if (loading) {
    return (
      <div className="suppliers-page-modern" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen-premium">
          <div className="premium-spinner"></div>
          <p>{currentLang.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`suppliers-page-modern ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background */}
      <div className="suppliers-bg-animation">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      {/* Language Toggle */}
      <button className="language-toggle-premium" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
        <FiGlobe /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      {/* Header */}
      <div className="page-header-premium">
        <div className="header-content">
          <div className="header-icon">
            <FiTruck size={32} />
          </div>
          <div>
            <h1>{currentLang.suppliers}</h1>
            <p>{currentLang.manageSuppliers}</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => loadSuppliers(true)} disabled={refreshing}>
          <FiRefreshCw className={refreshing ? 'spinning' : ''} />
          {refreshing ? currentLang.refreshing : 'Refresh'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert-premium error">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert-premium success">
          <FiCheckCircle />
          <span>{success}</span>
          <div className="progress-bar"></div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid-premium">
        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiTruck />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.totalSuppliers}</h3>
            <div className="kpi-value">{metrics.total}</div>
            <div className="kpi-trend">
              <FiTrendingUp />
              <span>Total partners</span>
            </div>
          </div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiMail />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.withContact}</h3>
            <div className="kpi-value">{metrics.withFullContact}</div>
            <div className="kpi-sub">{metrics.contactRate.toFixed(0)}% complete</div>
          </div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiPackage />
          </div>
          <div className="kpi-info">
            <h3>Active Status</h3>
            <div className="kpi-value">{((metrics.withPhone / metrics.total) * 100 || 0).toFixed(0)}%</div>
            <div className="kpi-sub">with phone contact</div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card-premium">
        <div className="form-card-header">
          <h3><FiPlus /> {editingId ? currentLang.editSupplier : currentLang.addNewSupplier}</h3>
          {editingId && (
            <button className="cancel-edit" onClick={resetForm}>
              <FiX /> {currentLang.cancel}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-premium">
            <div className="input-group-premium">
              <label><FiUser /> {currentLang.name} <span className="required">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={currentLang.supplierName}
                className="premium-input"
                required
              />
            </div>

            <div className="input-group-premium">
              <label><FiMail /> {currentLang.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={currentLang.emailPlaceholder}
                className="premium-input"
              />
            </div>

            <div className="input-group-premium">
              <label><FiPhone /> {currentLang.phone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={currentLang.phonePlaceholder}
                className="premium-input"
              />
            </div>

            <div className="input-group-premium">
              <label><FiMapPin /> {currentLang.address}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={currentLang.addressPlaceholder}
                className="premium-input"
              />
            </div>
          </div>

          <div className="form-actions-premium">
            <button type="submit" className="btn-submit">
              {editingId ? <FiEdit2 /> : <FiPlus />}
              {editingId ? currentLang.update : currentLang.add}
            </button>
          </div>
        </form>
      </div>

      {/* Suppliers Table */}
      <div className="table-card-premium">
        <div className="table-header">
          <h3><FiTruck /> {currentLang.suppliersList}</h3>
          <div className="table-stats">{suppliers.length} total suppliers</div>
        </div>

        <div className="table-responsive-premium">
          <table className="suppliers-table-premium">
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
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state-premium">
                    <FiTruck size={48} />
                    <p>{currentLang.noSuppliers}</p>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id} className="supplier-row">
                    <td data-label={currentLang.name}>
                      <div className="supplier-cell">
                        <div className="supplier-avatar">
                          {supplier.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="supplier-name">{supplier.name}</div>
                      </div>
                    </td>
                    <td data-label={currentLang.email}>
                      {supplier.email ? (
                        <a href={`mailto:${supplier.email}`} className="email-link">
                          {supplier.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td data-label={currentLang.phone}>
                      {supplier.phone ? (
                        <a href={`tel:${supplier.phone}`} className="phone-link">
                          {supplier.phone}
                        </a>
                      ) : '—'}
                    </td>
                    <td data-label={currentLang.address}>
                      <div className="address-cell">
                        <FiMapPin size={12} />
                        <span>{supplier.address || '—'}</span>
                      </div>
                    </td>
                    <td data-label={currentLang.actions} className="actions-cell-premium">
                      <button className="action-icon edit" onClick={() => handleEdit(supplier)} title={currentLang.editSupplier}>
                        <FiEdit2 />
                      </button>
                      <button className="action-icon delete" onClick={() => handleDelete(supplier._id, supplier.name)} title={currentLang.deleteConfirm}>
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