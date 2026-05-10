import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiUsers,
  FiActivity,
  FiServer,
  FiMapPin,
  FiDownload,
  FiRefreshCw,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDatabase,
  FiArchive,
  FiFilter,
  FiSliders,
  FiLogIn,
  FiLogOut,
  FiEdit,
  FiPlusCircle,
  FiMinusCircle,
  FiEye,
} from "react-icons/fi";
import {
  getAllAudits,
  downloadAuditLogs,
  getStorageStats,
  runCleanup,
  resetAllLogs,
  deleteLogsByDateRange,
} from "../api/audit";
import "../styles/AuditPage.css";

const translations = {
  EN: {
    title: "Audit Trail",
    subtitle: "Track all system activities",
    export: "Export CSV",
    refresh: "Refresh",
    filters: "Filters",
    apply: "Apply",
    clear: "Clear",
    all: "All",
    date: "Date",
    user: "User",
    action: "Action",
    ip: "IP Address",
    noLogs: "No audit logs found",
    previous: "Previous",
    next: "Next",
    loading: "Loading...",
    totalLogs: "Total Logs",
    oldestLog: "Oldest",
    newestLog: "Newest",
    autoCleanup: "Cleanup",
    resetAll: "Reset All",
    deleteByDate: "Delete by date",
    startDate: "Start",
    endDate: "End",
    delete: "Delete",
    success: "Success",
    error: "Error",
    page: "Page",
    of: "of",
    logsDeleted: "logs deleted",
    cleanupSuccess: "Cleanup completed",
    resetSuccess: "All logs deleted",
  },
  AR: {
    title: "سجل التدقيق",
    subtitle: "تتبع جميع نشاطات النظام",
    export: "تصدير CSV",
    refresh: "تحديث",
    filters: "فلترة",
    apply: "تطبيق",
    clear: "مسح",
    all: "الكل",
    date: "التاريخ",
    user: "المستخدم",
    action: "الإجراء",
    ip: "عنوان IP",
    noLogs: "لا توجد سجلات",
    previous: "السابق",
    next: "التالي",
    loading: "جاري التحميل...",
    totalLogs: "إجمالي السجلات",
    oldestLog: "الأقدم",
    newestLog: "الأحدث",
    autoCleanup: "تنظيف",
    resetAll: "إعادة تعيين",
    deleteByDate: "حذف حسب التاريخ",
    startDate: "من",
    endDate: "إلى",
    delete: "حذف",
    success: "نجاح",
    error: "خطأ",
    page: "صفحة",
    of: "من",
    logsDeleted: "سجل تم حذفها",
    cleanupSuccess: "اكتمل التنظيف",
    resetSuccess: "تم حذف جميع السجلات",
  },
};

