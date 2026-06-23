import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import employeesService from "../api/employeesService";
import jsPDF from "jspdf"; // 👈 Import pour le PDF
import "../styles/HrPage.css";

function HrPage({ user, onLogout }) {
  const navigate = useNavigate();

  // ===== État pour les employés récupérés =====
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // ===== État pour les logs de présence =====
  const [logs, setLogs] = useState([]);
  const [newLog, setNewLog] = useState({
    employee: "",
    date: new Date().toISOString().slice(0, 10),
    status: "Present",
    notes: "",
  });

  // ===== Chargement des employés depuis l'API =====
  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await employeesService.getAllEmployees();
      let employeesArray = [];
      if (Array.isArray(data)) employeesArray = data;
      else if (data?.data && Array.isArray(data.data)) employeesArray = data.data;
      else employeesArray = [];
      setEmployees(employeesArray);
    } catch (err) {
      console.error("Erreur chargement employés:", err);
      alert("Could not load employees list. Please refresh.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // ===== Gestion du formulaire de log =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLog((prev) => ({ ...prev, [name]: value }));
  };

  const addLog = () => {
    if (!newLog.employee || !newLog.date) {
      alert("Please select an employee and enter a date.");
      return;
    }
    const newEntry = {
      id: Date.now(),
      employee: newLog.employee,
      date: newLog.date,
      status: newLog.status,
      notes: newLog.notes,
    };
    setLogs([...logs, newEntry]);
    setNewLog({
      employee: "",
      date: new Date().toISOString().slice(0, 10),
      status: "Present",
      notes: "",
    });
  };

  const deleteLog = (id) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  // ===== Statistiques calculées à partir des logs =====
  const totalEmployees = logs.length;
  const today = new Date().toISOString().slice(0, 10);
  const presentToday = logs.filter(
    (log) => log.date === today && log.status === "Present"
  ).length;
  const absentToday = logs.filter(
    (log) => log.date === today && log.status === "Absent"
  ).length;

  // ===== EXPORT PDF =====
  const downloadLogsPDF = () => {
    if (logs.length === 0) {
      alert("No logs to export.");
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // --- En-tête ---
    pdf.setFillColor(26, 75, 122); // Bleu profond
    pdf.rect(0, 0, pageWidth, 40, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("ATTENDANCE LOGS", pageWidth / 2, 25, { align: "center" });

    // Sous-titre avec date
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: "center" });

    y = 55;
    pdf.setTextColor(26, 75, 122);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Summary", margin, y);
    y += 10;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Total Logs: ${totalEmployees}`, margin, y);
    y += 7;
    pdf.text(`Present Today: ${presentToday}`, margin, y);
    y += 7;
    pdf.text(`Absent Today: ${absentToday}`, margin, y);
    y += 10;

    // --- Tableau ---
    const colWidths = [45, 35, 35, 45]; // Employee, Date, Status, Notes
    const totalCols = colWidths.length;
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const startX = (pageWidth - tableWidth) / 2;

    // En-têtes
    const headers = ["Employee", "Date", "Status", "Notes"];
    pdf.setFillColor(26, 75, 122);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    let currentX = startX;
    headers.forEach((header, i) => {
      pdf.rect(currentX, y - 2, colWidths[i], 10, "F");
      pdf.text(header, currentX + 2, y + 6);
      currentX += colWidths[i];
    });
    y += 10;

    // Lignes
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    logs.forEach((log, rowIndex) => {
      // Vérifier si on doit sauter de page
      if (y + 10 > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        y = 20;
        // Réimprimer les en-têtes
        pdf.setFillColor(26, 75, 122);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        currentX = startX;
        headers.forEach((header, i) => {
          pdf.rect(currentX, y - 2, colWidths[i], 10, "F");
          pdf.text(header, currentX + 2, y + 6);
          currentX += colWidths[i];
        });
        y += 10;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
      }

      const rowData = [
        log.employee,
        log.date,
        log.status,
        log.notes || "—",
      ];
      currentX = startX;
      rowData.forEach((text, i) => {
        // Fond alterné pour lisibilité
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(245, 248, 250);
          pdf.rect(currentX, y - 2, colWidths[i], 10, "F");
        }
        pdf.text(String(text), currentX + 2, y + 6);
        currentX += colWidths[i];
      });
      y += 10;
    });

    // --- Pied de page ---
    const footerY = pdf.internal.pageSize.getHeight() - 10;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text("Generated by HR Dashboard", pageWidth / 2, footerY, { align: "center" });

    // Sauvegarder
    pdf.save(`attendance_logs_${today}.pdf`);
  };

  // ===== Modules de navigation =====
  const menuModules = [
    {
      id: "employees",
      title: "Employee Directory",
      description: "Manage workforce, profiles, and organizational data",
      path: "/user/hr/employees",
    },
    {
      id: "departments",
      title: "Departments",
      description: "Configure divisions, teams, and reporting lines",
      path: "/user/hr/departments",
    },
    {
      id: "contracts",
      title: "Contracts",
      description: "Oversee agreements, renewals, and compliance",
      path: "/user/hr/contracts",
    },
    {
      id: "payroll",
      title: "Payroll",
      description: "Manage employee salaries and payroll processing",
      path: "/user/hr/payroll",
    },
    {
      id: "attendance",
      title: "Attendance & Leaves",
      description: "Monitor presence, time tracking, and leave requests",
      path: "/user/hr/attendance",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="hr-page">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>HR Dashboard</h1>
            <p className="header-subtitle">Workforce management platform</p>
          </div>
          <div className="header-right">
            <div className="date-display">{formatDate()}</div>
          </div>
        </header>

        {/* KPI Stats */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">Total Logs</div>
                <div className="stat-value">{totalEmployees}</div>
                <div className="stat-change neutral">Entries</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">Present Today</div>
                <div className="stat-value">{presentToday}</div>
                <div className="stat-change up">
                  {totalEmployees > 0 ? `${Math.round((presentToday / totalEmployees) * 100)}%` : "—"}
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">Absent Today</div>
                <div className="stat-value">{absentToday}</div>
                <div className="stat-change down">
                  {totalEmployees > 0 ? `${Math.round((absentToday / totalEmployees) * 100)}%` : "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tableau de saisie des logs de présence */}
        <section className="attendance-table-section">
          <div className="section-header">
            <div>
              <h2>Attendance Logs</h2>
              <p className="section-description">Manually enter daily attendance records</p>
            </div>
            {/* Bouton PDF */}
            <button className="btn-download-pdf" onClick={downloadLogsPDF}>
              📄 Download PDF
            </button>
          </div>

          {/* Formulaire d'ajout avec SELECT pour les employés */}
          <div className="log-form">
            <select
              name="employee"
              value={newLog.employee}
              onChange={handleInputChange}
              className="form-input employee-select"
              disabled={loadingEmployees}
            >
              <option value="">
                {loadingEmployees ? "Loading employees..." : "Select an employee"}
              </option>
              {employees.map((emp) => (
                <option key={emp._id} value={`${emp.firstName} ${emp.lastName}`}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              value={newLog.date}
              onChange={handleInputChange}
              className="form-input date-input"
            />
            <select
              name="status"
              value={newLog.status}
              onChange={handleInputChange}
              className="form-input status-select"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="Remote">Remote</option>
            </select>
            <input
              type="text"
              name="notes"
              placeholder="Notes (optional)"
              value={newLog.notes}
              onChange={handleInputChange}
              className="form-input notes-input"
            />
            <button onClick={addLog} className="btn-add">Add Log</button>
          </div>

          {/* Tableau des logs existants */}
          <div className="table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-message">No logs recorded yet. Add one above.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.employee}</td>
                      <td>{log.date}</td>
                      <td>
                        <span className={`status-badge ${log.status.toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>{log.notes || "—"}</td>
                      <td>
                        <button onClick={() => deleteLog(log.id)} className="btn-delete">
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modules */}
        <div className="modules-section">
          <div className="section-header">
            <h2>Management modules</h2>
            <p className="section-description">Access HR administration functions</p>
          </div>
          <div className="modules-grid">
            {menuModules.map((module, index) => (
              <div
                key={module.id}
                className="module-card"
                onClick={() => handleNavigation(module.path)}
                style={{ animationDelay: `${index * 0.05}s` }}
                tabIndex={0}
                role="button"
                aria-label={module.title}
              >
                <div className="module-content">
                  <h3 className="module-title">
                    <span className="module-dot"></span>
                    {module.title}
                  </h3>
                  <p className="module-description">{module.description}</p>
                </div>
                <div className="module-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HrPage;