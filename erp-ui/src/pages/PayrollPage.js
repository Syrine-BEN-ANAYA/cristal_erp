import React, { useEffect, useState } from "react";
import payrollService from "../api/payrollService";
import employeesService from "../api/employeesService";
import { useLanguage } from "../context/LanguageContext";
import "../styles/PayrollPage.css";

export default function PayrollPage() {
  const { t, isRTL, language } = useLanguage();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [statistics, setStatistics] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [rawData, setRawData] = useState(null);

  const [form, setForm] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: "",
    bonuses: 0,
    deductions: 0,
    netSalary: "",
    status: "draft",
    notes: "",
  });

  // ================= LOAD PAYROLLS =================
  const loadPayrolls = async () => {
    try {
      setLoading(true);
      const data = await payrollService.getAllPayrolls();
      setRawData(data);
      
      let filtered = data || [];
      
      if (selectedMonth !== null && selectedYear !== null) {
        filtered = filtered.filter(p => p.month === selectedMonth && p.year === selectedYear);
      }
      
      if (filterEmployee !== "all") {
        filtered = filtered.filter(p => p.employeeId?._id === filterEmployee || p.employeeId === filterEmployee);
      }
      
      if (filterStatus !== "all") {
        filtered = filtered.filter(p => p.status === filterStatus);
      }
      
      const formattedData = payrollService.formatPayrolls(filtered);
      setPayrolls(formattedData);
    } catch (err) {
      console.error(err);
      setError(t.errorLoadingPayrolls || "Error loading payrolls");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD STATISTICS =================
  const loadStatistics = async () => {
    try {
      const stats = await payrollService.getPayrollStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error("Error loading statistics", err);
    }
  };

  // ================= LOAD EMPLOYEES =================
  const loadEmployees = async () => {
    try {
      const data = await employeesService.getAllEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading employees", err);
      setEmployees([]);
    }
  };

  useEffect(() => {
    loadPayrolls();
    loadStatistics();
    loadEmployees();
  }, [selectedMonth, selectedYear, filterEmployee, filterStatus]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    
    if (name === "basicSalary" || name === "bonuses" || name === "deductions") {
      const basicSalary = parseFloat(newForm.basicSalary) || 0;
      const bonuses = parseFloat(newForm.bonuses) || 0;
      const deductions = parseFloat(newForm.deductions) || 0;
      newForm.netSalary = payrollService.calculateNetSalary(basicSalary, bonuses, deductions).toFixed(2);
    }
    
    setForm(newForm);
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setForm({
      employeeId: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basicSalary: "",
      bonuses: 0,
      deductions: 0,
      netSalary: "",
      status: "draft",
      notes: "",
    });
    setEditingId(null);
    setError(null);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = payrollService.validatePayroll(form);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const payrollData = {
        employeeId: form.employeeId,
        month: parseInt(form.month, 10),
        year: parseInt(form.year, 10),
        basicSalary: parseFloat(form.basicSalary),
        bonuses: parseFloat(form.bonuses) || 0,
        deductions: parseFloat(form.deductions) || 0,
        netSalary: parseFloat(form.netSalary),
        status: form.status || "draft",
        notes: form.notes || "",
      };

      if (editingId) {
        await payrollService.updatePayroll(editingId, payrollData);
        setSuccess(t.payrollUpdatedSuccess || "Payroll updated successfully!");
      } else {
        await payrollService.createPayroll(payrollData);
        setSuccess(t.payrollCreatedSuccess || "Payroll created successfully!");
      }

      resetForm();
      loadPayrolls();
      loadStatistics();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || t.errorSavingPayroll || "Error saving payroll");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDeletePayroll || "Are you sure you want to delete this payroll record?")) return;

    try {
      await payrollService.deletePayroll(id);
      setSuccess(t.payrollDeletedSuccess || "Payroll deleted successfully!");
      loadPayrolls();
      loadStatistics();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(t.errorDeletingPayroll || "Error deleting payroll");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= EDIT =================
  const handleEdit = (payroll) => {
    setEditingId(payroll._id);
    setForm({
      employeeId: payroll.employeeId?._id || payroll.employeeId || "",
      month: payroll.month,
      year: payroll.year,
      basicSalary: payroll.basicSalary,
      bonuses: payroll.bonuses || 0,
      deductions: payroll.deductions || 0,
      netSalary: payroll.netSalary,
      status: payroll.status || "draft",
      notes: payroll.notes || "",
    });
    setError(null);
  };

  // ================= UPDATE STATUS =================
  const handleStatusUpdate = async (id, status) => {
    try {
      await payrollService.updatePayrollStatus(id, status);
      setSuccess(t.statusUpdatedSuccess || `Payroll marked as ${status}!`);
      loadPayrolls();
      loadStatistics();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(t.errorUpdatingStatus || "Error updating status");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= MARK AS PAID =================
  const handleMarkAsPaid = async (id) => {
    try {
      await payrollService.markAsPaid(id);
      setSuccess(t.payrollMarkedPaid || "Payroll marked as paid!");
      loadPayrolls();
      loadStatistics();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(t.errorMarkingPaid || "Error marking as paid");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= PROCESS BULK PAYROLL =================
  const handleProcessPayroll = async () => {
    setShowProcessModal(false);
    
    if (employees.length === 0) {
      setError(t.noEmployeesFound || "No employees found to process payroll");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const employeeIds = employees.map(emp => emp._id);
      const result = await payrollService.processBulkPayroll(selectedMonth || new Date().getMonth() + 1, selectedYear || new Date().getFullYear(), employeeIds);
      
      setSuccess(t.payrollProcessedSuccess || `Payroll processed for ${result.data?.created || 0} employees!`);
      loadPayrolls();
      loadStatistics();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(t.errorProcessingPayroll || "Error processing payroll");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= GET STATUS CLASS =================
  const getStatusClass = (status) => {
    switch (status) {
      case "paid": return "status-badge paid";
      case "processed": return "status-badge processed";
      case "draft": return "status-badge draft";
      default: return "status-badge draft";
    }
  };

  const statusOptions = payrollService.getStatusOptions(language);
  const months = payrollService.getMonths(language);
  const years = payrollService.getYears();

  // Debug info (optional - remove in production)
  const showDebug = false;

  return (
    <div className="payroll-page" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon"></div>
          <div>
            <h1>{t.payroll || "Payroll Management"}</h1>
            <p>{t.managePayroll || "Manage employee salaries and payroll processing"}</p>
          </div>
        </div>
      </div>

      {/* Debug Info (optional) */}
      {showDebug && rawData && (
        <div className="debug-info">
          <strong>Debug:</strong> Raw: {rawData.length} | Displayed: {payrolls.length} | 
          Filter: Month {selectedMonth || 'All'} / Year {selectedYear || 'All'}
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && statistics.data && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.data.total || 0}</h3>
              <p>{t.totalPayrolls || "Total Payrolls"}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.data.totalAmount?.toLocaleString()} OMR</h3>
              <p>{t.totalAmount || "Total Amount"}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.data.draft || 0}</h3>
              <p>{t.draft || "Draft"}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.data.processed || 0}</h3>
              <p>{t.processed || "Processed"}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.data.paid || 0}</h3>
              <p>{t.paid || "Paid"}</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Period Selector */}
      <div className="period-card">
        <div className="period-grid">
          <div className="input-group">
            <label>{t.month || "Month"}</label>
            <select
              value={selectedMonth === null ? "" : selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
              className="form-select"
            >
              <option value="">All Months</option>
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>{t.year || "Year"}</label>
            <select
              value={selectedYear === null ? "" : selectedYear}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="form-select"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>&nbsp;</label>
            <button className="btn-process" onClick={() => setShowProcessModal(true)}>
              Process Payroll
            </button>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <div className="form-card-header">
          <h3>{editingId ? (t.editPayroll || "Edit Payroll") : (t.newPayroll || "New Payroll")}</h3>
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
                    {emp.firstName} {emp.lastName} - {emp.position || ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>{t.month || "Month"} <span className="required">*</span></label>
              <select
                name="month"
                value={form.month}
                onChange={handleChange}
                className="form-select"
                required
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>{t.year || "Year"} <span className="required">*</span></label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="form-select"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>{t.basicSalary || "Basic Salary"} <span className="required">*</span></label>
              <input
                type="number"
                name="basicSalary"
                value={form.basicSalary}
                onChange={handleChange}
                placeholder="Enter basic salary"
                className="form-input"
                required
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>{t.bonuses || "Bonuses"}</label>
              <input
                type="number"
                name="bonuses"
                value={form.bonuses}
                onChange={handleChange}
                placeholder="Enter bonuses"
                className="form-input"
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>{t.deductions || "Deductions"}</label>
              <input
                type="number"
                name="deductions"
                value={form.deductions}
                onChange={handleChange}
                placeholder="Enter deductions"
                className="form-input"
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>{t.netSalary || "Net Salary"} <span className="required">*</span></label>
              <input
                type="number"
                name="netSalary"
                value={form.netSalary}
                className="form-input"
                required
                step="0.01"
                readOnly
              />
              <small className="field-note">{t.autoCalculated || "Auto-calculated"}</small>
            </div>

            <div className="input-group full-width">
              <label>{t.notes || "Notes"}</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                className="form-textarea"
                rows="2"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? (t.updatePayroll || "Update Payroll") : (t.createPayroll || "Create Payroll")}
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="input-group">
            <label>{t.filterByEmployee || "Filter by Employee"}</label>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="form-select"
            >
              <option value="all">{t.allEmployees || "All Employees"}</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>{t.filterByStatus || "Filter by Status"}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="all">{t.allStatus || "All Status"}</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>&nbsp;</label>
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setFilterEmployee("all");
                setFilterStatus("all");
                setSelectedMonth(null);
                setSelectedYear(null);
              }}
            >
              {t.clearFilters || "Clear Filters"}
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-header">
          <h3>{t.payrollsList || "Payrolls List"}</h3>
          <span className="table-stats">
            {payrolls.length} {t.records || "records"}
          </span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t.loadingPayrolls || "Loading payrolls..."}</p>
            </div>
          ) : payrolls.length === 0 ? (
            <div className="empty-state">
              <p>{t.noPayrollsFound || "No payroll records found"}</p>
              <p className="empty-state-subtitle">
                {t.createFirstPayroll || "Create your first payroll record using the form above"}
              </p>
            </div>
          ) : (
            <table className="payrolls-table">
              <thead>
                <tr>
                  <th>{t.employee || "Employee"}</th>
                  <th>{t.period || "Period"}</th>
                  <th>{t.basicSalary || "Basic Salary"}</th>
                  <th>{t.bonuses || "Bonuses"}</th>
                  <th>{t.deductions || "Deductions"}</th>
                  <th>{t.netSalary || "Net Salary"}</th>
                  <th>{t.status || "Status"}</th>
                  <th>{t.actions || "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.id || payroll._id}>
                    <td data-label={t.employee}>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {payroll.employeeName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="employee-name">{payroll.employeeName}</div>
                          <div className="employee-position">{payroll.employeePosition}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label={t.period}>
                      {payroll.monthName} {payroll.year}
                    </td>
                    <td data-label={t.basicSalary}>
                      {payroll.formattedBasicSalary}
                    </td>
                    <td data-label={t.bonuses}>
                      + {payroll.formattedBonuses}
                    </td>
                    <td data-label={t.deductions}>
                      - {payroll.formattedDeductions}
                    </td>
                    <td data-label={t.netSalary}>
                      <strong>{payroll.formattedNetSalary}</strong>
                    </td>
                    <td data-label={t.status}>
                      <span className={getStatusClass(payroll.status)}>
                        {payroll.statusLabel}
                      </span>
                    </td>
                    <td data-label={t.actions} className="actions-cell">
                      {payroll.isDraft && (
                        <>
                          <button
                            className="action-icon edit"
                            onClick={() => handleEdit(payroll)}
                            title={t.edit || "Edit"}
                          >
                            Edit
                          </button>
                          <button
                            className="action-icon process"
                            onClick={() => handleStatusUpdate(payroll._id, "processed")}
                            title={t.process || "Process"}
                          >
                            Process
                          </button>
                        </>
                      )}
                      {payroll.isProcessed && (
                        <button
                          className="action-icon paid"
                          onClick={() => handleMarkAsPaid(payroll._id)}
                          title={t.markAsPaid || "Mark as Paid"}
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        className="action-icon delete"
                        onClick={() => handleDelete(payroll._id)}
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

      {/* Process Payroll Modal */}
      {showProcessModal && (
        <div className="modal-overlay" onClick={() => setShowProcessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.processPayroll || "Process Payroll"}</h3>
              <button className="modal-close" onClick={() => setShowProcessModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                {t.confirmProcessPayroll || "Are you sure you want to process payroll for"}{" "}
                <strong>{selectedMonth ? months[selectedMonth - 1] : "this"} {selectedYear || "year"}</strong>?
              </p>
              <p className="warning-text">
                {t.processPayrollWarning || "This will create payroll records for all active employees."}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowProcessModal(false)}>
                {t.cancel || "Cancel"}
              </button>
              <button className="btn-confirm" onClick={handleProcessPayroll}>
                {t.confirm || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}