import axios from 'axios';

const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3104';

// Axios instance for Payroll (via Gateway)
const payrollApi = axios.create({
  baseURL: `${API_GATEWAY_URL}/payroll`,
  timeout: 10000,
});

// Récupérer le token d'authentification
const getAuthToken = () => {
  const token = localStorage.getItem('auth_token') || 
                localStorage.getItem('token') || 
                sessionStorage.getItem('auth_token') || '';
  return token;
};

// Headers par défaut
const getHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return headers;
};

// Gestionnaire d'erreurs
const handleError = (error, defaultMessage) => {
  console.error('API Error:', error.response?.data || error.message);
  if (error.response) {
    const message = error.response.data?.message || error.response.data || defaultMessage;
    throw new Error(typeof message === 'object' ? JSON.stringify(message) : message);
  } else if (error.request) {
    throw new Error('Impossible de contacter le serveur');
  } else {
    throw new Error(error.message || defaultMessage);
  }
};

/**
 * Service pour la gestion des fiches de paie (Payroll)
 * Adapté pour le Gateway NestJS
 */
const payrollService = {
  // ================= CREATE =================
  async createPayroll(payrollData) {
    try {
      const cleanData = {
        employeeId: payrollData.employeeId,
        month: parseInt(payrollData.month, 10),
        year: parseInt(payrollData.year, 10),
        basicSalary: parseFloat(payrollData.basicSalary),
        bonuses: payrollData.bonuses ? parseFloat(payrollData.bonuses) : 0,
        deductions: payrollData.deductions ? parseFloat(payrollData.deductions) : 0,
        netSalary: parseFloat(payrollData.netSalary),
        status: payrollData.status || 'draft',
        notes: payrollData.notes || '',
      };

      const response = await payrollApi.post('/', cleanData, {
        headers: getHeaders(),
      });

      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la création de la fiche de paie');
    }
  },

  // ================= GET ALL =================
  async getAllPayrolls() {
    try {
      const response = await payrollApi.get('/', {
        headers: getHeaders(),
      });
      
      // La réponse du Gateway est: { statusCode, message, data, count }
      const data = response.data?.data || response.data;
      
      // Si data est un tableau, le retourner, sinon retourner un tableau vide
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur getAllPayrolls:', error);
      return [];
    }
  },

  // ================= GET BY ID =================
  async getPayrollById(id) {
    if (!id || id.trim() === '') {
      throw new Error('Payroll ID is required');
    }

    try {
      const response = await payrollApi.get(`/${id}`, {
        headers: getHeaders(),
      });
      
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération de la fiche de paie');
    }
  },

  // ================= GET BY PERIOD =================
  async getPayrollsByPeriod(month, year) {
    if (!month || !year) {
      return [];
    }

    try {
      const response = await payrollApi.get(`/period?month=${month}&year=${year}`, {
        headers: getHeaders(),
      });
      
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur getPayrollsByPeriod:', error);
      return [];
    }
  },

  // ================= GET BY STATUS =================
  async getPayrollsByStatus(status) {
    if (!status || status.trim() === '') {
      return [];
    }

    try {
      const response = await payrollApi.get(`/status/${status}`, {
        headers: getHeaders(),
      });
      
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur getPayrollsByStatus:', error);
      return [];
    }
  },

  // ================= GET BY EMPLOYEE =================
  async getPayrollsByEmployee(employeeId) {
    if (!employeeId || employeeId.trim() === '') {
      return [];
    }

    try {
      const response = await payrollApi.get(`/employee/${employeeId}`, {
        headers: getHeaders(),
      });
      
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur getPayrollsByEmployee:', error);
      return [];
    }
  },

  // ================= UPDATE (PATCH) =================
  async updatePayroll(id, payrollData) {
    if (!id || id.trim() === '') {
      throw new Error('Payroll ID is required');
    }

    try {
      const cleanData = {};
      
      if (payrollData.month !== undefined) cleanData.month = parseInt(payrollData.month, 10);
      if (payrollData.year !== undefined) cleanData.year = parseInt(payrollData.year, 10);
      if (payrollData.basicSalary !== undefined) cleanData.basicSalary = parseFloat(payrollData.basicSalary);
      if (payrollData.bonuses !== undefined) cleanData.bonuses = parseFloat(payrollData.bonuses);
      if (payrollData.deductions !== undefined) cleanData.deductions = parseFloat(payrollData.deductions);
      if (payrollData.netSalary !== undefined) cleanData.netSalary = parseFloat(payrollData.netSalary);
      if (payrollData.status !== undefined) cleanData.status = payrollData.status;
      if (payrollData.notes !== undefined) cleanData.notes = payrollData.notes;

      const response = await payrollApi.patch(`/${id}`, cleanData, {
        headers: getHeaders(),
      });

      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour de la fiche de paie');
    }
  },

  // ================= UPDATE STATUS =================
  async updatePayrollStatus(id, status) {
    if (!id || id.trim() === '') {
      throw new Error('Payroll ID is required');
    }

    if (!status || !['draft', 'processed', 'paid'].includes(status)) {
      throw new Error('Invalid status');
    }

    try {
      const response = await payrollApi.patch(`/${id}`, { status }, {
        headers: getHeaders(),
      });

      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du statut');
    }
  },

  // ================= MARK AS PAID =================
  async markAsPaid(id) {
    return this.updatePayrollStatus(id, 'paid');
  },

  // ================= MARK AS PROCESSED =================
  async markAsProcessed(id) {
    return this.updatePayrollStatus(id, 'processed');
  },

  // ================= DELETE =================
  async deletePayroll(id) {
    if (!id || id.trim() === '') {
      throw new Error('Payroll ID is required');
    }

    try {
      const response = await payrollApi.delete(`/${id}`, {
        headers: getHeaders(),
      });

      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de la fiche de paie');
    }
  },

  // ================= DELETE BY EMPLOYEE =================
  async deletePayrollsByEmployee(employeeId) {
    if (!employeeId || employeeId.trim() === '') {
      throw new Error('Employee ID is required');
    }

    try {
      const response = await payrollApi.delete(`/employee/${employeeId}`, {
        headers: getHeaders(),
      });

      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression des fiches de paie');
    }
  },

  // ================= STATISTICS =================
  async getPayrollStatistics() {
    try {
      const response = await payrollApi.get('/statistics', {
        headers: getHeaders(),
      });
      
      const data = response.data?.data || response.data;
      
      return {
        data: {
          total: data?.total || 0,
          draft: data?.draft || 0,
          processed: data?.processed || 0,
          paid: data?.paid || 0,
          totalAmount: data?.totalAmount || 0,
          averageSalary: data?.averageSalary || 0,
          byMonth: data?.byMonth || [],
        },
      };
    } catch (error) {
      console.error('Erreur getPayrollStatistics:', error);
      return {
        data: {
          total: 0,
          draft: 0,
          processed: 0,
          paid: 0,
          totalAmount: 0,
          averageSalary: 0,
          byMonth: [],
        },
      };
    }
  },

  // ================= BULK PROCESS =================
  async processBulkPayroll(month, year, employeeIds) {
    if (!month || !year) {
      throw new Error('Month and year are required');
    }

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      throw new Error('At least one employee ID is required');
    }

    try {
      const response = await payrollApi.post('/bulk/process', {
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        employeeIds,
      }, {
        headers: getHeaders(),
      });

      return response.data;
    } catch (error) {
      handleError(error, 'Erreur lors du traitement groupé des paies');
    }
  },

  // ================= HEALTH CHECK =================
  async healthCheck() {
    try {
      const response = await payrollApi.get('/health', {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  },

  // ================= CALCULATE NET SALARY =================
  calculateNetSalary(basicSalary, bonuses = 0, deductions = 0) {
    return basicSalary + bonuses - deductions;
  },

  // ================= VALIDATE PAYROLL =================
  validatePayroll(payrollData) {
    const errors = [];

    if (!payrollData.employeeId) {
      errors.push('Employee is required');
    }

    if (!payrollData.month || payrollData.month < 1 || payrollData.month > 12) {
      errors.push('Month must be between 1 and 12');
    }

    if (!payrollData.year || payrollData.year < 2000 || payrollData.year > 2100) {
      errors.push('Year must be between 2000 and 2100');
    }

    if (!payrollData.basicSalary || payrollData.basicSalary <= 0) {
      errors.push('Basic salary must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // ================= UTILS =================
  getStatusOptions(language = 'en') {
    const options = [
      { value: 'draft', label: language === 'fr' ? 'Brouillon' : 'Draft', icon: '📋' },
      { value: 'processed', label: language === 'fr' ? 'Traité' : 'Processed', icon: '⚙️' },
      { value: 'paid', label: language === 'fr' ? 'Payé' : 'Paid', icon: '✅' },
    ];
    return options;
  },

  getMonths(language = 'en') {
    if (language === 'fr') {
      return ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    } else if (language === 'ar') {
      return ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    }
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  },

  getYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  },

  formatPayroll(payroll) {
    if (!payroll) return null;

    const months = this.getMonths('en');
    
    return {
      ...payroll,
      id: payroll._id,
      employeeName: payroll.employeeId?.firstName && payroll.employeeId?.lastName 
        ? `${payroll.employeeId.firstName} ${payroll.employeeId.lastName}`
        : 'Unknown Employee',
      employeePosition: payroll.employeeId?.position || '-',
      monthName: months[payroll.month - 1],
      formattedBasicSalary: `${(payroll.basicSalary || 0).toLocaleString()} OMR`,
      formattedBonuses: `${(payroll.bonuses || 0).toLocaleString()} OMR`,
      formattedDeductions: `${(payroll.deductions || 0).toLocaleString()} OMR`,
      formattedNetSalary: `${(payroll.netSalary || 0).toLocaleString()} OMR`,
      statusLabel: this.getStatusOptions('en').find(s => s.value === payroll.status)?.label || payroll.status,
      statusIcon: this.getStatusOptions('en').find(s => s.value === payroll.status)?.icon || '📋',
      isDraft: payroll.status === 'draft',
      isProcessed: payroll.status === 'processed',
      isPaid: payroll.status === 'paid',
    };
  },

  formatPayrolls(payrolls) {
    if (!payrolls || !Array.isArray(payrolls)) {
      return [];
    }
    return payrolls.map(p => this.formatPayroll(p)).filter(p => p !== null);
  },
};

export default payrollService;