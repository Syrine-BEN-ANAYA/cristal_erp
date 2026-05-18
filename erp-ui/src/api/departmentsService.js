// departmentsService.js
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
 * Service pour la gestion des départements
 */
const departmentsService = {
  /**
   * Créer un nouveau département
   * @param {Object} departmentData - Données du département
   * @param {string} departmentData.name - Nom du département (requis)
   * @param {string} departmentData.description - Description du département (optionnel)
   * @returns {Promise<Object>} - Département créé
   */
  async createDepartment(departmentData) {
    try {
      const response = await axios.post(
        `${API_GATEWAY_URL}/departments`,
        departmentData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la création du département');
    }
  },

  /**
   * Récupérer tous les départements
   * @returns {Promise<Array>} - Liste des départements
   */
  async getAllDepartments() {
    try {
      const response = await axios.get(
        `${API_GATEWAY_URL}/departments`,
        { headers: getHeaders() }
      );
      
      // Vérifier la structure de la réponse
      let departmentsData = response.data;
      
      // Si c'est un objet avec une propriété data qui est un tableau
      if (departmentsData && departmentsData.data && Array.isArray(departmentsData.data)) {
        departmentsData = departmentsData.data;
      }
      
      // Si ce n'est pas un tableau, retourner un tableau vide
      if (!Array.isArray(departmentsData)) {
        console.warn('La réponse API n\'est pas un tableau:', departmentsData);
        return [];
      }
      
      return departmentsData;
    } catch (error) {
      console.error('Erreur dans getAllDepartments:', error);
      handleError(error, 'Erreur lors de la récupération des départements');
      return []; // Retourner un tableau vide en cas d'erreur
    }
  },

  /**
   * Récupérer un département par son ID
   * @param {string} id - ID du département
   * @returns {Promise<Object>} - Département trouvé
   */
  async getDepartmentById(id) {
    try {
      const response = await axios.get(
        `${API_GATEWAY_URL}/departments/${id}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du département');
    }
  },

  /**
   * Mettre à jour un département
   * @param {string} id - ID du département
   * @param {Object} departmentData - Données à mettre à jour
   * @returns {Promise<Object>} - Département mis à jour
   */
  async updateDepartment(id, departmentData) {
    try {
      const response = await axios.put(
        `${API_GATEWAY_URL}/departments/${id}`,
        departmentData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du département');
    }
  },

  /**
   * Supprimer un département
   * @param {string} id - ID du département
   * @returns {Promise<Object>} - Message de confirmation
   */
  async deleteDepartment(id) {
    try {
      const response = await axios.delete(
        `${API_GATEWAY_URL}/departments/${id}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du département');
    }
  },

  /**
   * Rechercher des départements par nom
   * @param {string} searchTerm - Terme de recherche
   * @returns {Promise<Array>} - Liste des départements correspondants
   */
  async searchDepartments(searchTerm) {
    try {
      const allDepartments = await this.getAllDepartments();
      if (!searchTerm) return allDepartments;
      
      const term = searchTerm.toLowerCase();
      return allDepartments.filter(dept => 
        dept.name?.toLowerCase().includes(term) ||
        dept.description?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Erreur dans searchDepartments:', error);
      return [];
    }
  },

  /**
   * Vérifier si un département existe par son nom
   * @param {string} name - Nom du département
   * @returns {Promise<boolean>} - True si le département existe
   */
  async checkDepartmentExists(name) {
    try {
      const departments = await this.getAllDepartments();
      return departments.some(dept => 
        dept.name?.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      console.error('Erreur dans checkDepartmentExists:', error);
      return false;
    }
  },

  /**
   * Formater les données d'un département pour l'affichage
   * @param {Object} department - Données brutes du département
   * @returns {Object} - Données formatées
   */
  formatDepartment(department) {
    if (!department) return null;
    
    return {
      ...department,
      _id: department._id || department.id,
      name: department.name || '',
      description: department.description || '',
      formattedCreatedAt: department.createdAt
        ? new Date(department.createdAt).toLocaleDateString('fr-FR')
        : 'N/A',
      formattedUpdatedAt: department.updatedAt
        ? new Date(department.updatedAt).toLocaleDateString('fr-FR')
        : 'N/A',
      hasDescription: !!(department.description && department.description.trim()),
      initials: department.name
        ? department.name.substring(0, 2).toUpperCase()
        : 'DP',
    };
  },

  /**
   * Formater la liste des départements
   * @param {Array} departments - Liste des départements
   * @returns {Array} - Liste formatée
   */
  formatDepartments(departments) {
    if (!departments || !Array.isArray(departments)) {
      return [];
    }
    return departments.map(dept => this.formatDepartment(dept)).filter(dept => dept !== null);
  },

  /**
   * Obtenir les statistiques des départements
   * @param {Array} employees - Liste des employés (optionnel)
   * @returns {Promise<Object>} - Statistiques
   */
  async getDepartmentStats(employees = []) {
    try {
      const departments = await this.getAllDepartments();
      
      const stats = {
        total: departments.length,
        withDescription: departments.filter(d => d.description && d.description.trim()).length,
        withoutDescription: departments.filter(d => !d.description || !d.description.trim()).length,
        departmentEmployees: {},
      };
      
      // Compter les employés par département
      if (employees && employees.length > 0) {
        departments.forEach(dept => {
          stats.departmentEmployees[dept._id] = employees.filter(
            emp => emp.departmentId === dept._id
          ).length;
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Erreur dans getDepartmentStats:', error);
      return {
        total: 0,
        withDescription: 0,
        withoutDescription: 0,
        departmentEmployees: {},
      };
    }
  },

  /**
   * Obtenir les départements populaires (avec le plus d'employés)
   * @param {Array} employees - Liste des employés
   * @param {number} limit - Nombre maximum de résultats
   * @returns {Promise<Array>} - Départements populaires
   */
  async getPopularDepartments(employees = [], limit = 5) {
    try {
      const departments = await this.getAllDepartments();
      
      const departmentCounts = departments.map(dept => ({
        ...dept,
        employeeCount: employees.filter(emp => emp.departmentId === dept._id).length,
      }));
      
      return departmentCounts
        .sort((a, b) => b.employeeCount - a.employeeCount)
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur dans getPopularDepartments:', error);
      return [];
    }
  },

  /**
   * Valider les données d'un département
   * @param {Object} departmentData - Données à valider
   * @returns {Object} - { isValid, errors }
   */
  validateDepartment(departmentData) {
    const errors = [];
    
    if (!departmentData.name || departmentData.name.trim() === '') {
      errors.push('Le nom du département est requis');
    }
    
    if (departmentData.name && departmentData.name.length < 2) {
      errors.push('Le nom du département doit contenir au moins 2 caractères');
    }
    
    if (departmentData.name && departmentData.name.length > 100) {
      errors.push('Le nom du département ne peut pas dépasser 100 caractères');
    }
    
    if (departmentData.description && departmentData.description.length > 500) {
      errors.push('La description ne peut pas dépasser 500 caractères');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Vider le cache (si vous utilisez un cache)
   */
  clearCache() {
    // Implémenter si nécessaire
    console.log('Cache des départements vidé');
  }
};

export default departmentsService;