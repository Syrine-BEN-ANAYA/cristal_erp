// employeesService.js
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
    throw new Error('Impossible de contacter le serveur');
  } else {
    throw new Error(error.message || defaultMessage);
  }
};

/**
 * Service pour la gestion des employés
 */
const employeesService = {
  /**
   * Créer un nouvel employé
   */
  async createEmployee(employeeData) {
    try {
      const response = await axios.post(
        `${API_GATEWAY_URL}/employees`,
        employeeData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la création de l’employé');
    }
  },

  /**
   * Récupérer tous les employés
   */
  async getAllEmployees() {
    try {
      const response = await axios.get(
        `${API_GATEWAY_URL}/employees`,
        { headers: getHeaders() }
      );
      
      // Vérifier si la réponse est un tableau ou un objet avec une propriété data
      let employeesData = response.data;
      
      // Si c'est un objet avec une propriété data qui est un tableau
      if (employeesData && employeesData.data && Array.isArray(employeesData.data)) {
        employeesData = employeesData.data;
      }
      // Si ce n'est pas un tableau, retourner un tableau vide
      if (!Array.isArray(employeesData)) {
        console.warn('La réponse API n\'est pas un tableau:', employeesData);
        return [];
      }
      
      return employeesData;
    } catch (error) {
      console.error('Erreur dans getAllEmployees:', error);
      handleError(error, 'Erreur lors de la récupération des employés');
      return []; // Retourner un tableau vide en cas d'erreur
    }
  },

  /**
   * Récupérer un employé par son ID
   */
  async getEmployeeById(id) {
    try {
      const response = await axios.get(
        `${API_GATEWAY_URL}/employees/${id}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération de l’employé');
    }
  },

  /**
   * Mettre à jour un employé
   */
  async updateEmployee(id, employeeData) {
    try {
      const response = await axios.put(
        `${API_GATEWAY_URL}/employees/${id}`,
        employeeData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour de l’employé');
    }
  },

  /**
   * Supprimer un employé
   */
  async deleteEmployee(id) {
    try {
      const response = await axios.delete(
        `${API_GATEWAY_URL}/employees/${id}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de l’employé');
    }
  },

  /**
   * Formater les données d'un employé pour l'affichage
   */
  formatEmployee(employee) {
    if (!employee) return null;
    
    return {
      ...employee,
      fullName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      fullNameAr: employee.firstNameAr && employee.lastNameAr 
        ? `${employee.firstNameAr} ${employee.lastNameAr}`.trim()
        : `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      formattedHireDate: employee.hireDate 
        ? new Date(employee.hireDate).toLocaleDateString('fr-FR')
        : 'Non spécifié',
      formattedCreatedAt: employee.createdAt
        ? new Date(employee.createdAt).toLocaleDateString('fr-FR')
        : 'N/A',
      skillsList: Array.isArray(employee.skills) ? employee.skills : [],
      displayStatus: employee.isActive ? 'Actif' : 'Inactif',
      statusColor: employee.isActive ? '#10b981' : '#ef4444',
    };
  },

  /**
   * Formater la liste des employés - VÉRIFICATION DE SÉCURITÉ
   */
  formatEmployees(employees) {
    // Vérifier si employees est un tableau
    if (!employees || !Array.isArray(employees)) {
      console.warn('formatEmployees: employees n\'est pas un tableau:', employees);
      return [];
    }
    
    // Formater chaque employé
    return employees.map(emp => this.formatEmployee(emp)).filter(emp => emp !== null);
  }
};

export default employeesService;