const AuditPage = ({ token, user }) => {
  const [language, setLanguage] = useState("EN");
  const t = translations[language];
  const isRTL = language === "AR";

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [storageStats, setStorageStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");

  useEffect(() => {
    loadAudits();
    loadStorageStats();
  }, [page, selectedEntity]);

  const loadAudits = async () => {
    setLoading(true);
    try {
      const response = await getAllAudits(token, {
        page,
        limit: 20,
        entity: selectedEntity || undefined,
      });
      setLogs(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalLogs(response.total || 0);
    } catch (err) {
      showToast("Failed to load logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadStorageStats = async () => {
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return;
    try {
      const stats = await getStorageStats(token);
      setStorageStats(stats);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async () => {
    try {
      await downloadAuditLogs(token, {});
      showToast("Logs exported successfully");
    } catch (err) {
      showToast("Export failed", "error");
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await runCleanup(token);
      showToast(`${t.cleanupSuccess}: ${result.deletedCount} ${t.logsDeleted}`);
      loadAudits();
      loadStorageStats();
    } catch (err) {
      showToast("Cleanup failed", "error");
    }
  };

  const handleReset = async () => {
    if (!window.confirm(t.resetSuccess + " ? " + t.resetAll)) return;
    try {
      const result = await resetAllLogs(token);
      showToast(`${t.resetSuccess}: ${result.deletedCount} ${t.logsDeleted}`);
      loadAudits();
      loadStorageStats();
    } catch (err) {
      showToast("Reset failed", "error");
    }
  };

  const handleDeleteByDate = async () => {
    if (!startDate || !endDate) {
      showToast("Select both dates", "error");
      return;
    }
    if (!window.confirm(`${t.deleteByDate} ${startDate} → ${endDate}?`)) return;
    try {
      const result = await deleteLogsByDateRange(token, startDate, endDate);
      showToast(`${result.deletedCount} ${t.logsDeleted}`);
      loadAudits();
      loadStorageStats();
      setStartDate("");
      setEndDate("");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const getActionIcon = (action) => {
    if (action.includes("LOGIN")) return <FiLogIn size={12} />;
    if (action.includes("LOGOUT")) return <FiLogOut size={12} />;
    if (action.includes("CREATE")) return <FiPlusCircle size={12} />;
    if (action.includes("UPDATE")) return <FiEdit size={12} />;
    if (action.includes("DELETE") || action.includes("RESET")) return <FiTrash2 size={12} />;
    if (action.includes("VIEW")) return <FiEye size={12} />;
    if (action.includes("ADD")) return <FiPlusCircle size={12} />;
    if (action.includes("REMOVE")) return <FiMinusCircle size={12} />;
    if (action.includes("EXPORT")) return <FiDownload size={12} />;
    if (action.includes("CLEANUP")) return <FiArchive size={12} />;
    return <FiActivity size={12} />;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString(language === "AR" ? "ar-EG" : "en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: d.toLocaleTimeString(language === "AR" ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getActionLabel = (action) => {
    const labels = {
      LOGIN_SUCCESS: "Login success",
      LOGIN_FAILED: "Login failed",
      LOGOUT: "Logout",
      REGISTER: "Register",
      CREATE_PRODUCT: "Product created",
      UPDATE_PRODUCT: "Product updated",
      DELETE_PRODUCT: "Product deleted",
      CREATE_ORDER: "Order created",
      UPDATE_ORDER: "Order updated",
      DELETE_ORDER: "Order deleted",
      CREATE_CUSTOMER: "Customer created",
      UPDATE_CUSTOMER: "Customer updated",
      DELETE_CUSTOMER: "Customer deleted",
      CREATE_PURCHASE: "Purchase created",
      UPDATE_PURCHASE: "Purchase updated",
      DELETE_PURCHASE: "Purchase deleted",
      ADD_STOCK: "Stock added",
      REMOVE_STOCK: "Stock removed",
      VIEW_ALL_PRODUCTS: "Viewed products",
      VIEW_ALL_ORDERS: "Viewed orders",
      VIEW_ALL_AUDITS: "Viewed audit",
      AUTO_CLEANUP: "Auto cleanup",
      RESET_ALL_LOGS: "Reset logs",
      EXPORT_LOGS: "Exported logs",
    };
    return labels[action] || action.replace(/_/g, " ").toLowerCase();
  };

  return (
    <div className="audit-page">
      {/* Toast */}
      {toast && (
        <div className={`audit-toast ${toast.type === "error" ? "error" : ""}`}>
          {toast.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="audit-header">
        <div className="audit-header-left">
          <div className="audit-header-icon">
            <FiServer size={24} />
          </div>
          <div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
        </div>
        <div className="audit-header-right">
          <button className="audit-btn audit-btn-export" onClick={handleExport}>
            <FiDownload size={14} /> {t.export}
          </button>
          <button className="audit-btn audit-btn-refresh" onClick={loadAudits}>
            <FiRefreshCw size={14} /> {t.refresh}
          </button>
          <button
            className="audit-btn audit-btn-lang"
            onClick={() => setLanguage(language === "EN" ? "AR" : "EN")}
          >
            {language === "EN" ? "عربي" : "EN"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && storageStats && (
        <div className="audit-stats">
          <div className="audit-stat-card">
            <FiDatabase />
            <div>
              <div className="audit-stat-value">{storageStats.totalLogs.toLocaleString()}</div>
              <div className="audit-stat-label">{t.totalLogs}</div>
            </div>
          </div>
          <div className="audit-stat-card">
            <FiCalendar />
            <div>
              <div className="audit-stat-value">
                {storageStats.oldestLogDate ? formatDate(storageStats.oldestLogDate).date : "-"}
              </div>
              <div className="audit-stat-label">{t.oldestLog}</div>
            </div>
          </div>
          <div className="audit-stat-card">
            <FiClock />
            <div>
              <div className="audit-stat-value">
                {storageStats.newestLogDate ? formatDate(storageStats.newestLogDate).date : "-"}
              </div>
              <div className="audit-stat-label">{t.newestLog}</div>
            </div>
          </div>
          <div className="audit-stat-card audit-stat-actions">
            <button className="audit-btn-warning" onClick={handleCleanup}>
              <FiArchive size={14} /> {t.autoCleanup}
            </button>
            {user.role === "SUPER_ADMIN" && (
              <button className="audit-btn-danger" onClick={handleReset}>
                <FiTrash2 size={14} /> {t.resetAll}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="audit-filters">
        <div className="audit-filters-header">
          <FiFilter size={14} />
          <span>{t.filters}</span>
          <button className="audit-filters-clear" onClick={() => setSelectedEntity("")}>
            {t.clear}
          </button>
        </div>
        <div className="audit-filters-body">
          <select value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)}>
            <option value="">{t.all}</option>
            <option value="AUTH">Authentication</option>
            <option value="USER">User</option>
            <option value="PRODUCT">Product</option>
            <option value="ORDER">Order</option>
            <option value="CUSTOMER">Customer</option>
            <option value="PURCHASE">Purchase</option>
            <option value="AUDIT">Audit</option>
          </select>
          <div className="audit-date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder={t.startDate}
            />
            <span>→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder={t.endDate}
            />
            <button className="audit-btn-delete" onClick={handleDeleteByDate}>
              <FiTrash2 size={14} /> {t.delete}
            </button>
          </div>
        </div>
        <div className="audit-filters-footer">
          <button className="audit-btn-apply" onClick={loadAudits}>
            <FiSliders size={14} /> {t.apply}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="audit-results">
        {totalLogs > 0 ? `Showing ${logs.length} of ${totalLogs} logs` : t.noLogs}
      </div>

      {/* Table */}
      <div className="audit-table-wrapper">
        {loading ? (
          <div className="audit-loading">
            <div className="audit-spinner"></div>
            <span>{t.loading}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="audit-empty">
            <FiAlertCircle size={40} />
            <p>{t.noLogs}</p>
          </div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>{t.date}</th>
                <th>{t.user}</th>
                <th>{t.action}</th>
                <th>{t.ip}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const { date, time } = formatDate(log.createdAt);
                return (
                  <tr key={log._id}>
                    <td>
                      <div className="audit-date">
                        <span className="audit-date-day">{date}</span>
                        <span className="audit-date-time">{time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="audit-user">
                        <div className="audit-avatar">
                          {log.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="audit-username">{log.username || "System"}</div>
                          <div className="audit-userid">{log.userId?.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="audit-action-badge">
                        {getActionIcon(log.action)}
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td>
                      <code className="audit-ip">{log.ip || "-"}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="audit-pagination">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            ← {t.previous}
          </button>
          <span>
            {t.page} {page} {t.of} {totalPages}
          </span>
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            {t.next} →
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditPage;