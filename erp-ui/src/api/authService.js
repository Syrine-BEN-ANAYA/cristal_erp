import axios from "axios";

const API_GATEWAY_URL =
  process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3104";

// =====================================================
// HEADERS
// =====================================================
const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// =====================================================
// AUTH
// =====================================================
export const login = async (username, password) => {
  const res = await axios.post(
    `${API_GATEWAY_URL}/auth/login`,
    { username, password },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};

export const getMe = async (token) => {
  const res = await axios.get(
    `${API_GATEWAY_URL}/auth/me`,
    getConfig(token)
  );

  return res.data;
};

export const register = async (data, token) => {
  const res = await axios.post(
    `${API_GATEWAY_URL}/auth/register`,
    data,
    getConfig(token)
  );

  return res.data;
};

// =====================================================
// USERS
// =====================================================

// GET ALL USERS
export const getUsers = async (token) => {
  const res = await axios.get(
    `${API_GATEWAY_URL}/users`,
    getConfig(token)
  );

  return res.data;
};

// GET ONE USER
export const getUser = async (id, token) => {
  const res = await axios.get(
    `${API_GATEWAY_URL}/users/${id}`,
    getConfig(token)
  );

  return res.data;
};

// CREATE USER (manual)
export const createUser = async (userData, token) => {
  const res = await axios.post(
    `${API_GATEWAY_URL}/users`,
    userData,
    getConfig(token)
  );

  return res.data;
};

// CREATE USER FROM EMPLOYEE
export const createUserFromEmployee = async (
  employeeId,
  userData,
  token
) => {
  const res = await axios.post(
    `${API_GATEWAY_URL}/users/from-employee/${employeeId}`,
    userData,
    getConfig(token)
  );

  return res.data;
};

// UPDATE USER
export const updateUser = async (id, userData, token) => {
  const res = await axios.put(
    `${API_GATEWAY_URL}/users/${id}`,
    userData,
    getConfig(token)
  );

  return res.data;
};

// DELETE USER
export const deleteUser = async (id, token) => {
  const res = await axios.delete(
    `${API_GATEWAY_URL}/users/${id}`,
    getConfig(token)
  );

  return res.data;
};

// CHANGE PASSWORD
export const changePassword = async (
  userId,
  newPassword,
  token
) => {
  const res = await axios.put(
    `${API_GATEWAY_URL}/users/change-password/${userId}`,
    { newPassword },
    getConfig(token)
  );

  return res.data;
};

// FORCE PASSWORD RESET
export const forceResetPassword = async (
  userId,
  token
) => {
  const res = await axios.put(
    `${API_GATEWAY_URL}/users/force-reset/${userId}`,
    {},
    getConfig(token)
  );

  return res.data;
};

// =====================================================
// EMPLOYEES
// =====================================================

// GET EMPLOYEES WAITING FOR ACCOUNT CREATION
export const getPendingEmployees = async (token) => {
  const res = await axios.get(
    `${API_GATEWAY_URL}/employees/accounts/pending`,
    getConfig(token)
  );

  return res.data;
};