import React, { useEffect, useState } from "react";
import leavesService from "../api/leavesService";
import employeesService from "../api/employeesService";
import { useLanguage } from "../context/LanguageContext";
import "../styles/LeavesPage.css";

export default function LeavesPage() {
  const { t, isRTL } = useLanguage();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filterStatus, setFilterStatus] = useState("all");

  const [form, setForm] = useState({
    employeeId: "",
    type: "annual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // ================= LOAD LEAVES =================
  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await leavesService.getAllLeaves();
      const formattedData = leavesService.formatLeaves(data);
      setLeaves(formattedData);
      
      const statsData = await leavesService.getLeaveStatistics();
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError(t.errorLoadingLeaves || "Error loading leaves");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD EMPLOYEES =================
  const loadEmployees = async () => {
    try {
      const data = await employeesService.getAllEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading employees", err);
    }
  };

  useEffect(() => {
    loadLeaves();
    loadEmployees();
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setForm({
      employeeId: "",
      type: "annual",
      startDate: "",
      endDate: "",
      reason: "",
    });
    setEditingId(null);
    setError(null);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = leavesService.validateLeave(form);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      if (editingId) {
        await leavesService.updateLeave(editingId, form);
        setSuccess(t.leaveUpdatedSuccess || "Leave updated successfully!");
      } else {
        await leavesService.createLeave(form);
        setSuccess(t.leaveCreatedSuccess || "Leave request created successfully!");
      }

      resetForm();
      loadLeaves();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || t.errorSavingLeave || "Error saving leave");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDeleteLeave || "Are you sure you want to delete this leave request?")) return;

    try {
      await leavesService.deleteLeave(id);
      setSuccess(t.leaveDeletedSuccess || "Leave deleted successfully!");
      loadLeaves();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(t.errorDeletingLeave || "Error deleting leave");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= UPDATE STATUS =================
  const handleStatusUpdate = async (id, status) => {
    try {
      await leavesService.updateLeaveStatus(id, status);
      setSuccess(t.leaveStatusUpdated || `Leave ${status} successfully!`);
      loadLeaves();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(t.errorUpdatingStatus || "Error updating status");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= EDIT =================
  const handleEdit = (leave) => {
    setEditingId(leave._id);
    setForm({
      employeeId: leave.employeeId?._id || leave.employeeId || "",
      type: leave.type || "annual",
      startDate: leave.startDate?.split("T")[0] || "",
      endDate: leave.endDate?.split("T")[0] || "",
      reason: leave.reason || "",
    });
    setError(null);
  };

  // ================= FILTER LEAVES =================
  const filteredLeaves = leaves.filter(leave => {
    if (filterStatus === "all") return true;
    return leave.status === filterStatus;
  });

  // ================= GET STATUS CLASS =================
  const getStatusClass = (status) => {
    switch (status) {
      case "approved": return "status-badge approved";
      case "rejected": return "status-badge rejected";
      default: return "status-badge pending";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      default: return "Pending";
    }
  };

  return (
    <div className="leaves-page" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon"></div>
          <div>
            <h1>{t.leaves || "Leave Management"}</h1>
            <p>{t.manageLeaves || "Manage employee leave requests"}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.total || 0}</h3>
            <p>{t.totalLeaves || "Total Leaves"}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.pending || 0}</h3>
            <p>{t.pendingLeaves || "Pending"}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.approved || 0}</h3>
            <p>{t.approvedLeaves || "Approved"}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.rejected || 0}</h3>
            <p>{t.rejectedLeaves || "Rejected"}</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert error">
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="alert success">
          <span>{success}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <div className="form-card-header">
          <h3>{editingId ? (t.editLeave || "Edit Leave Request") : (t.newLeave || "New Leave Request")}</h3>
          {editingId && (
            <button className="cancel-edit" onClick={resetForm}>
              {t.cancel || "Cancel"}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>{t.employee || "Employee"} <span className="required">*</span></label>
              <select
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">{t.selectEmployee || "Select Employee"}</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>{t.leaveType || "Leave Type"} <span className="required">*</span></label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="form-select"
                required
              >
                {leavesService.getLeaveTypes().map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>{t.startDate || "Start Date"} <span className="required">*</span></label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="input-group">
              <label>{t.endDate || "End Date"} <span className="required">*</span></label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="input-group full-width">
              <label>{t.reason || "Reason"}</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder={t.reasonPlaceholder || "Enter reason for leave (optional)"}
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? (t.updateLeave || "Update Leave") : (t.createLeave || "Create Leave Request")}
            </button>
          </div>
        </form>
      </div>

      {/* Filter */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="input-group">
            <label>{t.filterByStatus || "Filter by Status"}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="all">{t.allLeaves || "All Leaves"}</option>
              <option value="pending">{t.pending || "Pending"}</option>
              <option value="approved">{t.approved || "Approved"}</option>
              <option value="rejected">{t.rejected || "Rejected"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-header">
          <h3>{t.leavesList || "Leaves List"}</h3>
          <span className="table-stats">
            {filteredLeaves.length} {t.leaves || "leaves"}
          </span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t.loadingLeaves || "Loading leaves..."}</p>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="empty-state">
              <p>{t.noLeavesFound || "No leave requests found"}</p>
              <p style={{ fontSize: "13px", marginTop: "8px" }}>
                {t.createFirstLeave || "Create your first leave request using the form above"}
              </p>
            </div>
          ) : (
            <table className="leaves-table">
              <thead>
                <tr>
                  <th>{t.employee || "Employee"}</th>
                  <th>{t.leaveType || "Leave Type"}</th>
                  <th>{t.startDate || "Start Date"}</th>
                  <th>{t.endDate || "End Date"}</th>
                  <th>{t.duration || "Duration"}</th>
                  <th>{t.status || "Status"}</th>
                  <th>{t.actions || "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="leave-row">
                    <td data-label={t.employee}>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {leave.employeeName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="employee-name">{leave.employeeName}</div>
                          <div className="employee-email">{leave.employeeEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label={t.leaveType}>
                      <span className="leave-type-badge">
                        {leavesService.getLeaveTypeLabel(leave.type)}
                      </span>
                    </td>
                    <td data-label={t.startDate} className="date-cell">
                      {leave.startDateFormatted}
                    </td>
                    <td data-label={t.endDate} className="date-cell">
                      {leave.endDateFormatted}
                    </td>
                    <td data-label={t.duration}>
                      <span className="duration-badge">
                        {leave.duration} {leave.duration > 1 ? (t.days || "days") : (t.day || "day")}
                      </span>
                    </td>
                    <td data-label={t.status}>
                      <span className={getStatusClass(leave.status)}>
                        {getStatusLabel(leave.status)}
                      </span>
                    </td>
                    <td data-label={t.actions} className="actions-cell">
                      {leave.status === 'pending' && (
                        <>
                          <button
                            className="action-icon approve"
                            onClick={() => handleStatusUpdate(leave._id, 'approved')}
                            title={t.approve || "Approve"}
                          >
                            Approve
                          </button>
                          <button
                            className="action-icon reject"
                            onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                            title={t.reject || "Reject"}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        className="action-icon edit"
                        onClick={() => handleEdit(leave)}
                        title={t.edit || "Edit"}
                      >
                        Edit
                      </button>
                      <button
                        className="action-icon delete"
                        onClick={() => handleDelete(leave._id)}
                        title={t.delete || "Delete"}
                      >
                        Delete
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