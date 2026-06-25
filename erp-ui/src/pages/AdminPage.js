import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getUsers } from '../api/authService';
import { 
  FiUsers, FiShield, FiUserCheck, FiGlobe
} from 'react-icons/fi';
import '../styles/AdminPage.css';

const AdminPage = ({ user, token }) => {
  const { t, isRTL, language, toggleLanguage } = useLanguage();

  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 });

  // Traductions pour cette page
  const pageTranslations = {
    EN: {
      title: 'Admin Dashboard',
      subtitle: 'System overview and monitoring',
      metrics: 'System Metrics',
      totalUsers: 'Total Users',
      admins: 'Administrators',
      activeUsers: 'Active Users',
      monitoring: 'System Metrics & Monitoring',
      live: 'LIVE',
    },
    AR: {
      title: 'لوحة تحكم المدير',
      subtitle: 'نظرة عامة على النظام ومراقبته',
      metrics: 'مقاييس النظام',
      totalUsers: 'إجمالي المستخدمين',
      admins: 'المدراء',
      activeUsers: 'المستخدمين النشطين',
      monitoring: 'مقاييس النظام والمراقبة',
      live: 'مباشر',
    }
  };

  const pageT = pageTranslations[language];

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const usersData = await getUsers(token);
        const usersWithId = usersData.map(u => ({ ...u, id: u._id }));
        setStats({
          total: usersWithId.length,
          admins: usersWithId.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
          users: usersWithId.filter(u => u.role === 'USER').length
        });
      } catch (err) {
        console.error('Failed to fetch users stats:', err);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <div className={`admin-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="admin-header-modern">
        <div className="header-content-modern">
          <div className="header-title-section">
            <div className="title-icon">
              <FiUsers size={32} />
            </div>
            <div>
              <h1 className="admin-title">{pageT.title}</h1>
              <p className="admin-subtitle">{pageT.subtitle}</p>
            </div>
          </div>
          <button className="language-toggle-modern" onClick={toggleLanguage}>
            <FiGlobe size={18} />
            <span>{language === 'EN' ? 'العربية' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>{pageT.totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FiShield />
          </div>
          <div className="stat-info">
            <h3>{stats.admins}</h3>
            <p>{pageT.admins}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <FiUserCheck />
          </div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>{pageT.activeUsers}</p>
          </div>
        </div>
      </div>

      {/* Dashboard iframe - Metrics */}
      <div className="dashboard-card-modern">
        <div className="dashboard-header-modern">
          <h3>📈 {pageT.monitoring}</h3>
          <span className="live-badge">{pageT.live}</span>
        </div>
        <div className="dashboard-container-modern">
          <iframe
            src="http://localhost:3000/goto/afjshjythmg3ke?orgId=1&kiosk=1&refresh=10s&theme=dark"
            className="grafana-iframe-modern"
            title="Grafana Dashboard"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="fullscreen"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;