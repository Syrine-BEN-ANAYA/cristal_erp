// src/api/customersService.js
import axios from "axios";

// ← URL vers l’API Gateway
const API_GATEWAY_URL = "http://localhost:3004/customers";

// Helper pour config avec token
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------- CREATE CUSTOMER ----------------
export const createCustomer = async (customerData, token) => {
  const res = await axios.post(API_GATEWAY_URL, customerData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL CUSTOMERS ----------------
export const getCustomers = async (token) => {
  const res = await axios.get(API_GATEWAY_URL, getConfig(token));
  return res.data;
};

// ---------------- GET CUSTOMER BY ID ----------------
export const getCustomerById = async (id, token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- UPDATE CUSTOMER ----------------
export const updateCustomer = async (id, customerData, token) => {
  const res = await axios.put(`${API_GATEWAY_URL}/${id}`, customerData, getConfig(token));
  return res.data;
};

// ---------------- DELETE CUSTOMER ----------------
export const deleteCustomer = async (id, token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};