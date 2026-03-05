import axios from "axios";

const API_URL = "http://localhost:3001/auth";
const USERS_URL = "http://localhost:3001/users";

// Helper pour config avec token
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------- LOGIN ----------------

export const login = async (email, password) => {
  if (!email || !password) throw new Error('Email et password requis');

  const response = await axios.post(
    'http://localhost:3001/auth/login',
    { email, password }, // body exact
    { headers: { 'Content-Type': 'application/json' } } // obligatoire
  );

  return response.data; // { access_token: ... }
};

// ---------------- REGISTER ----------------
export const register = async (userData, token) => {
  const res = await axios.post(`${API_URL}/register`, userData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL USERS ----------------
export const getUsers = async (token) => {
  const res = await axios.get(USERS_URL, getConfig(token));
  return res.data;
};

// ---------------- CREATE USER ----------------
export const createUser = async (userData, token) => {
  const res = await axios.post(USERS_URL, userData, getConfig(token));
  return res.data;
};

// ---------------- UPDATE USER ----------------
export const updateUser = async (id, userData, token) => {
  const res = await axios.put(`${USERS_URL}/${id}`, userData, getConfig(token));
  return res.data;
};

// ---------------- DELETE USER ----------------
export const deleteUser = async (id, token) => {
  const res = await axios.delete(`${USERS_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- CHANGE PASSWORD ----------------
export const changePassword = async (id, passwordData, token) => {
  const res = await axios.put(`${USERS_URL}/change-password/${id}`, passwordData, getConfig(token));
  return res.data;
};