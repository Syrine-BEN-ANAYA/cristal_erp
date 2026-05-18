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
    hr: 'HR',
    employees: 'Employees',
    contracts: 'Contracts',
    leaves: 'Leaves',
    payroll: 'Payroll',
    departments: 'Departments',
    attendances: 'Attendances',
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
    
    // Contracts Page
    contractsTitle: 'Contracts Management',
    contractsSubtitle: 'Manage employee contracts and agreements',
    newContract: 'New Contract',
    editContract: 'Edit Contract',
    contractEmployee: 'Employee',
    contractType: 'Contract Type',
    contractStartDate: 'Start Date',
    contractEndDate: 'End Date',
    contractSalary: 'Salary',
    salaryPlaceholder: 'Enter salary amount',
    createContractBtn: 'Create Contract',
    updateContractBtn: 'Update Contract',
    contractsList: 'Contracts List',
    noContracts: 'No contracts found',
    createFirstContract: 'Create your first contract using the form above',
    selectEmployee: 'Select Employee',
    contractTypePlaceholder: 'Ex: CDI, CDD, Internship, Freelance, etc.',
    contractTypeCDI: 'CDI (Permanent)',
    contractTypeCDD: 'CDD (Fixed-Term)',
    contractTypeInternship: 'Internship',
    contractTypeFreelance: 'Freelance',
    contractTypeTemporary: 'Temporary',
    contractTypeApprenticeship: 'Apprenticeship',
    statusActive: 'Active',
    statusTerminated: 'Terminated',
    statusPending: 'Pending',
    editContractTitle: 'Edit contract',
    downloadContract: 'Download contract as PDF',
    deleteContract: 'Delete contract',
    loadingContracts: 'Loading contracts...',
    errorLoadingContracts: 'Error loading contracts',
    errorSavingContract: 'Error saving contract',
    errorDeletingContract: 'Error deleting contract',
    errorGeneratingPDF: 'Error generating PDF contract',
    contractUpdatedSuccess: 'Contract updated successfully!',
    contractCreatedSuccess: 'Contract created successfully!',
    contractDeletedSuccess: 'Contract deleted successfully!',
    contractDownloadedSuccess: 'Contract downloaded successfully!',
    pleaseSelectEmployee: 'Please select an employee',
    pleaseSelectStartDate: 'Please select a start date',
    pleaseEnterValidSalary: 'Please enter a valid salary',
    confirmDeleteContract: 'Are you sure you want to delete this contract?',
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
    hr: 'الموارد البشرية',
    employees: 'الموظفين',
    contracts: 'العقود',
    leaves: 'الإجازات',
    payroll: 'الرواتب',
    departments: 'الأقسام',
    attendances: 'الحضور',
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
    
    // Contracts Page
    contractsTitle: 'إدارة العقود',
    contractsSubtitle: 'إدارة عقود الموظفين والاتفاقيات',
    newContract: 'عقد جديد',
    editContract: 'تعديل العقد',
    contractEmployee: 'الموظف',
    contractType: 'نوع العقد',
    contractStartDate: 'تاريخ البداية',
    contractEndDate: 'تاريخ النهاية',
    contractSalary: 'الراتب',
    salaryPlaceholder: 'أدخل قيمة الراتب',
    createContractBtn: 'إنشاء عقد',
    updateContractBtn: 'تحديث العقد',
    contractsList: 'قائمة العقود',
    noContracts: 'لا توجد عقود',
    createFirstContract: 'قم بإنشاء أول عقد باستخدام النموذج أعلاه',
    selectEmployee: 'اختر موظف',
    contractTypePlaceholder: 'مثال: CDI, CDD, تدريب, عمل حر, إلخ',
    contractTypeCDI: 'CDI (عقد دائم)',
    contractTypeCDD: 'CDD (عقد محدد المدة)',
    contractTypeInternship: 'تدريب',
    contractTypeFreelance: 'عمل حر',
    contractTypeTemporary: 'مؤقت',
    contractTypeApprenticeship: 'تلمذة مهنية',
    statusActive: 'نشط',
    statusTerminated: 'منتهي',
    statusPending: 'قيد الانتظار',
    editContractTitle: 'تعديل العقد',
    downloadContract: 'تحميل العقد بصيغة PDF',
    deleteContract: 'حذف العقد',
    loadingContracts: 'جاري تحميل العقود...',
    errorLoadingContracts: 'خطأ في تحميل العقود',
    errorSavingContract: 'خطأ في حفظ العقد',
    errorDeletingContract: 'خطأ في حذف العقد',
    errorGeneratingPDF: 'خطأ في إنشاء ملف PDF',
    contractUpdatedSuccess: 'تم تحديث العقد بنجاح!',
    contractCreatedSuccess: 'تم إنشاء العقد بنجاح!',
    contractDeletedSuccess: 'تم حذف العقد بنجاح!',
    contractDownloadedSuccess: 'تم تحميل العقد بنجاح!',
    pleaseSelectEmployee: 'الرجاء اختيار موظف',
    pleaseSelectStartDate: 'الرجاء اختيار تاريخ البداية',
    pleaseEnterValidSalary: 'الرجاء إدخال راتب صحيح',
    confirmDeleteContract: 'هل أنت متأكد من حذف هذا العقد؟',
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