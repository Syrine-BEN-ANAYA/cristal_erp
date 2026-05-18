import axios from "axios";

// Base URLs
const API_EMPLOYEES = "http://localhost:3104/employees";
const API_GATEWAY_BASE_URL =
  process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3104";

// Axios instance for Employees
const employeesApi = axios.create({
  baseURL: API_EMPLOYEES,
  timeout: 10000,
});

// Axios instance for Contracts (via Gateway)
const contractsApi = axios.create({
  baseURL: `${API_GATEWAY_BASE_URL}/contracts`,
  timeout: 10000,
});

// ======================================================
// EMPLOYEES SERVICE
// ======================================================
export const getEmployees = async () => {
  try {
    const res = await employeesApi.get("/");
    return res.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const getEmployeeById = async (id) => {
  try {
    const res = await employeesApi.get(`/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
};

// ======================================================
// CONTRACTS SERVICE (via Gateway)
// ======================================================
const contractsService = {
  // ================= GET ALL =================
  async getAllContracts(params = {}) {
    try {
      const cleanParams = {};

      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== "") {
          cleanParams[key] = value;
        }
      });

      const response = await contractsApi.get("/", {
        params: cleanParams,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching all contracts:", error);
      throw error;
    }
  },

  // ================= GET BY ID =================
  async getContractById(id) {
    if (!id || id.trim() === "") {
      throw new Error("Contract ID is required");
    }

    try {
      const response = await contractsApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contract ${id}:`, error);
      throw error;
    }
  },

  // ================= GET ACTIVE CONTRACT BY EMPLOYEE =================
  async getActiveContract(employeeId) {
    if (!employeeId || employeeId.trim() === "") {
      throw new Error("Employee ID is required");
    }

    try {
      const response = await contractsApi.get(`/employee/${employeeId}/active`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching active contract for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // ================= GET CONTRACTS BY EMPLOYEE =================
  async getContractsByEmployee(employeeId) {
    if (!employeeId || employeeId.trim() === "") {
      return [];
    }

    try {
      const response = await contractsApi.get(`/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contracts for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // ================= GET CONTRACTS BY STATUS =================
  async getContractsByStatus(status) {
    if (!status || status.trim() === "") {
      return [];
    }

    try {
      const response = await contractsApi.get(`/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contracts with status ${status}:`, error);
      throw error;
    }
  },

  // ================= GET CONTRACTS BY TYPE =================
  async getContractsByType(type) {
    if (!type || type.trim() === "") {
      return [];
    }

    try {
      const response = await contractsApi.get(`/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contracts of type ${type}:`, error);
      throw error;
    }
  },

  // ================= GET ACTIVE CONTRACTS =================
  async getActiveContracts() {
    try {
      const response = await contractsApi.get("/active");
      return response.data;
    } catch (error) {
      console.error("Error fetching active contracts:", error);
      throw error;
    }
  },

  // ================= GET EXPIRED CONTRACTS =================
  async getExpiredContracts() {
    try {
      const response = await contractsApi.get("/expired");
      return response.data;
    } catch (error) {
      console.error("Error fetching expired contracts:", error);
      throw error;
    }
  },

  // ================= CREATE CONTRACT =================
  async createContract(contractData) {
    if (!contractData.employeeId || contractData.employeeId.trim() === "") {
      throw new Error("Employee ID is required");
    }

    const payload = {
      ...contractData,
      salary: Number(contractData.salary),
      status: contractData.status || "active",
    };

    try {
      const response = await contractsApi.post("/", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating contract:", error);
      throw error;
    }
  },

  // ================= UPDATE CONTRACT (PATCH) =================
  async updateContract(id, contractData) {
    if (!id || id.trim() === "") {
      throw new Error("Contract ID is required");
    }

    const payload = { ...contractData };

    if (payload.employeeId === "") {
      delete payload.employeeId;
    }
    if (payload.type === "") {
      delete payload.type;
    }
    if (payload.status === "") {
      delete payload.status;
    }

    try {
      const response = await contractsApi.patch(`/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating contract ${id}:`, error);
      throw error;
    }
  },

  // ================= UPDATE CONTRACT (PUT) =================
  async fullUpdateContract(id, contractData) {
    if (!id || id.trim() === "") {
      throw new Error("Contract ID is required");
    }

    const payload = {
      ...contractData,
      salary: Number(contractData.salary),
    };

    try {
      const response = await contractsApi.put(`/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error doing full update on contract ${id}:`, error);
      throw error;
    }
  },

  // ================= TERMINATE CONTRACT =================
  async terminateContract(id, terminationDate = null) {
    if (!id || id.trim() === "") {
      throw new Error("Contract ID is required");
    }

    const payload = terminationDate ? { terminationDate } : {};

    try {
      const response = await contractsApi.patch(`/${id}/terminate`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error terminating contract ${id}:`, error);
      throw error;
    }
  },

  // ================= RENEW CONTRACT =================
  async renewContract(id, newEndDate) {
    if (!id || id.trim() === "") {
      throw new Error("Contract ID is required");
    }

    if (!newEndDate || newEndDate.trim() === "") {
      throw new Error("New end date is required");
    }

    try {
      const response = await contractsApi.patch(`/${id}/renew`, { newEndDate });
      return response.data;
    } catch (error) {
      console.error(`Error renewing contract ${id}:`, error);
      throw error;
    }
  },

  // ================= DELETE CONTRACT =================
  async deleteContract(id) {
    if (!id || id.trim() === "") {
      throw new Error("Contract ID is required");
    }

    try {
      const response = await contractsApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting contract ${id}:`, error);
      throw error;
    }
  },

  // ================= DELETE CONTRACTS BY EMPLOYEE =================
  async deleteContractsByEmployee(employeeId) {
    if (!employeeId || employeeId.trim() === "") {
      throw new Error("Employee ID is required");
    }

    try {
      const response = await contractsApi.delete(`/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting contracts for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // ================= GET STATISTICS =================
  async getStatistics() {
    try {
      const response = await contractsApi.get("/statistics");
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  },

  // ================= HEALTH CHECK =================
  async healthCheck() {
    try {
      const response = await contractsApi.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },
};

export default contractsService;