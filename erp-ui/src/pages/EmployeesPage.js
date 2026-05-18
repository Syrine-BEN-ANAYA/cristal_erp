import React, { useEffect, useState } from "react";
import employeesService from "../api/employeesService";
import jsPDF from "jspdf";
import { useLanguage } from "../context/LanguageContext";
import { 
  FiUsers, 
  FiUserPlus, 
  FiEdit2, 
  FiTrash2, 
  FiDownload,
  FiMail, 
  FiPhone, 
  FiBriefcase, 
  FiCalendar, 
  FiCheckCircle, 
  FiCircle,
  FiUser,
  FiX,
  FiAlertCircle,
  FiCheck,
  FiRefreshCw,
  FiSearch
} from "react-icons/fi";
import "../styles/EmployeesPage.css";

export default function EmployeesPage() {
  const { t, isRTL, language } = useLanguage();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    position: "",
    hireDate: "",
    skills: "",
    isActive: true,
  });

  // ================= FORMAT DATE =================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(language === 'AR' ? 'ar-OM' : 'en-US');
  };

  // ================= LOAD EMPLOYEES =================
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await employeesService.getAllEmployees();
      console.log('Données reçues:', data);
      
      let employeesArray = [];
      if (Array.isArray(data)) {
        employeesArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        employeesArray = data.data;
      } else {
        employeesArray = [];
      }
      
      const formattedData = employeesService.formatEmployees(employeesArray);
      setEmployees(formattedData);
      
    } catch (err) {
      console.error('Erreur loadEmployees:', err);
      setError(err.message || "Error loading employees");
      setEmployees([]);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      position: "",
      hireDate: "",
      skills: "",
      isActive: true,
    });
    setEditingId(null);
    setError(null);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.position) {
      setError("Please fill all required fields");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(",").map(s => s.trim()) : [],
        hireDate: form.hireDate || null,
      };

      if (editingId) {
        await employeesService.updateEmployee(editingId, payload);
        setSuccess("Employee updated successfully!");
      } else {
        await employeesService.createEmployee(payload);
        setSuccess("Employee created successfully!");
      }

      resetForm();
      loadEmployees();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving employee");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await employeesService.deleteEmployee(id);
      setSuccess("Employee deleted successfully!");
      loadEmployees();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Error deleting employee");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ================= EDIT =================
  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setForm({
      firstName: emp.firstName || "",
      lastName: emp.lastName || "",
      email: emp.email || "",
      phoneNumber: emp.phoneNumber || "",
      gender: emp.gender || "",
      position: emp.position || "",
      hireDate: emp.hireDate?.split("T")[0] || "",
      skills: Array.isArray(emp.skills) ? emp.skills.join(", ") : "",
      isActive: emp.isActive !== false,
    });
    setError(null);
  };

  // ================= DOWNLOAD PDF =================
  const downloadEmployeePDF = async (employee) => {
    try {
      setDownloadingId(employee._id);
      
      const pdf = new jsPDF();
      
      pdf.setFillColor(26, 75, 122);
      pdf.rect(0, 0, 210, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("EMPLOYEE INFORMATION", 105, 25, { align: "center" });
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      
      let y = 60;
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 75, 122);
      pdf.text("PERSONAL INFORMATION", 20, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      
      pdf.text(`Full Name: ${employee.firstName} ${employee.lastName}`, 20, y);
      y += 8;
      pdf.text(`Email: ${employee.email}`, 20, y);
      y += 8;
      pdf.text(`Phone: ${employee.phoneNumber || "N/A"}`, 20, y);
      y += 8;
      pdf.text(`Gender: ${employee.gender === 'male' ? 'Male' : employee.gender === 'female' ? 'Female' : 'N/A'}`, 20, y);
      y += 15;
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(26, 75, 122);
      pdf.text("PROFESSIONAL INFORMATION", 20, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      
      pdf.text(`Position: ${employee.position}`, 20, y);
      y += 8;
      pdf.text(`Hire Date: ${formatDate(employee.hireDate)}`, 20, y);
      y += 8;
      pdf.text(`Status: ${employee.isActive ? 'Active' : 'Inactive'}`, 20, y);
      y += 15;
      
      if (employee.skills && employee.skills.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(26, 75, 122);
        pdf.text("SKILLS", 20, y);
        y += 10;
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        
        pdf.text(employee.skills.join(", "), 20, y);
      }
      
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, 280, { align: "center" });
      
      pdf.save(`employee_${employee.firstName}_${employee.lastName}.pdf`);
      setSuccess("Employee downloaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Error generating PDF");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="employees-page" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <FiUsers size={28} />
          </div>
          <div>
            <h1>{t.employees || "Employees Management"}</h1>
            <p>Manage your workforce and employee information</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert error">
          <FiAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="alert success">
          <FiCheck size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <div className="form-card-header">
          <h3>
            {editingId ? <><FiEdit2 size={18} /> Edit Employee</> : <><FiUserPlus size={18} /> New Employee</>}
          </h3>
          {editingId && (
            <button className="cancel-edit" onClick={resetForm}>
              <FiX size={16} /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label><FiUser size={14} /> First Name *</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="form-input" required />
            </div>

            <div className="input-group">
              <label><FiUser size={14} /> Last Name *</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="form-input" required />
            </div>

            <div className="input-group">
              <label><FiMail size={14} /> Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" required />
            </div>

            <div className="input-group">
              <label><FiPhone size={14} /> Phone Number</label>
              <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="form-input" />
            </div>

            <div className="input-group">
              <label><FiUsers size={14} /> Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="input-group">
              <label><FiBriefcase size={14} /> Position *</label>
              <input type="text" name="position" value={form.position} onChange={handleChange} className="form-input" required />
            </div>

            <div className="input-group">
              <label><FiCalendar size={14} /> Hire Date</label>
              <input type="date" name="hireDate" value={form.hireDate} onChange={handleChange} className="form-input" />
            </div>

            <div className="input-group">
              <label><FiRefreshCw size={14} /> Skills (comma separated)</label>
              <input type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Python" className="form-input" />
            </div>

            <div className="input-group checkbox-group">
              <label>
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                <FiCheckCircle size={14} /> Active Status
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? <><FiEdit2 size={16} /> Update Employee</> : <><FiUserPlus size={16} /> Create Employee</>}
            </button>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-header">
          <h3><FiUsers size={18} /> Employees List</h3>
          <span className="table-stats">{employees.length} employees</span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <FiUsers size={48} strokeWidth={1} />
              <p>No employees found</p>
              <p style={{ fontSize: "13px", marginTop: "8px", color: "var(--text-muted)" }}>
                Create your first employee using the form above
              </p>
            </div>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Position</th>
                  <th>Hire Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td data-label="Employee">
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                          <div className="employee-name">{emp.firstName} {emp.lastName}</div>
                          <div className="employee-department">{emp.position}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Email">
                      <FiMail size={12} /> {emp.email}
                    </td>
                    <td data-label="Phone Number">
                      {emp.phoneNumber ? (
                        <a href={`tel:${emp.phoneNumber}`} className="phone-link">
                          <FiPhone size={12} /> {emp.phoneNumber}
                        </a>
                      ) : (
                        <span className="no-data">—</span>
                      )}
                    </td>
                    <td data-label="Position">
                      <FiBriefcase size={12} /> {emp.position}
                    </td>
                    <td data-label="Hire Date">
                      <FiCalendar size={12} /> {formatDate(emp.hireDate)}
                    </td>
                    <td data-label="Status">
                      <span className={emp.isActive ? "status-badge active" : "status-badge terminated"}>
                        {emp.isActive ? <FiCheckCircle size={10} /> : <FiCircle size={10} />}
                        {emp.isActive ? " Active" : " Inactive"}
                      </span>
                    </td>
                    <td data-label="Actions" className="actions-cell">
                      <button className="action-icon edit" onClick={() => handleEdit(emp)} title="Edit">
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        className="action-icon download" 
                        onClick={() => downloadEmployeePDF(emp)} 
                        disabled={downloadingId === emp._id}
                        title="Download PDF"
                      >
                        {downloadingId === emp._id ? <div className="spinner-small" /> : <FiDownload size={16} />}
                      </button>
                      <button className="action-icon delete" onClick={() => handleDelete(emp._id)} title="Delete">
                        <FiTrash2 size={16} />
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