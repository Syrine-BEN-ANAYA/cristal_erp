import axios from "axios";

const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3101/audits";

const getConfig = (token) => ({
  headers: { Authorization: token ? `Bearer ${token}` : "" },
});

// =========================
// POUR UTILISATEUR STANDARD
// =========================

export const getMyAudits = async (token, page = 1, limit = 50) => {
  const res = await axios.get(
    `${API_GATEWAY_URL}/me?page=${page}&limit=${limit}`, 
    getConfig(token)
  );
  return res.data;
};

// =========================
// POUR ADMIN ET SUPER_ADMIN
// =========================

export const getAllAudits = async (token, filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.action) params.append('action', filters.action);
  if (filters.entity) params.append('entity', filters.entity);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  const queryString = params.toString();
  const url = queryString ? `${API_GATEWAY_URL}?${queryString}` : API_GATEWAY_URL;
  
  const res = await axios.get(url, getConfig(token));
  return res.data;
};

// =========================
// POUR SUPER_ADMIN UNIQUEMENT
// =========================

export const getUserAudits = async (token, targetUserId, page = 1, limit = 50) => {
  const res = await axios.get(
    `${API_GATEWAY_URL}/users/${targetUserId}?page=${page}&limit=${limit}`, 
    getConfig(token)
  );
  return res.data;
};

// =========================
// GESTION DE STOCKAGE
// =========================

// Obtenir les statistiques de stockage
export const getStorageStats = async (token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/storage/stats`, getConfig(token));
  return res.data;
};

// Compter le nombre total de logs
export const countLogs = async (token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/storage/count`, getConfig(token));
  return res.data;
};

// Nettoyage automatique (SUPER_ADMIN only)
export const runCleanup = async (token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/cleanup`, getConfig(token));
  return res.data;
};

// Réinitialiser tous les logs (SUPER_ADMIN only)
export const resetAllLogs = async (token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/reset`, getConfig(token));
  return res.data;
};

// =========================
// STATISTIQUES
// =========================

export const getStatsByAction = async (token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/stats/actions`, getConfig(token));
  return res.data;
};

export const getStatsByEntity = async (token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/stats/entities`, getConfig(token));
  return res.data;
};

// =========================
// EXPORT
// =========================

export const exportAuditLogs = async (token, filters = {}, format = 'csv') => {
  const params = new URLSearchParams();
  
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.action) params.append('action', filters.action);
  if (filters.entity) params.append('entity', filters.entity);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  params.append('format', format);
  
  const res = await axios.get(`${API_GATEWAY_URL}/export?${params.toString()}`, {
    ...getConfig(token),
    responseType: 'blob',
  });
  
  return res.data;
};

export const downloadAuditLogs = async (token, filters = {}) => {
  const blob = await exportAuditLogs(token, filters, 'csv');
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
// =========================
// SUPPRESSION PAR DATE
// =========================

// Supprimer les logs par plage de dates
export const deleteLogsByDateRange = async (token, startDate, endDate) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/by-date`, {
    params: { startDate, endDate },
    ...getConfig(token),
  });
  return res.data;
};

// Récupérer les logs d'un mois spécifique
export const getLogsByMonth = async (token, year, month) => {
  const res = await axios.get(`${API_GATEWAY_URL}/by-month`, {
    params: { year, month },
    ...getConfig(token),
  });
  return res.data;
};