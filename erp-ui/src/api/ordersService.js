// src/api/ordersService.js
import axios from "axios";

// URL de l'API Gateway pour les commandes
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3104/orders";

// --- Helper pour config avec token ---
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});
// src/api/ordersService.js
export const getTotalOrderAmount = async (token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/total`, getConfig(token));
  return res.data; // { totalOrderAmount: number }
};
// ---------------- CREATE ORDER ----------------
export const createOrder = async (orderData, token) => {
  const res = await axios.post(API_GATEWAY_URL, orderData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL ORDERS ----------------
export const getOrders = async (token) => {
  const res = await axios.get(API_GATEWAY_URL, getConfig(token));
  return res.data;
};

// ---------------- GET ONE ORDER ----------------
export const getOrder = async (id, token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- UPDATE ORDER ----------------
export const updateOrder = async (id, orderData, token) => {
  const res = await axios.put(`${API_GATEWAY_URL}/${id}`, orderData, getConfig(token));
  return res.data;
};

// ---------------- DELETE ORDER ----------------
export const deleteOrder = async (id, token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- DELETE ORDERS BY MONTH ----------------
export const deleteOrdersByMonth = async (month, token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}?month=${month}`, getConfig(token));
  return res.data;
};