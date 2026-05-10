import React, { createContext, useState, useContext, useEffect } from 'react';

// Traductions globales
export const translations = {
  EN: {
    // Layout
    adminMenu: 'Admin Menu',
    mainMenu: 'Main Menu',
    dashboardAdmin: 'Dashboard Admin',
    logs: 'Logs',
    logout: 'Logout',
    superAdmin: 'Super Admin',
    admin: 'Admin',
    user: 'User',
    // Menu items
    reporting: 'Reporting',
    orders: 'Orders',
    purchases: 'Purchases',
    customers: 'Customers',
    suppliers: 'Suppliers',
    products: 'Products',
    // Footer
    copyright: '© 2026 AL RUBAI UNITED CRISTAL',
    allRights: 'All rights reserved',
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    refresh: 'Refresh',
    search: 'Search',
    actions: 'Actions',
    // Users Management
    userManagement: 'User Management',
    manageUsers: 'Manage system users and permissions',
    createUser: 'Create New User',
    userList: 'User List',
    username: 'Username',
    password: 'Password',
    role: 'Role',
    changePassword: 'Change Password',
    updatePassword: 'Update Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    userCreated: 'User created successfully',
    userUpdated: 'User updated successfully',
    userDeleted: 'User deleted successfully',
    passwordUpdated: 'Password updated successfully',
    usernameExists: 'Username already exists',
    noUsers: 'No users found',
    allFieldsRequired: 'All fields are required',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordsDontMatch: "Passwords don't match",
    adminRestricted: 'Admins can only assign USER role',
    userRole: 'User',
    adminRole: 'Admin',
    superAdminRole: 'Super Admin',
    totalUsers: 'Total Users',
    administrators: 'Administrators',
    activeUsers: 'Active Users',
    editUser: 'Edit User',
    deleteConfirm: 'This action cannot be undone',
  },
  AR: {
    // Layout
    adminMenu: 'قائمة المدير',
    mainMenu: 'القائمة الرئيسية',
    dashboardAdmin: 'لوحة التحكم',
    logs: 'سجل التدقيق',
    logout: 'تسجيل خروج',
    superAdmin: 'مدير عام',
    admin: 'مدير',
    user: 'مستخدم',
    // Menu items
    reporting: 'التقارير',
    orders: 'الطلبات',
    purchases: 'المشتريات',
    customers: 'العملاء',
    suppliers: 'الموردين',
    products: 'المنتجات',
    // Footer
    copyright: '© 2026 الكريستال الرباعي المتحدة',
    allRights: 'جميع الحقوق محفوظة',
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    close: 'إغلاق',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    refresh: 'تحديث',
    search: 'بحث',
    actions: 'إجراءات',
    // Users Management
    userManagement: 'إدارة المستخدمين',
    manageUsers: 'إدارة مستخدمي النظام والصلاحيات',
    createUser: 'إنشاء مستخدم جديد',
    userList: 'قائمة المستخدمين',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    role: 'الدور',
    changePassword: 'تغيير كلمة المرور',
    updatePassword: 'تحديث كلمة المرور',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    userCreated: 'تم إنشاء المستخدم بنجاح',
    userUpdated: 'تم تحديث المستخدم بنجاح',
    userDeleted: 'تم حذف المستخدم بنجاح',
    passwordUpdated: 'تم تحديث كلمة المرور بنجاح',
    usernameExists: 'اسم المستخدم موجود بالفعل',
    noUsers: 'لا يوجد مستخدمين',
    allFieldsRequired: 'جميع الحقول مطلوبة',
    passwordMinLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    passwordsDontMatch: 'كلمات المرور غير متطابقة',
    adminRestricted: 'يمكن للمديرين تعيين دور مستخدم فقط',
    userRole: 'مستخدم',
    adminRole: 'مدير',
    superAdminRole: 'مدير عام',
    totalUsers: 'إجمالي المستخدمين',
    administrators: 'المدراء',
    activeUsers: 'المستخدمين النشطين',
    editUser: 'تعديل المستخدم',
    deleteConfirm: 'لا يمكن التراجع عن هذا الإجراء',
  },
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('app_language');
    return saved === 'AR' || saved === 'EN' ? saved : 'EN';
  });

  const t = translations[language];
  const isRTL = language === 'AR';

  const toggleLanguage = () => {
    const newLang = language === 'EN' ? 'AR' : 'EN';
    setLanguage(newLang);
    localStorage.setItem('app_language', newLang);
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'EN' ? 'en' : 'ar';
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};