// CustomersPage.js - Version modernisée avec thème bleu & doré
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../api/customersService';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiEdit2, FiTrash2, 
  FiX, FiGlobe, FiRefreshCw, FiUsers, FiTrendingUp, FiCheckCircle,
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
      deleteConfirm: 'Are you sure you want to delete this customer?',
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
      customerDeleted: 'Customer deleted successfully!',
      totalCustomers: 'Total Customers',
      activeCustomers: 'Active Customers',
      withEmail: 'With Email'
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
      deleteConfirm: 'هل أنت متأكد من حذف هذا العميل؟',
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
      customerDeleted: 'تم حذف العميل بنجاح!',
      totalCustomers: 'إجمالي العملاء',
      activeCustomers: 'العملاء النشطين',
      withEmail: 'مع بريد إلكتروني'
    }
  };

  const currentLang = translations[language];
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

  const metrics = useMemo(() => {
    const withEmail = customers.filter(c => c.email && c.email.trim() !== '').length;
    return {
      total: customers.length,
      withEmail,
      activeRate: customers.length > 0 ? (withEmail / customers.length) * 100 : 0
    };
  }, [customers]);

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

    const payload = { name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, address: address.trim() || undefined };

    try {
      if (editingId) {
        const updated = await updateCustomer(editingId, payload, token);
        setCustomers(customers.map(c => (c._id === updated._id ? updated : c)));
        showSuccessMessage(currentLang.customerUpdated);
      } else {
        const created = await createCustomer(payload, token);
        setCustomers([...customers, created]);
        showSuccessMessage(currentLang.customerCreated);
      }
      resetForm();
    } catch (err) {
      setError(err.message || (editingId ? currentLang.updateFailed : currentLang.creationFailed));
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
    if (!window.confirm(`${currentLang.deleteConfirm} "${name}"?`)) return;
    try {
      await deleteCustomer(id, token);
      setCustomers(customers.filter(c => c._id !== id));
      showSuccessMessage(`${currentLang.customerDeleted} "${name}"`);
    } catch (err) {
      setError(err.message || currentLang.deleteFailed);
    }
  };

  if (loading) {
    return (
      <div className="customers-page-modern" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="loading-screen-premium">
          <div className="premium-spinner"></div>
          <p>{currentLang.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`customers-page-modern ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background */}
      <div className="customers-bg-animation">
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
            <FiUsers size={32} />
          </div>
          <div>
            <h1>{currentLang.customers}</h1>
            <p>{currentLang.manageCustomers}</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => loadCustomers(true)} disabled={refreshing}>
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
            <FiUsers />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.totalCustomers}</h3>
            <div className="kpi-value">{metrics.total}</div>
            <div className="kpi-trend">
              <FiTrendingUp />
              <span>Total registered</span>
            </div>
          </div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiMail />
          </div>
          <div className="kpi-info">
            <h3>{currentLang.withEmail}</h3>
            <div className="kpi-value">{metrics.withEmail}</div>
            <div className="kpi-sub">{metrics.activeRate.toFixed(0)}% of total</div>
          </div>
        </div>

        <div className="kpi-card-premium">
          <div className="kpi-icon-bg" style={{ background: 'linear-gradient(135deg, #1a4b7a, #0a2b4e)' }}>
            <FiTrendingUp />
          </div>
          <div className="kpi-info">
            <h3>Completion Rate</h3>
            <div className="kpi-value">{((customers.filter(c => c.phone).length / metrics.total) * 100 || 0).toFixed(0)}%</div>
            <div className="kpi-sub">with phone number</div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card-premium">
        <div className="form-card-header">
          <h3><FiPlus /> {editingId ? currentLang.editCustomer : currentLang.addNewCustomer}</h3>
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
                placeholder={currentLang.customerName}
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

      {/* Customers Table */}
      <div className="table-card-premium">
        <div className="table-header">
          <h3><FiUsers /> {currentLang.customersList}</h3>
          <div className="table-stats">{customers.length} total customers</div>
        </div>

        <div className="table-responsive-premium">
          <table className="customers-table-premium">
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
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state-premium">
                    <FiUsers size={48} />
                    <p>{currentLang.noCustomers}</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="customer-row">
                    <td data-label={currentLang.name}>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="customer-name">{customer.name}</div>
                      </div>
                    </td>
                    <td data-label={currentLang.email}>
                      {customer.email ? (
                        <a href={`mailto:${customer.email}`} className="email-link">
                          {customer.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td data-label={currentLang.phone}>
                      {customer.phone ? (
                        <a href={`tel:${customer.phone}`} className="phone-link">
                          {customer.phone}
                        </a>
                      ) : '—'}
                    </td>
                    <td data-label={currentLang.address}>
                      <div className="address-cell">
                        <FiMapPin size={12} />
                        <span>{customer.address || '—'}</span>
                      </div>
                    </td>
                    <td data-label={currentLang.actions} className="actions-cell-premium">
                      <button className="action-icon edit" onClick={() => handleEdit(customer)} title={currentLang.editCustomer}>
                        <FiEdit2 />
                      </button>
                      <button className="action-icon delete" onClick={() => handleDelete(customer._id, customer.name)} title={currentLang.deleteConfirm}>
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