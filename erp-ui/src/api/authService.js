// src/api/authService.js
import axios from "axios";

const API_URL = "http://localhost:3001/auth";
const USERS_URL = "http://localhost:3001/users";

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- LOGIN ---
export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password }, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// --- GET CURRENT USER (getMe) ---
export const getMe = async (token) => {
  const res = await axios.get(`${API_URL}/me`, getConfig(token));
  return res.data;
};

export const changePassword = async (userId, newPassword, token) => {
  const res = await axios.put(
    `http://localhost:3001/users/change-password/${userId}`,
    { newPassword }, // ← l’objet attendu par NestJS
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// --- CRUD USERS ---
export const getUsers = async (token) => {
  const res = await axios.get(USERS_URL, getConfig(token));
  return res.data;
};

export const createUser = async (data, token) => {
  const res = await axios.post(USERS_URL, data, getConfig(token));
  return res.data;
};

export const updateUser = async (id, data, token) => {
  const res = await axios.put(`${USERS_URL}/${id}`, data, getConfig(token));
  return res.data;
};

export const deleteUser = async (id, token) => {
  const res = await axios.delete(`${USERS_URL}/${id}`, getConfig(token));
  return res.data;
};

export const register = async (data, token) => {
  const res = await axios.post(`${API_URL}/register`, data, getConfig(token));
  return res.data;
};