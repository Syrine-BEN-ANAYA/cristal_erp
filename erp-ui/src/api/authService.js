// src/api/authService.js
import axios from "axios";

// ← on pointe désormais vers l’API Gateway
const API_GATEWAY_URL = "http://localhost:3004";

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- LOGIN ---
export const login = async (email, password) => {
  const res = await axios.post(
    `${API_GATEWAY_URL}/auth/login`,
    { email, password },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};

// --- GET CURRENT USER (getMe) ---
export const getMe = async (token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/auth/me`, getConfig(token));
  return res.data;
};

// --- CHANGE PASSWORD ---
export const changePassword = async (userId, newPassword, token) => {
  const res = await axios.put(
    `${API_GATEWAY_URL}/users/change-password/${userId}`,
    { newPassword }, // objet attendu par NestJS
    getConfig(token)
  );
  return res.data;
};

// --- CRUD USERS ---
// GET ALL USERS
export const getUsers = async (token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/users`, getConfig(token));
  return res.data;
};

// CREATE USER
export const createUser = async (data, token) => {
  const res = await axios.post(`${API_GATEWAY_URL}/users`, data, getConfig(token));
  return res.data;
};

// UPDATE USER
export const updateUser = async (id, data, token) => {
  const res = await axios.put(`${API_GATEWAY_URL}/users/${id}`, data, getConfig(token));
  return res.data;
};

// DELETE USER
export const deleteUser = async (id, token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/users/${id}`, getConfig(token));
  return res.data;
};

// REGISTER USER
export const register = async (data, token) => {
  const res = await axios.post(`${API_GATEWAY_URL}/auth/register`, data, getConfig(token));
  return res.data;
};