// leavesService.js
import axios from 'axios';

const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3104';

// Récupérer le token d'authentification depuis localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('auth_token');
  return token || '';
};

// Headers par défaut
const getHeaders = () => ({
  'Authorization': getAuthToken(),
  'Content-Type': 'application/json',
});

// Gestionnaire d'erreurs
const handleError = (error, defaultMessage) => {
  if (error.response) {
    const message = error.response.data?.message || error.response.data || defaultMessage;
    throw new Error(message);
  } else if (error.request) {
    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
  } else {
    throw new Error(error.message || defaultMessage);
  }
};

/**
 * Service pour la gestion des congés
 */
const leavesService = {
  /**
   * Créer une nouvelle demande de congé
   * @param {Object} leaveData - Données du congé
   * @returns {Promise<Object>} - Congé créé
   */
  async createLeave(leaveData) {
    try {
      const response = await axios.post(
        `${API_GATEWAY_URL}/leaves`,
        leaveData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la création du congé');
    }
  },

  /**
   * Récupérer tous les congés
   * @returns {Promise<Array>} - Liste des congés
   */
  async getAllLeaves() {
    try {
      const response = await axios.get(
        `${API_GATEWAY_URL}/leaves`,
        { headers: getHeaders() }
      );
      
      let leavesData = response.data;
      
      if (leavesData && leavesData.data && Array.isArray(leavesData.data)) {
        leavesData = leavesData.data;
      }
      
      return Array.isArray(leavesData) ? leavesData : [];
    } catch (error) {
      console.error('Erreur dans getAllLeaves:', error);
      handleError(error, 'Erreur lors de la récupération des congés');
      return [];
    }
  },

  /**
   * Récupérer un congé par son ID
   * @param {string} id - ID du congé
   * @returns {Promise<Object>} - Congé trouvé
   */
  async getLeaveById(id) {
    try {
      const response = await axios.get(
        `${API_GATEWAY_URL}/leaves/${id}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du congé');
    }
  },

  /**
   * Récupérer les congés d'un employé
   * @param {string} employeeId - ID de l'employé
   * @returns {Promise<Array>} - Liste des congés de l'employé
   */
  async getLeavesByEmployee(employeeId) {
    try {
      const response = await axios.get(
        `${API_GATEWAY_URL}/leaves/employee/${employeeId}`,
        { headers: getHeaders() }
      );
      
      let leavesData = response.data;
      if (leavesData && leavesData.data && Array.isArray(leavesData.data)) {
        leavesData = leavesData.data;
      }
      
      return Array.isArray(leavesData) ? leavesData : [];
    } catch (error) {
      console.error('Erreur dans getLeavesByEmployee:', error);
      return [];
    }
  },

  /**
   * Mettre à jour un congé
   * @param {string} id - ID du congé
   * @param {Object} leaveData - Données à mettre à jour
   * @returns {Promise<Object>} - Congé mis à jour
   */
  async updateLeave(id, leaveData) {
    try {
      const response = await axios.put(
        `${API_GATEWAY_URL}/leaves/${id}`,
        leaveData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du congé');
    }
  },

  /**
   * Mettre à jour le statut d'un congé
   * @param {string} id - ID du congé
   * @param {string} status - Nouveau statut (pending, approved, rejected)
   * @returns {Promise<Object>} - Congé mis à jour
   */
  async updateLeaveStatus(id, status) {
    try {
      const response = await axios.patch(
        `${API_GATEWAY_URL}/leaves/${id}/status`,
        { status },
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du statut');
    }
  },

  /**
   * Supprimer un congé
   * @param {string} id - ID du congé
   * @returns {Promise<Object>} - Message de confirmation
   */
  async deleteLeave(id) {
    try {
      const response = await axios.delete(
        `${API_GATEWAY_URL}/leaves/${id}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du congé');
    }
  },

  /**
   * Récupérer les statistiques des congés
   * @returns {Promise<Object>} - Statistiques
   */
  async getLeaveStatistics() {
    try {
      const response = await axios.get(
        `${API_GATEWAY_URL}/leaves/statistics/summary`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur dans getLeaveStatistics:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        byType: {}
      };
    }
  },

  /**
   * Approuver un congé
   * @param {string} id - ID du congé
   * @returns {Promise<Object>} - Congé approuvé
   */
  async approveLeave(id) {
    return this.updateLeaveStatus(id, 'approved');
  },

  /**
   * Rejeter un congé
   * @param {string} id - ID du congé
   * @returns {Promise<Object>} - Congé rejeté
   */
  async rejectLeave(id) {
    return this.updateLeaveStatus(id, 'rejected');
  },

  /**
   * Formater les données d'un congé pour l'affichage
   * @param {Object} leave - Données brutes du congé
   * @returns {Object} - Données formatées
   */
  formatLeave(leave) {
    if (!leave) return null;
    
    const startDate = leave.startDate ? new Date(leave.startDate) : null;
    const endDate = leave.endDate ? new Date(leave.endDate) : null;
    
    // Calculer la durée en jours
    let duration = 0;
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate - startDate);
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Statut en français
    const statusLabels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté'
    };
    
    // Couleur du statut
    const statusColors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444'
    };
    
    return {
      ...leave,
      _id: leave._id || leave.id,
      employeeName: leave.employeeId 
        ? `${leave.employeeId.firstName || ''} ${leave.employeeId.lastName || ''}`.trim()
        : 'N/A',
      employeeEmail: leave.employeeId?.email || 'N/A',
      startDateFormatted: startDate ? startDate.toLocaleDateString() : 'N/A',
      endDateFormatted: endDate ? endDate.toLocaleDateString() : 'N/A',
      duration,
      statusLabel: statusLabels[leave.status] || leave.status || 'En attente',
      statusColor: statusColors[leave.status] || '#f59e0b',
      isPending: leave.status === 'pending',
      isApproved: leave.status === 'approved',
      isRejected: leave.status === 'rejected',
    };
  },

  /**
   * Formater la liste des congés
   * @param {Array} leaves - Liste des congés
   * @returns {Array} - Liste formatée
   */
  formatLeaves(leaves) {
    if (!leaves || !Array.isArray(leaves)) {
      return [];
    }
    return leaves.map(leave => this.formatLeave(leave)).filter(leave => leave !== null);
  },

  /**
   * Valider les données d'un congé
   * @param {Object} leaveData - Données à valider
   * @returns {Object} - { isValid, errors }
   */
  validateLeave(leaveData) {
    const errors = [];
    
    if (!leaveData.employeeId) {
      errors.push('L\'employé est requis');
    }
    
    if (!leaveData.type || leaveData.type.trim() === '') {
      errors.push('Le type de congé est requis');
    }
    
    if (!leaveData.startDate) {
      errors.push('La date de début est requise');
    }
    
    if (!leaveData.endDate) {
      errors.push('La date de fin est requise');
    }
    
    if (leaveData.startDate && leaveData.endDate) {
      const start = new Date(leaveData.startDate);
      const end = new Date(leaveData.endDate);
      
      if (start > end) {
        errors.push('La date de début doit être antérieure à la date de fin');
      }
      
      if (start < new Date()) {
        errors.push('La date de début ne peut pas être dans le passé');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Types de congés disponibles
   * @returns {Array} - Liste des types de congés
   */
  getLeaveTypes() {
  return [
  { value: 'annual', label: 'Annual Leave', color: '#10b981' },
  { value: 'sick', label: 'Sick Leave',color: '#ef4444' },
  { value: 'unpaid', label: 'Unpaid Leave', color: '#f59e0b' },
  { value: 'maternity', label: 'Maternity Leave', color: '#ec489a' },
  { value: 'paternity', label: 'Paternity Leave', color: '#3b82f6' },
  { value: 'bereavement', label: 'Bereavement Leave', color: '#6b7280' },
  { value: 'emergency', label: 'Emergency Leave', color: '#f97316' },
  { value: 'training', label: 'Training Leave', color: '#8b5cf6' },
];
  },

  /**
   * Obtenir le libellé d'un type de congé
   * @param {string} type - Type de congé
   * @returns {string} - Libellé
   */
  getLeaveTypeLabel(type) {
    const types = this.getLeaveTypes();
    const found = types.find(t => t.value === type);
    return found ? found.label : type;
  },

  /**
   * Obtenir l'icône d'un type de congé
   * @param {string} type - Type de congé
   * @returns {string} - Icône
   */
  getLeaveTypeIcon(type) {
    const types = this.getLeaveTypes();
    const found = types.find(t => t.value === type);
    return found ? found.icon : '📅';
  }
};

export default leavesService;