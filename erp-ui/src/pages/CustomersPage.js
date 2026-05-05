// CustomersPage.js - Version sans KPI
import React, { useEffect, useState, useCallback } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../api/customersService';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiEdit2, FiTrash2, 
  FiX, FiGlobe, FiRefreshCw, FiUsers, FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import '../styles/CustomersPage.css';

export default function CustomersPage({ token }) {
  const [customers, setCustomers] = useState([]);
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
      customers: 'Customers Management',
      manageCustomers: 'Manage your customer database',
      addNewCustomer: 'Add New Customer',
      editCustomer: 'Edit Customer',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      nameRequired: 'Name is required',
      update: 'Update Customer',
      add: 'Add Customer',
      cancel: 'Cancel',
      customersList: 'Customers List',
      actions: 'Actions',
      noCustomers: 'No customers found. Add your first customer above.',
      deleteConfirm: 'Delete this customer?',
      updateFailed: 'Update failed',
      creationFailed: 'Creation failed',
      deleteFailed: 'Delete failed',
      loading: 'Loading customers...',
      refreshing: 'Refreshing...',
      customerName: 'Customer name',
      emailPlaceholder: 'customer@example.com',
      phonePlaceholder: '+968 123 456 789',
      addressPlaceholder: 'Full address',
      customerCreated: 'Customer created successfully!',
      customerUpdated: 'Customer updated successfully!',
      customerDeleted: 'Customer deleted successfully!'
    },
    ar: {
      customers: 'إدارة العملاء',
      manageCustomers: 'إدارة قاعدة بيانات العملاء',
      addNewCustomer: 'إضافة عميل جديد',
      editCustomer: 'تعديل العميل',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      nameRequired: 'الاسم مطلوب',
      update: 'تحديث العميل',
      add: 'إضافة عميل',
      cancel: 'إلغاء',
      customersList: 'قائمة العملاء',
      actions: 'إجراءات',
      noCustomers: 'لا يوجد عملاء. قم بإضافة عميلك الأول أعلاه',
      deleteConfirm: 'حذف هذا العميل؟',
      updateFailed: 'فشل التحديث',
      creationFailed: 'فشل الإنشاء',
      deleteFailed: 'فشل الحذف',
      loading: 'جاري تحميل العملاء...',
      refreshing: 'جاري التحديث...',
      customerName: 'اسم العميل',
      emailPlaceholder: 'customer@example.com',
      phonePlaceholder: '+968 123 456 789',
      addressPlaceholder: 'العنوان الكامل',
      customerCreated: 'تم إنشاء العميل بنجاح!',
      customerUpdated: 'تم تحديث العميل بنجاح!',
      customerDeleted: 'تم حذف العميل بنجاح!'
    }
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  const loadCustomers = useCallback(async (showRefresh = false) => {
    if (!token) return;
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await getCustomers(token);
      setCustomers(data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

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
      setError(t.nameRequired);
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
        const updated = await updateCustomer(editingId, payload, token);
        setCustomers(customers.map(c => (c._id === updated._id ? updated : c)));
        showSuccessMessage(t.customerUpdated);
      } else {
        const created = await createCustomer(payload, token);
        setCustomers([...customers, created]);
        showSuccessMessage(t.customerCreated);
      }
      resetForm();
    } catch (err) {
      setError(err.message || (editingId ? t.updateFailed : t.creationFailed));
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setName(customer.name);
    setEmail(customer.email || '');
    setPhone(customer.phone || '');
    setAddress(customer.address || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${t.deleteConfirm} "${name}"?`)) return;
    try {
      await deleteCustomer(id, token);
      setCustomers(customers.filter(c => c._id !== id));
      showSuccessMessage(`${t.customerDeleted} "${name}"`);
    } catch (err) {
      setError(err.message || t.deleteFailed);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="customers-page" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`customers-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <button className="language-toggle" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
        <FiGlobe /> {language === 'en' ? 'العربية' : 'English'}
      </button>

      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <FiUsers size={28} />
          </div>
          <div>
            <h1>{t.customers}</h1>
            <p>{t.manageCustomers}</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => loadCustomers(true)} disabled={refreshing}>
          <FiRefreshCw className={refreshing ? 'spinning' : ''} />
          {refreshing ? t.refreshing : 'Refresh'}
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
          <h3><FiPlus /> {editingId ? t.editCustomer : t.addNewCustomer}</h3>
          {editingId && (
            <button className="cancel-edit" onClick={resetForm}>
              <FiX /> {t.cancel}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label><FiUser /> {t.name} <span className="required">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.customerName}
                className="form-input"
                required
              />
            </div>

            <div className="input-group">
              <label><FiMail /> {t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label><FiPhone /> {t.phone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label><FiMapPin /> {t.address}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.addressPlaceholder}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? <FiEdit2 /> : <FiPlus />}
              {editingId ? t.update : t.add}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3><FiUsers /> {t.customersList}</h3>
          <div className="table-stats">{customers.length} total customers</div>
        </div>

        <div className="table-responsive">
          <table className="customers-table">
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.email}</th>
                <th>{t.phone}</th>
                <th>{t.address}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <FiUsers size={48} />
                    <p>{t.noCustomers}</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="customer-row">
                    <td data-label={t.name}>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="customer-name">{customer.name}</div>
                      </div>
                    </td>
                    <td data-label={t.email}>
                      {customer.email ? (
                        <a href={`mailto:${customer.email}`} className="email-link">
                          {customer.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td data-label={t.phone}>
                      {customer.phone ? (
                        <a href={`tel:${customer.phone}`} className="phone-link">
                          {customer.phone}
                        </a>
                      ) : '—'}
                    </td>
                    <td data-label={t.address}>
                      <div className="address-cell">
                        <FiMapPin size={12} />
                        <span>{customer.address || '—'}</span>
                      </div>
                    </td>
                    <td data-label={t.actions} className="actions-cell">
                      <button className="action-icon edit" onClick={() => handleEdit(customer)} title={t.editCustomer}>
                        <FiEdit2 />
                      </button>
                      <button className="action-icon delete" onClick={() => handleDelete(customer._id, customer.name)} title={t.deleteConfirm}>
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