import React, { useEffect, useState } from "react";
import departmentsService from "../api/departmentsService";
import { useLanguage } from "../context/LanguageContext";
import "../styles/DepartmentsPage.css";

export default function DepartmentsPage() {
  const { t, isRTL } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // ================= LOAD DEPARTMENTS =================
  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentsService.getAllDepartments();
      const formattedData = departmentsService.formatDepartments(data);
      setDepartments(formattedData);
    } catch (err) {
      console.error(err);
      setError(t.errorLoadingDepartments || "Error loading departments");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
    });
    setEditingId(null);
    setError(null);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.name.trim() === "") {
      setError(t.departmentNameRequired || "Department name is required");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      if (editingId) {
        await departmentsService.updateDepartment(editingId, form);
        setSuccess(t.departmentUpdatedSuccess || "Department updated successfully!");
      } else {
        await departmentsService.createDepartment(form);
        setSuccess(t.departmentCreatedSuccess || "Department created successfully!");
      }

      resetForm();
      loadDepartments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || t.errorSavingDepartment || "Error saving department");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id, departmentName) => {
    if (!window.confirm(t.confirmDeleteDepartment || `Are you sure you want to delete "${departmentName}"?`)) return;

    try {
      await departmentsService.deleteDepartment(id);
      setSuccess(t.departmentDeletedSuccess || "Department deleted successfully!");
      loadDepartments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(t.errorDeletingDepartment || "Error deleting department");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= EDIT =================
  const handleEdit = (dept) => {
    setEditingId(dept._id);
    setForm({
      name: dept.name || "",
      description: dept.description || "",
    });
    setError(null);
  };

  // ================= FILTER DEPARTMENTS =================
  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="departments-page" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
          <div>
            <h1>{t.departments || "Departments Management"}</h1>
            <p>{t.manageDepartments || "Manage your organization departments"}</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="alert success">
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <div className="form-card-header">
          <h3>
            {editingId ? (
              <>
                <span>✏️</span> {t.editDepartment || "Edit Department"}
              </>
            ) : (
              <>
                <span>➕</span> {t.newDepartment || "New Department"}
              </>
            )}
          </h3>
          {editingId && (
            <button className="cancel-edit" onClick={resetForm}>
              <span>✖</span> {t.cancel || "Cancel"}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>
                <span>🏢</span> {t.departmentName || "Department Name"} <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t.enterDepartmentName || "Enter department name"}
                className="form-input"
                required
              />
            </div>

            <div className="input-group">
              <label>
                <span>📝</span> {t.description || "Description"}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={t.enterDescription || "Enter department description (optional)"}
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? (
                <>
                  <span>✏️</span> {t.updateDepartment || "Update Department"}
                </>
              ) : (
                <>
                  <span>➕</span> {t.createDepartment || "Create Department"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Search Filter */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="input-group">
            <label>🔍 {t.search || "Search"}</label>
            <input
              type="text"
              placeholder={t.searchDepartments || "Search by name or description..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-header">
          <h3>
            <span>📋</span> {t.departmentsList || "Departments List"}
          </h3>
          <span className="table-stats">
            {filteredDepartments.length} {t.departments || "departments"}
          </span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t.loadingDepartments || "Loading departments..."}</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
              <p>{t.noDepartmentsFound || "No departments found"}</p>
              <p style={{ fontSize: "13px", marginTop: "8px" }}>
                {t.createFirstDepartment || "Create your first department using the form above"}
              </p>
            </div>
          ) : (
            <table className="departments-table">
              <thead>
                <tr>
                  <th>{t.departmentName || "Department Name"}</th>
                  <th>{t.description || "Description"}</th>
                  <th>{t.createdAt || "Created At"}</th>
                  <th>{t.actions || "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept) => (
                  <tr key={dept._id} className="department-row">
                    <td data-label={t.departmentName}>
                      <div className="department-cell">
                        <div className="department-avatar">
                          {dept.initials || dept.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="department-name">{dept.name}</div>
                      </div>
                    </td>
                    <td data-label={t.description}>
                      {dept.description ? (
                        <div className="description-cell">
                          {dept.description.length > 100 
                            ? `${dept.description.substring(0, 100)}...` 
                            : dept.description}
                        </div>
                      ) : (
                        <span className="no-description">—</span>
                      )}
                    </td>
                    <td data-label={t.createdAt}>
                      {dept.formattedCreatedAt || 'N/A'}
                    </td>
                    <td data-label={t.actions} className="actions-cell">
                      <button
                        className="action-icon edit"
                        onClick={() => handleEdit(dept)}
                        title={t.editDepartment || "Edit department"}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                          <path d="M4 20h16" />
                        </svg>
                      </button>
                      <button
                        className="action-icon delete"
                        onClick={() => handleDelete(dept._id, dept.name)}
                        title={t.deleteDepartment || "Delete department"}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}