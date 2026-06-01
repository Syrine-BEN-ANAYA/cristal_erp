import axios from 'axios';

const API_GATEWAY_URL =
  process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3104';

// ================= AUTH =================
const getAuthToken = () => {
  const token = localStorage.getItem('auth_token');
  return token ? `Bearer ${token}` : '';
};

// ================= HEADERS =================
const getHeaders = () => ({
  Authorization: getAuthToken(),
  'Content-Type': 'application/json',
});

// ================= ERROR HANDLER =================
const handleError = (error, defaultMessage) => {
  if (error.response) {
    const message =
      error.response.data?.message ||
      error.response.data ||
      defaultMessage;

    throw new Error(message);
  }

  if (error.request) {
    throw new Error('Impossible de contacter le serveur');
  }

  throw new Error(error.message || defaultMessage);
};

// ================= SERVICE =================
const employeesService = {
  // ================= CREATE =================
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

  // ================= GET ALL =================
  async getAllEmployees() {
    try {
      const response = await axios.get(
        `${API_GATEWAY_URL}/employees`,
        { headers: getHeaders() }
      );

      const data = response.data;

      // API Gateway safe handling
      if (Array.isArray(data)) return data;

      if (Array.isArray(data?.data)) return data.data;

      console.warn('API response is not an array:', data);
      return [];
    } catch (error) {
      console.error('getAllEmployees error:', error);
      handleError(error, 'Erreur lors de la récupération des employés');
      return [];
    }
  },

  // ================= GET BY ID =================
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

  // ================= UPDATE =================
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

 
  // ================= APPROVE EMPLOYEE (IMPORTANT ERP FLOW) =================
  async approveEmployee(id) {
    try {
      const response = await axios.post(
        `${API_GATEWAY_URL}/employees/${id}/approve`,
        {},
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de l’approbation de l’employé');
    }
  },

  // ================= ACCOUNT STATUS =================
  async updateAccountStatus(id, accountStatus) {
    try {
      const response = await axios.patch(
        `${API_GATEWAY_URL}/employees/${id}/account-status`,
        { accountStatus },
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du statut');
    }
  },

  // ================= FORMAT ONE EMPLOYEE =================
  formatEmployee(employee) {
    if (!employee) return null;

    return {
      ...employee,

      fullName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),

      formattedHireDate: employee.hireDate
        ? new Date(employee.hireDate).toLocaleDateString('fr-FR')
        : 'Non spécifié',

      formattedCreatedAt: employee.createdAt
        ? new Date(employee.createdAt).toLocaleDateString('fr-FR')
        : 'N/A',

      skillsList: Array.isArray(employee.skills) ? employee.skills : [],

      displayStatus: employee.isActive ? 'Actif' : 'Inactif',
      statusColor: employee.isActive ? '#10b981' : '#ef4444',

      accountStatusLabel:
        employee.accountStatus === 'CREATED'
          ? 'Compte créé'
          : employee.accountStatus === 'PENDING'
          ? 'En attente'
          : 'Non défini',
    };
  },

  // ================= FORMAT LIST =================
  formatEmployees(employees) {
    if (!Array.isArray(employees)) return [];

    return employees
      .map(this.formatEmployee)
      .filter(Boolean);
  },
};

export default employeesService;