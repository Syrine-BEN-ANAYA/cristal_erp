import axios from "axios";

const API_URL = "http://localhost:3002/orders";

// --- Helper pour config avec token ---
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` }, // ← token correctement formaté
});

// ---------------- CREATE ORDER ----------------
export const createOrder = async (orderData, token) => {
  const res = await axios.post(API_URL, orderData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL ORDERS ----------------
export const getOrders = async (token) => {
  const res = await axios.get(API_URL, getConfig(token));
  return res.data;
};

// ---------------- GET ONE ORDER ----------------
export const getOrder = async (id, token) => {
  const res = await axios.get(`${API_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- UPDATE ORDER ----------------
export const updateOrder = async (id, orderData, token) => {
  const res = await axios.put(`${API_URL}/${id}`, orderData, getConfig(token));
  return res.data;
};

// ---------------- DELETE ORDER ----------------
export const deleteOrder = async (id, token) => {
  const res = await axios.delete(`${API_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- DELETE ORDERS BY MONTH ----------------
export const deleteOrdersByMonth = async (month, token) => {
  const res = await axios.delete(`${API_URL}?month=${month}`, getConfig(token));
  return res.data;
};