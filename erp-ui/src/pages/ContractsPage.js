import React, { useEffect, useState } from "react";
import contractsService from "../api/contractsService";
import employeesService from "../api/employeesService";
import jsPDF from "jspdf";
import "../styles/ContractsPage.css";
import { useLanguage } from "../context/LanguageContext";

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [form, setForm] = useState({
    employeeId: "",
    type: "CDI",
    startDate: "",
    endDate: "",
    salary: "",
    position: "",
    description: "",
  });

  const formatSalary = (salary) => {
    return new Intl.NumberFormat(language === 'AR' ? 'ar-OM' : 'en-US', {
      style: 'currency',
      currency: 'OMR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await contractsService.getAllContracts();
      let contractsData = res.data || [];
      if (Array.isArray(contractsData)) {
        setContracts(contractsData);
      } else if (contractsData && Array.isArray(contractsData.data)) {
        setContracts(contractsData.data);
      } else {
        setContracts([]);
      }
    } catch (err) {
      console.error(err);
      setError("Error loading contracts");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const employeesData = await employeesService.getAllEmployees();
      setEmployees(employeesData || []);
    } catch (err) {
      console.error("Error loading employees", err);
      setEmployees([]);
    }
  };

  useEffect(() => {
    loadContracts();
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      employeeId: "",
      type: "CDI",
      startDate: "",
      endDate: "",
      salary: "",
      position: "",
      description: "",
    });
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.employeeId) {
      setError("Please select an employee");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!form.startDate) {
      setError("Please select a start date");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!form.salary || form.salary <= 0) {
      setError("Please enter a valid salary");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const payload = {
        ...form,
        salary: Number(form.salary),
        endDate: form.endDate || null,
      };

      if (editingId) {
        await contractsService.updateContract(editingId, payload);
        setSuccess("Contract updated successfully!");
      } else {
        await contractsService.createContract(payload);
        setSuccess("Contract created successfully!");
      }

      resetForm();
      loadContracts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error saving contract");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contract?")) return;

    try {
      await contractsService.deleteContract(id);
      setSuccess("Contract deleted successfully!");
      loadContracts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Error deleting contract");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setForm({
      employeeId: c.employeeId?._id || c.employeeId || "",
      type: c.type || "CDI",
      startDate: c.startDate?.split("T")[0] || "",
      endDate: c.endDate?.split("T")[0] || "",
      salary: c.salary || "",
      position: c.position || "",
      description: c.description || "",
    });
    setError(null);
  };

  const handleTerminate = async (id) => {
    if (!window.confirm("Are you sure you want to terminate this contract?")) return;

    try {
      await contractsService.terminateContract(id);
      setSuccess("Contract terminated successfully!");
      loadContracts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Error terminating contract");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRenew = async (id) => {
    const newEndDate = prompt("Enter new end date (YYYY-MM-DD):");
    if (newEndDate) {
      try {
        await contractsService.renewContract(id, newEndDate);
        setSuccess("Contract renewed successfully!");
        loadContracts();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error(err);
        setError("Error renewing contract");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "status-badge active";
      case "terminated":
        return "status-badge terminated";
      case "expired":
        return "status-badge expired";
      default:
        return "status-badge pending";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Active";
      case "terminated":
        return "Terminated";
      case "expired":
        return "Expired";
      default:
        return status || "Active";
    }
  };

  const downloadSimplePDF = async (contract) => {
    try {
      setDownloadingId(contract._id);
      const employeeId = contract.employeeId?._id || contract.employeeId;
      const employee = employees.find(emp => emp._id === employeeId);
      
      const pdf = new jsPDF();
      
      pdf.setFillColor(26, 75, 122);
      pdf.rect(0, 0, 210, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("EMPLOYMENT CONTRACT", 105, 25, { align: "center" });
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      
      let y = 60;
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 75, 122);
      pdf.text("CONTRACT DETAILS", 20, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      
      pdf.text(`Contract ID: ${contract._id}`, 20, y);
      y += 8;
      pdf.text(`Contract Type: ${contract.type}`, 20, y);
      y += 8;
      pdf.text(`Position: ${contract.position || 'Not specified'}`, 20, y);
      y += 8;
      pdf.text(`Start Date: ${new Date(contract.startDate).toLocaleDateString()}`, 20, y);
      y += 8;
      pdf.text(`End Date: ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Not specified'}`, 20, y);
      y += 8;
      pdf.text(`Salary: ${formatSalary(contract.salary)}`, 20, y);
      y += 8;
      pdf.text(`Status: ${getStatusLabel(contract.status)}`, 20, y);
      y += 15;
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 75, 122);
      pdf.text("EMPLOYEE INFORMATION", 20, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      
      pdf.text(`Full Name: ${employee?.firstName || ''} ${employee?.lastName || ''}`, 20, y);
      y += 8;
      pdf.text(`Email: ${employee?.email || 'N/A'}`, 20, y);
      y += 8;
      pdf.text(`Phone: ${employee?.phone || 'N/A'}`, 20, y);
      y += 8;
      pdf.text(`Employee ID: ${employee?._id || 'N/A'}`, 20, y);
      y += 15;
      
      if (contract.description) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(26, 75, 122);
        pdf.text("DESCRIPTION", 20, y);
        y += 10;
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        
        const descriptionLines = pdf.splitTextToSize(contract.description, 170);
        pdf.text(descriptionLines, 20, y);
        y += (descriptionLines.length * 7) + 10;
      }
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 75, 122);
      pdf.text("TERMS & CONDITIONS", 20, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      
      const terms = [
        "1. The Employee agrees to perform duties assigned by the Company.",
        "2. This contract is governed by the labor laws of the jurisdiction.",
        "3. Either party may terminate this contract with written notice.",
        "4. Confidential information must be protected by the Employee.",
        "5. Any disputes shall be resolved through arbitration."
      ];
      
      terms.forEach(term => {
        pdf.text(term, 20, y);
        y += 7;
      });
      
      y += 15;
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Signatures:", 20, y);
      y += 20;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("_____________________", 20, y);
      pdf.text("Employee Signature", 20, y + 5);
      
      pdf.text("_____________________", 120, y);
      pdf.text("Company Representative", 120, y + 5);
      
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, 280, { align: "center" });
      
      pdf.save(`contract_${employee?.firstName || 'employee'}_${employee?.lastName || ''}_${contract.type}.pdf`);
      setSuccess("Contract downloaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Error generating PDF contract");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="contracts-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon"></div>
          <div>
            <h1>Contracts Management</h1>
            <p>Manage employee contracts and agreements</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert error">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert success">
          <span>{success}</span>
        </div>
      )}

      <div className="form-card">
        <div className="form-card-header">
          <h3>{editingId ? "Edit Contract" : "New Contract"}</h3>
          {editingId && (
            <button className="cancel-edit" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>Employee *</label>
              <select
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Contract Type *</label>
              <input
                type="text"
                name="type"
                placeholder="Ex: CDI, CDD, Internship, Freelance"
                value={form.type}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="input-group">
              <label>Position</label>
              <input
                type="text"
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Job position / title"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Start Date *</label>
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
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Salary *</label>
              <input
                type="number"
                name="salary"
                placeholder="Enter salary amount"
                value={form.salary}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="input-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Contract description, terms, etc."
                value={form.description}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? "Update Contract" : "Create Contract"}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Contracts List</h3>
          <span className="table-stats">
            {contracts.length} contract{contracts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading contracts...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="empty-state">
              <p>No contracts found</p>
              <p style={{ fontSize: "13px", marginTop: "8px" }}>
                Create your first contract using the form above
              </p>
            </div>
          ) : (
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Position</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c._id}>
                    <td data-label="Employee">
                      <div>
                        <div className="customer-name">
                          {c.employeeId?.firstName} {c.employeeId?.lastName}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          ID: {c.employeeId?._id?.slice(-6)}
                        </div>
                      </div>
                    </td>
                    <td data-label="Type">
                      <strong>{c.type}</strong>
                    </td>
                    <td data-label="Position">
                      {c.position || "-"}
                    </td>
                    <td data-label="Start Date">
                      {new Date(c.startDate).toLocaleDateString()}
                    </td>
                    <td data-label="End Date">
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : "-"}
                    </td>
                    <td data-label="Salary">
                      {formatSalary(c.salary)}
                    </td>
                    <td data-label="Status">
                      <span className={getStatusClass(c.status)}>
                        {getStatusLabel(c.status)}
                      </span>
                    </td>
                    <td data-label="Actions" className="actions-cell">
                      <button
                        className="action-icon edit"
                        onClick={() => handleEdit(c)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      {c.status === "active" && (
                        <>
                          <button
                            className="action-icon terminate"
                            onClick={() => handleTerminate(c._id)}
                            title="Terminate"
                          >
                            Terminate
                          </button>
                          <button
                            className="action-icon renew"
                            onClick={() => handleRenew(c._id)}
                            title="Renew"
                          >
                            Renew
                          </button>
                        </>
                      )}
                      <button
                        className="action-icon download"
                        onClick={() => downloadSimplePDF(c)}
                        disabled={downloadingId === c._id}
                        title="Download PDF"
                      >
                        {downloadingId === c._id ? "..." : "PDF"}
                      </button>
                      <button
                        className="action-icon delete"
                        onClick={() => handleDelete(c._id)}
                        title="Delete"
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