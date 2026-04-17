import React, { useEffect, useState } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../api/customersService';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiX, FiGlobe } from 'react-icons/fi';
import '../styles/CustomersPage.css';

export default function CustomersPage({ token }) {
  const [customers, setCustomers] = useState([]);
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
      customers: 'Customers',
      manageCustomers: 'Manage your customers',
      addNewCustomer: 'Add New Customer',
      editCustomer: 'Edit Customer',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      nameRequired: 'Name is required',
      update: 'Update',
      add: 'Add',
      cancel: 'Cancel',
      customersList: 'Customers List',
      actions: 'Actions',
      noCustomers: 'No customers found.',
      deleteConfirm: 'Are you sure you want to delete this customer?',
      updateFailed: 'Update failed',
      creationFailed: 'Creation failed',
      deleteFailed: 'Delete failed',
      loading: 'Loading...',
      customerName: 'Customer name',
      emailPlaceholder: 'customer@example.com',
      phonePlaceholder: '+968 123 456 789',
      addressPlaceholder: 'Full address'
    },
    ar: {
      customers: 'العملاء',
      manageCustomers: 'إدارة عملائك',
      addNewCustomer: 'إضافة عميل جديد',
      editCustomer: 'تعديل العميل',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      nameRequired: 'الاسم مطلوب',
      update: 'تحديث',
      add: 'إضافة',
      cancel: 'إلغاء',
      customersList: 'قائمة العملاء',
      actions: 'إجراءات',
      noCustomers: 'لا يوجد عملاء.',
      deleteConfirm: 'هل أنت متأكد من حذف هذا العميل؟',
      updateFailed: 'فشل التحديث',
      creationFailed: 'فشل الإنشاء',
      deleteFailed: 'فشل الحذف',
      loading: 'جاري التحميل...',
      customerName: 'اسم العميل',
      emailPlaceholder: 'customer@example.com',
      phonePlaceholder: '+968 123 456 789',
      addressPlaceholder: 'العنوان الكامل'
    }
  };

  const currentLang = t[language];

  useEffect(() => {
    const loadCustomers = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getCustomers(token);
        setCustomers(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, [token]);

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
        const updated = await updateCustomer(editingId, payload, token);
        setCustomers(customers.map(c => (c._id === updated._id ? updated : c)));
      } else {
        const created = await createCustomer(payload, token);
        setCustomers([...customers, created]);
      }
      resetForm();
      setError('');
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm(currentLang.deleteConfirm)) return;
    try {
      await deleteCustomer(id, token);
      setCustomers(customers.filter(c => c._id !== id));
      setError('');
    } catch (err) {
      setError(err.message || currentLang.deleteFailed);
    }
  };

  if (loading) {
    return (
      <div className="customers-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="loading-spinner">{currentLang.loading}</div>
      </div>
    );
  }

  return (
    <div className="customers-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <div>
          <h2 className="page-title">{currentLang.customers}</h2>
          <p className="page-subtitle">{currentLang.manageCustomers}</p>
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
          {editingId ? currentLang.editCustomer : currentLang.addNewCustomer}
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
                  placeholder={currentLang.customerName}
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

      <div className="table-container">
        <h3 className="table-title">{currentLang.customersList}</h3>
        <div className="table-responsive">
          <table className="customers-table">
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
              {customers.map((c) => (
                <tr key={c._id}>
                  <td data-label={currentLang.name}>{c.name}</td>
                  <td data-label={currentLang.email}>{c.email || '—'}</td>
                  <td data-label={currentLang.phone}>{c.phone || '—'}</td>
                  <td data-label={currentLang.address}>{c.address || '—'}</td>
                  <td className="actions-cell" data-label={currentLang.actions}>
                    <button onClick={() => handleEdit(c)} className="icon-btn edit-btn" title={currentLang.editCustomer}>
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="icon-btn delete-btn" title={currentLang.deleteConfirm}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-message">{currentLang.noCustomers}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}