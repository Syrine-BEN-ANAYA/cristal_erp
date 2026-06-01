// FirstPage.js - Version modernisée avec header original conservé
import React, { useState, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  FiHome, FiUsers, FiDollarSign, FiCpu, FiShoppingCart, 
  FiTruck, FiChevronRight, FiInfo,
  FiBriefcase, FiShield, FiStar
} from 'react-icons/fi';
import '../styles/FirstPage.css';

export default function FirstPage({ onLogout, user }) {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState(null);
  const [language, setLanguage] = useState('EN');
  const [searchTerm] = useState('');

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
      headOfDept: 'Head of Department',
      email: 'Email',
      noResults: 'No departments found',
      companyTagline: 'Enterprise Resource Planning',
      underDevelopment: 'Under Development',
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
      headOfDept: 'رئيس القسم',
      email: 'البريد الإلكتروني',
      noResults: 'لم يتم العثور على أقسام',
      companyTagline: 'تخطيط موارد المؤسسات',
  
      underDevelopment: 'قيد التطوير',
    
    }
  };

  const t = translations[language];
  const isRTL = language === 'AR';

  // Department icons mapping
  const getDepartmentIcon = (id) => {
    switch(id) {
      case 'ADMIN': return <FiShield size={28} />;
      case 'HR': return <FiUsers size={28} />;
      case 'FINANCE': return <FiDollarSign size={28} />;
      case 'IT': return <FiCpu size={28} />;
      case 'SALES': return <FiShoppingCart size={28} />;
      case 'LOGISTICS': return <FiTruck size={28} />;
      default: return <FiBriefcase size={28} />;
    }
  };

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
      accessType: 'admin',
      isUnderDevelopment: false,
      stats: { modules: 8, employees: 12 },
      modulesEN: ['User Management', 'Role & Permissions', 'Security Settings', 'Audit Logs', 'System Backup', 'Performance Monitoring'],
      modulesAR: ['إدارة المستخدمين', 'الأدوار والصلاحيات', 'إعدادات الأمان', 'سجلات التدقيق', 'النسخ الاحتياطي', 'مراقبة الأداء'],
      headEN: 'Admin Department',
      headAR: 'قسم الإدارة',
      email: 'admin@alrubaiunitedcristal.om',
      extension: '2100'
    },
    {
      id: 'HR',
      nameEN: 'Human Resources',
      nameAR: 'الموارد البشرية',
    color: '#d4af37',
      bgColor: 'rgba(212, 175, 55, 0.15)',
      descriptionEN: 'Employee management, recruitment, payroll',
      descriptionAR: 'إدارة الموظفين، التوظيف، كشوف المرتبات',
      path: '/user/hr',
      accessType: 'hr_user',
      isUnderDevelopment: false,
      stats: { modules: 6, employees: 8 },
      modulesEN: ['Employee Management', 'Recruitment', 'Payroll', 'Training', 'Performance Review', 'Leave Management'],
      modulesAR: ['إدارة الموظفين', 'التوظيف', 'كشوف المرتبات', 'التدريب', 'تقييم الأداء', 'إدارة الإجازات'],
      headEN: 'Khalid Al Balushi',
      headAR: 'خالد البلوشي',
      email: 'hr@alrubaiunitedcristal.om',
      extension: '2200'
    },
    {
      id: 'FINANCE',
      nameEN: 'Finance & Accounting',
      nameAR: 'المالية والمحاسبة',
  color: '#d4af37',
      bgColor: 'rgba(212, 175, 55, 0.15)',
      descriptionEN: 'Financial management, accounting, treasury',
      descriptionAR: 'الإدارة المالية، المحاسبة، الخزانة',
      path: '/user/finance',
      accessType: 'all',
      isUnderDevelopment: true,
      stats: { modules: 7, employees: 10 },
      modulesEN: ['General Ledger', 'Accounts Payable', 'Accounts Receivable', 'Budget Control', 'Financial Reporting', 'Audit Trail'],
      modulesAR: ['دفتر الأستاذ العام', 'الحسابات الدائنة', 'الحسابات المدينة', 'الرقابة على الميزانية', 'التقارير المالية', 'مسار التدقيق'],
      headEN: 'Salim Al Hinai',
      headAR: 'سليم الهنائي',
      email: 'finance@alrubaiunitedcristal.om',
      extension: '2300'
    },
    {
      id: 'IT',
      nameEN: 'Information Technology',
      nameAR: 'تكنولوجيا المعلومات',
   color: '#d4af37',
      bgColor: 'rgba(212, 175, 55, 0.15)',
      descriptionEN: 'Infrastructure, support, security',
      descriptionAR: 'البنية التحتية، الدعم، الأمن',
      path: '/user/it',
      accessType: 'all',
      isUnderDevelopment: true,
      stats: { modules: 6, employees: 15 },
      modulesEN: ['Infrastructure', 'Help Desk', 'Network Security', 'ERP Development', 'Cloud Services', 'Data Center'],
      modulesAR: ['البنية التحتية', 'مكتب المساعدة', 'أمن الشبكات', 'تطوير ERP', 'الخدمات السحابية', 'مركز البيانات'],
      headEN: 'Ahmed Al Rashdi',
      headAR: 'أحمد الراشدي',
      email: 'it@alrubaiunitedcristal.om',
      extension: '2400'
    },
    {
      id: 'SALES',
      nameEN: 'Sales & Purchases',
      nameAR: 'المبيعات والمشتريات',
      color: '#d4af37',
      bgColor: 'rgba(212, 175, 55, 0.15)',
      descriptionEN: 'Sales, orders, CRM',
      descriptionAR: 'المبيعات، المشتريات، إدارة علاقات العملاء',
      path: '/user/reporting',
      accessType: 'prod_user',
      isUnderDevelopment: false,
      stats: { modules: 8, employees: 20 },
      modulesEN: ['CRM', 'Lead Management', 'Order Processing', 'Sales Analytics', 'Purchase Orders', 'Supplier Management'],
      modulesAR: ['إدارة علاقات العملاء', 'إدارة العملاء المحتملين', 'معالجة الطلبات', 'تحليلات المبيعات', 'أوامر الشراء', 'إدارة الموردين'],
      headEN: 'Mohammed Al Lawati',
      headAR: 'محمد اللواتي',
      email: 'sales@alrubaiunitedcristal.om',
      extension: '2500'
    },
    {
      id: 'LOGISTICS',
      nameEN: 'Logistics & Warehouse',
      nameAR: 'الخدمات اللوجستية',
    color: '#d4af37',
      bgColor: 'rgba(212, 175, 55, 0.15)',
      descriptionEN: 'Logistics, warehouse, transport',
      descriptionAR: 'الخدمات اللوجستية، المستودعات، النقل',
      path: '/user/logistics',
      accessType: 'all',
      isUnderDevelopment: true,
      stats: { modules: 5, employees: 25 },
      modulesEN: ['Warehouse', 'Fleet Management', 'Shipping', 'Inventory Tracking', 'Route Optimization'],
      modulesAR: ['المستودعات', 'إدارة الأسطول', 'الشحن', 'تتبع المخزون', 'تحسين المسار'],
      headEN: 'Ibrahim Al Farsi',
      headAR: 'إبراهيم الفارسي',
      email: 'logistics@alrubaiunitedcristal.om',
      extension: '2600'
    },
  ];

  const filteredDepartments = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return departments.filter(dept => {
      const nameToSearch = language === 'EN' ? dept.nameEN.toLowerCase() : dept.nameAR.toLowerCase();
      return nameToSearch.includes(searchLower);
    });
  }, [searchTerm, language]);

  const getDepartmentName = (dept) => language === 'EN' ? dept.nameEN : dept.nameAR;
  const getDepartmentDescription = (dept) => language === 'EN' ? dept.descriptionEN : dept.descriptionAR;
  const getModules = (dept) => language === 'EN' ? dept.modulesEN : dept.modulesAR;
  const getHeadName = (dept) => language === 'EN' ? dept.headEN : dept.headAR;

  const stats = useMemo(() => ({
    total: departments.length,
    available: departments.filter(d => !d.isUnderDevelopment).length,
    inDevelopment: departments.filter(d => d.isUnderDevelopment).length,
    totalEmployees: departments.reduce((sum, d) => sum + d.stats.employees, 0)
  }), []);

  const handleModuleClick = (dept) => {
  console.log("Department clicked:", dept.id);
  
  localStorage.setItem('selectedDepartment', dept.id);
  localStorage.setItem('selectedDepartmentType', dept.accessType);
  localStorage.setItem('selectedDepartmentName', getDepartmentName(dept));
  
  const accessibleDepartments = ['ADMIN', 'SALES', 'HR'];  // ← MODIFICATION ICI
  
  if (accessibleDepartments.includes(dept.id)) {
    window.location.href = '/login';
  } else {
    window.location.href = '/under-construction';
  }
};

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'AR' : 'EN');
  };

  return (
    <div className={`firstpage-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ===== HEADER - KEPT ORIGINAL ===== */}
      <header className="dashboard-header">
        <div className="header-grid">
          <div className="header-brand">
            <div className="brand-content">
              <h1 className="brand-title">
                AL RUBAI<span className="brand-separator"> | </span>UNITED AL CRISTAL
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
      <div className="departments-section">
        <div className="section-header">
          <h3>{t.departments}</h3>
          <span className="section-badge">{filteredDepartments.length} departments</span>
        </div>

        <div className="departments-grid-modern">
          {filteredDepartments.map((dept) => (
            <div 
              key={dept.id} 
              className={`department-card-modern ${selectedDept?.id === dept.id ? 'selected' : ''} ${dept.isUnderDevelopment ? 'under-dev' : ''}`}
            >
              <div className="card-header-modern">
                <div className="dept-icon-modern" style={{ color: dept.color }}>
                  {getDepartmentIcon(dept.id)}
                </div>
                <div className="dept-info-modern">
                  <h3>{getDepartmentName(dept)}</h3>
                  <p className="dept-desc-modern">{getDepartmentDescription(dept)}</p>
                </div>
                {dept.isUnderDevelopment && (
                  <div className="dev-badge">{t.underDevelopment}</div>
                )}
              </div>
              
              <div className="card-stats-modern">
                <div className="stat-badge">
                  <FiHome size={12} />
                  <span>{dept.stats.modules} {t.modules}</span>
                </div>
                <div className="stat-badge">
                  <FiUsers size={12} />
                  <span>{dept.stats.employees} {t.employees}</span>
                </div>
              </div>
              
              <div className="card-actions-modern">
                <button 
                  className="btn-view-details"
                  onClick={() => setSelectedDept(selectedDept?.id === dept.id ? null : dept)}
                >
                  <FiInfo size={14} />
                  {t.viewDetails}
                </button>
                <button 
                  className="btn-access"
                  onClick={() => handleModuleClick(dept)}
                >
                  {t.accessModule}
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="no-results-modern">
            <FiHome size={48} />
            <p>{t.noResults}</p>
          </div>
        )}
      </div>

      {/* Modal Details */}
      {selectedDept && (
        <div className="modal-overlay-modern" onClick={() => setSelectedDept(null)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-title-modern">
                <div className="modal-icon-wrapper" style={{ backgroundColor: selectedDept.bgColor, color: selectedDept.color }}>
                  {getDepartmentIcon(selectedDept.id)}
                </div>
                <div>
                  <h3>{getDepartmentName(selectedDept)}</h3>
                  <p>{getDepartmentDescription(selectedDept)}</p>
                </div>
              </div>
              <button className="modal-close-modern" onClick={() => setSelectedDept(null)}>×</button>
            </div>
            
            <div className="modal-body-modern">
              <div className="detail-section-modern">
                <h4><FiStar /> {t.keyModules}</h4>
                <div className="modules-list-modern">
                  {getModules(selectedDept).map((module, idx) => (
                    <span key={idx} className="module-tag-modern">
                      {module}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="detail-section-modern">
                <h4><FiUsers /> {t.leadership}</h4>
                <div className="leadership-card-modern">
                  <div className="leader-info-modern">
                    <div className="leader-avatar">👨‍💼</div>
                    <div>
                      <div className="leader-name">{getHeadName(selectedDept)}</div>
                      <div className="leader-title">{t.headOfDept}</div>
                    </div>
                  </div>
                  <div className="contact-info-modern">
                    <div className="contact-item">📧 {selectedDept.email}</div>
                    <div className="contact-item">📞 {t.extension}: {selectedDept.extension}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer-modern">
              <button 
                className="btn-access-modal"
                onClick={() => handleModuleClick(selectedDept)}
              >
                {t.accessModule}
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer - KEPT ORIGINAL */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span>{t.erpVersion}</span>
            <span>{t.isoCertified}</span>
          </div>
          <div className="footer-copyright">
            © 2026 AL RUBAI UNITED AL CRISTAL. {t.allRightsReserved}
          </div>
        </div>
      </footer>
    </div>
  );
}