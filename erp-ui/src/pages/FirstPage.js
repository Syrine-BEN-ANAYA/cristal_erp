// FirstPage.js
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/FirstPage.css';

export default function FirstPage({ onLogout }) {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState(null);
  const [language, setLanguage] = useState('EN');
  const [searchTerm] = useState('');

  // Translations
  const translations = {
    EN: {
      welcome: 'Welcome',
      departments: 'Departments',
      modules: 'Active Modules',
      employees: 'Employees',
      systemUptime: 'System Uptime',
      searchPlaceholder: 'Search departments...',
      viewDetails: 'View Details',
      accessModule: 'Access Module',
      keyModules: 'Key Modules',
      leadership: 'Leadership',
      extension: 'Ext',
      allRightsReserved: 'All Rights Reserved',
      erpVersion: 'ERP System v4.2.1',
      headOfDept: 'Head of Department',
      email: 'Email',
      noResults: 'No departments found',
      companyTagline: 'Enterprise Resource Planning'
    },
    AR: {
      welcome: 'مرحباً',
      departments: 'الأقسام',
      modules: 'الوحدات النشطة',
      employees: 'الموظفين',
      systemUptime: 'وقت تشغيل النظام',
      searchPlaceholder: 'البحث في الأقسام...',
      viewDetails: 'عرض التفاصيل',
      accessModule: 'الوصول إلى الوحدة',
      keyModules: 'الوحدات الرئيسية',
      leadership: 'القيادة',
      extension: 'داخلي',
      allRightsReserved: 'جميع الحقوق محفوظة',
      erpVersion: 'نظام تخطيط الموارد المؤسسية الإصدار 4.2.1',
      isoCertified: 'معتمد ISO 9001:2024',
      headOfDept: 'رئيس القسم',
      email: 'البريد الإلكتروني',
      noResults: 'لم يتم العثور على أقسام',
      companyTagline: 'تخطيط موارد المؤسسات'
    }
  };

  const t = translations[language];

  // FirstPage.js - Departments avec types corrects
const departments = [
  {
    id: 'ADMIN',
    nameEN: 'Administration',
    nameAR: 'الإدارة العامة',
    color: '#d4af37',
    bgColor: 'rgba(212, 175, 55, 0.15)',
    descriptionEN: 'System administration, user management, security',
    descriptionAR: 'إدارة النظام، إدارة المستخدمين، الأمان',
    path: '/admin',
    accessType: 'admin',  // ← Seulement les admins
    isUnderDevelopment: false,
    stats: { modules: 8 },
    modulesEN: ['User Management', 'Role & Permissions', 'Security Settings', 'Audit Logs'],
    modulesAR: ['إدارة المستخدمين', 'الأدوار والصلاحيات', 'إعدادات الأمان', 'سجلات التدقيق'],
    headEN: 'Admin Department',
    headAR: 'قسم الإدارة',
    email: 'admin@alrubaiunitedcristal.om',
    extension: '2000'
  },
  {
    id: 'HR',
    nameEN: 'HR',
    nameAR: 'الموارد البشرية',
    color: '#1a4b7a',
    bgColor: 'rgba(26, 75, 122, 0.08)',
    descriptionEN: 'Employee management, recruitment, payroll',
    descriptionAR: 'إدارة الموظفين، التوظيف، كشوف المرتبات',
    path: '/user/hr',
    accessType: 'all',  // ← Tous les utilisateurs
    isUnderDevelopment: true,
    stats: { modules: 8 },
    modulesEN: ['Employee Management', 'Recruitment', 'Payroll', 'Training'],
    modulesAR: ['إدارة الموظفين', 'التوظيف', 'كشوف المرتبات', 'التدريب'],
    headEN: 'Khalid Al Balushi',
    headAR: 'خالد البلوشي',
    email: 'hr@alrubaiunitedcristal.om',
    extension: '2100',
  },
  {
    id: 'FINANCE',
    nameEN: 'Finance & Accounting',
    nameAR: 'المالية والمحاسبة',
    color: '#1a4b7a',
    bgColor: 'rgba(26, 75, 122, 0.08)',
    descriptionEN: 'Financial management, accounting, treasury',
    descriptionAR: 'الإدارة المالية، المحاسبة، الخزانة',
    path: '/user/finance',
    accessType: 'all',
    isUnderDevelopment: true,
    stats: { modules: 8 },
    modulesEN: ['General Ledger', 'Accounts Payable', 'Accounts Receivable', 'Budget Control'],
    modulesAR: ['دفتر الأستاذ العام', 'الحسابات الدائنة', 'الحسابات المدينة', 'الرقابة على الميزانية'],
    headEN: 'Salim Al Hinai',
    headAR: 'سليم الهنائي',
    email: 'finance@alrubaiunitedcristal.om',
    extension: '2200',
  },
  {
    id: 'IT',
    nameEN: 'IT',
    nameAR: 'تكنولوجيا المعلومات',
    color: '#1a4b7a',
    bgColor: 'rgba(26, 75, 122, 0.08)',
    descriptionEN: 'Infrastructure, support, security',
    descriptionAR: 'البنية التحتية، الدعم، الأمن',
    path: '/user/it',
    accessType: 'all',
    isUnderDevelopment: true,
    stats: { modules: 8 },
    modulesEN: ['Infrastructure', 'Help Desk', 'Network Security', 'ERP Development'],
    modulesAR: ['البنية التحتية', 'مكتب المساعدة', 'أمن الشبكات', 'تطوير ERP'],
    headEN: 'Ahmed Al Rashdi',
    headAR: 'أحمد الراشدي',
    email: 'it@alrubaiunitedcristal.om',
    extension: '2300',
  },
  {
    id: 'SALES',
    nameEN: 'Sales & Purchases',
    nameAR: 'المبيعات والمشتريات',
    color: '#1a4b7a',
    bgColor: 'rgba(26, 75, 122, 0.08)',
    descriptionEN: 'Sales, orders, CRM',
    descriptionAR: 'المبيعات، المشتريات، إدارة علاقات العملاء',
    path: '/user/reporting',
    accessType: 'user',  // ← Seulement les users normaux (pas admin)
    isUnderDevelopment: false,
    stats: { modules: 8 },
    modulesEN: ['CRM', 'Lead Management', 'Order Processing', 'Sales Analytics'],
    modulesAR: ['إدارة علاقات العملاء', 'إدارة العملاء المحتملين', 'معالجة الطلبات', 'تحليلات المبيعات'],
    headEN: 'Mohammed Al Lawati',
    headAR: 'محمد اللواتي',
    email: 'sales@alrubaiunitedcristal.om',
    extension: '2400',
  },
  {
    id: 'LOGISTICS',
    nameEN: 'Logistics & Warehouse',
    nameAR: 'الخدمات اللوجستية',
    color: '#1a4b7a',
    bgColor: 'rgba(26, 75, 122, 0.08)',
    descriptionEN: 'Logistics, warehouse, transport',
    descriptionAR: 'الخدمات اللوجستية، المستودعات، النقل',
    path: '/user/logistics',
    accessType: 'all',
    isUnderDevelopment: true,  // ← En développement
    stats: { modules: 8 },
    modulesEN: ['Warehouse', 'Fleet Management', 'Shipping', 'Inventory Tracking'],
    modulesAR: ['المستودعات', 'إدارة الأسطول', 'الشحن', 'تتبع المخزون'],
    headEN: 'Ibrahim Al Farsi',
    headAR: 'إبراهيم الفارسي',
    email: 'logistics@alrubaiunitedcristal.om',
    extension: '2700',
  },
];

  const filteredDepartments = departments.filter(dept => {
    const searchLower = searchTerm.toLowerCase();
    const nameToSearch = language === 'EN' ? dept.nameEN.toLowerCase() : dept.nameAR.toLowerCase();
    return nameToSearch.includes(searchLower);
  });

  const getDepartmentName = (dept) => language === 'EN' ? dept.nameEN : dept.nameAR;
  const getDepartmentDescription = (dept) => language === 'EN' ? dept.descriptionEN : dept.descriptionAR;
  const getModules = (dept) => language === 'EN' ? dept.modulesEN : dept.modulesAR;
  const getHeadName = (dept) => language === 'EN' ? dept.headEN : dept.headAR;
// FirstPage.js - Remplacer handleModuleClick par ceci
// FirstPage.js
const handleModuleClick = (dept) => {
  console.log("Department clicked:", dept.id);
  
  // Stocker les infos
  localStorage.setItem('selectedDepartment', dept.id);
  localStorage.setItem('selectedDepartmentType', dept.accessType);
  localStorage.setItem('selectedDepartmentName', getDepartmentName(dept));
  
  // Liste des départements accessibles
  const accessibleDepartments = ['ADMIN', 'SALES'];
  
  if (accessibleDepartments.includes(dept.id)) {
    // Rediriger vers login
    window.location.href = '/login';
  } else {
    // Rediriger vers under-construction
    window.location.href = '/under-construction';
  }
};

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'AR' : 'EN');
  };

  const isRTL = language === 'AR';

  return (
    <div className={`firstpage-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-grid">
          <div className="header-brand">
            <div className="brand-content">
              <h1 className="brand-title">
                AL RUBAI<span className="brand-separator"> | </span>UNITED CRISTAL
              </h1>
              <div className="brand-title-ar">الكريستال الرباعي المتحدة</div>
              <div className="brand-divider"></div>
              <p className="brand-description">{t.companyTagline}</p>
              <div className="brand-decoration">
                <span className="olive-branch">🌿</span>
                <span className="olive-branch">✨</span>
                <span className="olive-branch">🌿</span>
              </div>
            </div>
          </div>

          <div className="header-controls">
            <div className="language-switch">
              <button onClick={toggleLanguage} className={`lang-btn ${language === 'EN' ? 'active' : ''}`}>EN</button>
              <button onClick={toggleLanguage} className={`lang-btn ${language === 'AR' ? 'active' : ''}`}>AR</button>
            </div>
          </div>
        </div>
      </header>

      {/* Departments Grid */}
      <div className="departments-container">
        <div className="departments-grid">
          {filteredDepartments.map((dept) => (
            <div key={dept.id} className={`department-card ${selectedDept?.id === dept.id ? 'selected' : ''}`}>
              <div className="card-header">
                <div className="dept-icon">{dept.icon}</div>
                <div className="dept-info">
                  <h3>{getDepartmentName(dept)}</h3>
                  <p className="dept-desc">{getDepartmentDescription(dept)}</p>
                </div>
              </div>
              
              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-value">{dept.stats.modules}</span>
                  <span className="stat-name">{t.modules}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{dept.extension}</span>
                  <span className="stat-name">{t.extension}</span>
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedDept(selectedDept?.id === dept.id ? null : dept)}
                >
                  {t.viewDetails}
                </button>
                <button 
                  className="access-btn"
                  onClick={() => handleModuleClick(dept)}
                >
                  {t.accessModule} →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="no-results">
            <p>{t.noResults}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedDept && (
        <div className="modal-overlay" onClick={() => setSelectedDept(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{selectedDept.icon}</span>
                <div>
                  <h3>{getDepartmentName(selectedDept)}</h3>
                  <p>{getDepartmentDescription(selectedDept)}</p>
                </div>
              </div>
              <button className="close-modal" onClick={() => setSelectedDept(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>{t.keyModules}</h4>
                <div className="modules-list">
                  {getModules(selectedDept).map((module, idx) => (
                    <span key={idx} className="module-tag">{module}</span>
                  ))}
                </div>
              </div>
              
              <div className="detail-section">
                <h4>{t.leadership}</h4>
                <div className="leadership-card">
                  <div className="leader-info">
                    <div className="leader-icon">👨‍💼</div>
                    <div>
                      <div className="leader-name">{getHeadName(selectedDept)}</div>
                      <div className="leader-title">{t.headOfDept}</div>
                    </div>
                  </div>
                  <div className="contact-info">
                    <div>📧 {selectedDept.email}</div>
                    <div>📞 {t.extension}: {selectedDept.extension}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="access-module-btn"
                onClick={() => handleModuleClick(selectedDept)}
              >
                {t.accessModule} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span>{t.erpVersion}</span>
            <span>{t.isoCertified}</span>
          </div>
          <div className="footer-copyright">
            © 2026 AL RUBAI UNITED CRISTAL. {t.allRightsReserved}
          </div>
        </div>
      </footer>
    </div>
  );
}